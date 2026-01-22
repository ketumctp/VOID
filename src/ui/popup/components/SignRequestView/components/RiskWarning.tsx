import React from 'react';

interface RiskWarningProps {
    riskAssessment: any;
    isHighRisk: boolean;
    insufficientBalance: boolean;
    requiredAmount: number;
}

export const RiskWarning: React.FC<RiskWarningProps> = ({
    riskAssessment,
    isHighRisk,
    insufficientBalance,
    requiredAmount
}) => {
    return (
        <>
            {/* Simulation Result */}
            {riskAssessment?.simulation ? (
                <div style={{
                    padding: '20px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Estimated Balance Change
                    </div>
                    <div style={{
                        marginTop: '4px',
                        fontSize: '32px',
                        fontWeight: '700',
                        color: riskAssessment.simulation.diff < 0 ? '#ef5350' : '#4caf50'
                    }}>
                        {riskAssessment.simulation.diff > 0 ? '+' : ''}
                        {riskAssessment.simulation.diff.toFixed(4)} SOL
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '8px' }}>
                        {riskAssessment.simulation.preBalance?.toFixed(4)} → {riskAssessment.simulation.postBalance?.toFixed(4)}
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '16px',
                    background: 'rgba(255, 193, 7, 0.1)',
                    border: '1px dashed #ffc107',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    color: '#ffc107',
                    fontSize: '13px'
                }}>
                    ⚠️ Simulation Not Available
                </div>
            )}

            {/* Insufficient Balance */}
            {insufficientBalance && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(239, 83, 80, 0.2)',
                    border: '2px solid #ef5350',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
                    <div style={{
                        color: '#ef5350',
                        fontWeight: '700',
                        fontSize: '16px',
                        marginBottom: '12px'
                    }}>
                        Insufficient Balance!
                    </div>
                    <div style={{ color: '#ff8a80', fontSize: '13px' }}>
                        Required: {(requiredAmount / 1_000_000_000).toFixed(4)} RIALO
                    </div>
                </div>
            )}

            {/* Critical Security Alert */}
            {isHighRisk && (
                <div style={{
                    padding: '16px',
                    background: 'rgba(239, 83, 80, 0.15)',
                    border: '2px solid #ef5350',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        color: '#ef5350'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700' }}>
                            <span>⚠️</span>
                            <span>CRITICAL SECURITY ALERT</span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#ffcdd2' }}>
                            {riskAssessment?.message || 'DANGER: Risk assessment not available. Proceed with extreme caution.'}
                        </p>
                        {riskAssessment?.isUnknownProgram && (
                            <p style={{ fontSize: '13px', color: '#ef5350', fontWeight: '600', marginTop: '4px' }}>
                                DO NOT IGNORE THIS. You could lose all your funds.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
