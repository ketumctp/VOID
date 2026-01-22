/**
 * Background Service Worker - Main entry point
 * Handles all background operations for Rialo Wallet
 */

import './shims'; // MUST BE FIRST

import { handleMessage } from './message-handler';
import type { BaseMessage } from '../shared/types';

console.log('Rialo Wallet background service worker started');

/**
 * Listen for messages from popup and content scripts
 */
chrome.runtime.onMessage.addListener((
    message: BaseMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) => {
    // Sanitize log for security
    const sanitizedMessage = { ...message };
    if ('password' in sanitizedMessage) (sanitizedMessage as any).password = '***';
    if ('mnemonic' in sanitizedMessage) (sanitizedMessage as any).mnemonic = '***';
    if ('secretKey' in sanitizedMessage) (sanitizedMessage as any).secretKey = '***';

    console.log('[Rialo] Background received message:', sanitizedMessage);
    // Handle async messages
    handleMessage(message, sender)
        .then(response => {
            // handleMessage already returns a formatted response { success, data, id }
            // Do not wrap it again, or the UI will receive { success: true, data: { success: true, data: ... } }
            sendResponse(response);
        })
        .catch(error => {
            sendResponse({
                id: message.id,
                success: false,
                error: error.message || 'Unknown error'
            });
        });
    return true; // Keep channel open for async response
});

/**
 * Listen for external messages (from dApps via content script)
 */
chrome.runtime.onMessageExternal.addListener((
    message: BaseMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
) => {
    handleMessage(message, sender)
        .then(response => sendResponse(response))
        .catch(error => {
            sendResponse({
                id: message.id,
                success: false,
                error: error.message || 'Unknown error'
            });
        });

    return true;
});

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Rialo Wallet installed:', details.reason);

    if (details.reason === 'install') {
        // Open onboarding/main popup page
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
        });
    }
});

/**
 * Keep service worker alive
 */
chrome.runtime.onConnect.addListener((port) => {
    console.log('Port connected:', port.name);
});
