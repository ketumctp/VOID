/**
 * Account Scanner - Discovers accounts with balances
 */

import * as keyring from './keyring';
import * as rpc from './rpc';

export interface ScannedAccount {
    index: number;
    publicKey: string;
    balance: number;
}

/**
 * Scan for accounts with activity
 * Checks the first N derivation paths.
 */
export async function scanForAccounts(mnemonic: string, limit: number = 20): Promise<ScannedAccount[]> {
    if (!keyring.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
    }
    const foundAccounts: ScannedAccount[] = [];

    // Optimize: Run checks in parallel batches
    const batchSize = 5;

    for (let i = 0; i < limit; i += batchSize) {
        const batchPromises = Array.from({ length: Math.min(batchSize, limit - i) }, async (_, offset) => {
            const index = i + offset;
            try {
                const keypair = await keyring.deriveKeypairFromMnemonic(mnemonic, index);
                const publicKey = keypair.publicKey.toBase58();

                const balance = await rpc.getBalance(publicKey);

                // Condition to include: Has balance OR is Account 0 (always include root)
                if (balance > 0 || index === 0) {
                    return {
                        index,
                        publicKey,
                        balance
                    };
                }
            } catch (e) {
                console.warn(`Failed to scan account ${index}:`, e);
            }
            return null;
        });

        const results = await Promise.all(batchPromises);
        results.forEach(acc => {
            if (acc) foundAccounts.push(acc);
        });
    }

    return foundAccounts.sort((a, b) => a.index - b.index);
}
