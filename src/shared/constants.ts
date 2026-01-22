/**
 * Constants for Rialo Wallet Extension
 */

import type { NetworkConfig } from './types';

/**
 * Network configurations
 */
export const RIALO_DEVNET: NetworkConfig = {
    name: 'Rialo Devnet',
    rpcEndpoint: 'https://devnet.rialo.io:4101',
    chainId: 'rialo-devnet'
};

export const DEFAULT_NETWORK = RIALO_DEVNET;

/**
 * Chrome storage keys
 */
export const STORAGE_KEYS = {
    ENCRYPTED_WALLET: 'encrypted_wallet',
    CONNECTED_DAPPS: 'connected_dapps',
    SETTINGS: 'settings'
} as const;

/**
 * Encryption configuration
 */
export const ENCRYPTION_CONFIG = {
    PBKDF2_ITERATIONS: 100000,
    SALT_LENGTH: 16, // bytes
    KEY_LENGTH: 32, // 256 bits
    IV_LENGTH: 12, // GCM standard
    ALGORITHM: 'AES-GCM' as const,
    KEY_DERIVATION: 'PBKDF2' as const
};

/**
 * Wallet configuration
 */
export const WALLET_CONFIG = {
    VERSION: 1,
    MNEMONIC_STRENGTH: 128, // 12 words
    DERIVATION_PATH: "m/44'/501'/0'/0'" // Solana standard path
};

/**
 * Transaction configuration
 */
export const TRANSACTION_CONFIG = {
    CONFIRMATION_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    COMMITMENT: 'confirmed' as const
};

/**
 * UI configuration
 */
export const UI_CONFIG = {
    POPUP_WIDTH: 375,
    POPUP_HEIGHT: 600,
    NOTIFICATION_DURATION: 3000
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    WALLET_LOCKED: 'Wallet is locked',
    WALLET_NOT_FOUND: 'No wallet found',
    INVALID_PASSWORD: 'Invalid password',
    INVALID_MNEMONIC: 'Invalid mnemonic phrase',
    INVALID_SECRET_KEY: 'Invalid secret key',
    INVALID_ADDRESS: 'Invalid address',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    TRANSACTION_FAILED: 'Transaction failed',
    NETWORK_ERROR: 'Network error',
    USER_REJECTED: 'User rejected the request'
} as const;

/**
 * Security Constants
 */
export const KNOWN_PROGRAMS = {
    SYSTEM: '11111111111111111111111111111111',
    TOKEN: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
    MEMO: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb'
} as const;
