import { useState, useEffect } from 'react';
import { notify } from '@/lib/toast';

export const useSignRequest = (requestId: string, onComplete: () => void) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [requestData, setRequestData] = useState<any>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [requiredAmount, setRequiredAmount] = useState<number>(0);
    const [insufficientBalance, setInsufficientBalance] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            new Promise<any>((resolve) => {
                chrome.runtime.sendMessage({
                    type: 'GET_PENDING_REQUEST',
                    requestId: requestId,
                    id: Date.now().toString()
                }, resolve);
            }),
            new Promise<any>((resolve) => {
                chrome.runtime.sendMessage({
                    type: 'GET_BALANCE',
                    id: Date.now().toString()
                }, resolve);
            })
        ]).then(([requestResponse, balanceResponse]) => {
            setLoading(false);

            if (requestResponse && requestResponse.success && requestResponse.data) {
                setRequestData(requestResponse.data);

                let txAmount = 0;
                if (requestResponse.data.parsed?.instructions) {
                    requestResponse.data.parsed.instructions.forEach((ix: any) => {
                        if (ix.parsed?.info?.amount) {
                            txAmount += Number(ix.parsed.info.amount);
                        }
                    });
                }

                if (txAmount === 0 && requestResponse.data.data?.transaction) {
                    try {
                        const txData = typeof requestResponse.data.data.transaction === 'string'
                            ? JSON.parse(requestResponse.data.data.transaction)
                            : requestResponse.data.data.transaction;
                        if (txData.amount) {
                            txAmount = txData.amount;
                        }
                    } catch (e) { /* ignore */ }
                }

                txAmount += 5000; // Fee
                setRequiredAmount(txAmount);
            }

            if (balanceResponse && balanceResponse.success && balanceResponse.data) {
                const balanceLamports = parseInt(balanceResponse.data.balance || '0');
                setBalance(balanceLamports);
            }
        });
    }, [requestId]);

    useEffect(() => {
        if (balance !== null && requiredAmount > 0) {
            setInsufficientBalance(balance < requiredAmount);
        }
    }, [balance, requiredAmount]);

    const isHighRisk = () => {
        if (!requestData?.data?.riskAssessment) return true;
        const level = requestData.data.riskAssessment.level;
        return level === 'CRITICAL' || level === 'HIGH';
    };

    const handleApprove = (confirmInput: string) => {
        if (submitting) return;
        if (isHighRisk() && confirmInput !== 'CONFIRM') return;

        setSubmitting(true);
        const loadingToast = notify.loading('Signing transaction...');

        chrome.runtime.sendMessage({
            type: 'RESOLVE_REQUEST',
            requestId: requestId,
            id: Date.now().toString()
        }, (response: any) => {
            notify.dismiss(loadingToast);
            setSubmitting(false);

            if (response && response.success) {
                notify.success('Transaction signed successfully!');
                chrome.runtime.sendMessage({ type: 'GET_BALANCE', id: 'refresh' });
                onComplete();
            } else {
                const errorMsg = response?.error || 'Signing failed';
                if (errorMsg.toLowerCase().includes('insufficient')) {
                    notify.error('❌ Insufficient balance!');
                } else if (errorMsg.toLowerCase().includes('reject')) {
                    notify.error('Transaction rejected');
                } else {
                    notify.error(`Error: ${errorMsg}`);
                }
            }
        });
    };

    const handleReject = () => {
        if (submitting) return;
        setSubmitting(true);

        chrome.runtime.sendMessage({
            type: 'REJECT_REQUEST',
            requestId: requestId,
            id: Date.now().toString()
        }, () => {
            setSubmitting(false);
            notify.success('Request rejected');
            onComplete();
        });
    };

    return {
        loading,
        submitting,
        requestData,
        insufficientBalance,
        requiredAmount,
        isHighRisk,
        handleApprove,
        handleReject
    };
};
