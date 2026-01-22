/**
 * ConfirmView Component - Rialo Wallet
 */
import React, { useState, useRef, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import type { TokenInfo } from '../../../../shared/types';
import { Button } from '../../../components/ui/Button';
import * as styles from './ConfirmView.css';

interface ConfirmViewProps {
    onBack: () => void;
    onSuccess: (signature: string) => void;
    amount: string;
    recipient: string;
    selectedAsset: TokenInfo | null;
}

export const ConfirmView: React.FC<ConfirmViewProps> = ({
    onBack, onSuccess, amount, recipient, selectedAsset
}) => {
    const [error, setError] = useState('');
    const [estimatedFee, setEstimatedFee] = useState<string>('Loading...');
    const isSubmitting = useRef(false);

    // Fetch fee from chain on mount
    useEffect(() => {
        chrome.runtime.sendMessage({ type: 'GET_ESTIMATED_FEE', id: Date.now().toString() }, (response: any) => {
            if (response && response.success && response.data) {
                const feeLamports = response.data.feeLamports;
                const feeRialo = feeLamports / 1_000_000_000;
                setEstimatedFee(`${feeRialo.toFixed(9)} RIALO`);
            } else {
                // Fallback display
                setEstimatedFee('~ 0.000005 RIALO');
            }
        });
    }, []);

    const handleConfirmSend = () => {
        if (isSubmitting.current) return;

        isSubmitting.current = true;
        const toastId = notify.loading('Sending transaction...');

        const msg: any = {
            type: 'SEND_TRANSACTION',
            to: recipient,
            id: Date.now().toString()
        };

        if (selectedAsset) {
            // Token Transfer
            const decimals = selectedAsset.decimals;
            const amountBig = parseFloat(amount) * Math.pow(10, decimals);
            msg.amount = Math.floor(amountBig);
            msg.mint = selectedAsset.mint;
            msg.decimals = decimals;
        } else {
            // Native Transfer
            msg.amount = Math.floor(parseFloat(amount) * 1_000_000_000);
        }

        chrome.runtime.sendMessage(msg, (response: any) => {
            notify.dismiss(toastId);
            isSubmitting.current = false;

            if (response && response.success) {
                notify.success('Transaction sent successfully!');
                onSuccess(response.data.signature || '');
            } else {
                notify.error(response.error || 'Transaction failed');
                setError(response.error || 'Transaction failed');
            }
        });
    };

    const isNative = !selectedAsset;
    const symbol = isNative ? 'RIALO' : (selectedAsset?.symbol || 'Token');

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />
            <div className={styles.card}>
                <h2 className={styles.title}>Confirm Transaction</h2>

                {error && <div className={styles.errorMsg}>{error}</div>}

                <div className={styles.amountBox}>
                    <p className={styles.amountValue}>{amount}</p>
                    <p className={styles.amountSymbol}>{symbol}</p>
                </div>

                <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>To</span>
                        <span className={`${styles.detailValue} ${styles.address}`}>
                            {recipient}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Network</span>
                        <span className={styles.detailValue}>Rialo Devnet</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Estimated Fee</span>
                        <span className={styles.detailValue}>{estimatedFee}</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        fullWidth
                        size="lg"
                        onClick={onBack}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleConfirmSend}
                    >
                        Confirm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmView;
