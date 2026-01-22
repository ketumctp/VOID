/**
 * Shared types for Rialo Wallet Extension
 */

// REMOVED: import { PublicKey, Transaction } from '@solana/web3.js';
// We use string representations for IPC messages

/**
 * Wallet state stored in chrome.storage
 */
export interface EncryptedWallet {
    encryptedSecretKey: string;
    salt: string;
    publicKey: string;
    version: number;
    iv: string;
    encryptedMnemonic?: string;
    accounts?: AccountInfo[]; // List of derived accounts
    currentAccountIndex?: number;
}

/**
 * Wallet account info
 */
export interface WalletAccount {
    publicKey: string;
    balance: number; // in lamports
}

/**
 * Message types between popup and background
 */
export enum MessageType {
    // Wallet Management
    CREATE_WALLET = 'CREATE_WALLET',
    IMPORT_WALLET = 'IMPORT_WALLET',
    UNLOCK_WALLET = 'UNLOCK_WALLET',
    LOCK_WALLET = 'LOCK_WALLET',
    GET_WALLET_STATE = 'GET_WALLET_STATE',

    // Account Operations
    GET_BALANCE = 'GET_BALANCE',
    GET_ADDRESS = 'GET_ADDRESS',

    // Transaction Operations
    SEND_TRANSACTION = 'SEND_TRANSACTION',
    SIGN_TRANSACTION = 'SIGN_TRANSACTION',
    SIGN_MESSAGE = 'SIGN_MESSAGE',
    SIGN_AND_SEND_TRANSACTION = 'SIGN_AND_SEND_TRANSACTION', // Wallet Standard feature
    SEND_RAW_TRANSACTION = 'SEND_RAW_TRANSACTION', // Broadcast only
    REQUEST_AIRDROP = 'REQUEST_AIRDROP',

    // dApp Integration
    CONNECT_DAPP = 'CONNECT_DAPP',
    DISCONNECT_DAPP = 'DISCONNECT_DAPP',
    GET_CONNECTED_DAPPS = 'GET_CONNECTED_DAPPS',
    APPROVE_CONNECTION = 'APPROVE_CONNECTION',
    REJECT_CONNECTION = 'REJECT_CONNECTION',
    GET_PENDING_REQUEST = 'GET_PENDING_REQUEST',
    RESOLVE_REQUEST = 'RESOLVE_REQUEST', // For signing
    REJECT_REQUEST = 'REJECT_REQUEST',   // For signing

    // Settings
    EXPORT_SECRET_KEY = 'EXPORT_SECRET_KEY',
    GET_MNEMONIC = 'GET_MNEMONIC',

    // Account Management
    ADD_ACCOUNT = 'ADD_ACCOUNT',
    SWITCH_ACCOUNT = 'SWITCH_ACCOUNT',
    GET_ACCOUNTS = 'GET_ACCOUNTS',
    SCAN_ACCOUNTS = 'SCAN_ACCOUNTS', // New: Discovery

    // New Feature IDs
    GET_TRANSACTIONS = 'GET_TRANSACTIONS',
    GET_TOKENS = 'GET_TOKENS',
    ADD_TOKEN = 'ADD_TOKEN',
    REMOVE_TOKEN = 'REMOVE_TOKEN',
    CHANGE_PASSWORD = 'CHANGE_PASSWORD',
    GET_ESTIMATED_FEE = 'GET_ESTIMATED_FEE'
}

export interface AccountInfo {
    index: number;
    name: string;
    publicKey: string;
}


/**
 * Base message structure
 */
export interface BaseMessage {
    type: MessageType;
    id: string;
}

/**
 * Request/Response pairs for each message type
 */
export interface CreateWalletRequest extends BaseMessage {
    type: MessageType.CREATE_WALLET;
    password: string;
}

export interface ImportWalletRequest extends BaseMessage {
    type: MessageType.IMPORT_WALLET;
    password: string;
    mnemonic?: string;
    secretKey?: string;
    accountsToImport?: number[]; // Array of indices (e.g. [0, 2, 5])
}

export interface UnlockWalletRequest extends BaseMessage {
    type: MessageType.UNLOCK_WALLET;
    password: string;
}

export interface SendTransactionRequest extends BaseMessage {
    type: MessageType.SEND_TRANSACTION;
    to: string;
    amount: number; // in lamports or token base units
    mint?: string; // Optional: Token Mint address (if sending SPL tokens)
    decimals?: number; // Optional: Token decimals (required if mint is provided)
}

export interface SignTransactionRequest extends BaseMessage {
    type: MessageType.SIGN_TRANSACTION;
    transaction: string; // serialized transaction
    origin?: string; // dApp origin
}

export interface SignMessageRequest extends BaseMessage {
    type: MessageType.SIGN_MESSAGE;
    message: string; // base64 encoded
    origin?: string;
}

export interface RequestAirdropRequest extends BaseMessage {
    type: MessageType.REQUEST_AIRDROP;
    amount: number; // in SOL/RIALO (base unit, not lamports)
}

export interface ConnectDappRequest extends BaseMessage {
    type: MessageType.CONNECT_DAPP;
    origin: string;
}

export interface SendRawTransactionRequest extends BaseMessage {
    type: MessageType.SEND_RAW_TRANSACTION;
    transaction: string; // base64 encoded serialized transaction
}

export interface AddTokenRequest extends BaseMessage {
    type: MessageType.ADD_TOKEN;
    mint: string;
}

export interface RemoveTokenRequest extends BaseMessage {
    type: MessageType.REMOVE_TOKEN;
    mint: string;
}

export interface TokenInfo {
    mint: string;
    balance: number;
    decimals: number;
    symbol?: string; // e.g. "USDC"
    name?: string;   // e.g. "USD Coin"
    logoURI?: string;
    icon?: string; // Deprecated, use logoURI
}


/**
 * Generic response structure
 */
export interface MessageResponse<T = any> {
    id: string;
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Wallet state response
 */
export interface WalletStateResponse {
    isLocked: boolean;
    hasWallet: boolean;
    publicKey?: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
    signature: string;
    confirmed: boolean;
}

/**
 * Connected dApp info
 */
export interface ConnectedDapp {
    origin: string;
    connectedAt: number;
    lastUsed: number;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
    name: string;
    rpcEndpoint: string;
    chainId?: string;
}
