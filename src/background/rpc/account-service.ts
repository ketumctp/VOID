import { Buffer } from 'buffer';
import { ERROR_MESSAGES } from '../../shared/constants';
import { rpcRequest } from './core';

/**
 * Get raw account info
 */
export async function getAccountInfo(address: string): Promise<{ owner: string, data: Buffer, lamports: number, executable: boolean } | null> {
    try {
        const result = await rpcRequest('getAccountInfo', [{
            address: address,
            encoding: 'base64'
        }]);

        if (!result?.value) return null;

        return {
            owner: result.value.owner,
            data: Buffer.from(result.value.data[0], 'base64'),
            // [RIALO] Handle 'kelvin' vs 'lamports' vs 'value'
            lamports: result.value.kelvin ?? result.value.value ?? result.value.lamports ?? 0,
            executable: result.value.executable
        };
    } catch (e) {
        console.warn('Failed to fetch account info:', e);
        return null;
    }
}

/**
 * Get balance for an address (in lamports)
 */
export async function getBalance(address: string): Promise<number> {
    console.log('RPC Client v3.2: getBalance', address);
    try {
        // Rialo strict mode: [ { address: ... } ]
        const result = await rpcRequest('getBalance', [{
            address: address
        }]);

        return result?.value || 0;
    } catch (error) {
        console.error('Get balance error (v3.2):', error);
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
}

/**
 * Get data for a specific Token Account (ATA)
 * Used for manual token tracking since RPC doesn't support getParsedTokenAccountsByOwner
 */
export async function getTokenAccountData(ataAddress: string): Promise<{ amount: bigint, decimals: number } | null> {
    try {
        const result = await rpcRequest('getAccountInfo', [{
            address: ataAddress,
            encoding: 'base64'
        }]);

        if (!result?.value) return null;

        const data = Buffer.from(result.value.data[0], 'base64');

        // Basic check for Token Account size (165 bytes)
        // Token-2022 might be larger due to extensions, but core layout is compatible at start.
        if (data.length < 165) return null;

        // Layout:
        // Mint (32)
        // Owner (32)
        // Amount (8) - Offset 64
        const amount = data.readBigUInt64LE(64);

        // We return amount. Decimals must be fetched from Mint.
        return { amount, decimals: 0 };
    } catch (error) {
        console.warn('Failed to fetch token account data:', error);
        return null;
    }
}

/**
 * Get all token accounts for an owner (Auto-Discovery)
 */
export async function getTokenAccountsByOwner(owner: string, programId: string): Promise<any[]> {
    try {
        const result = await rpcRequest('getTokenAccountsByOwner', [
            owner,
            { programId: programId },
            { encoding: 'jsonParsed' }
        ]);
        return result?.value || [];
    } catch (error: any) {
        // Graceful handling for custom RPCs that don't support this method
        if (error.message && (error.message.includes('unknown variant') || error.message.includes('Method not found'))) {
            console.warn('[Discovery] Auto-scan not supported by this RPC node. Skipping.');
            return [];
        }
        console.warn('Failed to scan tokens for program:', programId, error);
        return [];
    }
}

/**
 * Get Mint Info (Decimals)
 */
export async function getMintInfo(mintAddress: string): Promise<{ decimals: number } | null> {
    try {
        const result = await rpcRequest('getAccountInfo', [{
            address: mintAddress,
            encoding: 'base64'
        }]);

        if (!result?.value) return null;
        const data = Buffer.from(result.value.data[0], 'base64');

        // Mint Layout:
        // MintAuthorityOption (4)
        // MintAuthority (32)
        // Supply (8)
        // Decimals (1) - Offset 44
        if (data.length < 82) return null;

        const decimals = data.readUInt8(44);
        return { decimals };
    } catch (e) {
        console.warn('Failed to fetch mint info:', e);
        return null;
    }
}

/**
 * Get balance in native token (converted from lamports)
 */
export async function getBalanceInNative(address: string): Promise<number> {
    const lamports = await getBalance(address);
    // Assuming 9 decimals like SOL for now, need constant?
    // LAMPORTS_PER_SOL is 1e9
    return lamports / 1000000000;
}
