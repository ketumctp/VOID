import { rpcRequest } from './core';

/**
 * Simulate a transaction to get estimated balance changes
 * SECURITY: Used to detect "Blind Signing" drains via CPI
 * Returns: { err, accounts, logs, simulationStatus }
 */
export async function simulateTransaction(serializedTx: string, accountsToInspect: string[] = []): Promise<{
    err: any;
    accounts: any[] | null;
    logs: string[];
    simulationStatus: 'success' | 'failed';
}> {
    try {
        const config: any = {
            sigVerify: false,
            replaceRecentBlockhash: true,
            commitment: 'confirmed',
            encoding: 'base64'
        };

        if (accountsToInspect.length > 0) {
            config.accounts = {
                encoding: 'base64',
                addresses: accountsToInspect
            };
        }

        const result = await rpcRequest('simulateTransaction', [
            serializedTx,
            config
        ]);

        const value = result.value;

        // PRODUCTION RULE: Empty logs with balance change = FAILED
        const hasLogs = value.logs && value.logs.length > 0;
        const hasError = !!value.err;

        return {
            err: value.err,
            accounts: value.accounts || null,
            logs: value.logs || [],
            simulationStatus: (hasError || !hasLogs) ? 'failed' : 'success'
        };
    } catch (error) {
        console.error('Simulation failed:', error);
        // ALL errors = FAILED (timeout, rpc_error, rate_limit, partial_data)
        return {
            err: 'Simulation Failed: ' + (error instanceof Error ? error.message : 'Unknown'),
            accounts: null,
            logs: [],
            simulationStatus: 'failed'
        };
    }
}
