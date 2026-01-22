
/**
 * Rialo Core System Logic
 * Mirrors logic from:
 * - rialo-s-native-token
 * - rialo-s-fee
 * - rialo-s-feature-set
 * - rialo-s-rent
 * - rialo-s-secp256r1-program
 */

// ============================================================================
// NATIVE TOKEN (from rialo-s-native-token)
// ============================================================================

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const SOL_SYMBOL = '◎'; // Configurable
export const SOL_NAME = 'Rialo';

// ============================================================================
// SECP256R1 PRECOMPILE SUPPORT (from rialo-s-secp256r1-program)
// ============================================================================

export const SECP256R1_PROGRAM_ID = 'KeccakSecp256r11111111111111111111111111111';

export const SECP256R1_SIGNATURE_SERIALIZED_SIZE = 64;
export const SECP256R1_COMPRESSED_PUBKEY_SERIALIZED_SIZE = 33;
export const SECP256R1_SIGNATURE_OFFSETS_SERIALIZED_SIZE = 14;

// ============================================================================
// FEATURE SET SYSTEM (from rialo-s-feature-set)
// ============================================================================

export const FEATURE_ENABLE_SECP256R1_PRECOMPILE = 'GNDyRkki2jZdGqHlWJ9WjZdGqHlWJ9GNDyRkki2jZd'; // Placeholder ID, usually derived from pubkey

// Simple registry for now, effectively "all features active" or "configurable"
// In a real wallet, this might query the cluster / feature account.
const ACTIVE_FEATURES = new Set<string>([
    FEATURE_ENABLE_SECP256R1_PRECOMPILE
]);

export function isFeatureActive(featureId: string): boolean {
    return ACTIVE_FEATURES.has(featureId);
}

// ============================================================================
// FEE CALCULATION (from rialo-s-fee)
// ============================================================================

export const DEFAULT_LAMPORTS_PER_SIGNATURE = 5000;

export interface SignatureCounts {
    numTransactionSignatures: number;
    numEd25519Signatures: number;
    numSecp256k1Signatures: number;
    numSecp256r1Signatures: number;
}

/**
 * Calculates the transaction fee based on signature counts and active features.
 * Mirrors `rialo_s_fee::calculate_fee` logic.
 */
export function calculateFee(
    counts: SignatureCounts,
    lamportsPerSignature: number = DEFAULT_LAMPORTS_PER_SIGNATURE,
    prioritizationFee: number = 0
): number {
    const {
        numTransactionSignatures,
        numEd25519Signatures,
        numSecp256k1Signatures,
        numSecp256r1Signatures
    } = counts;

    const secp256r1Enabled = isFeatureActive(FEATURE_ENABLE_SECP256R1_PRECOMPILE);

    // Rust: u64::from(enable_secp256r1_precompile).wrapping_mul(num_secp256r1_signatures)
    const effectiveSecp256r1Count = secp256r1Enabled ? numSecp256r1Signatures : 0;

    const totalSignatures = numTransactionSignatures +
        numEd25519Signatures +
        numSecp256k1Signatures +
        effectiveSecp256r1Count;

    return (totalSignatures * lamportsPerSignature) + prioritizationFee;
}

// ============================================================================
// RENT CALCULATION (from rialo-s-rent)
// ============================================================================

export const DEFAULT_BURN_PERCENT = 50;
export const ACCOUNT_STORAGE_OVERHEAD = 128; // bytes
export const DEFAULT_LAMPORTS_PER_BYTE_YEAR = 3_480;
export const EXEMPTION_THRESHOLD = 2.0; // Usually 2 years worth of rent

/**
 * Calculates the minimum balance for rent exemption.
 * Rent Exempt = (Data Size + Overhead) * LamportsPerByteYear * 2 Years
 */
export function calculateRentExempt(dataSize: number): number {
    const totalSize = dataSize + ACCOUNT_STORAGE_OVERHEAD;
    const rentPerYear = totalSize * DEFAULT_LAMPORTS_PER_BYTE_YEAR;
    return Math.ceil(rentPerYear * EXEMPTION_THRESHOLD);
}
