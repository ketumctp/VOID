import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ConnectionRequestProps {
    origin: string;
    handleApprove: () => void;
    handleReject: () => void;
}

export const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
    origin,
    handleApprove,
    handleReject
}) => {
    return (
        <div className="container animate-fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px'
        }}>
            {/* Header */}
            <div style={{
                marginTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 80,
                    height: 80,
                    marginBottom: '24px'
                }}>
                    <img
                        src="/icons/icon128.png"
                        alt="Rialo"
                        style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                    />
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Connection Request</h2>

                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#b4b4b4',
                    fontSize: '14px'
                }}>
                    {origin || 'Unknown Origin'}
                </div>
            </div>

            {/* Permissions */}
            <div style={{ marginTop: '40px', flex: 1 }}>
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '20px'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        color: 'var(--text-primary)'
                    }}>Expected Permissions</h3>

                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        color: '#999',
                        fontSize: '14px',
                        lineHeight: '2.5'
                    }}>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            View your public address
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            Request transaction signatures
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            View your wallet balance
                        </li>
                    </ul>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    className="btn-primary"
                    onClick={handleApprove}
                    style={{
                        background: 'linear-gradient(135deg, #e8e3d5 0%, #d4cfc0 100%)',
                        color: '#111',
                        borderRadius: '12px',
                        padding: '14px 24px',
                        fontWeight: '600',
                        border: 'none'
                    }}
                >
                    Connect
                </button>
                <button
                    className="btn-primary"
                    onClick={handleReject}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '14px 24px',
                        color: 'var(--text-primary)'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};
