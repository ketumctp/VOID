/**
 * Account Service - Manages multi-account state
 * Separation of concerns: Handles account list and selection, 
 * while Keyring handles the crypto/signing.
 */

import type { AccountInfo, EncryptedWallet } from '../shared/types';
import * as keyring from './keyring';
// import { STORAGE_KEYS } from '../shared/constants';

let accounts: AccountInfo[] = [];
let currentAccountIndex = 0;

/**
 * Initialize accounts from storage
 */
export async function init(storedWallet: EncryptedWallet) {
    if (storedWallet.accounts && storedWallet.accounts.length > 0) {
        accounts = storedWallet.accounts;
        currentAccountIndex = storedWallet.currentAccountIndex || 0;
    } else {
        // Migration: If no accounts array, create default Account 0
        accounts = [{
            index: 0,
            name: 'Account 1',
            publicKey: storedWallet.publicKey
        }];
        currentAccountIndex = 0;
    }
}

/**
 * Generate initial accounts list for new/imported wallet
 */
export async function createInitialAccounts(
    mnemonic: string,
    indices: number[] = [0]
): Promise<AccountInfo[]> {
    const initialAccounts: AccountInfo[] = [];

    for (const index of indices) {
        const keypair = await keyring.deriveKeypairFromMnemonic(mnemonic, index);
        initialAccounts.push({
            index,
            name: `Account ${index + 1}`,
            publicKey: keypair.publicKey.toBase58()
        });
    }

    // Set internal state
    accounts = initialAccounts;
    currentAccountIndex = accounts[0]?.index || 0;

    return accounts;
}


/**
 * Get all accounts
 */
export function getAccounts(): AccountInfo[] {
    return accounts;
}

/**
 * Get current account info
 */
export function getCurrentAccount(): AccountInfo {
    return accounts[currentAccountIndex] || accounts[0];
}

/**
 * Add new account
 */
/**
 * Add new account - DISABLED (Single Account Mode)
 */
export async function addAccount(_name?: string): Promise<AccountInfo> {
    throw new Error('Multi-account support is disabled in this version.');
}

/**
 * Switch active account - DISABLED (Single Account Mode)
 */
export async function switchAccount(index: number): Promise<void> {
    if (index !== 0) {
        throw new Error('Multi-account support is disabled in this version.');
    }
    // No-op for index 0
}

/**
 * Persist account state to storage
 * (Updates the existing EncryptedWallet object)
 */
// Internal helper removed as multi-account support is disabled.
// async function saveAccounts() { ... }
