
import * as keyring from '../keyring';
import type { CreateWalletRequest, ImportWalletRequest, UnlockWalletRequest, WalletStateResponse } from '../../shared/types';


// --- Wallet Management Handlers ---

export async function handleCreateWallet(msg: CreateWalletRequest) {
    console.log('[Rialo] handleCreateWallet called. Password length:', msg.password.length);
    try {
        const result = await keyring.createWallet(msg.password);
        console.log('[Rialo] Wallet created successfully. PubKey:', result.publicKey);
        return result;
    } catch (err) {
        console.error('[Rialo] createWallet failed:', err);
        throw err;
    }
}

export async function handleImportWallet(msg: ImportWalletRequest) {
    if (msg.mnemonic) {
        const publicKey = await keyring.importFromMnemonic(msg.mnemonic, msg.password);
        return { publicKey };
    } else if (msg.secretKey) {
        const publicKey = await keyring.importFromSecretKey(msg.secretKey, msg.password);
        return { publicKey };
    } else {
        throw new Error('Mnemonic or secret key required');
    }
}

export async function handleUnlockWallet(msg: UnlockWalletRequest) {
    const publicKey = await keyring.unlockWallet(msg.password);
    return { publicKey };
}

export function handleLockWallet() {
    keyring.lockWallet();
    return { success: true };
}

export async function handleGetWalletState(): Promise<WalletStateResponse> {
    const hasWallet = await keyring.hasWallet();
    const isLocked = !keyring.isUnlocked();
    const publicKey = await keyring.getPublicKey();
    console.log(`[Rialo] handleGetWalletState: hasWallet=${hasWallet}, isLocked=${isLocked}, pubKey=${publicKey}`);

    return {
        hasWallet,
        isLocked,
        publicKey: publicKey || undefined
    };
}
