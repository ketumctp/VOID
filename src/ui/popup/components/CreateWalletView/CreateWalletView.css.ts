/**
 * CreateWalletView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

export { animateFadeIn };

export const container = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f11 0%, #1a1a1f 100%)',
    position: 'relative',
    overflow: 'hidden',

    // On larger screens (Full Tab), center content as a card
    '@media': {
        'screen and (min-width: 480px)': {
            padding: 0,
            backgroundColor: '#0f0f11',
        }
    }
});

export const content = style({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    // Card Styles for Large Screens
    '@media': {
        'screen and (min-width: 480px)': {
            flex: 'none',
            width: '400px', // Fixed card width
            minHeight: 'auto',
            backgroundColor: '#18191c', // Surface color
            borderRadius: '24px',
            border: '1px solid #222',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }
    }
});

// Header
export const header = style({
    textAlign: 'center',
    marginBottom: vars.space['8'], // Increased spacing
});

export const brandRow = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['2'],
    marginBottom: vars.space['3'],
    opacity: 0.9,
});

export const brandIcon = style({
    width: '32px', // Slightly larger
    height: '32px',
    borderRadius: vars.borderRadius.sm,
});

export const brandName = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1.5px', // Wider spacing
});

export const title = style({
    fontSize: vars.fontSize['2xl'], // Larger title
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    letterSpacing: '-0.5px',
});

// Form
export const form = style({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['5'], // More breathing room
    marginBottom: vars.space['8'],
});

export const errorMessage = style({
    color: vars.color.danger,
    fontSize: vars.fontSize.xs,
    textAlign: 'center',
    marginBottom: vars.space['4'],
    padding: vars.space['2'],
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: vars.borderRadius.sm,
    border: `1px solid ${vars.color.dangerHover}`,
    fontWeight: vars.fontWeight.medium,
});

// Actions
export const actions = style({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['3'],
    marginTop: 'auto', // Push to bottom if content expands, or stick to form
});
