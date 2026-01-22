import React from 'react';

export const NetworkBanner: React.FC = () => {
    return (
        <div style={{
            background: '#ffc107',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '12px',
            letterSpacing: '1px'
        }}>
            ⚠️ RIALO DEVNET
        </div>
    );
};
