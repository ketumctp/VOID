import * as requestStore from '../../request-store';
import { popupManager } from '../../popup-manager';
import { parseTransaction } from '../../transaction-parser';
import * as signer from '../../signer';
import { state } from './state';
import { riskService } from './risk-service';
import { executionService } from './execution-service';
import type { PendingRequest } from './types';

export const approvalService = {
    async requestApproval(type: string, data: any, origin?: string, tabId?: number): Promise<any> {
        // SECURITY FIX: Use UUID for unpredictable IDs
        const requestId = crypto.randomUUID();

        // Parse (if transaction)
        let parsedData = null;
        let isNativeTransfer = false;
        let nativeTransferInfo: { to: string; amount: number } | null = null;

        if (data.transaction) {
            if (typeof data.transaction === 'string' && data.transaction.startsWith('{')) {
                // Try to parse as native transfer JSON
                try {
                    const parsed = JSON.parse(data.transaction);
                    if (parsed.to && typeof parsed.amount === 'number') {
                        isNativeTransfer = true;
                        nativeTransferInfo = { to: parsed.to, amount: parsed.amount };
                    }
                } catch (e) {
                    // Not valid JSON
                }
            } else if (typeof data.transaction === 'string') {
                parsedData = parseTransaction(data.transaction);
            }
        }

        // Risk Assessment
        let riskAssessment: any = undefined;

        if (isNativeTransfer && nativeTransferInfo) {
            // SPECIAL HANDLING: Native transfers (JSON format) - no simulation needed
            const amountSol = nativeTransferInfo.amount / 1_000_000_000;

            // Determine risk based on amount
            let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
            if (amountSol > 10) level = 'HIGH';
            else if (amountSol > 1) level = 'MEDIUM';

            riskAssessment = {
                level,
                message: `Native Transfer: ${amountSol.toFixed(4)} RIALO to ${nativeTransferInfo.to.substring(0, 8)}...`,
                simulationStatus: 'success', // Native transfers are well-understood
                simulation: {
                    preBalance: 0, // Will be shown separately
                    postBalance: 0,
                    diff: -amountSol,
                    success: true
                },
                isNativeTransfer: true
            };
        } else if (parsedData || data.transaction) {
            try {
                // Pass raw transaction if available, even if parsing failed partly
                const rawTx = (typeof data.transaction === 'string') ? data.transaction : undefined;
                riskAssessment = await riskService.performRiskAssessment(parsedData, rawTx);
            } catch (e) {
                console.error('Risk assessment failed:', e);
            }
        }

        // Persist to Storage
        await requestStore.saveRequest({
            id: requestId,
            type,
            origin,
            data: { ...data, riskAssessment },
            parsed: parsedData,
            timestamp: Date.now(),
            tabId
        });

        return new Promise(async (resolve, reject) => {
            const url = `approve.html?requestId=${requestId}&type=sign`;

            // 1. Try Side Panel first
            try {
                const sidePanelActive = await Promise.race([
                    new Promise<boolean>(r => {
                        chrome.runtime.sendMessage({ type: 'CHECK_SIDEPANEL_ACTIVE' }, (response) => {
                            if (chrome.runtime.lastError) r(false);
                            else r(response && response.active);
                        });
                    }),
                    new Promise<boolean>(r => setTimeout(() => r(false), 200))
                ]);

                if (sidePanelActive) {
                    console.log('[Rialo] Delegating sign request to Side Panel');
                    chrome.runtime.sendMessage({
                        type: 'OPEN_SIGN_VIEW',
                        requestId: requestId,
                        signType: type,
                        origin: origin
                    });

                    state.setPendingRequest(requestId, {
                        id: requestId,
                        type,
                        origin,
                        data,
                        parsed: parsedData,
                        resolve,
                        reject
                    });
                    return;
                }
            } catch (err) {
                console.warn('[Rialo] Side Panel check failed, falling back to popup', err);
            }

            // 2. Fallback: Open Popup
            popupManager.openPopup(chrome.runtime.getURL(url), 'transaction')
                .then(() => {
                    state.setPendingRequest(requestId, {
                        id: requestId,
                        type,
                        origin,
                        data,
                        parsed: parsedData,
                        resolve,
                        reject
                    });
                })
                .catch((err) => {
                    requestStore.removeRequest(requestId);
                    reject(err);
                });
        });
    },

    async resolveRequest(requestId: string) {
        // Try memory first
        let req = state.getPendingRequest(requestId);

        // REHYDRATION FIX: Try storage if memory is empty
        if (!req) {
            const stored = await requestStore.getRequest(requestId);
            if (!stored) throw new Error('Request not found or expired');

            req = {
                ...stored,
                // We don't have the original resolve/reject closures if rehydrated
                resolve: () => console.log('[Rialo] Rehydrated request resolved'),
                reject: () => console.log('[Rialo] Rehydrated request rejected')
            } as PendingRequest;
        }

        try {
            let result;
            if (req.type === 'transaction') {
                result = await signer.signTransaction(req.data.transaction);
            } else if (req.type === 'message') {
                result = await signer.signMessage(req.data.message);
            } else if (req.type === 'signAndSend') {
                result = await executionService.resolveSignAndSend(req);
            }

            await requestStore.removeRequest(requestId);
            if (req.resolve) req.resolve(result);
            state.deletePendingRequest(requestId);

            // POST-RESOLUTION BROADCAST (For rehydrated requests)
            if (req.tabId) {
                const tabId = req.tabId;
                chrome.tabs.sendMessage(tabId, {
                    type: `RIALO_REQUEST_COMPLETED_${requestId}`,
                    success: true,
                    result,
                    pageRequestId: req.data?.id,
                    requestType: req.type
                }).catch(() => { }); // If tab closed, ignore
            }

            return { success: true };
        } catch (e: any) {
            await requestStore.removeRequest(requestId);
            if (req.reject) req.reject(e);
            state.deletePendingRequest(requestId);
            // Broadcast failure
            if (req.tabId) {
                chrome.tabs.sendMessage(req.tabId, {
                    type: `RIALO_REQUEST_COMPLETED_${requestId}`,
                    success: false,
                    error: e.message,
                    pageRequestId: req.data?.id,
                    requestType: req.type
                }).catch(() => { });
            }
            throw e;
        }
    },

    async rejectRequest(requestId: string) {
        await requestStore.removeRequest(requestId);
        const req = state.getPendingRequest(requestId);
        if (req && req.reject) {
            req.reject(new Error('User rejected request'));
        }
        state.deletePendingRequest(requestId);

        // Broadcast rejection
        if (req && req.tabId) {
            chrome.tabs.sendMessage(req.tabId, {
                type: `RIALO_REQUEST_COMPLETED_${requestId}`,
                success: false,
                error: 'User rejected request',
                pageRequestId: req.data?.id,
                requestType: req.type
            }).catch(() => { });
        }
        return { success: true };
    },

    async getPendingRequest(requestId: string) {
        let req = state.getPendingRequest(requestId);
        if (!req) {
            const stored = await requestStore.getRequest(requestId);
            if (stored) {
                // Check Expiry (5m)
                if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
                    await requestStore.removeRequest(stored.id);
                    return null;
                }
                req = stored as any;
            }
        }
        if (!req) return null;
        return {
            id: req.id,
            type: req.type,
            origin: req.origin,
            data: req.data,
            parsed: req.parsed
        };
    }
};
