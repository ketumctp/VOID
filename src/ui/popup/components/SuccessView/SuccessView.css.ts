/**
 * SuccessView Styles - Rialo Wallet
 */
import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

export { animateFadeIn };

export const container = style({
    width: '100%',
    height: '100%',
    minWidth: vars.layout.popupWidth,
    minHeight: vars.layout.popupHeight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    background: vars.color.bgSurface,
    backdropFilter: 'blur(30px)',
    padding: vars.space['6'],
});

const popIn = keyframes({
    '0%': { transform: 'scale(0.8)', opacity: 0 },
    '100%': { transform: 'scale(1)', opacity: 1 },
});

export const iconWrapper = style({
    width: '80px',
    height: '80px',
    borderRadius: vars.borderRadius.full,
    backgroundColor: vars.color.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vars.space['6'],
    boxShadow: `0 0 20px ${vars.color.successHover}`,
    animation: `${popIn} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
});

export const title = style({
    fontSize: vars.fontSize['2xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    marginBottom: vars.space['2'],
});

export const message = style({
    fontSize: vars.fontSize.base,
    color: vars.color.textMuted,
    marginBottom: vars.space['8'],
});

export const hashContainer = style({
    width: '100%',
    marginBottom: vars.space['6'],
});

export const hashLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    marginBottom: vars.space['2'],
    textAlign: 'left',
});

export const hashBox = style({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['2'],
    background: vars.color.bgCard,
    padding: vars.space['3'],
    borderRadius: vars.borderRadius.md,
    border: `1px solid ${vars.color.glassBorder}`,
    marginBottom: vars.space['4'],
    overflow: 'hidden',
});

export const hashText = style({
    fontFamily: vars.fontFamily.mono,
    fontSize: vars.fontSize.xs,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    color: vars.color.textSecondary,
});

export const copyButton = style({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: vars.color.textPrimary,
    padding: vars.space['1'],
    borderRadius: vars.borderRadius.sm,
    transition: vars.transition.fast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    ':hover': {
        background: vars.color.bgElevated,
    }
});
