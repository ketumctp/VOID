/**
 * Design Tokens - VOID Wallet
 * Sumber kebenaran tunggal untuk semua nilai desain
 */

// =============================================================================
// PRIMITIVE COLORS
// Warna dasar mentah - tidak boleh dipakai langsung di komponen
// =============================================================================
const primitiveColors = {
    // Grayscale
    gray950: '#0f0f11',
    gray900: '#18181b',
    gray800: '#27272a',
    gray700: '#3f3f46',
    gray600: '#52525b',
    gray500: '#71717a',
    gray400: '#a1a1aa',
    gray300: '#d4d4d8',
    gray200: '#e4e4e7',
    gray100: '#f4f4f5',
    white: '#ffffff',
    black: '#000000',

    // Brand
    cream100: '#e8e3d5',
    cream200: '#d1cbb7',

    // Semantic primitives
    emerald500: '#10b981',
    emerald600: '#059669',
    red500: '#ef4444',
    red600: '#dc2626',
    yellow400: '#ffd700',
    yellow500: '#eab308',
    blue500: '#3b82f6',
    blue600: '#2563eb',
} as const;

// =============================================================================
// SEMANTIC COLORS
// Warna dengan konteks makna - gunakan ini di komponen
// =============================================================================
export const colors = {
    // Background
    bgDeep: primitiveColors.gray950,
    bgSurface: 'rgba(30, 30, 36, 0.6)',
    bgCard: 'rgba(39, 39, 42, 0.8)',
    bgElevated: 'rgba(63, 63, 70, 0.9)',
    bgInput: 'rgba(0, 0, 0, 0.2)',
    bgInputFocus: 'rgba(0, 0, 0, 0.4)',

    // Glass morphism
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassHighlight: 'rgba(255, 255, 255, 0.1)',
    glassSurface: 'rgba(255, 255, 255, 0.05)',

    // Text
    textPrimary: primitiveColors.cream100,
    textSecondary: primitiveColors.gray400,
    textMuted: primitiveColors.gray500,
    textInverse: primitiveColors.gray950,

    // States
    success: primitiveColors.emerald500,
    successHover: primitiveColors.emerald600,
    danger: primitiveColors.red500,
    dangerHover: primitiveColors.red600,
    warning: primitiveColors.yellow500,
    warningBg: 'rgba(255, 255, 0, 0.1)',
    warningBorder: 'rgba(255, 255, 0, 0.2)',
    info: primitiveColors.blue500,
    infoHover: primitiveColors.blue600,

    // Accents
    accentGlow: 'rgba(232, 227, 213, 0.1)',

    // Interactive
    hoverOverlay: 'rgba(255, 255, 255, 0.05)',
    activeOverlay: 'rgba(255, 255, 255, 0.08)',
    focusRing: primitiveColors.cream100,
} as const;

// =============================================================================
// SPACING SCALE
// Berdasarkan 4px base grid
// =============================================================================
export const space = {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================
export const fontSize = {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '42px',
} as const;

export const fontWeight = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
} as const;

export const lineHeight = {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
} as const;

export const letterSpacing = {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
    wider: '1px',
} as const;

export const fontFamily = {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const borderRadius = {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
} as const;

// =============================================================================
// SHADOWS
// =============================================================================
export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(232, 227, 213, 0.2)',
    glowStrong: '0 4px 20px rgba(232, 227, 213, 0.3)',
    glowButton: '0 4px 12px rgba(0, 0, 0, 0.2)',
    glowButtonHover: '0 6px 16px rgba(255, 255, 255, 0.15)',
    focus: '0 0 0 1px rgba(255, 255, 255, 0.1)',
} as const;

// =============================================================================
// Z-INDEX LAYERS
// =============================================================================
export const zIndex = {
    base: '0',
    dropdown: '1000',
    sticky: '1100',
    overlay: '1200',
    modal: '1300',
    popover: '1400',
    toast: '1500',
} as const;

// =============================================================================
// TRANSITIONS
// =============================================================================
export const transitions = {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// =============================================================================
// LAYOUT - Spesifik untuk browser extension popup
// =============================================================================
export const layout = {
    popupWidth: '375px',
    popupHeight: '600px',
    bottomNavHeight: '64px',
    headerHeight: '56px',
} as const;
