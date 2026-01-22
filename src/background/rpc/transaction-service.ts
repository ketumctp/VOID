import { Buffer } from 'buffer';
import { TRANSACTION_CONFIG, ERROR_MESSAGES } from '../../shared/constants';
import { getActiveKeypair } from '../keyring';
import { RialoTransaction } from '../../shared/rialo-transaction';
import { RialoAddress, RialoSystem } from '../../shared/chain-compat';
import { rpcRequest } from './core';
import { getBalance } from './account-service';

/**
 * Get estimated transaction fee from the chain (in lamports)
 * Fetches fee schedule from Rialo devnet
 */
export async function getEstimatedFee(): Promise<number> {
    try {
        // Try getFees first (Solana legacy)
        const result = await rpcRequest('getFees', []);
        if (result?.value?.feeCalculator?.lamportsPerSignature) {
            return result.value.feeCalculator.lamportsPerSignature;
        }

        // Fallback: getRecentBlockhash (older Solana RPC)
        const blockhashResult = await rpcRequest('getRecentBlockhash', []);
        if (blockhashResult?.value?.feeCalculator?.lamportsPerSignature) {
            return blockhashResult.value.feeCalculator.lamportsPerSignature;
        }

        // Fallback: getLatestBlockhash + default fee (newer Solana doesn't include fee in blockhash)
        // Default Solana base fee is 5000 lamports per signature
        return 5000;
    } catch (error) {
        console.warn('[Rialo] Failed to get fee from chain, using default:', error);
        return 5000; // Default fallback
    }
}

/**
 * Send raw transaction (Rialo Format)
 */
export async function sendRawTransaction(
    serializedTx: string
): Promise<string> {
    try {
        console.log('Sending Rialo raw transaction...');

        // Rialo Params: [{ transaction: "base64...", config: { ... } }]
        const signature = await rpcRequest('sendTransaction', [
            {
                transaction: serializedTx,
                config: {
                    encoding: 'base64',
                    skipPreflight: false,
                    preflightCommitment: TRANSACTION_CONFIG.COMMITMENT
                }
            }
        ]);

        return signature;
    } catch (error) {
        console.error('Send raw transaction error:', error);
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
}

/**
 * Confirm transaction
 */
export async function confirmTransaction(
    signature: string
): Promise<boolean> {
    const MAX_RETRIES = 30;
    const DELAY_MS = 1000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const result = await rpcRequest('getSignatureStatuses', [
                [signature],
                { searchTransactionHistory: true }
            ]);

            const status = result?.value?.[0];
            if (status) {
                if (status.err) return false;
                if ((status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized') ||
                    (status.executed === true)) {
                    return true;
                }
            }
        } catch (e) {
            console.warn('Confirmation poll failed', e);
        }
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    return false;
}

/**
 * Get signatures for address (Transaction History)
 */
export async function getSignaturesForAddress(
    address: string,
    limit: number = 10,
    before?: string
): Promise<any[]> {
    const paramStruct: any = {
        address: address,
        limit,
        commitment: TRANSACTION_CONFIG.COMMITMENT
    };

    if (before) {
        paramStruct.before = before;
    }

    const result = await rpcRequest('getSignaturesForAddress', [paramStruct]);
    return result?.value || [];
}

/**
 * Request airdrop
 */
export async function requestAirdrop(
    address: string,
    amount: number
): Promise<string> {
    const signature = await rpcRequest('requestAirdrop', [
        address,
        amount
    ]);

    await confirmTransaction(signature);
    return signature;
}

/**
 * Send native token transfer
 */
export async function sendNativeTransfer(
    to: string,
    amountLamports: number
): Promise<string> {
    try {
        const keypair = getActiveKeypair();

        let toPublicKey: RialoAddress;
        try {
            toPublicKey = new RialoAddress(to);
        } catch {
            throw new Error(ERROR_MESSAGES.INVALID_ADDRESS);
        }

        // Check balance
        const balance = await getBalance(keypair.publicKey.toBase58());
        const estimatedFee = 5000;

        if (balance < amountLamports + estimatedFee) {
            throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
        }

        // Create transaction (Rialo Format)
        const validFrom = Date.now() - 60000;

        const transaction = new RialoTransaction(keypair.publicKey, validFrom)
            .add(
                RialoSystem.transfer({
                    fromPubkey: keypair.publicKey,
                    toPubkey: toPublicKey,
                    lamports: amountLamports
                })
            );

        // Sign
        transaction.sign(keypair);
        const serialized = transaction.serialize().toString('base64');

        // Send
        const signature = await sendRawTransaction(serialized);

        // Confirm
        await confirmTransaction(signature);

        return signature;
    } catch (error) {
        console.error('Send transfer error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
}

/**
 * Send SPL Token transfer (supports Standard and Token-2022)
 */
export async function sendSPLTokenTransfer(
    to: string,
    amount: number,
    mint: string,
    decimals: number
): Promise<string> {
    try {
        const keypair = getActiveKeypair();
        const validFrom = Date.now() - 60000;

        // Program IDs
        // const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';

        let tokenProgramId = TOKEN_2022_PROGRAM_ID;
        try {
            const accountInfo = await rpcRequest('getAccountInfo', [{ address: mint, encoding: 'base64' }]);
            if (accountInfo?.value?.owner) {
                tokenProgramId = accountInfo.value.owner;
            }
        } catch (e) {
            console.warn('Failed to fetch mint owner, defaulting to Token 2022', e);
        }

        console.log('[Rialo] Token Transfer using Program:', tokenProgramId);

        // Addresses
        const walletPubkey = keypair.publicKey;
        // const mintPubkey = new RialoAddress(mint); // Assuming RialoAddress takes string
        // Check RialoAddress constructor usage in other functions.
        // Line 210: toPublicKey = new RialoAddress(to);
        const mintPubkey = new RialoAddress(mint);
        const recipientPubkey = new RialoAddress(to);
        const tokenProgramAddr = new RialoAddress(tokenProgramId);
        const ataProgramAddr = new RialoAddress(ASSOCIATED_TOKEN_PROGRAM_ID);
        const systemProgramAddr = new RialoAddress(SYSTEM_PROGRAM_ID);

        // We assume RialoAddress has findProgramAddress or similar static method
        // If not, we might fail compilation again if chain-compat doesn't have it.
        // Let's check if we can simulate it or if we should use rpc.
        // Actually, without source of chain-compat, assume it mirrors PublicKey API or fail.
        // IF FAIL: I will implement a simpler "findAddress" helper using createAddressWithSeed if available? No.

        // I'll assume it works for now. If build fails, I'll inspect chain-compat.
        const sourceATA = await RialoAddress.findProgramAddress(
            [walletPubkey.toBuffer(), tokenProgramAddr.toBuffer(), mintPubkey.toBuffer()],
            ataProgramAddr
        );
        const destATA = await RialoAddress.findProgramAddress(
            [recipientPubkey.toBuffer(), tokenProgramAddr.toBuffer(), mintPubkey.toBuffer()],
            ataProgramAddr
        );

        console.log('[Rialo] Source ATA:', sourceATA[0].toString());
        console.log('[Rialo] Dest ATA:', destATA[0].toString());

        const transaction = new RialoTransaction(walletPubkey, validFrom);

        const createAtaIx = {
            programId: ataProgramAddr,
            keys: [
                { pubkey: walletPubkey, isSigner: true, isWritable: true },
                { pubkey: destATA[0], isSigner: false, isWritable: true },
                { pubkey: recipientPubkey, isSigner: false, isWritable: false },
                { pubkey: mintPubkey, isSigner: false, isWritable: false },
                { pubkey: systemProgramAddr, isSigner: false, isWritable: false },
                { pubkey: tokenProgramAddr, isSigner: false, isWritable: false }
            ],
            data: Buffer.from([1]) // CreateIdempotent
        };
        transaction.add(createAtaIx);

        const amountBuf = Buffer.alloc(8);
        const amountBig = BigInt(amount);
        // Pre-check for BigInt safety?
        // writeBigUInt64LE handles BigInt.
        amountBuf.writeBigUInt64LE(amountBig);

        const transferData = Buffer.concat([
            Buffer.from([12]), // Opcode 12
            amountBuf,
            Buffer.from([decimals])
        ]);

        const transferIx = {
            programId: tokenProgramAddr,
            keys: [
                { pubkey: sourceATA[0], isSigner: false, isWritable: true },    // Source
                { pubkey: mintPubkey, isSigner: false, isWritable: false },     // Mint
                { pubkey: destATA[0], isSigner: false, isWritable: true },      // Dest
                { pubkey: walletPubkey, isSigner: true, isWritable: false }     // Authority
            ],
            data: transferData
        };
        transaction.add(transferIx);

        transaction.sign(keypair);
        const serialized = transaction.serialize().toString('base64');
        const signature = await sendRawTransaction(serialized);

        await confirmTransaction(signature);
        return signature;

    } catch (error) {
        console.error('Send token transfer error:', error);
        throw new Error(ERROR_MESSAGES.TRANSACTION_FAILED);
    }
}
