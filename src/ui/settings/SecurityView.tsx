/**
 * SecurityView Component - Rialo Wallet
 */
import React, { useState } from 'react';
import { Header } from '../components/ui/Header';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { notify } from '../../lib/toast';
import * as styles from './SecurityView.css';

interface SecurityViewProps {
    type: 'mnemonic' | 'private_key';
    onBack: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ type, onBack }) => {
    const [step, setStep] = useState<'password' | 'reveal'>('password');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secretData, setSecretData] = useState('');
    const [isRevealed, setIsRevealed] = useState(false);

    const title = type === 'mnemonic' ? 'Secret Phrase' : 'Private Key';
    const description = type === 'mnemonic'
        ? 'Your 12-word recovery phrase. Never share this with anyone.'
        : 'Your account private key. Never share this with anyone.';

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Verify password
        chrome.runtime.sendMessage({ type: 'UNLOCK_WALLET', password, id: Date.now().toString() }, (response: any) => {
            if (response && response.success) {
                // Password correct
                const msgType = type === 'mnemonic' ? 'GET_MNEMONIC' : 'EXPORT_SECRET_KEY';
                chrome.runtime.sendMessage({ type: msgType, id: Date.now().toString() }, (res: any) => {
                    setLoading(false);
                    if (res && res.success) {
                        setSecretData(type === 'mnemonic' ? res.data.mnemonic : res.data.secretKey);
                        setStep('reveal');
                    } else {
                        notify.error('Failed to retrieve secret');
                    }
                });
            } else {
                setLoading(false);
                notify.error('Incorrect password');
            }
        });
    };

    const toggleReveal = () => {
        setIsRevealed(!isRevealed);
    };

    const renderMnemonicGrid = () => {
        const words = secretData.split(' ');
        return (
            <div
                className={styles.mnemonicGridHoverable}
                onClick={toggleReveal}
                style={{ position: 'relative', cursor: 'pointer' }}
            >
                {words.map((word, index) => (
                    <div key={index} className={styles.mnemonicWord}>
                        <span className={styles.wordIndex}>{index + 1}</span>
                        <span className={isRevealed ? styles.wordText : styles.wordTextBlurred}>
                            {word}
                        </span>
                    </div>
                ))}

                {/* Overlay with eye icon when blurred */}
                {!isRevealed && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        pointerEvents: 'none'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        <span style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                            Click to reveal
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Header title={title} onBack={onBack} />

            <div className={styles.content}>
                {step === 'password' ? (
                    <>
                        <div className={styles.securityCheck}>
                            <p className={styles.securityTitle}>Security Check</p>
                            <p className={styles.securityText}>
                                Please enter your password to view your {title.toLowerCase()}.
                            </p>
                        </div>

                        <form onSubmit={handleUnlock} className={styles.passwordForm}>
                            <Input
                                label="PASSWORD"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter wallet password"
                                autoFocus
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                disabled={!password || loading}
                            >
                                {loading ? 'Verifying...' : 'Reveal'}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className={styles.warningBox}>
                            <p className={styles.warningTitle}>Do not share</p>
                            <p className={styles.securityText}>
                                {description}
                            </p>
                        </div>

                        {type === 'mnemonic' ? renderMnemonicGrid() : (
                            <div
                                onClick={toggleReveal}
                                style={{
                                    position: 'relative',
                                    cursor: 'pointer'
                                }}
                            >
                                <textarea
                                    readOnly
                                    value={secretData}
                                    className={styles.privateKeyBox}
                                    style={{
                                        filter: isRevealed ? 'none' : 'blur(6px)',
                                        userSelect: isRevealed ? 'text' : 'none',
                                        transition: 'filter 0.2s ease'
                                    }}
                                />
                                {!isRevealed && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'rgba(0,0,0,0.8)',
                                        padding: '16px 24px',
                                        borderRadius: '12px',
                                        pointerEvents: 'none'
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                        <span style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                                            Click to reveal
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Safety Warnings */}
                        <div className={styles.safetyList}>
                            <div className={styles.safetyItem}>
                                <span className={styles.safetyIcon}>⚠️</span>
                                <div className={styles.safetyContent}>
                                    <p className={styles.safetyTitle}>
                                        DO NOT share your {type === 'mnemonic' ? 'recovery phrase' : 'private key'} with ANYONE.
                                    </p>
                                    <p className={styles.safetyDesc}>
                                        Anyone with this can have full control over your assets. Please stay vigilant against phishing attacks at all times.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.safetyItem}>
                                <span className={styles.safetyIcon}>⚠️</span>
                                <div className={styles.safetyContent}>
                                    <p className={styles.safetyTitle}>
                                        Back up safely.
                                    </p>
                                    <p className={styles.safetyDesc}>
                                        You will never be able to restore your account without this.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SecurityView;
