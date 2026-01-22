import React from 'react';

interface SimulationDetails {
    preBalance: number;
    postBalance: number;
    diff: number;
    success: boolean;
    error?: string;
}

interface Props {
    simulation?: SimulationDetails;
    simulationStatus?: 'success' | 'failed' | 'pending';
}

export const SimulationResult: React.FC<Props> = ({ simulation, simulationStatus }) => {
    // PHASE 1: NO SIMULATION = HARD BLOCK (don't return null!)
    if (!simulation || simulationStatus === 'failed') {
        return (
            <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#d32f2f',
                border: '2px solid #b71c1c',
                borderRadius: '8px',
                color: 'white'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    ⛔ SIMULATION BLOCKED
                </div>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    {simulation?.error || 'Transaction simulation failed or unavailable. This transaction cannot be approved.'}
                </p>
            </div>
        );
    }

    if (!simulation.success) {
        return (
            <div className="alert-danger" style={{ marginTop: '1rem' }}>
                <strong>Simulation Failed</strong>
                <p style={{ fontSize: '0.8rem', margin: '4px 0 0' }}>This transaction will likely fail or drain you.</p>
            </div>
        );
    }

    const isLoss = simulation.diff < 0;
    const isGain = simulation.diff > 0;
    const diffColor = isLoss ? '#d32f2f' : (isGain ? '#2e7d32' : 'inherit');
    const diffSign = isGain ? '+' : '';

    return (
        <div className="card" style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Estimated Balance Change
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: diffColor }}>
                    {diffSign}{simulation.diff.toFixed(5)} RIALO
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    (New Balance: {simulation.postBalance.toFixed(4)})
                </span>
            </div>
        </div>
    );
};

