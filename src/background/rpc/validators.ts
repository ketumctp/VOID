import {
    validatePubkey,
    validateAirdropAmount,
    validateSignature,
    validateLimit,
    ValidationError
} from '../../shared/rialo-api-types';

// Middleware Validation
export function validateRpcParams(method: string, params: any[]): void {
    if (!params || params.length === 0) return;

    // Basic mapping for common methods logic
    try {
        switch (method) {
            case 'getAccountInfo':
            case 'getBalance':
            case 'getTokenAccountsByOwner':
                // Param 0 is usually address
                if (typeof params[0] === 'string') validatePubkey(params[0]);
                else if (params[0]?.address) validatePubkey(params[0].address);
                break;
            case 'requestAirdrop':
                // [pubkey, amount]
                validatePubkey(params[0]);
                validateAirdropAmount(params[1]);
                break;
            case 'sendTransaction':
                // [encodedTx, config]
                // Basic check, full validation is on tx construction usually
                if (!params[0]) throw new ValidationError('Missing transaction data');
                break;
            case 'getSignatureStatuses':
                // [[signatures...]]
                if (Array.isArray(params[0])) {
                    params[0].forEach((sig: string) => validateSignature(sig));
                }
                break;
            case 'getSignaturesForAddress':
                // [ { address, limit, before... } ]
                if (params[0]?.address) validatePubkey(params[0].address);
                if (params[0]?.limit) validateLimit(params[0].limit);
                if (params[0]?.before) validateSignature(params[0].before);
                break;
        }
    } catch (e) {
        console.error(`Validation failed for ${method}:`, e);
        throw e; // Re-throw to block request
    }
}
