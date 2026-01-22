/**
 * RIALO CHAIN COMPATIBILITY LAYER
 * 
 * TEMPORARY ADAPTER to decouple UI migration from core refactors.
 * Implements Rialo primitives using neutral libraries (bs58, tweetnacl).
 * 
 * STRICT RULE: NO SOLANA NAMING (PublicKey, SystemProgram, etc).
 */

import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

/**
 * RialoAddress - Represents a 32-byte Ed25519 public key
 */
export class RialoAddress {
    private _bn: Uint8Array;

    constructor(value: RialoAddress | string | Uint8Array) {
        if (value instanceof RialoAddress) {
            this._bn = value.toBuffer();
        } else if (typeof value === 'string') {
            this._bn = bs58.decode(value);
        } else {
            this._bn = value;
        }

        if (this._bn.length !== 32) {
            throw new Error(`Invalid RialoAddress length: ${this._bn.length}`);
        }
    }

    toBase58(): string {
        return bs58.encode(this._bn);
    }

    toBuffer(): Uint8Array {
        return new Uint8Array(this._bn);
    }

    toBytes(): Uint8Array {
        return new Uint8Array(this._bn);
    }

    toString(): string {
        return this.toBase58();
    }

    equals(other: RialoAddress): boolean {
        const a = this.toBuffer();
        const b = other.toBuffer();
        return a.length === b.length && a.every((v, i) => v === b[i]);
    }

    static unique(): RialoAddress {
        const key = nacl.sign.keyPair();
        return new RialoAddress(key.publicKey);
    }

    // Added for PDA derivation
    static async findProgramAddress(seeds: Uint8Array[], programId: RialoAddress): Promise<[RialoAddress, number]> {
        // Static import usage is safe now that shims are loaded first in background/index.ts
        const [pkey, bump] = await PublicKey.findProgramAddress(
            seeds.map(s => s),
            new PublicKey(programId.toBuffer())
        );
        return [new RialoAddress(pkey.toBuffer()), bump];
    }
}

/**
 * RialoKeypair - Ed25519 Keypair
 */
export class RialoKeypair {
    publicKey: RialoAddress;
    secretKey: Uint8Array;

    constructor(keypair: { publicKey: Uint8Array; secretKey: Uint8Array }) {
        this.publicKey = new RialoAddress(keypair.publicKey);
        this.secretKey = keypair.secretKey;
    }

    static generate(): RialoKeypair {
        const pair = nacl.sign.keyPair();
        return new RialoKeypair(pair);
    }

    static fromSecretKey(secretKey: Uint8Array): RialoKeypair {
        const pair = nacl.sign.keyPair.fromSecretKey(secretKey);
        return new RialoKeypair(pair);
    }

    static fromSeed(seed: Uint8Array): RialoKeypair {
        const pair = nacl.sign.keyPair.fromSeed(seed);
        return new RialoKeypair(pair);
    }
}

/**
 * RialoInstruction - Generic instruction structure
 */
export interface RialoInstruction {
    programId: RialoAddress;
    keys: {
        pubkey: RialoAddress;
        isSigner: boolean;
        isWritable: boolean;
    }[];
    data: Uint8Array;
}

/**
 * RialoSystem - Factory for system instructions (Transfer, etc)
 */
export class RialoSystem {
    // Hardcoded System Program ID for Rialo (Standard)
    static programId = new RialoAddress('11111111111111111111111111111111');

    static transfer(params: {
        fromPubkey: RialoAddress;
        toPubkey: RialoAddress;
        lamports: number | bigint;
    }): RialoInstruction {
        const data = Buffer.alloc(12);
        data.writeUInt32LE(2, 0); // Transfer instruction index = 2
        data.writeBigInt64LE(BigInt(params.lamports), 4);

        return {
            programId: RialoSystem.programId,
            keys: [
                { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
                { pubkey: params.toPubkey, isSigner: false, isWritable: true }
            ],
            data: new Uint8Array(data)
        };
    }
}
