import React from 'react';
import { ArrowLeftIcon } from '@/components/ui/icons/arrow-left';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border)',
            marginBottom: '1rem',
            background: 'var(--bg-card)',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            {/* Left side - Back button */}
            <div style={{
                flex: '0 0 auto',
                width: '40px',
                display: 'flex',
                justifyContent: 'flex-start'
            }}>
                {onBack && (
                    <button onClick={onBack} style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <ArrowLeftIcon size={20} />
                    </button>
                )}
            </div>

            {/* Center - Title */}
            <div style={{
                flex: '1 1 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{title}</h2>
            </div>

            {/* Right side - Optional action */}
            <div style={{
                flex: '0 0 auto',
                width: '40px',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                {rightAction}
            </div>
        </header>
    );
};
