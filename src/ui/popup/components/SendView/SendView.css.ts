/**
 * SendView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

// Re-export for component use
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
    padding: vars.space['6'],
    flex: 1,
    overflowY: 'auto',
});

export const formGroup = style({
    marginBottom: vars.space['5'],
});

export const label = style({
    display: 'block',
    marginBottom: vars.space['2'],
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textSecondary,
});

export const errorMsg = style({
    color: vars.color.danger,
    fontSize: vars.fontSize.sm,
    marginTop: vars.space['2'],
    padding: vars.space['3'],
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: vars.borderRadius.md,
    border: `1px solid ${vars.color.dangerHover}`,
    display: 'flex',
    alignItems: 'center',
    marginBottom: vars.space['4'],
});

// =============================================================================
// ASSET SELECTOR
// =============================================================================
export const assetSelectorTrigger = style({
    padding: vars.space['3'],
    background: vars.color.bgInput,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    cursor: 'pointer',
    transition: vars.transition.fast,
    width: '100%',
    textAlign: 'left',

    selectors: {
        '&:hover': {
            background: vars.color.hoverOverlay,
            borderColor: vars.color.textSecondary,
        },
    },
});

export const assetIcon = style({
    width: '32px',
    height: '32px',
    borderRadius: vars.borderRadius.full,
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
});

export const assetIconImg = style({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

export const assetInfo = style({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
});

export const assetSymbol = style({
    fontWeight: vars.fontWeight.semibold,
    fontSize: vars.fontSize.base,
    color: vars.color.textPrimary,
    lineHeight: 1.2,
});

export const assetBalance = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    marginTop: '2px',
});

export const chevronIcon = style({
    color: vars.color.textSecondary,
    transition: vars.transition.fast,
});

export const dropdownMenu = style({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: vars.space['2'],
    background: vars.color.bgElevated,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.lg,
    zIndex: vars.zIndex.dropdown,
    maxHeight: '240px',
    overflowY: 'auto',
    boxShadow: vars.shadow.lg,
    backdropFilter: 'blur(20px)',
});

export const dropdownItem = style({
    padding: vars.space['3'],
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    cursor: 'pointer',
    transition: vars.transition.fast,
    borderBottom: `1px solid ${vars.color.glassBorder}`,
    background: 'transparent',
    width: '100%',
    textAlign: 'left', // Button reset

    selectors: {
        '&:hover': {
            background: vars.color.hoverOverlay,
        },
        '&:last-child': {
            borderBottom: 'none',
        },
        '&[data-selected="true"]': {
            background: vars.color.activeOverlay,
        },
    },
});

export const relativeContainer = style({
    position: 'relative',
});
