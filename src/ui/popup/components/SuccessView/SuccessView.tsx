/**
 * SuccessView Component - Rialo Wallet
 */
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import { CheckIcon } from '@/components/ui/icons/check';
import { CopyIcon } from '@/components/ui/icons/copy';
import { Button } from '../../../components/ui/Button';
import * as styles from './SuccessView.css';

interface SuccessViewProps {
    signature: string;
    onBack: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ signature, onBack }) => {

    const copyHash = async () => {
        if (!signature) return;
        try {
            await navigator.clipboard.writeText(signature);
            notify.success('Transaction hash copied');
        } catch (err) {
            notify.error('Failed to copy hash');
        }
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />
            <div className={styles.iconWrapper}>
                <CheckIcon size={48} color="white" />
            </div>

            <h2 className={styles.title}>Transaction Sent!</h2>
            <p className={styles.message}>Your transfer was successful.</p>

            {signature && (
                <div className={styles.hashContainer}>
                    <p className={styles.hashLabel}>Transaction Hash</p>
                    <div className={styles.hashBox}>
                        <span className={styles.hashText}>{signature}</span>
                        <button className={styles.copyButton} onClick={copyHash} title="Copy Hash">
                            <CopyIcon size={16} />
                        </button>
                    </div>

                    <Button
                        variant="glass"
                        fullWidth
                        size="md"
                        onClick={() => window.open(`https://explorer.rialo-community.xyz/transactions/${signature}?cluster=devnet`, '_blank')}
                        style={{ marginBottom: '16px' }}
                    >
                        View on Explorer
                    </Button>
                </div>
            )}

            <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={onBack}
                style={{ width: '80%' }}
            >
                Back to Wallet
            </Button>
        </div>
    );
};

export default SuccessView;
