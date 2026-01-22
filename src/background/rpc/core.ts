import { DEFAULT_NETWORK } from '../../shared/constants';
import { Connection } from '@solana/web3.js';
import { validateRpcParams } from './validators';

let idCounter = 1;

export const connection = new Connection(DEFAULT_NETWORK.rpcEndpoint, 'confirmed');

// Manual RPC helper
export async function rpcRequest(method: string, params: any): Promise<any> {
    // 1. Client-side Validation
    validateRpcParams(method, params);

    const payload = {
        jsonrpc: '2.0',
        id: idCounter++,
        method,
        params
    };

    // DEBUG LOGGING
    console.log('[RIALO RPC PAYLOAD]', JSON.stringify(payload));

    const response = await fetch(DEFAULT_NETWORK.rpcEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log('[RIALO RPC RAW RESPONSE]', text);

    let json;
    try {
        json = JSON.parse(text);
    } catch (e) {
        throw new Error(`RPC returned non-JSON response: ${text}`);
    }

    if (json.error) {
        // Properly stringify error object for console
        console.error('[RIALO RPC ERROR]', JSON.stringify(json.error, null, 2));

        // Create detailed error message
        const errorMsg = json.error.message || JSON.stringify(json.error);
        const errorCode = json.error.code ? ` (Code: ${json.error.code})` : '';
        throw new Error(`RPC Error${errorCode}: ${errorMsg}`);
    }
    return json.result;
}
