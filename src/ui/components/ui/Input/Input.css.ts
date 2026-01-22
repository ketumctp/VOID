/**
 * Input Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

// =============================================================================
// BASE INPUT
// =============================================================================
const baseInput = style({
    width: '100%',
    fontFamily: 'inherit',
    fontSize: vars.fontSize.base,
    color: vars.color.textPrimary,
    background: vars.color.bgInput,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.md,
    transition: vars.transition.normal,
    outline: 'none',

    '::placeholder': {
        color: vars.color.textMuted,
    },

    ':focus': {
        borderColor: vars.color.textPrimary,
        background: vars.color.bgInputFocus,
        boxShadow: vars.shadow.focus,
    },

    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
});

// =============================================================================
// INPUT RECIPE
// =============================================================================
export const input = recipe({
    base: baseInput,

    variants: {
        size: {
            sm: style({
                height: '36px',
                padding: `0 ${vars.space['3']}`,
                fontSize: vars.fontSize.sm,
            }),
            md: style({
                height: '44px',
                padding: `0 ${vars.space['4']}`,
            }),
            lg: style({
                height: '52px',
                padding: `0 ${vars.space['4']}`,
                fontSize: vars.fontSize.lg,
            }),
        },

        variant: {
            default: {},
            error: style({
                borderColor: vars.color.danger,

                ':focus': {
                    borderColor: vars.color.danger,
                },
            }),
            success: style({
                borderColor: vars.color.success,

                ':focus': {
                    borderColor: vars.color.success,
                },
            }),
        },

        hasLeftIcon: {
            true: style({ paddingLeft: vars.space['10'] }),
            false: {},
        },

        hasRightIcon: {
            true: style({ paddingRight: vars.space['10'] }),
            false: {},
        },
    },

    defaultVariants: {
        size: 'md',
        variant: 'default',
        hasLeftIcon: false,
        hasRightIcon: false,
    },
});

// =============================================================================
// INPUT WRAPPER
// =============================================================================
export const inputWrapper = style({
    position: 'relative',
    width: '100%',
});

export const inputIcon = recipe({
    base: style({
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: vars.color.textMuted,
        pointerEvents: 'none',
    }),

    variants: {
        position: {
            left: style({ left: vars.space['3'] }),
            right: style({ right: vars.space['3'] }),
        },
    },
});

// =============================================================================
// FORM GROUP (Label + Input)
// =============================================================================
export const formGroup = style({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['2'],
});

export const label = style({
    display: 'block',
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: vars.letterSpacing.wide,
    color: vars.color.textMuted,
});

export const helperText = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
});

export const errorText = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.danger,
});

// =============================================================================
// TEXTAREA
// =============================================================================
export const textarea = recipe({
    base: [baseInput, style({
        minHeight: '100px',
        padding: vars.space['3'],
        resize: 'vertical',
        lineHeight: vars.lineHeight.relaxed,
    })],

    variants: {
        variant: {
            default: {},
            error: style({
                borderColor: vars.color.danger,
            }),
        },
    },

    defaultVariants: {
        variant: 'default',
    },
});
