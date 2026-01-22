
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

/**
 * Rialo CPI & Known Programs
 * Mirrors logic from:
 * - rialo-sol-cpi
 * - rialo-subscriber-interface
 */

// ============================================================================
// PROGRAM REGISTRY
// ============================================================================

export const RIALO_PROGRAMS = {
    NativeLoader: 'NativeLoader1111111111111111111111111111111',
    SystemProgram: '11111111111111111111111111111111',
    TokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    Token2022Program: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    MemoProgram: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb',

    // Rialo Specific
    HttpCallProgram: 'HttpCaLL111111111111111111111111111111111', // Placeholder, verify if known
    OracleRegistryProgram: '11111111111111111111111111111111', // Placeholder: Needs actual Rialo Oracle ID
    SubscriberProgram: 'Subscriber111111111111111111111111111111111',
    Secp256r1Program: 'KeccakSecp256r11111111111111111111111111111'
};

export const KNOWN_PROGRAM_NAMES: Record<string, string> = {
    [RIALO_PROGRAMS.NativeLoader]: 'Native Loader',
    [RIALO_PROGRAMS.SystemProgram]: 'System Program',
    [RIALO_PROGRAMS.TokenProgram]: 'Token Program',
    [RIALO_PROGRAMS.Token2022Program]: 'Token-2022 Program',
    [RIALO_PROGRAMS.MemoProgram]: 'Memo Program',
    [RIALO_PROGRAMS.HttpCallProgram]: 'Rialo HTTP Call',
    [RIALO_PROGRAMS.OracleRegistryProgram]: 'Rialo Oracle Registry',
    [RIALO_PROGRAMS.SubscriberProgram]: 'Rialo Subscriber',
    [RIALO_PROGRAMS.Secp256r1Program]: 'Secp256r1 Precompile',
};

// ============================================================================
// SUBSCRIBER PROGRAM INTERFACE
// ============================================================================

export enum SubscriberInstructionType {
    Subscribe = 0,
    Unsubscribe = 1,
    Update = 2,
    Destroy = 3,
}

// Seeds (Assumed based on naming conventions, should match Rust)
const SUBSCRIBE_SEED = Buffer.from('subscribe', 'utf8');
const ORACLE_SEED = Buffer.from('oracle', 'utf8');

/**
 * Derives the subscription address for a user.
 * Rust: derive_subscription_address(subscriber, nonce, program_id)
 */
export function deriveSubscriptionAddress(
    subscriber: PublicKey,
    nonce: bigint | number,
    programId: PublicKey = new PublicKey(RIALO_PROGRAMS.SubscriberProgram)
): [PublicKey, number] {
    // nonce usually u64 le bytes
    const nonceBuf = Buffer.alloc(8);
    // writeBigUInt64LE is available in newer Node/Browsers, or use library
    // Fallback or use manual write for < 2^53
    if (typeof nonce === 'bigint') {
        nonceBuf.writeBigUInt64LE(nonce);
    } else {
        // Safe for non-huge numbers
        const low = nonce % 0x100000000;
        const high = Math.floor(nonce / 0x100000000);
        nonceBuf.writeUInt32LE(low, 0);
        nonceBuf.writeUInt32LE(high, 4);
    }

    return PublicKey.findProgramAddressSync(
        [SUBSCRIBE_SEED, subscriber.toBuffer(), nonceBuf],
        programId
    );
}

/**
 * Derives the oracle address.
 * Rust: derive_oracle_address(oracle_id, program_id)
 */
export function deriveOracleAddress(
    oracleId: string, // Assuming string ID or pubkey? usually string or bytes
    programId: PublicKey = new PublicKey(RIALO_PROGRAMS.OracleRegistryProgram)
): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [ORACLE_SEED, Buffer.from(oracleId, 'utf8')],
        programId
    );
}

// ============================================================================
// INSTRUCTION PARSING
// ============================================================================

export interface DecodedSubscriberInstruction {
    type: SubscriberInstructionType;
    typeName: string;
}

export function parseSubscriberInstruction(data: Buffer | Uint8Array): DecodedSubscriberInstruction | null {
    if (data.length === 0) return null;

    // Assuming 1st byte defines instruction variant
    const variant = data[0];

    switch (variant) {
        case SubscriberInstructionType.Subscribe:
            return { type: variant, typeName: 'Subscribe' };
        case SubscriberInstructionType.Unsubscribe:
            return { type: variant, typeName: 'Unsubscribe' };
        case SubscriberInstructionType.Update:
            return { type: variant, typeName: 'Update' };
        case SubscriberInstructionType.Destroy:
            return { type: variant, typeName: 'Destroy' };
        default:
            return null;
    }
}
