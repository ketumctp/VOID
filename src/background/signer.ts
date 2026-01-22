/**
 * Signer - Handles transaction and message signing
 * Uses Rialo primitives for signing
 */

import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { getActiveKeypair } from './keyring';
import { ERROR_MESSAGES } from '../shared/constants';
import { parseTransaction } from './transaction-parser';

/**
 * Sign a Rialo transaction
 * PERFORMS STRICT PARSING CHECKS.
 * Throws if transaction cannot be parsed.
 */
export async function signTransaction(
    serializedTx: string
): Promise<{ signature: string; signedTx: string; signatureBytes?: number[] }> {
    const keypair = getActiveKeypair();

    try {
        // SECURITY ENFORCEMENT: Never sign opaque blobs
        // 1. Attempt to parse
        const parsed = parseTransaction(serializedTx);
        if (!parsed) {
            console.error('[Signer] Failed to parse transaction blob. Rejecting blind sign attempt.');
            throw new Error('SECURITY: Cannot sign unparsable transaction. Blind signing is disabled.');
        }

        console.log('[Rialo Signer] Signing validated transaction for:', parsed.feePayer);

        // Decode the transaction/message blob
        const txBuffer = Buffer.from(serializedTx, 'base64');

        // Sign the blob directly (Ed25519)
        const signature = sign.detached(txBuffer, keypair.secretKey);

        // Use a simple mock format for verification: Concatenate sig + tx
        const combined = new Uint8Array(signature.length + txBuffer.length);
        combined.set(signature);
        combined.set(txBuffer, signature.length);

        return {
            signature: bs58.encode(signature),
            signedTx: Buffer.from(combined).toString('base64'),
            signatureBytes: Array.from(signature)
        };

    } catch (error) {
        console.error('Transaction signing error:', error);
        throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.TRANSACTION_FAILED);
    }
}

/**
 * Sign arbitrary message (for dApp authentication)
 */
export function signMessage(message: string): {
    signature: string;
    publicKey: string;
} {
    const keypair = getActiveKeypair();

    // Decode message from base64
    const messageBytes = Buffer.from(message, 'base64');

    // SECURITY FIX (CRIT-001): Domain Separation
    // Prevent "Blind Signing" of transactions by prepending a prefix.
    // This ensures the signed data cannot be a valid transaction.
    const prefix = '\xffRialo Signed Message:\n';
    const prefixBytes = new TextEncoder().encode(prefix);

    const combinedState = new Uint8Array(prefixBytes.length + messageBytes.length);
    combinedState.set(prefixBytes);
    combinedState.set(messageBytes, prefixBytes.length);

    // Sign using tweetnacl (Ed25519)
    const signature = sign.detached(combinedState, keypair.secretKey);

    return {
        signature: bs58.encode(signature),
        publicKey: keypair.publicKey.toBase58()
    };
}

/**
 * Verify a message signature
 */
export function verifySignature(
    message: string,
    signature: string,
    publicKey: string
): boolean {
    try {
        const messageBytes = Buffer.from(message, 'base64');
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(publicKey);

        // Reconstruct the signed payload with prefix
        const prefix = '\xffRialo Signed Message:\n';
        const prefixBytes = new TextEncoder().encode(prefix);

        const combinedState = new Uint8Array(prefixBytes.length + messageBytes.length);
        combinedState.set(prefixBytes);
        combinedState.set(messageBytes, prefixBytes.length);

        return sign.detached.verify(combinedState, signatureBytes, publicKeyBytes);
    } catch {
        return false;
    }
}
