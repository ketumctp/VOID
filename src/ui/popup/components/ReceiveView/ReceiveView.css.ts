/**
 * ReceiveView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css.ts';

// Re-export animation for use in component
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
});

export const content = style({
    textAlign: 'center',
    padding: `${vars.space['8']} 0`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
});

export const title = style({
    fontSize: vars.fontSize['2xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    marginBottom: vars.space['2'],
});

export const subtitle = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    marginBottom: vars.space['6'],
});

export const qrContainer = style({
    margin: `${vars.space['6']} auto`,
    padding: vars.space['4'],
    backgroundColor: '#ffffff',
    borderRadius: vars.borderRadius.xl,
    width: '180px',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: vars.shadow.glowStrong,
});

export const qrImage = style({
    width: '100%',
    height: 'auto',
    display: 'block',
});

export const addressLabel = style({
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textMuted,
    marginBottom: vars.space['3'],
    textTransform: 'uppercase',
    letterSpacing: vars.letterSpacing.wide,
});

export const addressBox = style({
    backgroundColor: vars.color.bgInput,
    borderRadius: vars.borderRadius.lg,
    padding: `${vars.space['3']} ${vars.space['4']}`,
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    border: `1px solid ${vars.color.glassBorder}`,
    maxWidth: '90%',
    width: '100%',
    transition: vars.transition.fast,

    selectors: {
        '&:hover': {
            borderColor: vars.color.textSecondary,
            background: vars.color.bgInputFocus,
        },
    },
});

export const addressText = style({
    fontFamily: vars.fontFamily.mono,
    fontSize: vars.fontSize.xs,
    flex: 1,
    wordBreak: 'break-word',
    lineHeight: vars.lineHeight.relaxed,
    color: vars.color.textPrimary,
    textAlign: 'left',
});

export const copyButton = style({
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: vars.space['2'],
    color: vars.color.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.borderRadius.md,
    transition: vars.transition.fast,
    flexShrink: 0,

    selectors: {
        '&:hover': {
            background: vars.color.hoverOverlay,
            color: vars.color.textPrimary,
        },
        '&[data-copied="true"]': {
            color: vars.color.success,
        },
    },
});

export const successMessage = style({
    color: vars.color.success,
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.medium,
    marginTop: vars.space['2'],
    height: '20px', // Reserve space to prevent layout jump
});
