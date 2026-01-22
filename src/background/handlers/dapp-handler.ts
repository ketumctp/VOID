
import * as dappManager from '../dapp-manager';
import * as keyring from '../keyring';
import * as requestStore from '../request-store';
import { popupManager } from '../popup-manager';
import type { ConnectDappRequest } from '../../shared/types';

// Module-level state for pending connections
const pendingConnections = new Map<string, {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    popupId: number;
}>();

export async function handleConnectDapp(msg: ConnectDappRequest, sender?: chrome.runtime.MessageSender) {
    console.log('[Rialo] Handling CONNECT_DAPP for origin:', msg.origin);

    // SECURITY FIX: Origin Spoofing Protection for Connection
    if (sender && sender.url) {
        try {
            const senderUrl = new URL(sender.url);
            const senderOrigin = senderUrl.origin;

            if (senderOrigin !== msg.origin) {
                console.error(`[Rialo Security] Connection Origin Mismatch! Claimed: ${msg.origin}, Actual: ${senderOrigin}`);
                throw new Error('SECURITY VIOLATION: Origin Mismatch. You cannot connect as another dApp.');
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('SECURITY')) throw e;
            console.warn('[Rialo] Failed to validate connection origin:', e);
            // We might want to be strict here too, but consistent with transaction handler
            throw new Error('SECURITY VIOLATION: Failed to validate sender origin.');
        }
    }

    // AUTO-CONNECT CHECK (CRIT-FIX: Persistence)
    if (await dappManager.isConnected(msg.origin)) {
        console.log('[Rialo] Already connected to origin:', msg.origin);
        const publicKey = await keyring.getPublicKey();
        if (publicKey) {
            return { publicKey, connected: true, autoApproved: true };
        }
    }

    // SECURITY: Open popup for user approval
    // CRIT-FIX: Random ID to prevent prediction
    const requestId = crypto.randomUUID();

    // PERSISTENCE (CRIT-004)
    await requestStore.saveRequest({
        id: requestId,
        type: 'connect',
        origin: msg.origin,
        data: { origin: msg.origin },
        timestamp: Date.now()
    });

    // Open approval popup or delegate to Side Panel
    return new Promise<any>(async (resolve, reject) => {

        // 1. Try to delegate to active Side Panel first
        try {
            const sidePanelActive = await Promise.race([
                new Promise<boolean>(r => {
                    chrome.runtime.sendMessage({ type: 'CHECK_SIDEPANEL_ACTIVE' }, (response) => {
                        if (chrome.runtime.lastError) r(false);
                        else r(response && response.active);
                    });
                }),
                new Promise<boolean>(r => setTimeout(() => r(false), 200)) // 200ms timeout
            ]);

            if (sidePanelActive) {
                console.log('[Rialo] Delegating connection request to Side Panel');
                // Send the request to the side panel
                chrome.runtime.sendMessage({
                    type: 'OPEN_CONNECT_VIEW',
                    origin: msg.origin,
                    requestId: requestId
                });

                // We still need to track the pending connection
                pendingConnections.set(requestId, { resolve, reject, popupId: 0 });
                return;
            }
        } catch (err) {
            console.warn('[Rialo] Side Panel check failed, falling back to popup', err);
        }

        // 2. Fallback: Open Popup Window
        console.log('[Rialo] Creating approval popup...');

        const url = `approve.html?origin=${encodeURIComponent(msg.origin)}&requestId=${requestId}`;

        // RACE CONDITION FIX (CRIT-003)
        popupManager.openPopup(chrome.runtime.getURL(url), 'dapp_connect')
            .then((popupWindow) => {
                if (!popupWindow?.id) {
                    console.error('[Rialo] Failed to open popup');
                    reject(new Error('Failed to open approval window'));
                    return;
                }

                console.log('[Rialo] Popup created with ID:', popupWindow.id);

                // Store the pending connection request
                pendingConnections.set(requestId, { resolve, reject, popupId: popupWindow.id });
                console.log('[Rialo] Connection pending for:', msg.origin, 'ID:', requestId);
            })
            .catch((err) => {
                requestStore.removeRequest(requestId);
                reject(err);
            });
    });
}

export async function handleApproveConnection(msg: { origin?: string, requestId: string }) {
    console.log('[Rialo] Received APPROVE_CONNECTION for ID:', msg.requestId);

    const requestId = msg.requestId;
    let pending = pendingConnections.get(requestId);

    // REHYDRATION (CRIT-004)
    if (!pending) {
        // Check storage
        const stored = await requestStore.getRequest(requestId);
        if (stored) {
            console.log('[Rialo] Restored pending connection from storage');
            // Create dummy pending object to support flow
            pending = {
                resolve: () => console.log('Orphaned connection resolved'),
                reject: () => console.log('Orphaned connection rejected'),
                popupId: 0 // Unknown if restored
            };
        }
    }

    if (!pending) {
        console.warn('[Rialo] No pending connection found for ID:', requestId);
        throw new Error('No pending connection found');
    }

    // We need origin from storage or msg?
    // msg should have origin if possible, but we should trust storage
    const stored = await requestStore.getRequest(requestId);
    const origin = stored?.origin || msg.origin;

    if (!origin) throw new Error('Origin not found for request');

    try {
        console.log('[Rialo] Processing approval...');
        await dappManager.connectDapp(origin);
        const publicKey = await keyring.getPublicKey();

        // Close popup
        if (pending.popupId) {
            chrome.windows.remove(pending.popupId).catch(() => { });
        }

        // Resolve the original promise
        console.log('[Rialo] Resolving pending connection promise');
        pending.resolve({ publicKey, connected: true });

        // Cleanup
        pendingConnections.delete(requestId);

        await requestStore.removeRequest(requestId);
        popupManager.closePopup();

        return { success: true };
    } catch (error) {
        console.error('[Rialo] Approval processing failed:', error);
        pending.reject(error);
        pendingConnections.delete(requestId);
        throw error;
    }
}

export async function handleRejectConnection(msg: { origin?: string, requestId: string }) {
    console.log('[Rialo] Received REJECT_CONNECTION for ID:', msg.requestId);

    const requestId = msg.requestId;
    const pending = pendingConnections.get(requestId);

    if (!pending) {
        return { success: true }; // Already handled or timeout
    }

    // Close popup
    if (pending.popupId) {
        chrome.windows.remove(pending.popupId).catch(() => { });
    }

    // Reject the original promise
    pending.reject(new Error('User rejected connection'));

    // Cleanup
    pendingConnections.delete(requestId);
    await requestStore.removeRequest(requestId);
    popupManager.closePopup();

    return { success: true };
}

export async function handleDisconnectDapp(msg: { origin: string }) {
    await dappManager.disconnectDapp(msg.origin);

    // BROADCAST DISCONNECT EVENT (CRIT-FIX: UI Sync)
    // Find all tabs with this origin and notify them
    // Note: Chrome extensions can't easily query tabs by origin directly without iterating
    // We send to all tabs, content script filters by checking its own origin?
    // Optimization: query by url pattern if possible, or just broadcast.
    // Simpler: Send to all tabs, let content script ignore if not relevant?
    // Better: We know the sender tab ID usually?
    // msg doesn't have tabId. But handleDisconnect is usually called from UI.

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id && tab.url && tab.url.startsWith(msg.origin)) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'RIALO_WALLET_DISCONNECT_EVENT',
                origin: msg.origin
            }).catch(() => { }); // Ignore errors (closed tabs)
        }
    }

    return { success: true };
}

export async function handleGetConnectedDapps() {
    return await dappManager.getConnectedDapps();
}

export async function handleCheckConnectionStatus(msg: { origin: string }) {
    const isConnected = await dappManager.isConnected(msg.origin);
    return { isConnected };
}
