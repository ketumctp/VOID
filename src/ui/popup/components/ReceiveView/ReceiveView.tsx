/**
 * ReceiveView Component - Rialo Wallet
 */
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import { CopyIcon } from '@/components/ui/icons/copy';
import { CheckIcon } from '@/components/ui/icons/check';
import { Header } from '../../../components/ui/Header';
import * as styles from './ReceiveView.css';

interface ReceiveViewProps {
    publicKey: string;
    onBack: () => void;
}

export const ReceiveView: React.FC<ReceiveViewProps> = ({ publicKey, onBack }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (publicKey) {
            generateQRCode(publicKey);
        }
    }, [publicKey]);

    const generateQRCode = async (address: string) => {
        try {
            const url = await QRCode.toDataURL(address, {
                width: 440, // Higher res for crisp display
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error('QR Code generation failed:', err);
        }
    };

    const copyToClipboard = async () => {
        if (!publicKey) return;
        try {
            await navigator.clipboard.writeText(publicKey);
            setCopySuccess(true);
            notify.success('Address copied to clipboard');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            notify.error('Failed to copy address');
        }
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />

            <Header
                title="Receive"
                onBack={onBack}
            />

            <div className={styles.content}>
                <h1 className={styles.title}>Receive RIALO</h1>
                <p className={styles.subtitle}>Scan code or copy address to deposit</p>

                {qrCodeUrl && (
                    <div className={styles.qrContainer}>
                        <img src={qrCodeUrl} alt="QR Code" className={styles.qrImage} />
                    </div>
                )}

                <p className={styles.addressLabel}>Your Wallet Address</p>

                <div className={styles.addressBox}>
                    <div className={styles.addressText}>
                        {publicKey}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={styles.copyButton}
                        title="Copy address"
                        data-copied={copySuccess}
                    >
                        {copySuccess ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                    </button>
                </div>

                <div className={styles.successMessage}>
                    {copySuccess && 'Address copied to clipboard!'}
                </div>
            </div>
        </div>
    );
};

export default ReceiveView;
