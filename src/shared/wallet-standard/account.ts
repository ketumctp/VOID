import type { WalletAccount, IdentifierArray } from '@wallet-standard/base';
import bs58 from 'bs58';

export const RIALO_CHAINS: IdentifierArray = ['rialo:devnet'] as const;

export const RIALO_FEATURES: IdentifierArray = [
    'rialo:signTransaction',
    'rialo:signMessage',
    'rialo:signAndSendTransaction',
    'solana:signTransaction',
    'solana:signMessage',
    'solana:signAndSendTransaction',
] as const;

/**
 * Helper to create a standard WalletAccount object
 */
export function createWalletAccount(publicKeyString: string): WalletAccount {
    return {
        address: publicKeyString,
        publicKey: bs58.decode(publicKeyString),
        chains: RIALO_CHAINS,
        features: RIALO_FEATURES,
        label: 'Rialo Account',
    };
}
