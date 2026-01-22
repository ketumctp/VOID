/**
 * Button Styles - Rialo Wallet
 * Menggunakan recipe pattern untuk variant composition
 */
import { style, keyframes } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

// =============================================================================
// BASE BUTTON
// =============================================================================
const baseButton = style({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: vars.fontWeight.semibold,
    borderRadius: vars.borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    transition: vars.transition.normal,
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    lineHeight: 1,
    whiteSpace: 'nowrap',

    ':focus-visible': {
        outline: `2px solid ${vars.color.focusRing}`,
        outlineOffset: '2px',
    },

    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
    },
});

// =============================================================================
// SIZE VARIANTS
// =============================================================================
const sizeVariants = {
    sm: style({
        height: '32px',
        padding: `0 ${vars.space['3']}`,
        fontSize: vars.fontSize.sm,
        gap: vars.space['2'],
        borderRadius: vars.borderRadius.md,
    }),
    md: style({
        height: '40px',
        padding: `0 ${vars.space['4']}`,
        fontSize: vars.fontSize.base,
        gap: vars.space['2'],
    }),
    lg: style({
        height: '48px',
        padding: `0 ${vars.space['6']}`,
        fontSize: vars.fontSize.base,
        gap: vars.space['3'],
    }),
    xl: style({
        height: '56px',
        padding: `0 ${vars.space['8']}`,
        fontSize: vars.fontSize.lg,
        gap: vars.space['3'],
    }),
};

// =============================================================================
// VARIANT STYLES
// =============================================================================
const variantStyles = {
    primary: style({
        background: vars.color.textPrimary,
        color: vars.color.textInverse,
        border: `1px solid ${vars.color.textPrimary}`,
        boxShadow: vars.shadow.glowButton,

        selectors: {
            '&:hover:not(:disabled)': {
                background: '#ffffff',
                transform: 'translateY(-1px)',
                boxShadow: vars.shadow.glowButtonHover,
            },
            '&:active:not(:disabled)': {
                transform: 'translateY(0)',
            },
        },
    }),

    secondary: style({
        background: vars.color.bgCard,
        color: vars.color.textPrimary,
        border: `1px solid ${vars.color.glassBorder}`,

        selectors: {
            '&:hover:not(:disabled)': {
                background: vars.color.bgElevated,
                borderColor: vars.color.textSecondary,
            },
        },
    }),

    glass: style({
        background: vars.color.glassSurface,
        color: vars.color.textPrimary,
        border: `1px solid ${vars.color.glassBorder}`,
        backdropFilter: 'blur(4px)',

        selectors: {
            '&:hover:not(:disabled)': {
                background: vars.color.glassHighlight,
                borderColor: vars.color.textPrimary,
                transform: 'translateY(-1px)',
            },
        },
    }),

    ghost: style({
        background: 'transparent',
        color: vars.color.textPrimary,
        border: '1px solid transparent',

        selectors: {
            '&:hover:not(:disabled)': {
                background: vars.color.hoverOverlay,
            },
        },
    }),

    danger: style({
        background: vars.color.danger,
        color: '#ffffff',
        border: `1px solid ${vars.color.danger}`,

        selectors: {
            '&:hover:not(:disabled)': {
                background: vars.color.dangerHover,
                borderColor: vars.color.dangerHover,
            },
        },
    }),

    success: style({
        background: vars.color.success,
        color: '#ffffff',
        border: `1px solid ${vars.color.success}`,

        selectors: {
            '&:hover:not(:disabled)': {
                background: vars.color.successHover,
                borderColor: vars.color.successHover,
            },
        },
    }),
};

// =============================================================================
// RECIPE COMPOSITION
// =============================================================================
export const button = recipe({
    base: baseButton,

    variants: {
        variant: variantStyles,
        size: sizeVariants,
        fullWidth: {
            true: style({ width: '100%' }),
            false: style({ width: 'auto' }),
        },
        rounded: {
            true: style({ borderRadius: vars.borderRadius.full }),
            false: {},
        },
    },

    defaultVariants: {
        variant: 'primary',
        size: 'md',
        fullWidth: false,
        rounded: false,
    },
});

// =============================================================================
// ICON BUTTON (Khusus untuk tombol dengan icon saja)
// =============================================================================
export const iconButton = recipe({
    base: [baseButton, style({
        padding: 0,
        aspectRatio: '1',
    })],

    variants: {
        variant: variantStyles,
        size: {
            sm: style({ width: '32px', height: '32px' }),
            md: style({ width: '40px', height: '40px' }),
            lg: style({ width: '48px', height: '48px' }),
        },
        rounded: {
            true: style({ borderRadius: vars.borderRadius.full }),
            false: style({ borderRadius: vars.borderRadius.md }),
        },
    },

    defaultVariants: {
        variant: 'glass',
        size: 'md',
        rounded: true,
    },
});

// =============================================================================
// LOADING SPINNER
// =============================================================================
const spinAnimation = keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

export const spinner = style({
    animation: `${spinAnimation} 1s linear infinite`,
});
