import React, { useState } from 'react';
import { Button } from '@/ui/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { notify } from '@/lib/toast';

interface ConnectRequestViewProps {
    origin: string;
    requestId: string;
    onApprove: () => void;
    onReject: () => void;
}

export const ConnectRequestView: React.FC<ConnectRequestViewProps> = ({ origin, requestId, onApprove, onReject }) => {
    const [submitting, setSubmitting] = useState(false);

    const handleApprove = () => {
        if (submitting) return;
        setSubmitting(true);

        const loadingToast = notify.loading('Connecting...');

        chrome.runtime.sendMessage({
            type: 'APPROVE_CONNECTION',
            origin,
            requestId,
            id: Date.now().toString()
        }, (response: any) => {
            notify.dismiss(loadingToast);
            setSubmitting(false);

            if (response && response.success) {
                notify.success('Connected successfully!');
                onApprove();
            } else {
                notify.error(response?.error || 'Connection failed');
            }
        });
    };

    const handleReject = () => {
        if (submitting) return;
        setSubmitting(true);

        chrome.runtime.sendMessage({
            type: 'REJECT_CONNECTION',
            origin,
            requestId,
            id: Date.now().toString()
        }, () => {
            setSubmitting(false);
            notify.success('Connection rejected');
            onReject();
        });
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            color: 'var(--text-body)',
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
                <div style={{ marginBottom: '24px' }}>
                    <Logo variant="icon" size={80} animated={true} />
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
                            <span style={{ marginRight: '10px', color: '#4caf50' }}>✓</span>
                            View your public address
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', color: '#4caf50' }}>✓</span>
                            Request transaction signatures
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', color: '#4caf50' }}>✓</span>
                            View your wallet balance
                        </li>
                    </ul>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleApprove}
                    disabled={submitting}
                >
                    {submitting ? 'Connecting...' : 'Connect'}
                </Button>
                <Button
                    variant="glass"
                    size="lg"
                    fullWidth
                    onClick={handleReject}
                    disabled={submitting}
                >
                    {submitting ? 'Please wait...' : 'Cancel'}
                </Button>
            </div>
        </div>
    );
};
