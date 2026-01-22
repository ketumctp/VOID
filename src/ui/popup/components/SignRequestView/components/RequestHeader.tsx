import React from 'react';
import { Logo } from '@/components/ui/Logo';

interface RequestHeaderProps {
    signType: string;
    origin: string;
    fromAddress?: string;
}

export const RequestHeader: React.FC<RequestHeaderProps> = ({ signType, origin, fromAddress }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '24px'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <Logo variant="icon" size={64} animated={false} />
            </div>

            <h2 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text-primary)'
            }}>
                {signType === 'message' ? 'Sign Message' : 'Sign Transaction'}
            </h2>

            <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#b4b4b4',
                fontSize: '13px',
                marginBottom: '12px'
            }}>
                {origin || 'Unknown Origin'}
            </div>

            <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#888'
            }}>
                <span style={{ color: '#666' }}>Signing as: </span>
                <span style={{ color: '#ccc' }}>
                    {fromAddress
                        ? `${fromAddress.substring(0, 6)}...${fromAddress.slice(-4)}`
                        : 'Loading...'}
                </span>
            </div>
        </div>
    );
};
