
import { Connection, PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export interface TokenMetadata {
    name: string;
    symbol: string;
    uri: string;
    logoURI?: string; // Fetched from URI JSON
}

export class MetadataService {
    private connection: Connection;
    private cache: Map<string, TokenMetadata> = new Map();
    private pendingRequests: Map<string, Promise<TokenMetadata | null>> = new Map();

    constructor(connection: Connection) {
        this.connection = connection;
        // Load cache from storage on init
        chrome.storage.local.get(['metadata_cache'], (result) => {
            if (result.metadata_cache) {
                this.cache = new Map(Object.entries(result.metadata_cache));
            }
        });
    }

    async getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
        // 1. Check Cache
        if (this.cache.has(mintAddress)) {
            return this.cache.get(mintAddress)!;
        }

        // 2. Dedup pending requests
        if (this.pendingRequests.has(mintAddress)) {
            return this.pendingRequests.get(mintAddress)!;
        }

        const promise = this.fetchOnChainMetadata(mintAddress);
        this.pendingRequests.set(mintAddress, promise);

        try {
            const result = await promise;
            if (result) {
                this.cache.set(mintAddress, result);
                this.saveCache();
            }
            return result;
        } finally {
            this.pendingRequests.delete(mintAddress);
        }
    }

    private saveCache() {
        // Debounced save could be better, but keeping it simple
        const obj = Object.fromEntries(this.cache);
        chrome.storage.local.set({ metadata_cache: obj });
    }

    private async fetchOnChainMetadata(mintAddress: string): Promise<TokenMetadata | null> {
        try {
            console.log(`[Metadata] Fetching for mint: ${mintAddress}`);
            const mint = new PublicKey(mintAddress);
            const [metadataPDA] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('metadata'),
                    METADATA_PROGRAM_ID.toBuffer(),
                    mint.toBuffer(),
                ],
                METADATA_PROGRAM_ID
            );
            console.log(`[Metadata] PDA: ${metadataPDA.toBase58()}`);

            // Use custom RPC request instead of Solana Connection to avoid UUID ID format
            // Rialo RPC expects numeric ID, not UUID string
            const accountInfo = await this.getAccountInfoRialo(metadataPDA.toBase58());

            if (!accountInfo) {
                console.warn(`[Metadata] No account info found for PDA: ${metadataPDA.toBase58()}`);
                return null;
            }

            console.log(`[Metadata] Account found, data length: ${accountInfo.data.length}`);
            return await this.decodeMetadata(accountInfo.data);
        } catch (err) {
            console.error(`[Metadata] Failed to fetch metadata for ${mintAddress}`, err);
            return null;
        }
    }

    private async getAccountInfoRialo(address: string): Promise<{ data: Buffer } | null> {
        try {
            // Import rpcRequest from rpc.ts
            const payload = {
                jsonrpc: '2.0',
                id: Date.now() % 1000000, // Numeric ID
                method: 'getAccountInfo',
                params: [{
                    address: address,
                    encoding: 'base64'
                }]
            };

            const response = await fetch(this.connection.rpcEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await response.json();

            if (json.error) {
                throw new Error(`RPC Error: ${JSON.stringify(json.error)}`);
            }

            if (!json.result?.value) {
                return null;
            }

            const data = Buffer.from(json.result.value.data[0], 'base64');
            return { data };
        } catch (error) {
            console.error('getAccountInfoRialo error:', error);
            return null;
        }
    }

    private async decodeMetadata(buffer: Buffer): Promise<TokenMetadata> {
        // Custom lightweight deserializer for Metaplex Metadata Account
        // Layout:
        // key: u8 (1)
        // update_authority: Pubkey (32)
        // mint: Pubkey (32)
        // data:
        //   name: String (4 + len)
        //   symbol: String (4 + len)
        //   uri: String (4 + len)

        let offset = 1 + 32 + 32; // Skip Key, UpdateAuthority, Mint

        const readString = () => {
            const len = buffer.readUInt32LE(offset);
            offset += 4;
            const str = buffer.slice(offset, offset + len).toString('utf-8').replace(/\0/g, ''); // Remove null bytes padding
            offset += len;
            return str;
        };

        const name = readString().trim();
        const symbol = readString().trim();
        const uri = readString().trim();

        let logoURI = undefined;
        if (uri) {
            try {
                // Fetch off-chain JSON
                // Use fetch directly
                const response = await fetch(uri);
                const json = await response.json();
                if (json.image) {
                    logoURI = json.image;
                }
            } catch (e) {
                console.warn('Failed to fetch metadata URI JSON', e);
            }
        }

        return {
            name,
            symbol,
            uri,
            logoURI
        };
    }
}
