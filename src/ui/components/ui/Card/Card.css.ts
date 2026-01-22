/**
 * Card Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '../../../styles/theme.css';

// =============================================================================
// CARD RECIPE
// =============================================================================
export const card = recipe({
    base: style({
        background: vars.color.bgCard,
        border: `1px solid ${vars.color.glassBorder}`,
        borderRadius: vars.borderRadius.lg,
        backdropFilter: 'blur(20px)',
        transition: vars.transition.normal,
    }),

    variants: {
        padding: {
            none: {},
            sm: style({ padding: vars.space['3'] }),
            md: style({ padding: vars.space['4'] }),
            lg: style({ padding: vars.space['6'] }),
        },

        variant: {
            default: {},
            elevated: style({
                background: vars.color.bgElevated,
                boxShadow: vars.shadow.lg,
            }),
            glass: style({
                background: vars.color.glassSurface,
                backdropFilter: 'blur(30px)',
            }),
            interactive: style({
                cursor: 'pointer',

                selectors: {
                    '&:hover': {
                        background: vars.color.bgElevated,
                        borderColor: vars.color.textSecondary,
                    },
                },
            }),
        },

        fullWidth: {
            true: style({ width: '100%' }),
            false: {},
        },
    },

    defaultVariants: {
        padding: 'md',
        variant: 'default',
        fullWidth: false,
    },
});

// =============================================================================
// CARD PARTS
// =============================================================================
export const cardHeader = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vars.space['4'],
});

export const cardTitle = style({
    fontSize: vars.fontSize.lg,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textPrimary,
});

export const cardDescription = style({
    fontSize: vars.fontSize.sm,
    color: vars.color.textMuted,
    marginTop: vars.space['1'],
});

export const cardContent = style({
    // Untuk custom content
});

export const cardFooter = style({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    marginTop: vars.space['4'],
    paddingTop: vars.space['4'],
    borderTop: `1px solid ${vars.color.glassBorder}`,
});

// =============================================================================
// CONTAINER (Main popup container)
// =============================================================================
export const container = style({
    width: vars.layout.popupWidth,
    height: vars.layout.popupHeight,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    position: 'relative',
    overflowY: 'hidden',
    background: vars.color.bgSurface,
    backdropFilter: 'blur(30px)',
});

export const containerWithNav = style([container, {
    paddingBottom: '80px', // Space untuk bottom nav
}]);

export const scrollContent = style({
    flex: 1,
    overflowY: 'auto',
    padding: `0 ${vars.space['6']}`,
});

// =============================================================================
// PAGE LAYOUT
// =============================================================================
export const page = style({
    width: vars.layout.popupWidth,
    height: vars.layout.popupHeight,
    display: 'flex',
    flexDirection: 'column',
    padding: vars.space['8'],
    boxSizing: 'border-box',
    background: vars.color.bgSurface,
    backdropFilter: 'blur(30px)',
});

export const pageCenter = style([page, {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
}]);

// =============================================================================
// STACK LAYOUTS
// =============================================================================
export const stack = recipe({
    base: style({
        display: 'flex',
        flexDirection: 'column',
    }),

    variants: {
        gap: {
            none: {},
            xs: style({ gap: vars.space['1'] }),
            sm: style({ gap: vars.space['2'] }),
            md: style({ gap: vars.space['4'] }),
            lg: style({ gap: vars.space['6'] }),
            xl: style({ gap: vars.space['8'] }),
        },
        align: {
            start: style({ alignItems: 'flex-start' }),
            center: style({ alignItems: 'center' }),
            end: style({ alignItems: 'flex-end' }),
            stretch: style({ alignItems: 'stretch' }),
        },
    },

    defaultVariants: {
        gap: 'md',
        align: 'stretch',
    },
});

export const row = recipe({
    base: style({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    }),

    variants: {
        gap: {
            none: {},
            xs: style({ gap: vars.space['1'] }),
            sm: style({ gap: vars.space['2'] }),
            md: style({ gap: vars.space['4'] }),
            lg: style({ gap: vars.space['6'] }),
        },
        justify: {
            start: style({ justifyContent: 'flex-start' }),
            center: style({ justifyContent: 'center' }),
            end: style({ justifyContent: 'flex-end' }),
            between: style({ justifyContent: 'space-between' }),
            around: style({ justifyContent: 'space-around' }),
        },
    },

    defaultVariants: {
        gap: 'md',
        justify: 'start',
    },
});
