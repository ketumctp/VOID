/**
 * LockedView Component - Rialo Wallet
 */
import React, { useState, useRef, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import * as styles from './LockedView.css';

interface LockedViewProps {
    onUnlock: () => void;
}

export const LockedView: React.FC<LockedViewProps> = ({ onUnlock }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const isSubmitting = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input on mount
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 50);
    }, []);

    const handleUnlock = () => {
        if (isSubmitting.current) return;

        isSubmitting.current = true;

        chrome.runtime.sendMessage({ type: 'UNLOCK_WALLET', password, id: Date.now().toString() }, (response: any) => {
            isSubmitting.current = false;

            if (response && response.success) {
                notify.success('Wallet unlocked');
                onUnlock();
            } else {
                setError('Incorrect password');
                notify.error('Incorrect password');
            }
        });
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />
            <div className={styles.content}>

                {/* Header */}
                <div className={styles.header}>
                    <div style={{ marginBottom: '24px' }}>
                        <Logo variant="icon" size={80} animated={false} />
                    </div>
                    <h3 className={styles.title}>Unlock Wallet</h3>
                </div>

                {/* Form */}
                <div className={styles.form}>
                    {error && <div className={styles.errorMessage}>{error}</div>}

                    <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }}>
                        <Input
                            ref={inputRef}
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password..."
                        />
                    </form>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleUnlock}
                    >
                        Unlock
                    </Button>

                    <div className={styles.forgotPassword}>
                        <span
                            className={styles.link}
                            onClick={() => {
                                if (confirm('Reset wallet? This will erase your keys.')) {
                                    chrome.storage.local.clear(() => window.location.reload());
                                }
                            }}
                        >
                            Forgot password?
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockedView;
