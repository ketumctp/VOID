import { style, keyframes } from '@vanilla-extract/css';

const fadeIn = keyframes({
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
});

export const container = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-background)',
    color: 'var(--text-primary)',
});

export const animateFadeIn = style({
    animation: `${fadeIn} 0.3s ease-out forwards`
});

export const content = style({
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
});

export const listContainer = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
});

export const emptyState = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    gap: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px dashed rgba(255, 255, 255, 0.1)'
});

export const siteItem = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
    ':hover': {
        background: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
    }
});

export const siteInfo = style({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    overflow: 'hidden'
});

export const siteFavicon = style({
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'var(--text-muted)'
});

export const siteName = style({
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
});

export const siteOrigin = style({
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
});

export const disconnectButton = style({
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    ':hover': {
        background: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#ef4444'
    }
});
