/**
 * Inject Script - Secure Wallet Standard Registration
 * Implements @wallet-standard/core with comprehensive security mitigations
 */

import { registerWallet } from '@wallet-standard/wallet';
import { RialoStandardWallet } from '../shared/rialo-standard-wallet';
import bs58 from 'bs58';
// Buffer removed (unused)

// SECURITY LAYER 3: One-time registration guard
let walletRegistered = false;

// Create wallet instance
const rialoStandardWallet = new RialoStandardWallet();

/**
 * Register wallet with Wallet Standard
 * SECURITY: One-time registration, event validation
 */
function registerRialoWallet(): void {
    if (walletRegistered) {
        console.warn('[Rialo] Wallet already registered');
        return;
    }

    try {
        // Register with Wallet Standard (primary method)
        registerWallet(rialoStandardWallet);
        walletRegistered = true;

        console.log('[Rialo] Wallet registered via Wallet Standard');
    } catch (error) {
        console.error('[Rialo] Failed to register wallet:', error);
    }
}

/**
 * SECURITY LAYER 1: Legacy window.rialo with full hardening
 * Option B: Hardened backward compatibility
 */
function createLegacyAPI() {
    // Event Emitter Implementation
    const _events: Map<string, Set<Function>> = new Map();

    const emit = (event: string, ...args: any[]) => {
        const listeners = _events.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (e) {
                    console.error('[Rialo] Event listener error:', e);
                }
            });
        }
    };

    // Minimal proxy API - all methods proxy to Wallet Standard
    const legacyAPI = {
        publicKey: null as any, // Type 'any' to compat with PublicKey object expectations
        isConnected: false,
        isRialo: true,
        isPhantom: false, // Don't spoof Phantom directly, but act like it

        connect: async (options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: any }> => {
            // Support silent connect logic passed to standard wallet?
            // Standard wallet doesn't support options argument in current interface but we can try
            // Our background handler now supports auto-connect which satisfies onlyIfTrusted behavior naturally.

            try {
                const connectFeature = rialoStandardWallet.features['standard:connect'] as any;
                const result = await connectFeature.connect();

                if (result.accounts && result.accounts.length > 0) {
                    const pubKeyContent = result.accounts[0].address;
                    const publicKeyObj = {
                        toString: () => pubKeyContent,
                        toBase58: () => pubKeyContent,
                        toJSON: () => pubKeyContent,
                        toBytes: () => bs58.decode(pubKeyContent)
                    };

                    // Update internal state immediately for return
                    // Event listener will also update it shortly
                    legacyAPI.publicKey = publicKeyObj;
                    legacyAPI.isConnected = true;

                    return { publicKey: publicKeyObj };
                }
            } catch (e) {
                // Silent fail for onlyIfTrusted
                if (options?.onlyIfTrusted) {
                    throw new Error('User rejected connection');
                }
                throw e;
            }
            throw new Error('Connection failed');
        },

        disconnect: async (): Promise<void> => {
            const disconnectFeature = rialoStandardWallet.features['standard:disconnect'] as any;
            await disconnectFeature.disconnect();
            // State update handled by event listener
        },

        signTransaction: async (transaction: string): Promise<{ signature: string; signedTx: string }> => {
            if (!legacyAPI.isConnected) throw new Error('Wallet not connected');

            // Convert to Uint8Array if needed
            let txBytes: Uint8Array;
            if (typeof transaction === 'string') {
                txBytes = Uint8Array.from(atob(transaction), c => c.charCodeAt(0));
            } else if (transaction && typeof (transaction as any).serialize === 'function') {
                txBytes = (transaction as any).serialize({ requireAllSignatures: false, verifySignatures: false });
            } else {
                txBytes = transaction as any;
            }

            const account = rialoStandardWallet.accounts[0];
            if (!account) throw new Error('No account available');

            const signTxFeature = rialoStandardWallet.features['rialo:signTransaction'] as any;
            const result = await signTxFeature.signTransaction({
                account,
                transaction: txBytes,
            });

            const signedTxBase64 = btoa(String.fromCharCode(...result.signedTransaction));
            return {
                signature: 'legacy_signature', // Placeholder
                signedTx: signedTxBase64,
            };
        },

        signMessage: async (message: string): Promise<{ signature: Uint8Array }> => {
            if (!legacyAPI.isConnected) throw new Error('Wallet not connected');

            const messageBytes = new TextEncoder().encode(message);
            const account = rialoStandardWallet.accounts[0];
            if (!account) throw new Error('No account available');

            const signMsgFeature = rialoStandardWallet.features['rialo:signMessage'] as any;
            const result = await signMsgFeature.signMessage({
                account,
                message: messageBytes,
            });

            // Legacy returns object with signature property usually?
            // Phantom returns { signature: Uint8Array }
            return { signature: result.signature };
        },

        signAndSendTransaction: async (transaction: any): Promise<{ signature: string }> => {
            if (!legacyAPI.isConnected) throw new Error('Wallet not connected');

            const account = rialoStandardWallet.accounts[0];
            if (!account) throw new Error('No account available');

            // CUSTOM PROGRAM INSTRUCTION: Detect {programId, accounts, data}
            if (transaction && typeof transaction === 'object' && transaction.programId && Array.isArray(transaction.accounts)) {
                console.log('[Rialo] Custom instruction detected:', transaction);
                const signAndSendFeature = rialoStandardWallet.features['rialo:signAndSendTransaction'] as any;
                const result = await signAndSendFeature.signAndSendTransaction({
                    account,
                    transaction: JSON.stringify(transaction)
                });
                return { signature: bs58.encode(result.signature) };
            }

            // NATIVE RIALO TRANSFER: Detect simple params {to, amount}
            if (transaction && typeof transaction === 'object' && transaction.to && typeof transaction.amount === 'number') {
                console.log('[Rialo] Native transfer detected:', transaction);
                const signAndSendFeature = rialoStandardWallet.features['rialo:signAndSendTransaction'] as any;
                const result = await signAndSendFeature.signAndSendTransaction({
                    account,
                    transaction: JSON.stringify(transaction)
                });
                return { signature: bs58.encode(result.signature) };
            }

            // Fallback / Legacy Path
            let txBytes: Uint8Array;
            if (typeof transaction === 'string') {
                txBytes = Uint8Array.from(atob(transaction), c => c.charCodeAt(0));
            } else if (transaction && typeof (transaction as any).serialize === 'function') {
                txBytes = (transaction as any).serialize({ requireAllSignatures: false, verifySignatures: false });
            } else {
                txBytes = transaction as any;
            }

            const signAndSendFeature = rialoStandardWallet.features['rialo:signAndSendTransaction'] as any;
            const result = await signAndSendFeature.signAndSendTransaction({
                account,
                transaction: txBytes,
            });

            const signatureBase58 = btoa(String.fromCharCode(...result.signature));
            return { signature: signatureBase58 };
        },

        on: (event: string, callback: Function): void => {
            if (!_events.has(event)) {
                _events.set(event, new Set());
            }
            _events.get(event)!.add(callback);
        },

        off: (event: string, callback: Function): void => {
            const listeners = _events.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        },
    };

    // SYNC WITH STANDARD WALLET EVENTS
    // This is the glue that makes legacy API reactive!
    const standardEvents = rialoStandardWallet.features['standard:events'] as any;
    standardEvents.on('change', (properties: { accounts: any[] }) => {
        if (properties.accounts) {
            if (properties.accounts.length > 0) {
                // Connected
                const newKey = properties.accounts[0].address;
                if (!legacyAPI.isConnected || (legacyAPI.publicKey && legacyAPI.publicKey.toBase58() !== newKey)) {
                    const publicKeyObj = {
                        toString: () => newKey,
                        toBase58: () => newKey,
                        toJSON: () => newKey,
                        toBytes: () => bs58.decode(newKey)
                    };
                    legacyAPI.publicKey = publicKeyObj;
                    legacyAPI.isConnected = true;
                    // Emit 'connect' with public key
                    emit('connect', publicKeyObj);
                }
            } else {
                // Disconnected
                if (legacyAPI.isConnected) {
                    legacyAPI.isConnected = false;
                    legacyAPI.publicKey = null;
                    emit('disconnect');
                }
            }
        }
    });

    // Check initial state
    if (rialoStandardWallet.accounts.length > 0) {
        const newKey = rialoStandardWallet.accounts[0].address;
        const publicKeyObj = {
            toString: () => newKey,
            toBase58: () => newKey,
            toJSON: () => newKey,
            toBytes: () => bs58.decode(newKey)
        };
        legacyAPI.publicKey = publicKeyObj;
        legacyAPI.isConnected = true;
    }

    // SECURITY MITIGATION: specific method freezing
    // We allow propertries (publicKey, isConnected) to change, but methods are immutable
    const methods = ['connect', 'disconnect', 'signTransaction', 'signMessage', 'signAndSendTransaction', 'on', 'off'];

    methods.forEach(method => {
        Object.defineProperty(legacyAPI, method, {
            value: (legacyAPI as any)[method],
            writable: false,
            configurable: false
        });
    });

    // Prevent adding new properties, but allow changing existing ones (like publicKey)
    Object.seal(legacyAPI);

    return legacyAPI;
}

/**
 * Initialize wallet
 */
function initializeWallet(): void {
    // Register with Wallet Standard (primary)
    registerRialoWallet();

    // Create legacy API (backward compatibility with security)
    const legacyAPI = createLegacyAPI();

    // Assign to window (frozen object)
    (window as any).rialo = legacyAPI;

    // COMPATIBILITY LAYER: Expose as window.solana for legacy dApps
    // This allows dApps looking for a default Solana provider to find Rialo
    if (!(window as any).solana) {
        (window as any).solana = legacyAPI;
        console.log('[Rialo] Registered as window.solana for compatibility');
    }

    // Announce availability
    window.dispatchEvent(new CustomEvent('rialo#initialized', {
        detail: { rialo: legacyAPI }
    }));

    console.log('[Rialo] Wallet initialized (Standard + Legacy)');
}

// Initialize immediately
initializeWallet();
