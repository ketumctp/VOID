import React, { useState, useEffect } from 'react';
import { notify } from '../lib/toast';
import { ArrowDownIcon } from './ui/icons/arrow-down';
import { CheckIcon } from './ui/icons/check';
// import { PlusIcon } from './ui/plus'; // Assuming we'll add this later or use text

interface AccountSelectorProps {
    currentAccountIndex: number;
    accounts: string[]; // List of public keys
    onAccountChange: () => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
    currentAccountIndex,
    accounts,
    onAccountChange
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSwitch = async (index: number) => {
        if (index === currentAccountIndex) {
            setIsOpen(false);
            return;
        }

        const toastId = notify.loading('Switching account...');
        try {
            await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'SWITCH_ACCOUNT',
                    index,
                    id: Date.now().toString()
                }, (response) => {
                    if (response && response.success) resolve();
                    else reject(response?.error || 'Failed to switch');
                });
            });

            notify.dismiss(toastId);
            notify.success(`Switched to Account ${index + 1}`);
            setIsOpen(false);
            onAccountChange();
        } catch (error) {
            notify.dismiss(toastId);
            notify.error('Failed to switch account');
            console.error(error);
        }
    };

    const handleCreateAccount = async () => {
        const toastId = notify.loading('Creating new account...');
        try {
            await new Promise<void>((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: 'ADD_ACCOUNT',
                    id: Date.now().toString()
                }, (response) => {
                    if (response && response.success) resolve();
                    else reject(response?.error || 'Failed to create');
                });
            });

            notify.dismiss(toastId);
            notify.success('New account created');
            onAccountChange(); // Refresh state
        } catch (error) {
            notify.dismiss(toastId);
            notify.error('Failed to create account');
        }
    };

    // Close on click outside (simple implementation)
    useEffect(() => {
        const close = () => setIsOpen(false);
        if (isOpen) {
            window.addEventListener('click', close);
        }
        return () => window.removeEventListener('click', close);
    }, [isOpen]);

    return (
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
                onClick={toggleDropdown}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: `hsl(${currentAccountIndex * 137 % 360}, 70%, 50%)`, // Deterministic color
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }}>
                    {currentAccountIndex + 1}
                </div>
                <span>Account {currentAccountIndex + 1}</span>
                <ArrowDownIcon size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    left: 0,
                    width: '240px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                    zIndex: 50,
                    overflow: 'hidden',
                    animation: 'fade-in 0.15s ease-out'
                }}>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            margin: '0.5rem 0.5rem 0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            My Accounts
                        </p>

                        {accounts.map((pubkey, idx) => (
                            <div
                                key={pubkey}
                                onClick={() => handleSwitch(idx)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    backgroundColor: idx === currentAccountIndex ? 'var(--bg-dark)' : 'transparent',
                                    marginBottom: '2px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-dark)'}
                                onMouseLeave={e => {
                                    if (idx !== currentAccountIndex) e.currentTarget.style.backgroundColor = 'transparent'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: `hsl(${idx * 137 % 360}, 70%, 50%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Account {idx + 1}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                        {pubkey.slice(0, 4)}...{pubkey.slice(-4)}
                                    </div>
                                </div>
                                {idx === currentAccountIndex && <CheckIcon size={16} color="var(--success)" />}
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem' }}>
                        <button
                            onClick={handleCreateAccount}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px dashed var(--border)',
                                background: 'transparent',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            + Create New Account
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
