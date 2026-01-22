/**
 * Content Script - Secure Bridge (SECURITY LAYER 2)
 * Message passing with validation, nonce tracking, and origin binding
 */

import { MessageType } from '../shared/types';
import { validateMessage, trackNonce } from './utils/validation';
import type { AllowedMessageType } from './utils/validation';

console.log('[Rialo Content] Secure content script loaded');

/**
 * Inject the inject.js script into page context
 */
function injectScript() {
    try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        script.async = false;
        script.onload = function () {
            // @ts-ignore
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    } catch (error) {
        console.error('Failed to inject Rialo Wallet script:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScript);
} else {
    injectScript();
}

/**
 * Listen for Background Events (Disconnect, Account Change)
 */
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'RIALO_WALLET_DISCONNECT_EVENT') {
        const currentOrigin = window.location.origin;
        // Verify origin matches to be safe (though background filters too)
        if (message.origin && currentOrigin.startsWith(message.origin)) {
            console.log('[Rialo Content] Received Disconnect Event');
            window.postMessage({
                type: 'RIALO_WALLET_DISCONNECT_EVENT',
                timestamp: Date.now()
            }, '*');
        }
    }

    // FIX: Listen for completion events to resolve pending promises
    // This handles cases where the Service Worker sends a result asynchronously
    // or rehydrates after a suspend.
    if (message.type && message.type.startsWith('RIALO_REQUEST_COMPLETED_')) {
        const { success, result, error, pageRequestId, requestType } = message;

        if (pageRequestId && requestType) {
            console.log('[Rialo Content] Resolving async request:', { pageRequestId, success });

            // Map internal types to public message types
            let responseType = '';
            switch (requestType) {
                case 'connect': responseType = 'RIALO_WALLET_CONNECT_RESPONSE'; break;
                case 'transaction': responseType = 'RIALO_WALLET_SIGN_TRANSACTION_RESPONSE'; break;
                case 'message': responseType = 'RIALO_WALLET_SIGN_MESSAGE_RESPONSE'; break;
                case 'signAndSend': responseType = 'RIALO_WALLET_SIGN_AND_SEND_RESPONSE'; break;
                case 'raw': responseType = 'RIALO_WALLET_SEND_RAW_TRANSACTION_RESPONSE'; break; // Approximate map
            }

            if (responseType) {
                window.postMessage({
                    type: responseType,
                    id: pageRequestId,
                    success,
                    result,
                    error
                }, '*');
            }
        }
    }
});

/**
 * SECURITY LAYER 2: Secure message listener
 */
window.addEventListener('message', async (event) => {
    // SECURITY: Only accept messages from same window
    if (event.source !== window) return;

    const { type, id } = event.data;

    // Handle Rialo wallet messages
    if (!type?.startsWith('RIALO_WALLET_')) return;
    if (type.endsWith('_RESPONSE')) return;

    // SECURITY: Validate message
    const validation = validateMessage(event.data);
    if (!validation.valid) {
        if (!validation.silent) {
            console.error('[Rialo Security] Message validation failed:', validation.error);
        }
        if (id && !validation.silent) {
            window.postMessage({
                type: type + '_RESPONSE',
                id,
                success: false,
                error: validation.error || 'Invalid message'
            }, '*');
        }
        return;
    }

    // SECURITY: Track nonce
    trackNonce(id);

    try {
        let response: any;

        switch (type as AllowedMessageType) {
            case 'RIALO_WALLET_CONNECT':
                response = await handleConnect();
                sendResponse(type, id, true, response);
                break;
            case 'RIALO_WALLET_DISCONNECT':
                response = await handleDisconnect();
                sendResponse(type, id, true, response);
                break;
            case 'RIALO_WALLET_SIGN_TRANSACTION':
                response = await handleSignTransaction(event.data.transaction);
                sendResponse(type, id, true, response);
                break;
            case 'RIALO_WALLET_SIGN_MESSAGE':
                response = await handleSignMessage(event.data.message);
                sendResponse(type, id, true, response);
                break;
            case 'RIALO_WALLET_SIGN_AND_SEND':
                response = await handleSignAndSend(event.data.transaction);
                sendResponse(type, id, true, response);
                break;
            case 'RIALO_WALLET_SEND_RAW_TRANSACTION':
                // @ts-ignore
                response = await handleSendRawTransaction(event.data.transaction);
                sendResponse(type, id, true, response);
                break;
        }
    } catch (error) {
        sendResponse(type, id, false, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
});

function sendResponse(type: string, id: string, success: boolean, result?: any, error?: string) {
    window.postMessage({
        type: type + '_RESPONSE',
        id,
        success,
        result,
        error
    }, '*');
}

function sendToBackground(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    const errorMsg = chrome.runtime.lastError.message || 'Unknown error';

                    // SUPPRESSION: Handle "Extension context invalidated" gracefully
                    if (errorMsg.includes('Extension context invalidated')) {
                        console.warn('[Rialo] Extension context lost (updated/reloaded). Please reload the page.');
                        // We reject, but the dApp provider should handle this
                        reject(new Error('Extension context invalidated'));
                        return;
                    }

                    reject(new Error(errorMsg));
                } else if (response && response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response?.error || 'Request failed'));
                }
            });
        } catch (e) {
            // This catches immediate synchronous errors (like context already gone)
            console.warn('[Rialo] Send failed:', e);
            reject(new Error('Extension context invalidated'));
        }
    });
}


async function handleConnect() {
    return await sendToBackground({
        type: MessageType.CONNECT_DAPP,
        id: generateId(),
        origin: window.location.origin
    });
}

async function handleDisconnect() {
    return await sendToBackground({
        type: MessageType.DISCONNECT_DAPP,
        id: generateId(),
        origin: window.location.origin
    });
}

async function handleSignTransaction(transaction: string) {
    return await sendToBackground({
        type: MessageType.SIGN_TRANSACTION,
        id: generateId(),
        transaction,
        origin: window.location.origin
    });
}

async function handleSignMessage(message: string) {
    return await sendToBackground({
        type: MessageType.SIGN_MESSAGE,
        id: generateId(),
        message,
        origin: window.location.origin
    });
}

async function handleSignAndSend(transaction: string) {
    return await sendToBackground({
        type: MessageType.SIGN_AND_SEND_TRANSACTION,
        id: generateId(),
        transaction,
        origin: window.location.origin
    });
}

async function handleSendRawTransaction(transaction: string) {
    return await sendToBackground({
        type: MessageType.SEND_RAW_TRANSACTION,
        id: generateId(),
        transaction,
        origin: window.location.origin
    });
}

function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
