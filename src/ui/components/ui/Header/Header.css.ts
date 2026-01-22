/**
 * Header Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

export const header = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${vars.space['4']} ${vars.space['5']}`,
    borderBottom: `1px solid ${vars.color.glassBorder}`,
    marginBottom: vars.space['4'],
    background: vars.color.bgCard,
    position: 'sticky',
    top: 0,
    zIndex: vars.zIndex.sticky,
    backdropFilter: 'blur(20px)',
});

export const leftSection = style({
    flex: '0 0 auto',
    width: '40px',
    display: 'flex',
    justifyContent: 'flex-start',
});

export const centerSection = style({
    flex: '1 1 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

export const rightSection = style({
    flex: '0 0 auto',
    minWidth: '40px', // Changed from fixed width
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: vars.space['2'],
});

export const title = style({
    fontSize: vars.fontSize.lg,
    fontWeight: vars.fontWeight.semibold,
    margin: 0,
    color: vars.color.textPrimary,
    letterSpacing: '-0.01em',
});

export const backButton = style({
    padding: vars.space['2'],
    background: 'transparent',
    border: 'none',
    color: vars.color.textSecondary,
    borderRadius: vars.borderRadius.full,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: vars.transition.fast,

    selectors: {
        '&:hover': {
            color: vars.color.textPrimary,
            background: vars.color.hoverOverlay,
        },
    },
});

export const iconButton = style({
    padding: vars.space['2'],
    background: 'transparent',
    border: 'none',
    color: vars.color.textSecondary,
    borderRadius: vars.borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: vars.transition.fast,
    marginLeft: vars.space['2'],

    selectors: {
        '&:hover': {
            color: vars.color.textPrimary,
            background: vars.color.hoverOverlay,
        },
    },
});
