import * as signer from '../../signer';
import * as rpc from '../../rpc';
import * as keyring from '../../keyring';
import { ERROR_MESSAGES } from '../../../shared/constants';
import { validateBinding } from '../../tx-binding';
import { Buffer } from 'buffer';
import type { PendingRequest } from './types';

export const executionService = {
    async sendTransaction(to: string, amount: number, mint?: string, decimals?: number) {
        let signature;
        if (mint && decimals !== undefined) {
            signature = await rpc.sendSPLTokenTransfer(to, amount, mint, decimals);
        } else {
            signature = await rpc.sendNativeTransfer(to, amount);
        }
        const confirmed = await rpc.confirmTransaction(signature);
        return { signature, confirmed };
    },

    async requestAirdrop(amount: number) {
        const publicKey = await keyring.getPublicKey();
        if (!publicKey) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
        return { signature: await rpc.requestAirdrop(publicKey, amount) };
    },

    async sendRawTransaction(transaction: string) {
        return { signature: await rpc.sendRawTransaction(transaction) };
    },

    async getTransactions(limit: number = 10) {
        const publicKey = await keyring.getPublicKey();
        if (!publicKey) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
        return { transactions: await rpc.getSignaturesForAddress(publicKey, limit) };
    },

    async resolveSignAndSend(req: PendingRequest) {
        if (typeof req.data.transaction !== 'string') {
            throw new Error('SECURITY: Invalid transaction format.');
        }

        // NATIVE TRANSFER DETECTION: Check if it's JSON format {to, amount, from?, validFrom?}
        try {
            const parsed = JSON.parse(req.data.transaction);

            // Detect native Rialo transfer: must have 'to' and numeric 'amount'
            if (parsed.to && typeof parsed.amount === 'number') {
                console.log('[Rialo] Detected native transfer JSON, building and sending transaction...');
                console.log('[Rialo] Transfer to:', parsed.to, 'Amount:', parsed.amount, 'lamports');

                // Build and send native transfer directly using RPC
                const signature = await rpc.sendNativeTransfer(parsed.to, parsed.amount);
                console.log('[Rialo] Native transfer sent successfully. Signature:', signature);

                return { signature };
            }
        } catch (e) {
            // Not valid JSON or not a native transfer - continue to binary transaction path
            console.log('[Rialo] Not a JSON native transfer, treating as binary transaction');
        }

        // BINARY TRANSACTION PATH: For pre-built base64-encoded transactions
        console.log('[Rialo] Processing as binary transaction (base64)');

        // PHASE 5: Cryptographic Binding Validation
        // STRICT MODE: We compare the EXPECTED parsed data (req.parsed) 
        // with the ACTUAL parsed data from txBytes.
        const txBytes = Buffer.from(req.data.transaction, 'base64');
        const bindingResult = validateBinding(
            req.parsed, // The expectation (what the user approved)
            txBytes     // The reality (what is being signed)
        );

        if (!bindingResult.valid) {
            console.error('[Rialo Security] Binding validation failed:', bindingResult.reason);
            throw new Error(`SECURITY: ${bindingResult.reason || 'Transaction content mismatch (Binding Error)'}`);
        }

        console.log('[Rialo] Binding validation passed. Transaction integrity verified.');

        const signed = await signer.signTransaction(req.data.transaction);
        const signature = await rpc.sendRawTransaction(signed.signedTx);
        return { signature };
    }
};
