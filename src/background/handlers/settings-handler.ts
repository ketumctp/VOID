
import * as keyring from '../keyring';
import * as tokenService from '../token-service';
import { ERROR_MESSAGES } from '../../shared/constants';
import bs58 from 'bs58';

// --- Settings and Token Handlers ---

export async function handleExportSecretKey() {
    const keypair = keyring.getActiveKeypair();
    const secretKey = bs58.encode(keypair.secretKey);
    return { secretKey };
}

export async function handleGetMnemonic() {
    const mnemonic = keyring.getActiveMnemonic();
    return { mnemonic };
}

export async function handleGetTokens() {
    const publicKey = await keyring.getPublicKey();
    if (!publicKey) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);

    const tokens = await tokenService.getTokens(publicKey);
    return { tokens };
}

export async function handleAddToken(msg: { mint: string }) {
    await tokenService.addToken(msg.mint);
    return { success: true };
}

export async function handleRemoveToken(msg: { mint: string }) {
    await tokenService.removeToken(msg.mint);
    return { success: true };
}
