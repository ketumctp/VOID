
import * as dappManager from '../dapp-manager';
import { transactionService } from '../services/transaction-service';
import type {
    SendTransactionRequest,
    RequestAirdropRequest,
    SignTransactionRequest,
    SignMessageRequest,
    SendRawTransactionRequest
} from '../../shared/types';

// --- Transaction Handlers (Router Layer) ---

export async function handleSendTransaction(msg: SendTransactionRequest) {
    return await transactionService.sendTransaction(msg.to, msg.amount, msg.mint, msg.decimals);
}

export async function handleRequestAirdrop(msg: RequestAirdropRequest) {
    return await transactionService.requestAirdrop(msg.amount);
}

export async function handleSendRawTransaction(msg: SendRawTransactionRequest) {
    return await transactionService.sendRawTransaction(msg.transaction);
}

export async function handleGetTransactions(msg: { limit?: number }) {
    return await transactionService.getTransactions(msg.limit);
}

export async function handleSignTransaction(
    msg: SignTransactionRequest,
    sender: chrome.runtime.MessageSender
) {
    await validateDappConnection(msg.origin, sender);
    return await transactionService.requestApproval('transaction', { transaction: msg.transaction }, msg.origin, sender.tab?.id);
}

export async function handleSignMessage(
    msg: SignMessageRequest,
    sender: chrome.runtime.MessageSender
) {
    await validateDappConnection(msg.origin, sender);
    return await transactionService.requestApproval('message', { message: msg.message }, msg.origin, sender.tab?.id);
}

export async function handleSignAndSendTransaction(
    msg: SignTransactionRequest,
    sender: chrome.runtime.MessageSender
) {
    await validateDappConnection(msg.origin, sender);
    return await transactionService.requestApproval('signAndSend', { transaction: msg.transaction }, msg.origin, sender.tab?.id);
}

export async function handleGetPendingRequest(msg: { requestId: string }) {
    return await transactionService.getPendingRequest(msg.requestId);
}

export async function handleResolveRequest(msg: { requestId: string }) {
    return await transactionService.resolveRequest(msg.requestId);
}

export async function handleRejectRequest(msg: { requestId: string }) {
    return await transactionService.rejectRequest(msg.requestId);
}

// Helper
async function validateDappConnection(origin?: string, sender?: chrome.runtime.MessageSender) {
    if (origin && sender?.tab) {
        // SECURITY FIX: Origin Spoofing Protection
        // Ensure the message's claimed origin matches the actual sender's URL
        if (!sender.url) {
            throw new Error('SECURITY VIOLATION: Sender has no URL.');
        }

        try {
            const senderUrl = new URL(sender.url);
            // Remove trailing slashes for comparison just in case, though origins usually don't have them
            const senderOrigin = senderUrl.origin;

            if (senderOrigin !== origin) {
                console.error(`[Rialo Security] Origin Mismatch! Claimed: ${origin}, Actual: ${senderOrigin}`);
                throw new Error('SECURITY VIOLATION: Origin Mismatch. You cannot impersonate another dApp.');
            }
        } catch (e) {
            if (e instanceof Error && e.message.includes('SECURITY')) throw e;
            throw new Error('SECURITY VIOLATION: Failed to validate sender origin.');
        }

        const connected = await dappManager.isConnected(origin);
        if (!connected) throw new Error('dApp not connected');
        await dappManager.updateDappUsage(origin);
    }
}
