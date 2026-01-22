import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/components/ui/Button';

interface ActionButtonsProps {
    onApprove: (confirmInput: string) => void;
    onReject: () => void;
    isHighRisk: boolean;
    submitting: boolean;
    insufficientBalance: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onApprove,
    onReject,
    isHighRisk,
    submitting,
    insufficientBalance
}) => {
    const [confirmInput, setConfirmInput] = useState('');
    const [canApprove, setCanApprove] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isHighRisk && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, isHighRisk]);

    const handleConfirmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmInput(e.target.value);
        if (e.target.value === 'CONFIRM') {
            setCanApprove(true);
        } else {
            setCanApprove(false);
        }
    };

    return (
        <>
            {isHighRisk && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        marginBottom: '8px',
                        fontSize: '13px',
                        color: '#ccc',
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <span>Type "CONFIRM" to proceed</span>
                        {countdown > 0 && <span style={{ color: '#ef5350' }}>Wait {countdown}s...</span>}
                    </div>
                    <input
                        type="text"
                        placeholder="CONFIRM"
                        value={confirmInput}
                        onChange={handleConfirmInput}
                        disabled={countdown > 0}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: confirmInput === 'CONFIRM' ? '1px solid #4caf50' : '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            fontSize: '14px',
                            textAlign: 'center',
                            fontWeight: '600',
                            letterSpacing: '1px'
                        }}
                    />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                    variant={isHighRisk ? 'danger' : 'primary'}
                    size="lg"
                    fullWidth
                    onClick={() => onApprove(confirmInput)}
                    disabled={
                        submitting ||
                        insufficientBalance ||
                        (isHighRisk && (!canApprove || countdown > 0))
                    }
                    style={isHighRisk && (countdown > 0 || !canApprove) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                    {insufficientBalance ? '❌ Insufficient Balance' :
                        submitting ? 'Signing...' :
                            isHighRisk ? (countdown > 0 ? `Wait ${countdown}s...` : 'Approve DANGEROUS Transaction') :
                                'Approve & Sign'}
                </Button>
                <Button
                    variant="glass"
                    size="lg"
                    fullWidth
                    onClick={onReject}
                    disabled={submitting}
                >
                    {submitting ? 'Please wait...' : 'Reject'}
                </Button>
            </div>
        </>
    );
};
