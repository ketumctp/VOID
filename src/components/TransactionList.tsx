import React from 'react';
import bs58 from 'bs58';
import { ArrowUpRightIcon } from './ui/icons/arrow-up-right'; // Using available icons
import { ExternalLinkIcon } from './ui/icons/external-link';

export interface Transaction {
    signature: string;
    slot: number;
    err: any;
    memo: string | null;
    blockTime?: number;
}

interface TransactionListProps {
    transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent transactions</p>
            </div>
        );
    }

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return 'Unknown date';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatSignature = (sig: any) => {
        if (typeof sig === 'string') return sig;
        if (Array.isArray(sig)) return bs58.encode(Buffer.from(sig));
        // Handle object with values (e.g. Uint8Array serialized)
        if (sig && typeof sig === 'object' && Object.values(sig).length > 0) {
            return bs58.encode(Buffer.from(Object.values(sig) as number[]));
        }
        return 'Unknown';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Activity</h3>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                {transactions.map((tx) => {
                    const signatureStr = formatSignature(tx.signature);
                    return (
                        <div key={signatureStr} style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            transition: 'background 0.1s'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-dark)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 32, height: 32,
                                    borderRadius: '50%',
                                    backgroundColor: tx.err ? 'var(--destructive)' : 'var(--bg-dark)',
                                    border: tx.err ? 'none' : '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: tx.err ? 'white' : 'var(--text-muted)'
                                }}>
                                    {tx.err ? '!' : <ArrowUpRightIcon size={16} />}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: '500', fontSize: '0.85rem', color: tx.err ? 'var(--destructive)' : 'var(--text-primary)' }}>
                                        {tx.err ? 'Failed' : 'Rialo Transaction'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {formatTime(tx.blockTime)}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={`https://explorer.rialo-community.xyz/transactions/${signatureStr}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                title="View on Explorer"
                            >
                                <ExternalLinkIcon size={16} />
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
