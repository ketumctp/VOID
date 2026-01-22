/**
 * Global Styles - Rialo Wallet
 * CSS reset dan base element styles
 */
import { globalStyle, keyframes, style } from '@vanilla-extract/css';
import { vars } from './theme.css';

// =============================================================================
// CSS RESET (Modern)
// =============================================================================
globalStyle('*, *::before, *::after', {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
});

globalStyle('html', {
    width: vars.layout.popupWidth,
    height: vars.layout.popupHeight,
    minWidth: vars.layout.popupWidth,
    minHeight: vars.layout.popupHeight,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textSizeAdjust: '100%',
});

globalStyle('body', {
    margin: 0,
    fontFamily: vars.fontFamily.sans,
    backgroundColor: vars.color.bgDeep,
    backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(39, 39, 42, 1), rgba(15, 15, 17, 1) 100%)',
    backgroundAttachment: 'fixed',
    color: vars.color.textPrimary,
    fontSize: vars.fontSize.base,
    lineHeight: vars.lineHeight.normal,

    // STRICT DIMENSIONS FOR EXTENSION POPUP
    width: vars.layout.popupWidth,
    height: vars.layout.popupHeight,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
});

// RESPONSIVE MODE (For Side Panel)
globalStyle('body.responsive-width', {
    width: '100vw',
    height: '100vh',
    display: 'block',
});

globalStyle('html.responsive-width', {
    width: '100%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
});

// RESPONSIVE MODE (For Side Panel & Full Tab)
globalStyle('body.responsive-width', {
    width: '100vw',
    height: '100vh',
    minWidth: '375px', // Prevent too small
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: vars.color.bgDeep,
});

globalStyle('html.responsive-width', {
    width: '100%',
    height: '100%',
    minWidth: '0',
    minHeight: '0',
});

globalStyle('#root', {
    display: 'contents',
});

// =============================================================================
// TYPOGRAPHY BASE
// =============================================================================
globalStyle('h1, h2, h3, h4, h5, h6', {
    fontWeight: vars.fontWeight.semibold,
    lineHeight: vars.lineHeight.tight,
    letterSpacing: vars.letterSpacing.tight,
    color: vars.color.textPrimary,
});

globalStyle('h1', {
    fontSize: vars.fontSize['3xl'],
});

globalStyle('h2', {
    fontSize: vars.fontSize['2xl'],
});

globalStyle('h3', {
    fontSize: vars.fontSize.xl,
});

globalStyle('h4', {
    fontSize: vars.fontSize.lg,
});

globalStyle('p', {
    lineHeight: vars.lineHeight.relaxed,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
});

globalStyle('a', {
    color: vars.color.textPrimary,
    textDecoration: 'none',
});

globalStyle('a:hover', {
    textDecoration: 'underline',
});

// =============================================================================
// FORM ELEMENTS BASE
// =============================================================================
globalStyle('button', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
});

globalStyle('input, select, textarea', {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    border: 'none',
    outline: 'none',
    background: 'none',
});

globalStyle('input::placeholder, textarea::placeholder', {
    color: vars.color.textMuted,
});

// =============================================================================
// CUSTOM SCROLLBAR
// =============================================================================
globalStyle('::-webkit-scrollbar', {
    width: '6px',
    height: '6px',
});

globalStyle('::-webkit-scrollbar-track', {
    background: 'transparent',
});

globalStyle('::-webkit-scrollbar-thumb', {
    background: '#333',
    borderRadius: '3px',
});

globalStyle('::-webkit-scrollbar-thumb:hover', {
    background: '#555',
});

// =============================================================================
// UTILITY: Visually Hidden (untuk aksesibilitas)
// =============================================================================
globalStyle('.visually-hidden', {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
});

// =============================================================================
// ANIMATIONS (Global keyframes yang bisa dipakai ulang)
// =============================================================================
export const fadeIn = keyframes({
    from: { opacity: 0 },
    to: { opacity: 1 },
});

export const fadeInScale = keyframes({
    from: {
        opacity: 0,
        transform: 'scale(0.98)',
    },
    to: {
        opacity: 1,
        transform: 'scale(1)',
    },
});

export const slideUp = keyframes({
    from: {
        opacity: 0,
        transform: 'translateY(8px)',
    },
    to: {
        opacity: 1,
        transform: 'translateY(0)',
    },
});

export const spin = keyframes({
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
});

export const skeleton = keyframes({
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
});

// =============================================================================
// UTILITY CLASSES
// =============================================================================
export const animateFadeIn = style({
    animation: `${fadeInScale} 0.2s ease-out forwards`,
    willChange: 'transform, opacity',
});

export const animateSlideUp = style({
    animation: `${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
});
