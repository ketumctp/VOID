/**
 * Theme System - Rialo Wallet
 * CSS Variables contract untuk runtime theming
 */
import { createTheme, createThemeContract } from '@vanilla-extract/css';
import {
    colors,
    space,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    fontFamily,
    borderRadius,
    shadows,
    zIndex,
    transitions,
    layout,
} from './tokens.css';

// =============================================================================
// THEME CONTRACT
// Mendefinisikan semua CSS variables yang tersedia
// =============================================================================
export const vars = createThemeContract({
    color: {
        // Background
        bgDeep: null,
        bgSurface: null,
        bgCard: null,
        bgElevated: null,
        bgInput: null,
        bgInputFocus: null,

        // Glass
        glassBorder: null,
        glassHighlight: null,
        glassSurface: null,

        // Text
        textPrimary: null,
        textSecondary: null,
        textMuted: null,
        textInverse: null,

        // States
        success: null,
        successHover: null,
        danger: null,
        dangerHover: null,
        warning: null,
        warningBg: null,
        warningBorder: null,
        info: null,
        infoHover: null,

        // Accents
        accentGlow: null,

        // Interactive
        hoverOverlay: null,
        activeOverlay: null,
        focusRing: null,
    },
    space,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    fontFamily,
    borderRadius,
    shadow: shadows,
    zIndex,
    transition: transitions,
    layout,
});

// =============================================================================
// DARK THEME (Primary)
// =============================================================================
export const darkTheme = createTheme(vars, {
    color: colors,
    space,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    fontFamily,
    borderRadius,
    shadow: shadows,
    zIndex,
    transition: transitions,
    layout,
});

// =============================================================================
// LIGHT THEME (Future-ready)
// =============================================================================
export const lightTheme = createTheme(vars, {
    color: {
        ...colors,
        // Override untuk light mode
        bgDeep: '#ffffff',
        bgSurface: 'rgba(255, 255, 255, 0.9)',
        bgCard: 'rgba(249, 249, 249, 0.95)',
        bgElevated: 'rgba(255, 255, 255, 1)',
        bgInput: 'rgba(0, 0, 0, 0.05)',
        bgInputFocus: 'rgba(0, 0, 0, 0.08)',

        glassBorder: 'rgba(0, 0, 0, 0.08)',
        glassHighlight: 'rgba(0, 0, 0, 0.05)',
        glassSurface: 'rgba(0, 0, 0, 0.02)',

        textPrimary: '#18181b',
        textSecondary: '#52525b',
        textMuted: '#a1a1aa',
        textInverse: '#ffffff',

        hoverOverlay: 'rgba(0, 0, 0, 0.05)',
        activeOverlay: 'rgba(0, 0, 0, 0.08)',
        focusRing: '#18181b',
    },
    space,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    fontFamily,
    borderRadius,
    shadow: shadows,
    zIndex,
    transition: transitions,
    layout,
});
