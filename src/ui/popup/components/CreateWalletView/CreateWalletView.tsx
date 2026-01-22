/**
 * CreateWalletView Component - Rialo Wallet
 */
import React, { useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import * as styles from './CreateWalletView.css';

interface CreateWalletViewProps {
    onBack: () => void;
    onSuccess: () => void;
    isSidePanel?: boolean;
}

export const CreateWalletView: React.FC<CreateWalletViewProps> = ({ onBack, onSuccess, isSidePanel }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [isCreated, setIsCreated] = useState(false);
    const isSubmitting = useRef(false);

    const handleCreateWallet = () => {
        if (isSubmitting.current) return;

        if (!termsAccepted) {
            setError('You must agree to the Terms of Service');
            notify.error('Please accept terms');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            notify.error('Password too short');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            notify.error('Passwords do not match');
            return;
        }

        isSubmitting.current = true;
        const loadingId = notify.loading('Creating wallet...');

        chrome.runtime.sendMessage({ type: 'CREATE_WALLET', password, id: Date.now().toString() }, (response: any) => {
            isSubmitting.current = false;
            notify.dismiss(loadingId);

            if (response && response.success) {
                notify.success('Wallet created successfully');
                setIsCreated(true); // Switch to success UI to capture user gesture next
            } else {
                setError(response.error || 'Failed to create wallet');
                notify.error(response.error || 'Failed to create wallet');
            }
        });
    };

    const handleOpenWallet = () => {
        // If already in side panel, just proceed
        if (isSidePanel) {
            onSuccess();
            return;
        }

        // Attempt to open Side Panel
        // @ts-ignore
        if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.windowId) {
                    // @ts-ignore
                    chrome.sidePanel.open({ windowId: tabs[0].windowId })
                        .catch((err: any) => console.error('SidePanel Error:', err));

                    // Close this tab if it's the welcome tab
                    setTimeout(() => window.close(), 100);
                } else {
                    onSuccess();
                }
            });
        } else {
            onSuccess();
        }
    };

    if (isCreated) {
        return (
            <div className={`${styles.container} ${styles.animateFadeIn}`}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.brandRow}>
                            <div style={{ paddingRight: '0px' }}>
                                <Logo variant="icon" size={64} animated={true} />
                            </div>
                        </div>
                        <h2 className={styles.title}>Wallet Ready!</h2>
                        <p style={{ color: '#999', textAlign: 'center', marginTop: '8px' }}>
                            Your Rialo Devnet wallet is created.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <Button
                            variant="primary"
                            fullWidth
                            size="lg"
                            onClick={handleOpenWallet}
                        >
                            Open Wallet
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />
            <div className={styles.content}>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.brandRow}>
                        {/* Use Uniform Logo Component - Icon Only */}
                        <div style={{ paddingRight: '0px' }}>
                            <Logo variant="icon" size={64} animated={false} />
                        </div>
                        {/* Removed Rialo Text */}
                    </div>
                    <h2 className={styles.title}>New Wallet</h2>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleCreateWallet(); }} className={styles.form}>
                    <Input
                        label="Set Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoFocus
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                    />

                    {/* Custom Checkbox - Terms of Service */}
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                        onClick={() => setTermsAccepted(!termsAccepted)}
                    >
                        <div style={{
                            background: termsAccepted ? '#e8e3d5' : 'rgb(42, 42, 42)',
                            border: '1px solid rgb(72, 72, 72)',
                            borderRadius: '6px',
                            height: '22px',
                            width: '22px',
                            minWidth: '22px',
                            marginRight: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                            {termsAccepted && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M9.51948 13.9003L17.4173 6.26045C17.7763 5.91318 18.3546 5.91318 18.7136 6.26045L19.7308 7.24437C20.0897 7.59164 20.0897 8.15113 19.7308 8.4791L10.1776 17.7395C9.81863 18.0868 9.24026 18.0868 8.88127 17.7395L4.25428 13.2637C3.91524 12.9357 3.91524 12.3762 4.25428 12.0289L5.29137 11.045C5.63041 10.6977 6.20879 10.6977 6.56778 11.045L9.51948 13.9003Z" fill="#111111" />
                                </svg>
                            )}
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#b4b4b4',
                            margin: 0,
                            lineHeight: '1.4'
                        }}>
                            I agree to the <span
                                style={{ color: '#e8e3d5', textDecoration: 'underline', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent toggling checkbox
                                    chrome.tabs.create({ url: 'terms.html' });
                                }}
                            >Terms of Service</span>
                        </p>
                    </div>
                </form>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleCreateWallet}
                    >
                        Create Wallet
                    </Button>

                    <Button
                        variant="glass"
                        fullWidth
                        size="lg" // Increased size to match primary button
                        onClick={onBack}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateWalletView;
