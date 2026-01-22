import React from 'react';
import { KNOWN_PROGRAM_NAMES } from '../../../../../shared/rialo-cpi';

interface TransactionDetailsProps {
    requestData: any;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ requestData }) => {
    return (
        <div style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            overflow: 'auto'
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--text-primary)'
            }}>Details</h3>

            {requestData?.parsed?.instructions ? (
                <div style={{ fontSize: '13px', color: '#999' }}>
                    {requestData.parsed.instructions.map((ix: any, i: number) => {
                        const progId = ix.programId || ix.parsed?.programId;
                        const friendlyName = KNOWN_PROGRAM_NAMES[progId] || ix.parsed?.program || (progId ? `${progId.substring(0, 6)}...` : 'Unknown Program');

                        return (
                            <div key={i} style={{
                                padding: '8px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <strong style={{ color: '#ccc' }}>
                                    {ix.parsed?.type || 'Unknown'}
                                </strong>
                                <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                                    ({friendlyName})
                                </span>
                                {ix.parsed?.info?.amount && (
                                    <div style={{ marginTop: '4px', fontSize: '12px' }}>
                                        Amount: {(Number(ix.parsed.info.amount) / 1_000_000_000).toFixed(4)} RIALO
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div style={{
                        padding: '8px 0',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '8px'
                    }}>
                        <strong style={{ color: '#ccc' }}>Network Fee</strong>
                        <span style={{ color: '#999', fontSize: '12px' }}>~0.000005 RIALO</span>
                    </div>
                </div>
            ) : requestData?.data?.transaction ? (
                // Try JSON or show raw
                (() => {
                    try {
                        const txData = typeof requestData.data.transaction === 'string'
                            ? JSON.parse(requestData.data.transaction)
                            : requestData.data.transaction;

                        if (txData.to && txData.amount !== undefined) {
                            return (
                                <div style={{ fontSize: '13px', color: '#999' }}>
                                    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <strong style={{ color: '#ccc' }}>Native Transfer</strong>
                                    </div>
                                    <div style={{ padding: '8px 0' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ color: '#888' }}>To:</span>
                                            <div style={{
                                                fontFamily: 'monospace',
                                                fontSize: '11px',
                                                wordBreak: 'break-all',
                                                color: '#ccc',
                                                marginTop: '4px'
                                            }}>
                                                {txData.to}
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ color: '#888' }}>Amount:</span>
                                            <div style={{
                                                color: '#e8e3d5',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                marginTop: '4px'
                                            }}>
                                                {(txData.amount / 1_000_000_000).toFixed(6)} RIALO
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px' }}>
                                            <span style={{ color: '#888' }}>Network Fee:</span>
                                            <div style={{
                                                color: '#999',
                                                fontSize: '13px',
                                                marginTop: '2px'
                                            }}>
                                                ~0.000005 RIALO
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    } catch (e) { /* ignore */ }

                    // Fallback to Raw
                    const rawTx = requestData.data.transaction;
                    return (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            <div style={{ marginBottom: '8px' }}>Raw Transaction (Base64):</div>
                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '10px',
                                wordBreak: 'break-all',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '8px',
                                borderRadius: '8px',
                                maxHeight: '100px',
                                overflow: 'auto'
                            }}>
                                {typeof rawTx === 'string' ? rawTx.substring(0, 200) + '...' : JSON.stringify(rawTx).substring(0, 200) + '...'}
                            </div>
                        </div>
                    );
                })()
            ) : requestData?.data?.message ? (
                <div style={{ fontSize: '13px', color: '#999' }}>
                    <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <strong style={{ color: '#ccc' }}>Message to Sign</strong>
                    </div>
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        wordBreak: 'break-all'
                    }}>
                        {typeof requestData.data.message === 'string'
                            ? requestData.data.message
                            : JSON.stringify(requestData.data.message)}
                    </div>
                </div>
            ) : (
                <p style={{ color: '#999', fontSize: '13px' }}>
                    No transaction details available
                </p>
            )}
        </div>
    );
};
