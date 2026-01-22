/**
 * SecurityView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';
import { animateFadeIn } from '../styles/global.css';

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
    padding: 0,
});

export const content = style({
    flex: 1,
    padding: `${vars.space['4']} ${vars.space['5']}`,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
});

export const securityCheck = style({
    padding: vars.space['4'],
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.md,
    marginBottom: vars.space['2'],
    borderLeft: `4px solid ${vars.color.textPrimary}`,
});

export const securityTitle = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    marginBottom: vars.space['1'],
});

export const securityText = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    margin: 0,
});

export const passwordForm = style({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['4'],
});

export const warningBox = style({
    padding: vars.space['4'],
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: vars.borderRadius.md,
    borderLeft: `4px solid ${vars.color.danger}`,
});

export const warningTitle = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.danger,
    marginBottom: vars.space['1'],
});

export const mnemonicGrid = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: vars.space['3'],
    marginBottom: vars.space['4'],
});

export const mnemonicWord = style({
    position: 'relative',
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.sm,
    padding: `${vars.space['3']} ${vars.space['2']}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export const wordIndex = style({
    position: 'absolute',
    left: vars.space['2'],
    top: vars.space['1'],
    fontSize: '10px',
    color: vars.color.textMuted,
});

export const wordText = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textPrimary,
});

export const wordTextBlurred = style({
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    color: vars.color.textPrimary,
    filter: 'blur(5px)',
    userSelect: 'none',
    transition: 'filter 0.2s ease',
});

export const mnemonicGridHoverable = style({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: vars.space['3'],
    marginBottom: vars.space['4'],
    cursor: 'pointer',

    ':hover': {
        // This is just a marker, actual reveal is handled via state
    }
});

export const privateKeyBox = style({
    width: '100%',
    height: '6rem',
    padding: vars.space['4'],
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.md,
    fontFamily: vars.fontFamily.mono,
    fontSize: vars.fontSize.xs,
    color: vars.color.textPrimary,
    resize: 'none',
    outline: 'none',
    wordBreak: 'break-all',
    marginBottom: vars.space['4'],
});

export const safetyList = style({
    display: 'flex',
    flexDirection: 'column',
    gap: vars.space['3'],
    marginTop: vars.space['4'],
});

export const safetyItem = style({
    display: 'flex',
    gap: vars.space['3'],
});

export const safetyIcon = style({
    marginTop: '2px',
    fontSize: vars.fontSize.base,
});

export const safetyContent = style({
    flex: 1,
});

export const safetyTitle = style({
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.warning,
    marginBottom: '2px',
});

export const safetyDesc = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    lineHeight: vars.lineHeight.relaxed,
});

export const closeButton = style({
    background: 'none',
    border: 'none',
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
    cursor: 'pointer',
    textDecoration: 'underline',
    alignSelf: 'center',
    marginTop: vars.space['4'],
    padding: vars.space['2'],

    ':hover': {
        color: vars.color.textPrimary,
    }
});
