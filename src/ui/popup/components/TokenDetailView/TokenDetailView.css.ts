/**
 * TokenDetailView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

// Re-export
export { animateFadeIn };

export const container = style({
    width: '100%',
    height: '100%',
    minWidth: vars.layout.popupWidth,
    minHeight: vars.layout.popupHeight,
    display: 'flex',
    flexDirection: 'column',
    background: vars.color.bgSurface,
    backdropFilter: 'blur(30px)',
    padding: 0,
});

export const content = style({
    padding: vars.space['6'],
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
});

export const logoWrapper = style({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: vars.space['6'],
});

export const logoContainer = style({
    width: '64px',
    height: '64px',
    borderRadius: vars.borderRadius.full,
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: vars.shadow.glow,
});

export const logoImg = style({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

export const logoFallback = style({
    fontSize: vars.fontSize['2xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
});

export const balanceWrapper = style({
    marginBottom: vars.space['8'],
});

export const balanceAmount = style({
    fontSize: vars.fontSize['3xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    letterSpacing: '-1px',
});

export const actionsRow = style({
    display: 'flex',
    justifyContent: 'center',
    gap: vars.space['6'],
});

export const actionButton = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: vars.space['2'],
});

export const actionCircle = style({
    width: '48px',
    height: '48px',
    borderRadius: vars.borderRadius.full,
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: vars.transition.normal,
    color: vars.color.textPrimary,
    cursor: 'pointer',
    padding: 0,

    selectors: {
        '&:hover': {
            background: vars.color.textPrimary,
            color: vars.color.bgDeep,
            transform: 'translateY(-2px)',
            boxShadow: vars.shadow.glowStrong,
        },
    },
});

export const actionLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    fontWeight: vars.fontWeight.medium,
});

export const infoSection = style({
    padding: vars.space['6'],
    borderTop: `1px solid ${vars.color.glassBorder}`,
    marginTop: 'auto',
});

export const infoLabel = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    marginBottom: vars.space['2'],
});

export const infoValue = style({
    fontSize: vars.fontSize.xs,
    background: vars.color.bgCard,
    padding: vars.space['3'],
    borderRadius: vars.borderRadius.md,
    wordBreak: 'break-all',
    fontFamily: vars.fontFamily.mono,
    color: vars.color.textSecondary,
    border: `1px solid ${vars.color.glassBorder}`,
});
