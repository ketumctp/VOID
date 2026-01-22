import React from 'react';
import { Logo } from '@/components/ui/Logo';

// Manual import for these simple components if paths are tricky, or use inline styles matching the theme
// But best to try and use the same components if possible.
// Given the file structure, let's try to import directly or recreate the style to be exact.
// Actually, let's just use inline styles that MATCH LockedView.css.ts variables perfectly
// to avoid complex dependency chains in the 'approve' window which might be isolated.

interface UnlockFormProps {
    isLocked: boolean;
    unlockError: string;
    password: string;
    setPassword: (pwd: string) => void;
    handleUnlock: (e: React.FormEvent) => void;
    handleReject: () => void;
    origin: string;
}

export const UnlockForm: React.FC<UnlockFormProps> = ({
    isLocked,
    unlockError,
    password,
    setPassword,
    handleUnlock,
    handleReject,
    origin
}) => {
    if (!isLocked) return null;

    return (
        <div className="container animate-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '24px',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                        <Logo variant="icon" size={80} animated={false} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Unlock Wallet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px', margin: '0 auto' }}>
                        Please unlock your wallet to proceed with request from <strong style={{ color: 'var(--text-primary)' }}>{origin || 'dApp'}</strong>
                    </p>
                </div>

                {/* Form */}
                <div style={{ width: '100%' }}>
                    {unlockError && <div style={{
                        color: 'var(--danger)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        textAlign: 'center',
                        marginBottom: '16px'
                    }}>{unlockError}</div>}

                    <form onSubmit={handleUnlock}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: 'var(--text-secondary)',
                                marginBottom: '8px',
                                textTransform: 'uppercase'
                            }}>PASSWORD</label>
                            <input
                                type="password"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #e8e3d5 0%, #d4cfc0 100%)',
                                color: '#111',
                                border: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '16px'
                            }}
                        >
                            Unlock
                        </button>
                    </form>

                    <button
                        onClick={handleReject}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Cancel Request
                    </button>
                </div>
            </div>
        </div>
    );
};
