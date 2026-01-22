
/**
 * Rialo API Types & Validation
 * Mirrors `rialo-api-types` v0.1.10
 */

// ============================================================================
// CONSTANTS (from rialo-api-types/constants.rs)
// ============================================================================

export const MAX_LAMPORTS = 500_000_000_000_000_000n;
export const MAX_AIRDROP_AMOUNT = 1_000_000_000_000n;
export const MAX_PAGINATION_LIMIT = 1000;
export const MIN_SIGNATURE_LENGTH = 87;
export const MAX_SIGNATURE_LENGTH = 88;
export const MIN_BLOCKHASH_LENGTH = 43;
export const MAX_BLOCKHASH_LENGTH = 44;

// ============================================================================
// VALIDATION LOGIC (from rialo-api-types/validation.rs)
// ============================================================================

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export function validatePubkey(pubkey: string): void {
    // Basic base58 check and length validaiton
    // Helper Regex for Base58 (alphanumeric except 0OIl)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(pubkey)) {
        throw new ValidationError(`Invalid pubkey format: ${pubkey}`);
    }
    if (pubkey.length < 32 || pubkey.length > 44) { // Standard Solana pubkey length range in base58
        throw new ValidationError(`Invalid pubkey length: ${pubkey.length}`);
    }
}

export function validateSignature(signature: string): void {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(signature)) {
        throw new ValidationError(`Invalid signature format`);
    }
    if (signature.length < MIN_SIGNATURE_LENGTH || signature.length > MAX_SIGNATURE_LENGTH) {
        throw new ValidationError(`Invalid signature length: ${signature.length}`);
    }
}

export function validateLamports(lamports: number | bigint): void {
    const val = BigInt(lamports);
    if (val < 0n) {
        throw new ValidationError('Lamports cannot be negative');
    }
    if (val > MAX_LAMPORTS) {
        throw new ValidationError(`Lamports exceed max allowed: ${val}`);
    }
}

export function validateAirdropAmount(lamports: number | bigint): void {
    const val = BigInt(lamports);
    if (val <= 0n) {
        throw new ValidationError('Airdrop amount must be positive');
    }
    if (val > MAX_AIRDROP_AMOUNT) {
        throw new ValidationError(`Airdrop amount exceeds limit: ${val}`);
    }
}

export function validateLimit(limit: number): void {
    if (limit <= 0) {
        throw new ValidationError('Limit must be positive');
    }
    if (limit > MAX_PAGINATION_LIMIT) {
        throw new ValidationError(`Limit exceeds max pagination: ${limit}`);
    }
}

export function validateBlockhash(hash: string): void {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(hash)) {
        throw new ValidationError(`Invalid blockhash format`);
    }
    if (hash.length < MIN_BLOCKHASH_LENGTH || hash.length > MAX_BLOCKHASH_LENGTH) {
        throw new ValidationError(`Invalid blockhash length: ${hash.length}`);
    }
}

export type Encoding = 'base58' | 'base64' | 'json' | 'jsonParsed';

export function validateEncoding(encoding: string): void {
    const valid = ['base58', 'base64', 'json', 'jsonParsed'];
    if (!valid.includes(encoding)) {
        throw new ValidationError(`Invalid encoding: ${encoding}`);
    }
}

// ============================================================================
// MESSAGE TYPES (Request Interfaces)
// ============================================================================

export interface RequestAirdropRequest {
    pubkey: string;
    lamports: number; // RPC usually takes number or u64 as number/string
}

export interface GetAccountInfoRequest {
    pubkey: string;
    encoding?: Encoding;
}

export interface GetBalanceRequest {
    pubkey: string;
}

export interface SendTransactionRequest {
    transaction: string; // base58 or base64 encoded string
    encoding?: Encoding;
    maxRetries?: number;
    skipPreflight?: boolean;
}

export interface GetTransactionRequest {
    signature: string;
    encoding?: Encoding;
}

// Rialo Specific
export interface GetWorkflowLineageRequest {
    workflowId: string;
}

export interface GetTriggeredTransactionsRequest {
    limit?: number;
}

export interface GetSubscriptionsRequest {
    subscriber: string;
}

export interface GetMultipleAccountsRequest {
    pubkeys: string[];
    encoding?: Encoding;
}

export interface GetSignatureStatusesRequest {
    signatures: string[];
    searchTransactionHistory?: boolean;
}

export interface GetSignaturesForAddressRequest {
    address: string;
    limit?: number;
    before?: string; // signature
    until?: string; // signature
}

// Block/Epoch
export interface GetBlockRequest {
    slot: number; // u64
    encoding?: Encoding;
    detail?: 'full' | 'signatures' | 'none';
}

export interface GetEpochInfoRequest {
    commitment?: 'processed' | 'confirmed' | 'finalized';
}

// Health
export interface GetHealthRequest {
    // Empty struct in Rust usually
}

export interface GetValidatorHealthRequest {
    // Empty struct
}

// Utility
export interface GetFeeForMessageRequest {
    message: string; // base64 or base58 encoded message
    commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface IsBlockhashValidRequest {
    blockhash: string;
    commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface GetMinimumBalanceForRentExemptionRequest {
    dataLen: number;
    commitment?: 'processed' | 'confirmed' | 'finalized';
}

// More Rialo Specific
export interface GetConnectedFullNodesRequest {
    // Empty
}

export interface GetTransactionCountRequest {
    commitment?: 'processed' | 'confirmed' | 'finalized';
}
