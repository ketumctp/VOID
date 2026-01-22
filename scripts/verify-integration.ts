
import {
    validatePubkey,
    validateLamports,
    validateAirdropAmount,
    validateSignature,
    ValidationError
} from '../src/shared/rialo-api-types.ts';
import {
    calculateFee,
    FEATURE_ENABLE_SECP256R1_PRECOMPILE,
    isFeatureActive
} from '../src/shared/rialo-core.ts';
import {
    deriveSubscriptionAddress,
    deriveOracleAddress,
    RIALO_PROGRAMS
} from '../src/shared/rialo-cpi.ts';
import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';

// Mock feature active check if needed, but rialo-core has internal Set.
// We'll rely on default state (SECP256R1 enabled).

async function main() {
    console.log('Running Verification Script...');
    let passed = 0;
    let failed = 0;

    function assert(condition: boolean, msg: string) {
        if (condition) {
            console.log(`✅ PASS: ${msg}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${msg}`);
            failed++;
        }
    }

    function assertThrow(fn: () => void, msg: string) {
        try {
            fn();
            console.error(`❌ FAIL: ${msg} (Did not throw)`);
            failed++;
        } catch (e) {
            console.log(`✅ PASS: ${msg} (Threw as expected)`);
            passed++;
        }
    }

    // 1. Validation Logic
    console.log('\n--- Testing Validation ---');
    const validPubkey = '11111111111111111111111111111111';
    const invalidPubkeyChar = '1111111111111111111111111111111I'; // I is invalid in base58

    assertThrow(() => validatePubkey(invalidPubkeyChar), 'Invalid Pubkey Character');
    assertThrow(() => validatePubkey('short'), 'Short Pubkey');
    // validatePubkey(validPubkey); // Should not throw
    // Actually validPubkey base58 check might fail if I didn't implement bs58 decode validation,
    // My regex was /^[1-9A-HJ-NP-Za-km-z]+$/. '1' is valid.
    try {
        validatePubkey(validPubkey);
        assert(true, 'Valid Pubkey passed');
    } catch (e) {
        assert(false, `Valid Pubkey failed: ${e}`);
    }

    assertThrow(() => validateLamports(-1n), 'Negative Lamports');
    assertThrow(() => validateLamports(1_000_000_000_000_000_000n), 'Max Lamports Exceeded'); // Limit is 500e15

    // 2. Fee Calculation
    console.log('\n--- Testing Fee Calculation ---');
    const counts = {
        numTransactionSignatures: 1,
        numEd25519Signatures: 0,
        numSecp256k1Signatures: 0,
        numSecp256r1Signatures: 1
    };

    // Feature ENABLE_SECP256R1_PRECOMPILE is in ACTIVE_FEATURES by default in rialo-core.ts
    // Calculation: (1 + 0 + 0 + 1) * 5000 = 10000
    const fee = calculateFee(counts, 5000, 0);
    assert(fee === 10000, `Fee Calculation with Secp256r1 (Got ${fee}, Expected 10000)`);

    // 3. CPI Address Derivation
    console.log('\n--- Testing CPI Derivation ---');
    const subscriber = new PublicKey('11111111111111111111111111111111');
    const programId = new PublicKey(RIALO_PROGRAMS.SubscriberProgram);

    try {
        const [subAddress, nonce] = deriveSubscriptionAddress(subscriber, 1n, programId);
        console.log(`Derived Subscription Address: ${subAddress.toBase58()}, bump: ${nonce}`);
        assert(true, 'deriveSubscriptionAddress ran successfully');
    } catch (e) {
        assert(false, `deriveSubscriptionAddress failed: ${e}`);
    }

    try {
        const [oracleAddress, bump] = deriveOracleAddress('my-oracle', new PublicKey(RIALO_PROGRAMS.OracleRegistryProgram));
        console.log(`Derived Oracle Address: ${oracleAddress.toBase58()}, bump: ${bump}`);
        assert(true, 'deriveOracleAddress ran successfully');
    } catch (e) {
        assert(false, `deriveOracleAddress failed: ${e}`);
    }


    console.log(`\nVerification Complete: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

main().catch(console.error);
