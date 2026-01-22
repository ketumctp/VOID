import React from 'react';
import { ExclamationTriangleIcon, FireIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

interface TransactionDetailsProps {
    requestData: any;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ requestData }) => {
    if (!requestData) return <div>Loading...</div>;

    if (!requestData.parsed) {
        // Parse JSON if it's a string
        let dataToDisplay = requestData.data;
        try {
            if (typeof requestData.data.transaction === 'string') {
                const parsed = JSON.parse(requestData.data.transaction);
                // Native transfer format
                if (parsed.to && typeof parsed.amount === 'number') {
                    return (
                        <>
                            <h3 style={{ marginBottom: '0.75rem' }}>Transaction Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(0, 123, 255, 0.1)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</div>
                                    <div style={{ fontWeight: '600' }}>Native Token Transfer</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recipient</div>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>{parsed.to}</div>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Amount</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{(parsed.amount / 1_000_000_000).toFixed(4)} RIALO</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{parsed.amount.toLocaleString()} lamports</div>
                                </div>
                            </div>
                        </>
                    );
                }
            }
        } catch (e) {
            // Not JSON, continue to raw display
        }

        return (
            <>
                <h3 style={{ marginBottom: '0.75rem' }}>Transaction Data (Raw)</h3>
                <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#856404', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                        <span><strong>Warning:</strong> Could not parse transaction structure. Please verify the transaction details carefully.</span>
                    </div>
                </div>
                <pre style={{
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text)',
                    background: 'var(--bg-secondary)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid var(--border)'
                }}>
                    {JSON.stringify(dataToDisplay, null, 2)}
                </pre>
            </>
        );
    }

    return (
        <>
            <h3>Transaction Request</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {requestData.parsed.instructions.map((ix: any, idx: number) => (
                    <div key={idx} style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>{ix.programName}</div>
                        {renderInstructionDetails(ix)}
                    </div>
                ))}
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    Fee Payer: <span style={{ fontFamily: 'monospace' }}>{requestData.parsed.feePayer}</span>
                </div>
            </div>
        </>
    );
};

function renderInstructionDetails(ix: any) {
    if (ix.parsed?.type === 'transfer') {
        return (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <div><strong>Action:</strong> Transfer (SOL)</div>
                <div><strong>Amount:</strong> {ix.parsed.info.amount} SOL</div>
                <div><strong>To:</strong> <span style={{ fontFamily: 'monospace' }}>{ix.parsed.info.to}</span></div>
            </div>
        );
    }
    if (ix.parsed?.type === 'transferChecked') {
        return (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                <div><strong>Action:</strong> Transfer Token</div>
                <div><strong>Amount:</strong> {ix.parsed.info.amount}</div>
                <div><strong>Mint:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ix.parsed.info.mint}</span></div>
                <div><strong>To:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ix.parsed.info.to}</span></div>
            </div>
        );
    }
    if (ix.parsed?.type === 'setAuthority') {
        return (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', color: '#d9534f' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><strong>Action:</strong> <ShieldExclamationIcon className="w-4 h-4" /> SET AUTHORITY</div>
                <div><strong>Type:</strong> {ix.parsed.info.authorityType}</div>
                <div><strong>New Authority:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ix.parsed.info.newAuthority}</span></div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><ExclamationTriangleIcon className="w-4 h-4" /> This allows the new authority to control this account!</div>
            </div>
        );
    }
    if (ix.parsed?.type === 'burn') {
        return (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', color: '#f0ad4e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><strong>Action:</strong> <FireIcon className="w-4 h-4" /> BURN TOKEN</div>
                <div><strong>Account:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ix.parsed.info.account}</span></div>
                <div><strong>Amount (Raw):</strong> {ix.parsed.info.amountRaw}</div>
            </div>
        );
    }
    if (ix.parsed?.type === 'approve') {
        return (
            <div style={{ fontSize: '0.9rem', marginTop: '0.25rem', color: '#d9534f', border: '1px solid #d9534f', padding: '8px', borderRadius: '4px', background: '#fff5f5' }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldExclamationIcon className="w-5 h-5" /> APPROVE (DELEGATE)
                </div>
                <div style={{ marginTop: '4px' }}><strong>Delegate:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#ffebee', padding: '0 2px' }}>{ix.parsed.info.delegate}</span></div>
                <div><strong>Amount:</strong> {ix.parsed.info.amountRaw}</div>
                <div style={{ fontSize: '0.8rem', marginTop: '6px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><ExclamationTriangleIcon className="w-4 h-4" /> WARNING: You are giving this address CONTROL over your funds!</div>
            </div>
        );
    }

    return (
        <div style={{ fontSize: '0.8rem', color: 'orange' }}>
            <div style={{ marginBottom: '0.25rem' }}>Unknown Instruction Data:</div>
            {ix.parsed?.type === 'unknown' ? (
                <div style={{
                    wordBreak: 'break-all',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.1)',
                    padding: '4px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                }}>
                    HEX: {ix.parsed.info.dataHex}
                </div>
            ) : (
                <div style={{
                    wordBreak: 'break-all',
                    maxHeight: '100px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.1)',
                    padding: '4px',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                }}>
                    {ix.data}
                </div>
            )}
        </div>
    );
}
