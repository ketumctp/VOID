
import { RialoAddress, RialoKeypair } from './chain-compat';
import type { RialoInstruction } from './chain-compat';
import { Buffer } from 'buffer';
import nacl from 'tweetnacl';

export class RialoTransaction {

    feePayer: RialoAddress;
    validFrom: bigint;
    instructions: RialoInstruction[];
    signatures: { pubkey: RialoAddress, signature: Uint8Array | null }[];

    constructor(feePayer: RialoAddress, validFrom: number | bigint) {
        this.feePayer = feePayer;
        this.validFrom = BigInt(validFrom);
        this.instructions = [];
        this.signatures = [];
    }

    add(instruction: RialoInstruction): RialoTransaction {
        this.instructions.push(instruction);
        return this;
    }

    // Sign the transaction
    sign(keypair: RialoKeypair) {
        // Compile message
        const message = this.compileMessage();

        // Sign
        const signature = nacl.sign.detached(message, keypair.secretKey);

        // Store signature
        this.signatures = [{ pubkey: keypair.publicKey, signature }];
    }

    serialize(): Buffer {
        if (this.signatures.length === 0 || !this.signatures[0].signature) {
            throw new Error("Transaction not signed");
        }

        const message = this.compileMessage();
        const signature = this.signatures[0].signature!;

        // Final Transaction: [Compact-Array Signatures] [Message]
        const buffer: number[] = [];

        // 1. Signatures
        // We only support 1 signature for now as per simple wallet spec
        buffer.push(1); // Length 1
        buffer.push(...signature);

        // 2. Message
        buffer.push(...message);

        return Buffer.from(buffer);
    }

    compileMessage(): Buffer {
        // This implements the sorting and message construction logic from rialo-cdk

        // 1. Collect all accounts
        const accountMap = new Map<string, { isSigner: boolean, isWritable: boolean }>();

        // Add Fee Payer (Signer, Writable)
        accountMap.set(this.feePayer.toBase58(), { isSigner: true, isWritable: true });

        for (const ix of this.instructions) {
            // Add Program ID (Readonly, Non-Signer)
            const progId = ix.programId;
            const progIdStr = progId.toBase58();
            if (!accountMap.has(progIdStr)) {
                accountMap.set(progIdStr, { isSigner: false, isWritable: false });
            }

            // Add Instruction Accounts
            for (const acc of ix.keys) {
                const key = acc.pubkey.toBase58();
                if (accountMap.has(key)) {
                    const existing = accountMap.get(key)!;
                    existing.isSigner = existing.isSigner || acc.isSigner;
                    existing.isWritable = existing.isWritable || acc.isWritable;
                } else {
                    accountMap.set(key, { isSigner: acc.isSigner, isWritable: acc.isWritable });
                }
            }
        }

        // 2. Sort Accounts
        const accounts = Array.from(accountMap.entries()).map(([key, meta]) => ({
            pubkey: new RialoAddress(key),
            ...meta
        }));

        accounts.sort((a, b) => {
            // Signer > Non-Signer
            if (a.isSigner !== b.isSigner) return a.isSigner ? -1 : 1;
            // Writable > Readonly
            if (a.isWritable !== b.isWritable) return a.isWritable ? -1 : 1;
            // Pubkey Sort
            return Buffer.compare(
                Buffer.from(a.pubkey.toBuffer()),
                Buffer.from(b.pubkey.toBuffer())
            );
        });

        const feePayerIndex = accounts.findIndex(a => a.pubkey.equals(this.feePayer));
        if (feePayerIndex > 0) {
            const [payer] = accounts.splice(feePayerIndex, 1);
            accounts.unshift(payer);
        }

        // 3. Build Header
        const numRequiredSignatures = accounts.filter(a => a.isSigner).length;
        const numReadonlySignedAccounts = accounts.filter(a => a.isSigner && !a.isWritable).length;
        const numReadonlyUnsignedAccounts = accounts.filter(a => !a.isSigner && !a.isWritable).length;

        const buffer: number[] = [];
        buffer.push(numRequiredSignatures);
        buffer.push(numReadonlySignedAccounts);
        buffer.push(numReadonlyUnsignedAccounts);

        // 4. Account Keys
        startCompactArray(buffer, accounts.length);
        for (const acc of accounts) {
            buffer.push(...acc.pubkey.toBuffer());
        }

        // 5. Valid From (8 bytes little-endian)
        const validFromBuf = Buffer.alloc(8);
        validFromBuf.writeBigInt64LE(this.validFrom);
        buffer.push(...validFromBuf);

        // 6. Instructions
        startCompactArray(buffer, this.instructions.length);
        for (const ix of this.instructions) {
            // Program Index
            const progIdx = accounts.findIndex(a => a.pubkey.equals(ix.programId));
            if (progIdx === -1) throw new Error("Program ID not found in accounts");
            buffer.push(progIdx);

            // Account Indices
            startCompactArray(buffer, ix.keys.length);
            for (const key of ix.keys) {
                const accIdx = accounts.findIndex(a => a.pubkey.equals(key.pubkey));
                if (accIdx === -1) throw new Error("Account not found");
                buffer.push(accIdx);
            }

            // Data
            startCompactArray(buffer, ix.data.length);
            buffer.push(...ix.data);
        }

        return Buffer.from(buffer);
    }
}

function startCompactArray(buffer: number[], len: number) {
    if (len < 128) {
        buffer.push(len);
    } else {
        buffer.push((len & 0x7f) | 0x80);
        buffer.push((len >> 7) & 0x7f);
    }
}
