/**
 * WelcomeView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

export { animateFadeIn };

// Enhanced Container
export const container = style({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    background: 'linear-gradient(135deg, #0f0f11 0%, #1a1a1f 100%)',
    position: 'relative',
    overflow: 'hidden',

    // On larger screens (Full Tab), center content as a card
    '@media': {
        'screen and (min-width: 480px)': {
            padding: 0,
            backgroundColor: '#0f0f11', // Page background
        }
    }
});

export const content = style({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['8'],
    textAlign: 'center',
    width: '100%',

    // Card Styles for Large Screens
    '@media': {
        'screen and (min-width: 480px)': {
            flex: 'none', // Don't fill height
            width: '400px', // Fixed card width
            minHeight: '500px', // Min height for consistency
            backgroundColor: '#18191c', // Surface color
            borderRadius: '24px',
            border: '1px solid #222',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }
    }
});

// Premium Logo Wrapper
export const logoWrapper = style({
    width: '100%',
    display: 'flex',
    flexDirection: 'column', // Vertical stack
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space['4'], // Space between logo and text
    marginBottom: vars.space['6'],
});

export const logo = style({
    width: '100px', // Larger logo
    height: '100px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))',
    transform: 'scale(1)',
    transition: 'transform 0.3s ease',

    selectors: {
        [`${logoWrapper}:hover &`]: {
            transform: 'scale(1.05)',
        }
    }
});

// Typography
export const title = style({
    fontSize: '32px', // Explicit larger size
    fontWeight: vars.fontWeight.bold,
    color: '#ffffff', // Force white for impact
    marginBottom: vars.space['3'],
    letterSpacing: '-0.5px',
    lineHeight: 1.1,
    textShadow: '0 0 30px rgba(255,255,255,0.1)',
});

export const description = style({
    fontSize: vars.fontSize.base,
    color: vars.color.textSecondary,
    lineHeight: '1.6',
    maxWidth: '300px',
    fontWeight: vars.fontWeight.medium,
});

export const actionSection = style({
    width: '100%',
    paddingTop: vars.space['8'],
});
