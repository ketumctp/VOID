/**
 * DashboardView Styles - Rialo Wallet
 * Halaman utama wallet dengan balance, actions, dan token list
 */
import { style, keyframes } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';

// =============================================================================
// CONTAINER
// =============================================================================
export const container = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f11 0%, #1a1a1f 100%)',
    overflow: 'hidden',
    position: 'relative',

    // Reset padding for wrapper handling
    padding: 0,
});

export const mobileWrapper = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: vars.color.bgSurface,
    position: 'relative',
    overflow: 'hidden',

    // Desktop: Card Mode
    '@media': {
        'screen and (min-width: 480px)': {
            width: '400px',
            height: '650px', // Fixed height for "App" feel
            maxHeight: '90vh',
            borderRadius: '24px',
            border: '1px solid #222',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }
    }
});

const fadeInScale = keyframes({
    from: {
        opacity: 0,
        transform: 'scale(0.99)',
    },
    to: {
        opacity: 1,
        transform: 'scale(1)',
    },
});

export const animateFadeIn = style({
    animation: `${fadeInScale} 0.2s ease-out forwards`,
});

// =============================================================================
// HEADER
// =============================================================================
export const header = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${vars.space['3']} ${vars.space['5']}`,
    width: '100%',
    boxSizing: 'border-box',
});

export const logoGroup = style({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
    flex: 1,
});

export const logo = style({
    width: '32px',
    height: '32px',
});

export const appName = style({
    fontWeight: vars.fontWeight.bold,
    fontSize: vars.fontSize.lg,
    letterSpacing: '-0.5px',
    color: vars.color.textPrimary,
});

export const networkBadge = style({
    fontSize: vars.fontSize.xs,
    background: vars.color.warningBg,
    color: vars.color.warning,
    padding: `${vars.space['1']} ${vars.space['2']}`,
    borderRadius: vars.borderRadius.sm,
    border: `1px solid ${vars.color.warningBorder}`,
    fontWeight: vars.fontWeight.semibold,
});

// =============================================================================
// BALANCE SECTION
// =============================================================================
export const balanceSection = style({
    textAlign: 'center',
    padding: `${vars.space['4']} 0 ${vars.space['5']} 0`,
});

export const balanceLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    marginBottom: vars.space['2'],
    textTransform: 'uppercase',
    letterSpacing: '1px',
});

export const balanceAmount = style({
    fontSize: vars.fontSize['4xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    letterSpacing: '-1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['2'], // Increased gap slightly
});

export const balanceSymbol = style({
    fontSize: vars.fontSize.xl,
    color: vars.color.textSecondary,
    fontWeight: vars.fontWeight.medium,
    // Removed alignSelf: 'baseline' to respect parent's alignItems: 'center'
});

// =============================================================================
// ACTION BUTTONS
// =============================================================================
export const actionsRow = style({
    display: 'flex',
    justifyContent: 'center',
    gap: vars.space['6'],
    marginBottom: vars.space['5'],
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
        '&:hover:not(:disabled)': {
            background: vars.color.textPrimary,
            color: vars.color.bgDeep,
            transform: 'translateY(-2px)',
            boxShadow: vars.shadow.glowStrong,
        },
        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
    },
});

export const actionLabel = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    fontWeight: vars.fontWeight.medium,
});

// =============================================================================
// CONTENT AREA & TABS
// =============================================================================
export const contentArea = style({
    flex: 1,
    background: vars.color.bgCard,
    padding: `${vars.space['4']} ${vars.space['8']}`,
    overflowY: 'auto',
});

export const tabsRow = style({
    display: 'flex',
    gap: vars.space['8'],
    justifyContent: 'center',
    marginBottom: vars.space['6'],
});

export const tab = style({
    background: 'none',
    border: 'none',
    padding: `${vars.space['2']} 0`,
    fontWeight: vars.fontWeight.bold,
    fontSize: vars.fontSize.base,
    borderBottom: '3px solid transparent',
    borderRadius: '2px',
    transition: vars.transition.normal,
    cursor: 'pointer',
    color: vars.color.textMuted,
    width: 'auto',

    selectors: {
        '&[data-active="true"]': {
            color: vars.color.textPrimary,
            borderBottomColor: vars.color.textPrimary,
        },
    },
});

// =============================================================================
// TOKEN LIST
// =============================================================================
export const tokenList = style({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['3'],
});

export const tokenItem = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: vars.space['3'],
    borderRadius: vars.borderRadius.md,
    cursor: 'pointer',
    transition: vars.transition.fast,

    selectors: {
        '&:hover': {
            background: vars.color.hoverOverlay,
        },
    },
});

export const tokenInfo = style({
    display: 'flex',
    alignItems: 'center',
    gap: vars.space['3'],
});

export const tokenIcon = style({
    width: '40px',
    height: '40px',
    borderRadius: vars.borderRadius.full,
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
});

export const tokenIconImg = style({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
});

export const tokenName = style({
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textPrimary,
});

export const tokenType = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
});

export const tokenBalance = style({
    fontWeight: vars.fontWeight.semibold,
    textAlign: 'right',
    color: vars.color.textPrimary,
});

// =============================================================================
// IMPORT BUTTON
// =============================================================================
export const importButton = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    padding: `${vars.space['2']} ${vars.space['6']}`,
    background: '#222222',
    border: '1px solid #333333',
    borderRadius: vars.borderRadius.full,
    color: vars.color.textPrimary,
    cursor: 'pointer',
    transition: vars.transition.normal,
    width: 'auto',
    margin: '0 auto',
    display: 'block',

    selectors: {
        '&:hover': {
            background: '#333333',
        },
    },
});

// =============================================================================
// BOTTOM NAVIGATION
// =============================================================================
export const bottomNav = style({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: 'rgba(15, 15, 17, 0.95)',
    backdropFilter: 'blur(20px)',
    borderTop: `1px solid ${vars.color.glassBorder}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: vars.zIndex.sticky,
    paddingBottom: 'env(safe-area-inset-bottom)',
});

export const navItem = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['1'],
    color: vars.color.textSecondary,
    background: 'none',
    border: 'none',
    padding: vars.space['2'],
    width: '64px',
    cursor: 'pointer',
    transition: vars.transition.fast,

    selectors: {
        '&[data-active="true"]': {
            color: vars.color.textPrimary,
        },
    },
});

export const navLabel = style({
    fontSize: '10px',
    fontWeight: vars.fontWeight.medium,
});

// =============================================================================
// SKELETON LOADING
// =============================================================================
const skeletonAnimation = keyframes({
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
});

export const skeleton = style({
    background: `linear-gradient(90deg, ${vars.color.glassSurface} 0%, ${vars.color.glassHighlight} 50%, ${vars.color.glassSurface} 100%)`,
    backgroundSize: '200% 100%',
    animation: `${skeletonAnimation} 1.5s ease-in-out infinite`,
    borderRadius: vars.borderRadius.sm,
});

// =============================================================================
// SPINNER
// =============================================================================
const spinAnimation = keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

export const spinner = style({
    animation: `${spinAnimation} 1s linear infinite`,
});
