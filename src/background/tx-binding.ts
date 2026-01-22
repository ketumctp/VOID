/**
 * TX Binding - Cryptographic binding between UI display and signed transaction
 * PHASE 5: Prevents blind signing by ensuring UI matches TX bytes
 * STRICT MODE: Re-parses binary data and compares against approved UI data.
 */

import { parseTransaction } from './transaction-parser';
import type { ParsedTransaction } from './transaction-parser';

/**
 * Validates that the transaction the user approved (expected) matches exactly
 * the transaction bytes that are about to be signed (actual).
 * 
 * Strategy:
 * 1. Take the `expectedParsedData` (which the UI used to render the prompt).
 * 2. Parse the `rawTxBytes` into `actualParsedData`.
 * 3. Perform a STRICT DEEP EQUALITY check.
 * 
 * If they match, it proves the bytes contain exactly what the user saw.
 */
export function validateBinding(
    expectedParsedData: any,
    rawTxBytes: Uint8Array
): { valid: boolean; reason?: string } {

    // 1. Sanity Check: If we don't have expected data, we can't validate.
    if (!expectedParsedData) {
        return { valid: false, reason: 'Missing expected UI data for binding validation.' };
    }

    // 2. Re-parse the raw bytes
    // Convert Uint8Array to Base64 for the parser (which expects base64 string)
    // Node.js Buffer handling
    const base64Tx = Buffer.from(rawTxBytes).toString('base64');
    const actualParsedData = parseTransaction(base64Tx);

    if (!actualParsedData) {
        return { valid: false, reason: 'Failed to parse raw transaction bytes.' };
    }

    // 3. Deep Compare
    // We compare key structural fields: instructions, feePayer
    // We do NOT compare 'raw' string because it might be the source of the bytes itself

    // Filter out 'raw' from comparison to focus on content
    const sanitizedExpected = sanitizeForComparison(expectedParsedData);
    const sanitizedActual = sanitizeForComparison(actualParsedData);

    try {
        if (!deepEqual(sanitizedExpected, sanitizedActual)) {
            console.error('[Binding Mismatch] Expected:', JSON.stringify(sanitizedExpected, null, 2));
            console.error('[Binding Mismatch] Actual:', JSON.stringify(sanitizedActual, null, 2));
            return {
                valid: false,
                reason: 'CRITICAL: Transaction mismatch! The data shown to the user does not match the transaction bytes.'
            };
        }
    } catch (e) {
        return { valid: false, reason: 'Binding comparison error: ' + (e instanceof Error ? e.message : 'Unknown') };
    }

    return { valid: true };
}

/**
 * Removes fields that shouldn't be part of the comparison (like 'raw' blob string)
 */
function sanitizeForComparison(data: ParsedTransaction): any {
    const { raw, ...rest } = data;
    return rest;
}

/**
 * Helper: Strict Deep Equality Check
 */
function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    if (keys1.length !== keys2.length) return false;

    for (let i = 0; i < keys1.length; i++) {
        const key = keys1[i];
        if (key !== keys2[i]) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}
