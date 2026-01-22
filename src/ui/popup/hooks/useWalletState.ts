import { useState, useEffect } from 'react';
import type { TokenInfo } from '../../../shared/types';
import type { Transaction } from '../../../components/TransactionList';


const sendMsg = (msg: any): Promise<any> => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(msg, (res) => resolve(res));
    });
};

export const useWalletState = (view: string) => {
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [tokens, setTokens] = useState<TokenInfo[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const refreshBalance = async () => {
        try {
            const [balResponse, tokenResponse, txResponse] = await Promise.all([
                sendMsg({ type: 'GET_BALANCE', id: Date.now().toString() }),
                sendMsg({ type: 'GET_TOKENS', id: Date.now().toString() }),
                sendMsg({ type: 'GET_TRANSACTIONS', limit: 5, id: Date.now().toString() })
            ]);

            if (balResponse && balResponse.success && balResponse.data) {
                setWallet((prev: any) => ({ ...prev, ...balResponse.data }));
            }

            if (tokenResponse && tokenResponse.success && tokenResponse.data) {
                setTokens(tokenResponse.data.tokens || []);
            }

            if (txResponse && txResponse.success && txResponse.data) {
                setTransactions(txResponse.data.transactions || []);
            }
        } catch (error) {
            console.warn('Background poll failed:', error);
        }
    };

    const refreshState = async () => {
        setIsRefreshing(true);
        try {
            const response = await sendMsg({ type: 'GET_WALLET_STATE', id: 'init' });

            if (response && response.data) {
                const walletState = response.data;
                setWallet((prev: any) => ({
                    ...walletState,
                    balance: (walletState.balance && walletState.balance !== '0' ? walletState.balance : (prev?.balance || walletState.balance))
                }));

                // Initial full load if wallet exists and not locked (handled by navigation mostly, but data needs to load)
                if (walletState.hasWallet && !walletState.isLocked) {
                    await refreshBalance();
                }
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            // Don't show toast for init failures, just rely on UI error state
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Initial load with simple retry
    useEffect(() => {
        let retries = 0;
        const init = async () => {
            try {
                await refreshState();
            } catch (e) {
                if (retries < 2) {
                    retries++;
                    setTimeout(init, 500);
                }
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Real-time Polling Hook
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (view === 'dashboard' && !loading) {
            // Poll every 5 seconds
            intervalId = setInterval(() => {
                refreshBalance();
            }, 2000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [view, loading]);

    return {
        loading,
        setLoading,
        isRefreshing,
        wallet,
        tokens,
        transactions,
        refreshState,
        refreshBalance
    };
};
