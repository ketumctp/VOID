/**
 * Keyring - Manages wallet creation, import, and encryption
 */
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { RialoKeypair } from '../shared/chain-compat';
import bs58 from 'bs58';
import { encrypt, deriveKey, decryptWithKey, exportKey, importKey, base64ToBuffer } from '../shared/crypto';
import { WALLET_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../shared/constants';
import type { EncryptedWallet } from '../shared/types';
import * as accountService from './account-service';

let activeKeypair: RialoKeypair | null = null;
let activeMnemonic: string | null = null;


export function generateMnemonic(): string {
    return bip39.generateMnemonic(WALLET_CONFIG.MNEMONIC_STRENGTH);
}

export function validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
}

/**
 * Derive keypair from mnemonic
 * Path: m/44'/501'/{index}'/0'
 */
export async function deriveKeypairFromMnemonic(mnemonic: string, index: number = 0): Promise<RialoKeypair> {
    if (!validateMnemonic(mnemonic)) throw new Error(ERROR_MESSAGES.INVALID_MNEMONIC);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    return RialoKeypair.fromSeed(derivedSeed);
}

export function createKeypairFromSecretKey(secretKey: string | Uint8Array): RialoKeypair {
    try {
        if (typeof secretKey === 'string') {
            return RialoKeypair.fromSecretKey(bs58.decode(secretKey));
        }
        return RialoKeypair.fromSecretKey(secretKey);
    } catch {
        throw new Error(ERROR_MESSAGES.INVALID_SECRET_KEY);
    }
}

export async function createWallet(password: string): Promise<{ mnemonic: string; publicKey: string; }> {
    const mnemonic = generateMnemonic();
    const keypair = await deriveKeypairFromMnemonic(mnemonic);
    await saveEncryptedWallet(keypair, password, mnemonic);
    activeKeypair = keypair;
    activeMnemonic = mnemonic;
    return { mnemonic, publicKey: keypair.publicKey.toBase58() };
}

export async function importFromMnemonic(
    mnemonic: string,
    password: string,
    accountsToImport: number[] = [0]
): Promise<string> {
    const keypair = await deriveKeypairFromMnemonic(mnemonic, accountsToImport[0] || 0);

    // Generate initial account list
    const accounts = await accountService.createInitialAccounts(mnemonic, accountsToImport);

    await saveEncryptedWallet(keypair, password, mnemonic, accounts);

    activeKeypair = keypair;
    activeMnemonic = mnemonic;
    return keypair.publicKey.toBase58();
}

export async function importFromSecretKey(secretKey: string, password: string): Promise<string> {
    const keypair = createKeypairFromSecretKey(secretKey);

    // Secret Key import supports only 1 account by definition
    const accounts: any[] = [{
        index: 0,
        name: 'Account 1',
        publicKey: keypair.publicKey.toBase58()
    }];

    await saveEncryptedWallet(keypair, password, undefined, accounts);

    activeKeypair = keypair;
    activeMnemonic = null;
    return keypair.publicKey.toBase58();
}

async function saveEncryptedWallet(
    keypair: RialoKeypair,
    password: string,
    mnemonic?: string,
    accounts?: any[]
): Promise<void> {
    const secretKey = keypair.secretKey;
    const encrypted = await encrypt(secretKey, password);
    let encryptedMnemonic: string | undefined;

    if (mnemonic) {
        const mnemonicBytes = new TextEncoder().encode(mnemonic);
        const encryptedMnemonicData = await encrypt(mnemonicBytes, password, base64ToBuffer(encrypted.salt));
        encryptedMnemonic = JSON.stringify(encryptedMnemonicData);
    }

    // If no accounts passed (e.g. createWallet), default to Index 0
    const finalAccounts = accounts || [{
        index: 0,
        name: 'Account 1',
        publicKey: keypair.publicKey.toBase58()
    }];

    const wallet: EncryptedWallet = {
        encryptedSecretKey: encrypted.encrypted,
        salt: encrypted.salt,
        publicKey: keypair.publicKey.toBase58(),
        version: WALLET_CONFIG.VERSION,
        iv: encrypted.iv,
        encryptedMnemonic,
        accounts: finalAccounts, // Save the full list
        currentAccountIndex: finalAccounts[0].index
    };

    console.log('[Rialo] Saving wallet to storage with key:', STORAGE_KEYS.ENCRYPTED_WALLET);
    await chrome.storage.local.set({ [STORAGE_KEYS.ENCRYPTED_WALLET]: wallet });

    // Verify save
    const verify = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_WALLET);
    console.log('[Rialo] Verified save:', !!verify[STORAGE_KEYS.ENCRYPTED_WALLET]);

    // Init service with new data logic
    await accountService.init(wallet);
}

export async function unlockWallet(password: string): Promise<string> {
    const stored = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_WALLET);
    const wallet = stored[STORAGE_KEYS.ENCRYPTED_WALLET] as any;
    if (!wallet) throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);

    let derivedKey: CryptoKey;
    let decryptedSecretKey: Uint8Array;

    // STEP 1: Decryption (Password Check)
    try {
        const salt = base64ToBuffer(wallet.salt);
        derivedKey = await deriveKey(password, salt, true);
        decryptedSecretKey = await decryptWithKey(wallet.encryptedSecretKey, derivedKey, wallet.iv);
    } catch (e) {
        // Any decryption failure at this stage means wrong password
        // Note: Use console.warn, not console.error - wrong password is not a system error
        console.warn('[Rialo] Unlock attempt with invalid password');
        throw new Error(ERROR_MESSAGES.INVALID_PASSWORD);
    }

    // STEP 2: Restore Mnemonic (Optional, Non-Critical for Key 0)
    if (wallet.encryptedMnemonic) {
        try {
            const mnemonicData = JSON.parse(wallet.encryptedMnemonic);
            const mnemSalt = base64ToBuffer(mnemonicData.salt);
            const mnemKey = await deriveKey(password, mnemSalt);
            const decryptedMnemonic = await decryptWithKey(mnemonicData.encrypted, mnemKey, mnemonicData.iv);
            activeMnemonic = new TextDecoder().decode(decryptedMnemonic);
        } catch (e) {
            console.warn('[Rialo] Mnemonic decryption failed (non-fatal):', e);
            activeMnemonic = null;
        }
    }

    // STEP 3: Setup Account Logic
    try {
        await accountService.init(wallet);
        const currentAccount = accountService.getCurrentAccount();
        let keypair: RialoKeypair;

        if (currentAccount.index !== 0) {
            // Force reset to Account 0 if storage has weird state
            console.warn('Multi-account found in storage but disabled. Forcing Account 0.');
            await accountService.switchAccount(0);
        }
        keypair = RialoKeypair.fromSecretKey(decryptedSecretKey);

        // STEP 4: Session Persistence (Crit-Fix-002)
        // We attempt to persist, but if it fails (Context Invalidated), we should still UNLOCK in memory
        // because the user provided the correct password. Failing here causes "Phantom Unlock" UI bug.
        try {
            const jwk = await exportKey(derivedKey);
            await chrome.storage.session.set({ 'wallet_session_key': jwk });
            await chrome.storage.session.remove('wallet_session'); // Cleanup old generic
        } catch (storageError) {
            console.error('[Rialo] Session persistence failed (Context Invalidated?):', storageError);
            // We proceed anyway, meaning the session is VALID in memory but won't survive reload.
            // This fixes the "Password Correct -> Error UI -> Open Wallet" confusion.
        }

        // UNLOCK SUCCESSFUL
        activeKeypair = keypair;
        return keypair.publicKey.toBase58();

    } catch (e) {
        console.error('[Rialo] Unlock process failed:', e);
        // If we failed after decryption (e.g. keypair derivation), it's a System Error, not Bad Password
        throw new Error('Unlock failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
}

export async function restoreSession(): Promise<boolean> {
    if (isUnlocked()) return true;
    try {
        const session = await chrome.storage.session.get('wallet_session_key');
        const jwk = session['wallet_session_key'];

        // Also check legacy/plaintext to migrate/clear it? 
        // Better to just fail safe if only legacy exists, forcing re-login.

        if (jwk) {
            const stored = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_WALLET);
            const wallet = stored[STORAGE_KEYS.ENCRYPTED_WALLET] as any;
            if (!wallet) return false;

            const sessionKey = await importKey(jwk);

            // Decrypt using restored key
            const decryptedSecretKey = await decryptWithKey(wallet.encryptedSecretKey, sessionKey, wallet.iv);

            // Restore Mnemonic? 
            // Problem: Mnemonic used a DIFFERENT salt, so it needs a DIFFERENT key.
            // If we only stored the "SecretKey" encryption key, we can't decrypt the mnemonic.
            // This means `activeMnemonic` will be NULL after restore.
            // This is acceptable? Account 0 works. But generating new accounts requires Mnemonic.
            // If user wants to add account, they should be prompted for password?
            // Or we should store `mnemonic_session_key` too?
            // For now, let's just restore primary functionality (Active Account).

            activeMnemonic = null; // Cannot restore without password or separate key storage

            await accountService.init(wallet);
            const currentAccount = accountService.getCurrentAccount();

            // CRIT-FIX-002: Session Integrity (Single Account Mode)
            // Always restore Account 0 using the decrypted Secret Key.
            if (currentAccount.index > 0) {
                console.warn('[Rialo Security] Multi-account state detected during restore. Resetting to Account 0.');
                await accountService.switchAccount(0);
            }

            let keypair = RialoKeypair.fromSecretKey(decryptedSecretKey);
            activeKeypair = keypair;
            return true;

            // Fallback (Should be unreachable given the check above)
            return false;
        }
    } catch (e) {
        console.warn('Failed to restore session:', e);
    }
    return false;
}

export function lockWallet(): void {
    activeKeypair = null;
    activeMnemonic = null;
    chrome.storage.session.remove('wallet_session_key');
    chrome.storage.session.remove('wallet_session');
}

export function getActiveKeypair(): RialoKeypair {
    if (!activeKeypair) throw new Error(ERROR_MESSAGES.WALLET_LOCKED);
    return activeKeypair;
}

export function setActiveKeypair(keypair: RialoKeypair): void {
    activeKeypair = keypair;
}

export function getActiveMnemonic(): string {
    if (!activeMnemonic) throw new Error('Mnemonic not available');
    return activeMnemonic;
}

export async function hasWallet(): Promise<boolean> {
    console.log('[Rialo] Checking hasWallet with key:', STORAGE_KEYS.ENCRYPTED_WALLET);
    const stored = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_WALLET);
    console.log('[Rialo] hasWallet result:', !!stored[STORAGE_KEYS.ENCRYPTED_WALLET]);
    return !!stored[STORAGE_KEYS.ENCRYPTED_WALLET];
}

export function isUnlocked(): boolean {
    return activeKeypair !== null;
}

export async function getPublicKey(): Promise<string | null> {
    if (activeKeypair) return activeKeypair.publicKey.toBase58();
    const stored = await chrome.storage.local.get(STORAGE_KEYS.ENCRYPTED_WALLET);
    const wallet = stored[STORAGE_KEYS.ENCRYPTED_WALLET] as EncryptedWallet;
    return wallet?.publicKey || null;
}
