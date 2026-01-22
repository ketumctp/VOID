/**
 * Rialo Standard Wallet Implementation
 * Implements @wallet-standard/base Wallet interface with security hardening
 */

import type {
    Wallet,
    WalletAccount,
    WalletVersion,
    WalletIcon,
    IdentifierArray,
} from '@wallet-standard/base';
import { RIALO_WALLET_ICON } from '../wallet-icon';
import { Buffer } from 'buffer';
import bs58 from 'bs58';
import { WalletMessenger } from './messenger';
import { createWalletAccount, RIALO_CHAINS } from './account';

/**
 * Rialo Wallet implementing Wallet Standard with security features
 */
export class RialoStandardWallet implements Wallet {
    readonly #version: WalletVersion = '1.0.0';
    readonly #name = 'Rialo Wallet';
    readonly #icon: WalletIcon = RIALO_WALLET_ICON;
    // Chain identifier - STRICTLY RIALO DEVNET ONLY
    readonly #chains: IdentifierArray = RIALO_CHAINS;

    #accounts: WalletAccount[] = [];
    #eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();
    #connectedOrigins: Set<string> = new Set();
    #messenger: WalletMessenger;

    constructor() {
        this.#messenger = new WalletMessenger();
        // Initialize wallet state
        this.#setupMessageListener();
    }

    get version(): WalletVersion {
        return this.#version;
    }

    get name(): string {
        return this.#name;
    }

    get icon(): WalletIcon {
        return this.#icon;
    }

    get chains(): IdentifierArray {
        return this.#chains;
    }

    get accounts(): readonly WalletAccount[] {
        return this.#accounts;
    }

    get features(): Wallet['features'] {
        return {
            // Standard features
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },

            'standard:disconnect': {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },

            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },

            // Rialo-specific features (Renamed from solana:)
            'rialo:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },

            'rialo:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },

            'rialo:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },

            'rialo:sendRawTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                sendRawTransaction: this.#sendRawTransaction,
            },

            // Solana Compatibility Aliases
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },

            'solana:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },

            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
        };
    }

    /**
     * SECURITY LAYER: Connect feature with origin binding
     */
    #connect = async (_options?: { silent?: boolean }): Promise<{ accounts: readonly WalletAccount[] }> => {
        try {
            const origin = window.location.origin;

            // Send connect request to background
            const response = await this.#messenger.sendMessage({
                type: 'RIALO_WALLET_CONNECT',
                origin,
            });

            if (response.publicKey) {
                // Create wallet account
                const account = createWalletAccount(response.publicKey);

                this.#accounts = [account];
                this.#connectedOrigins.add(origin);

                // Emit events
                this.#emit('change', { accounts: this.#accounts });

                return { accounts: this.#accounts };
            }

            throw new Error('Connection failed');
        } catch (error) {
            console.error('Connect error:', error);
            throw error;
        }
    };

    /**
     * SECURITY LAYER: Disconnect feature
     */
    #disconnect = async (): Promise<void> => {
        const origin = window.location.origin;

        await this.#messenger.sendMessage({
            type: 'RIALO_WALLET_DISCONNECT',
            origin,
        });

        this.#accounts = [];
        this.#connectedOrigins.delete(origin);

        // Emit change event
        this.#emit('change', { accounts: [] });
    };

    /**
     * SECURITY LAYER: Sign transaction with validation
     */
    #signTransaction = async (input: {
        account: WalletAccount;
        transaction: Uint8Array;
        chain?: string;
    }): Promise<{ signedTransaction: Uint8Array }> => {
        this.#validateOriginAccess();

        const origin = window.location.origin;
        const transactionBase64 = Buffer.from(input.transaction).toString('base64');

        const response = await this.#messenger.sendMessage({
            type: 'RIALO_WALLET_SIGN_TRANSACTION',
            transaction: transactionBase64,
            origin,
        });

        return {
            signedTransaction: Buffer.from(response.signedTx, 'base64'),
            // Also pass through raw signature bytes for proper Transaction injection
            signatureBytes: response.signatureBytes ? new Uint8Array(response.signatureBytes) : undefined,
        } as any; // Cast to any since Wallet Standard doesn't define signatureBytes
    };

    /**
     * SECURITY LAYER: Sign message with enhanced UI
     */
    #signMessage = async (input: {
        account: WalletAccount;
        message: Uint8Array;
    }): Promise<{ signature: Uint8Array }> => {
        this.#validateOriginAccess();

        const origin = window.location.origin;
        const messageBase64 = Buffer.from(input.message).toString('base64');

        const response = await this.#messenger.sendMessage({
            type: 'RIALO_WALLET_SIGN_MESSAGE',
            message: messageBase64,
            origin,
        });

        return {
            signature: bs58.decode(response.signature),
        };
    };

    /**
     * SECURITY LAYER: Sign and send with simulation
     */
    #signAndSendTransaction = async (input: {
        account: WalletAccount;
        transaction: Uint8Array | string;
        chain?: string;
    }): Promise<{ signature: Uint8Array }> => {
        this.#validateOriginAccess();

        const origin = window.location.origin;

        // Check if already JSON string (native Rialo transfer params)
        let transactionData: string;
        if (typeof input.transaction === 'string') {
            // Already JSON string from inject.js native transfer detection
            transactionData = input.transaction;
        } else {
            // Binary transaction - encode to base64
            transactionData = Buffer.from(input.transaction).toString('base64');
        }

        const response = await this.#messenger.sendMessage({
            type: 'RIALO_WALLET_SIGN_AND_SEND',
            transaction: transactionData,
            origin,
        });

        return {
            signature: bs58.decode(response.signature),
        };
    };

    /**
     * Rialo Feature: Send Raw Transaction (Broadcast only)
     */
    #sendRawTransaction = async (input: {
        transaction: Uint8Array;
        chain?: string;
    }): Promise<{ signature: Uint8Array }> => {
        this.#validateOriginAccess();

        const origin = window.location.origin;
        const transactionBase64 = Buffer.from(input.transaction).toString('base64');

        const response = await this.#messenger.sendMessage({
            type: 'RIALO_WALLET_SEND_RAW_TRANSACTION',
            transaction: transactionBase64,
            origin,
        });

        return {
            signature: bs58.decode(response.signature),
        };
    };

    /**
     * Event emitter
     */
    #on = (event: string, listener: (...args: any[]) => void): (() => void) => {
        if (!this.#eventListeners.has(event)) {
            this.#eventListeners.set(event, new Set());
        }
        this.#eventListeners.get(event)!.add(listener);

        // Return unsubscribe function
        return () => {
            const listeners = this.#eventListeners.get(event);
            if (listeners) {
                listeners.delete(listener);
            }
        };
    };

    /**
     * Emit events to listeners
     */
    #emit(event: string, ...args: any[]): void {
        const listeners = this.#eventListeners.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    /**
     * SECURITY: Validate origin has access
     */
    #validateOriginAccess(): void {
        const origin = window.location.origin;
        if (!this.#connectedOrigins.has(origin)) {
            throw new Error('Wallet not connected to this origin');
        }
    }

    /**
     * Setup message listener for responses from content script
     */
    #setupMessageListener(): void {
        this.#messenger.setupListener(this.#handleMessage.bind(this));
    }

    /**
     * Handle incoming messages
     */
    #handleMessage(data: any): void {
        const { result, type } = data;

        if (type === 'RIALO_WALLET_ACCOUNT_CHANGED') {
            // Handle account change event
            if (result.publicKey) {
                const account = createWalletAccount(result.publicKey);
                this.#accounts = [account];
                this.#emit('change', { accounts: this.#accounts });
            } else {
                this.#accounts = [];
                this.#emit('change', { accounts: [] });
            }
        } else if (type === 'RIALO_WALLET_DISCONNECT_EVENT') {
            // CRIT-FIX: Handle remote disconnect
            const origin = window.location.origin;
            this.#accounts = [];
            this.#connectedOrigins.delete(origin);
            this.#emit('change', { accounts: [] });
        }
    }
}
