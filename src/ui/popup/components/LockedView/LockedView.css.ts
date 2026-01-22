/**
 * LockedView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
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
    background: vars.color.bgSurface,
    backdropFilter: 'blur(30px)',
    padding: vars.space['6'],
});

export const content = style({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
});

// Header
export const header = style({
    textAlign: 'center',
    marginTop: vars.space['12'],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

export const brandIcon = style({
    width: '64px',
    height: '64px',
    marginBottom: vars.space['4'],
    borderRadius: vars.borderRadius.xl,
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: vars.space['2'],
});

export const brandImg = style({
    width: '40px',
    height: '40px',
});

export const title = style({
    fontSize: vars.fontSize.xl,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textPrimary,
});

// Form
export const form = style({
    marginTop: 'auto',
    marginBottom: 'auto',
    width: '100%',
});

export const errorMessage = style({
    color: vars.color.danger,
    fontSize: vars.fontSize.sm,
    textAlign: 'center',
    marginBottom: vars.space['4'],
});

// Actions
export const actions = style({
    marginTop: 'auto',
    paddingBottom: vars.space['4'],
});

export const forgotPassword = style({
    textAlign: 'center',
    marginTop: vars.space['6'],
});

export const link = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    cursor: 'pointer',
    textDecoration: 'none',
    opacity: 0.8,
    transition: vars.transition.fast,

    ':hover': {
        color: vars.color.textPrimary,
        opacity: 1,
    }
});
