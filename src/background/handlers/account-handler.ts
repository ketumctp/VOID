
import * as keyring from '../keyring';
import * as rpc from '../rpc';
import * as accountService from '../account-service';
import * as accountScanner from '../account-scanner';
import { ERROR_MESSAGES } from '../../shared/constants';

// --- Account Operations Handlers ---

export async function handleGetBalance() {
    const publicKey = await keyring.getPublicKey();
    if (!publicKey) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);

    const balance = await rpc.getBalance(publicKey);
    return { balance, publicKey };
}

export async function handleGetAddress() {
    const publicKey = await keyring.getPublicKey();
    if (!publicKey) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
    return { publicKey };
}

export function handleGetAccounts() {
    return {
        accounts: accountService.getAccounts(),
        currentAccount: accountService.getCurrentAccount()
    };
}

export async function handleAddAccount() {
    return await accountService.addAccount();
}

export async function handleSwitchAccount(msg: { index: number }) {
    await accountService.switchAccount(msg.index);
    return { success: true };
}

export async function handleScanAccounts(msg: { mnemonic: string }) {
    return await accountScanner.scanForAccounts(msg.mnemonic);
}

export async function handleGetEstimatedFee() {
    const feeLamports = await rpc.getEstimatedFee();
    return { feeLamports, feeFormatted: (feeLamports / 1_000_000_000).toFixed(9) };
}
