import { style } from '@vanilla-extract/css';
import { vars } from '../../styles/theme.css';

export const container = style({
    width: '100%',
    padding: '12px 16px',
    background: vars.color.bgCard,
    borderBottom: `1px solid ${vars.color.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
    backdropFilter: 'blur(10px)',
});

export const appInfo = style({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    overflow: 'hidden',
});

export const faviconContainer = style({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: vars.color.bgSurface,
    border: `1px solid ${vars.color.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
});

export const favicon = style({
    width: '20px',
    height: '20px',
    objectFit: 'contain',
});

export const domainInfo = style({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
});

export const domainName = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textPrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2,
});

export const connectionStatus = style({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    marginTop: '2px',
});

export const statusDot = style({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: vars.color.textMuted,
    transition: 'background-color 0.2s',
});

export const connected = style({
    background: vars.color.success,
    boxShadow: `0 0 8px ${vars.color.success}`,
});

export const disconnectButton = style({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: vars.color.textMuted,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 0.2s',
    background: 'rgba(255,255,255,0.05)',

    selectors: {
        '&:hover': {
            background: 'rgba(239, 68, 68, 0.1)', // Red tint
            color: vars.color.danger,
            borderColor: vars.color.dangerHover,
        }
    }
});
