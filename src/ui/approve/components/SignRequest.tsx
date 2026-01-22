import React from 'react';
import { ExclamationTriangleIcon, NoSymbolIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { RiskAlert } from './RiskAlert';
import { SimulationResult } from './SimulationResult';
import { TransactionDetails } from './TransactionDetails';

interface SignRequestProps {
    origin: string;
    requestData: any;
    countdown: number | null;
    confirmText: string;
    setConfirmText: (text: string) => void;
    typedProgramId: string;
    setTypedProgramId: (text: string) => void;
    handleApprove: () => void;
    handleReject: () => void;
    getRiskLevel: () => 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    getRiskAssessment: () => any;
    isApproveDisabled: () => boolean;
}

export const SignRequest: React.FC<SignRequestProps> = ({
    origin,
    requestData,
    countdown,
    confirmText,
    setConfirmText,
    typedProgramId,
    setTypedProgramId,
    handleApprove,
    handleReject,
    getRiskLevel,
    getRiskAssessment,
    isApproveDisabled
}) => {
    return (
        <div className="container animate-fade-in" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
        }}>
            <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        marginBottom: '16px'
                    }}>
                        <img
                            src="/icons/icon128.png"
                            alt="Rialo"
                            style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                        />
                    </div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>Signature Request</h2>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#b4b4b4',
                        fontSize: '14px'
                    }}>
                        {(origin && !origin.includes('locked')) ? origin : 'Unknown Origin'}
                    </div>
                </div>

                {/* Risk Alert */}
                <RiskAlert requestData={requestData} />

                {/* Simulation Result */}
                <SimulationResult
                    simulation={requestData?.data?.riskAssessment?.simulation}
                    simulationStatus={requestData?.data?.riskAssessment?.simulationStatus}
                />

                {/* Transaction Details Card */}
                <div className="card" style={{
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'left',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <TransactionDetails requestData={requestData} />
                </div>

                {/* Warning Alert */}
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <span>Only approve if you trust this site.</span>
                </div>

                {/* PHASE 1: HARD BLOCK only if explicitly blocked */}
                {getRiskAssessment()?.hardBlocked && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#d32f2f',
                        border: '2px solid #b71c1c',
                        borderRadius: '8px',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <NoSymbolIcon className="w-6 h-6 text-white" />
                            TRANSACTION BLOCKED
                        </div>
                        <div style={{ fontSize: '0.9rem' }}>
                            {getRiskAssessment()?.message || 'This transaction is identified as malicious and cannot be approved.'}
                        </div>
                    </div>
                )}

                {/* PHASE 3: Unknown Program = Type FULL Program ID */}
                {getRiskAssessment()?.requireProgramIdInput && getRiskAssessment()?.unknownProgramId && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#ffebee',
                        border: '1px solid #ef5350',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontWeight: '600', color: '#c62828', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                            Unknown Program Detected
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                            To approve, type the <strong>FULL</strong> program ID below (copy-paste allowed):
                            <br />
                            <code style={{
                                background: '#f5f5f5',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'block',
                                overflowWrap: 'anywhere',
                                fontSize: '11px',
                                marginTop: '4px'
                            }}>
                                {getRiskAssessment()?.unknownProgramId}
                            </code>
                        </div>
                        <input
                            type="text"
                            placeholder="Paste FULL Program ID here"
                            value={typedProgramId}
                            onChange={e => setTypedProgramId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                )}

                {/* PHASE 4: HIGH/CRITICAL = Type CONFIRM */}
                {(getRiskLevel() === 'HIGH' || getRiskLevel() === 'CRITICAL') && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: getRiskLevel() === 'CRITICAL' ? '#ffebee' : '#fff3e0',
                        border: `1px solid ${getRiskLevel() === 'CRITICAL' ? '#ef5350' : '#ffb74d'}`,
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontWeight: '600', color: getRiskLevel() === 'CRITICAL' ? '#c62828' : '#e65100', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getRiskLevel() === 'CRITICAL' ? <ShieldExclamationIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
                            {getRiskLevel()} RISK TRANSACTION
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
                            Type <strong>CONFIRM</strong> to proceed:
                        </div>
                        <input
                            type="text"
                            placeholder="Type CONFIRM"
                            value={confirmText}
                            onChange={e => setConfirmText(e.target.value.toUpperCase())}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: confirmText === 'CONFIRM' ? '2px solid #4caf50' : '1px solid #ccc',
                                borderRadius: '6px',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>
                )}

                {/* PHASE 4: Countdown display */}
                {countdown !== null && countdown > 0 && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#e3f2fd',
                        border: '1px solid #2196f3',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#1565c0'
                    }}>
                        Please wait <strong>{countdown}</strong> seconds before approving...
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <button
                    className="btn-primary"
                    onClick={handleApprove}
                    disabled={isApproveDisabled()}
                    style={{
                        padding: '14px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        opacity: isApproveDisabled() ? 0.5 : 1,
                        background: isApproveDisabled() ? '#555' : 'linear-gradient(135deg, #e8e3d5 0%, #d4cfc0 100%)',
                        color: isApproveDisabled() ? '#999' : '#111',
                        cursor: isApproveDisabled() ? 'not-allowed' : 'pointer',
                        border: 'none',
                        boxShadow: isApproveDisabled() ? 'none' : '0 4px 12px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Approve & Sign
                </button>
                <button
                    className="btn-primary"
                    onClick={handleReject}
                    style={{
                        padding: '14px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Reject
                </button>
            </div>
        </div>
    );
};
