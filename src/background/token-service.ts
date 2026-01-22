

import * as rpc from './rpc';
import type { TokenInfo } from '../shared/types';
import { MetadataService } from './metadata-service';
import { PublicKey } from '@solana/web3.js';

const IMPORTED_TOKENS_KEY = 'imported_tokens';


/**
 * Get all tracked tokens with balances for a specific owner
 * Uses Auto-Discovery (Scan) + Imported Watchlist
 */
export async function getTokens(owner: string): Promise<TokenInfo[]> {
    try {
        const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

        // 1. Auto-Discovery: Scan for all accounts
        const [accountsStandard, accounts2022] = await Promise.all([
            rpc.getTokenAccountsByOwner(owner, TOKEN_PROGRAM_ID),
            rpc.getTokenAccountsByOwner(owner, TOKEN_2022_PROGRAM_ID)
        ]);

        const allAccounts = [...accountsStandard, ...accounts2022];

        // Map scanned accounts to TokenInfo
        const scannedTokens: TokenInfo[] = allAccounts.map((acc: any) => {
            const parsed = acc.account.data.parsed.info;
            return {
                mint: parsed.mint,
                balance: parsed.tokenAmount.uiAmount, // Uses pre-calculated UI amount
                decimals: parsed.tokenAmount.decimals,
                symbol: 'Token' // We could fetch metadata here, but for now generic
            };
        });

        // Initialize Metadata Service
        const metadataService = new MetadataService(rpc.connection);

        // Fetch Metadata for all scanned tokens
        const tokensWithMetadata = await Promise.all(scannedTokens.map(async (token) => {
            const metadata = await metadataService.getTokenMetadata(token.mint);
            if (metadata) {
                return {
                    ...token,
                    symbol: metadata.symbol,
                    name: metadata.name,
                    logoURI: metadata.logoURI
                };
            }
            return token;
        }));

        // 2. Imported Tokens (Watchlist)
        // These are tokens the user explicitly added. We show them even if balance is 0 or no account exists.
        const storedMints = await getStoredMints();

        // Filter out imported tokens that we already found in scan
        const missingMints = storedMints.filter(mint => !tokensWithMetadata.find(t => t.mint === mint));

        // Fetch data for missing imports AND their balances
        const importedPromises = missingMints.map(async (mint) => {
            const mintInfo = await rpc.getMintInfo(mint);
            if (!mintInfo) return null;

            // Derive ATA and fetch balance
            const TOKEN_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'; // Default to Token-2022
            const ataAddress = deriveATA(owner, mint, TOKEN_PROGRAM_ID);
            console.log(`[Token Import] Checking ATA ${ataAddress} for mint ${mint}`);

            // Fetch ATA balance
            let balance = 0;
            const ataData = await rpc.getTokenAccountData(ataAddress);
            console.log(`[Token Import] ATA data for ${mint}:`, ataData);
            if (ataData) {
                balance = Number(ataData.amount) / Math.pow(10, mintInfo.decimals);
                console.log(`[Token Import] Calculated balance for ${mint}: ${balance} (raw: ${ataData.amount}, decimals: ${mintInfo.decimals})`);
            }

            const metadata = await metadataService.getTokenMetadata(mint);

            return {
                mint,
                balance,
                decimals: mintInfo.decimals,
                symbol: metadata?.symbol || 'Token',
                name: metadata?.name || undefined,
                logoURI: metadata?.logoURI || undefined
            };
        });

        const importedTokens = (await Promise.all(importedPromises)).filter(t => t !== null) as TokenInfo[];

        return [...tokensWithMetadata, ...importedTokens];

    } catch (error) {
        console.error('getTokens failed:', error);
        return [];
    }
}

/**
 * Add a token to tracked list
 */
export async function addToken(mint: string): Promise<boolean> {
    try {
        // Verify mint exists with detailed diagnostics
        const info = await rpc.getAccountInfo(mint);

        if (!info) {
            throw new Error('Akun tidak ditemukan. Mohon periksa alamat dan jaringan (Devnet).');
        }

        const SYSTEM_PROGRAM = '11111111111111111111111111111111';
        const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        const TOKEN_2022_PROGRAM = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

        if (info.owner === SYSTEM_PROGRAM) {
            throw new Error('Alamat ini adalah Akun Sistem (Wallet), BUKAN Token Mint.');
        }

        if (info.owner !== TOKEN_PROGRAM && info.owner !== TOKEN_2022_PROGRAM) {
            throw new Error(`Pemilik Mint tidak valid: ${info.owner}. Diharapkan Program Token.`);
        }

        if (info.data.length < 82) {
            throw new Error('Ukuran data Token Mint tidak valid.');
        }

        // It seems valid, verify we can parse decimals
        const mintInfo = await rpc.getMintInfo(mint);
        if (!mintInfo) throw new Error('Gagal memproses data Mint.');

        const stored = await getStoredMints();
        if (!stored.includes(mint)) {
            stored.push(mint);
            await chrome.storage.local.set({ [IMPORTED_TOKENS_KEY]: stored });
        }
        return true;
    } catch (error) {
        throw error;
    }
}

/**
 * Remove token
 */
export async function removeToken(mint: string): Promise<boolean> {
    const stored = await getStoredMints();
    const newStored = stored.filter(m => m !== mint);
    await chrome.storage.local.set({ [IMPORTED_TOKENS_KEY]: newStored });
    return true;
}

async function getStoredMints(): Promise<string[]> {
    const result = await chrome.storage.local.get(IMPORTED_TOKENS_KEY);
    return (result[IMPORTED_TOKENS_KEY] as string[]) || [];
}

/**
 * Derive Associated Token Account address
 */
function deriveATA(owner: string, mint: string, tokenProgramId: string): string {
    const ownerPubkey = new PublicKey(owner);
    const mintPubkey = new PublicKey(mint);
    const tokenProgram = new PublicKey(tokenProgramId);
    const ataProgramId = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

    const [ata] = PublicKey.findProgramAddressSync(
        [ownerPubkey.toBuffer(), tokenProgram.toBuffer(), mintPubkey.toBuffer()],
        ataProgramId
    );

    return ata.toBase58();
}
