/**
 * ConfirmView Styles - Rialo Wallet
 */
import { style } from '@vanilla-extract/css';
import { vars } from '../../../styles/theme.css';
import { animateFadeIn } from '../../../styles/global.css';

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
    padding: vars.space['6'],
});

export const card = style({
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.xl,
    padding: vars.space['6'],
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: vars.shadow.lg,
});

export const title = style({
    fontSize: vars.fontSize.xl,
    fontWeight: vars.fontWeight.bold,
    textAlign: 'center',
    marginBottom: vars.space['6'],
    color: vars.color.textPrimary,
});

export const amountBox = style({
    background: vars.color.bgDeep,
    padding: vars.space['6'],
    borderRadius: vars.borderRadius.lg,
    marginBottom: vars.space['6'],
    textAlign: 'center',
    border: `1px solid ${vars.color.glassBorder}`,
});

export const amountValue = style({
    margin: 0,
    fontSize: vars.fontSize['3xl'],
    fontWeight: vars.fontWeight.bold,
    color: vars.color.textPrimary,
    letterSpacing: '-1px',
});

export const amountSymbol = style({
    margin: 0,
    color: vars.color.textMuted,
    fontSize: vars.fontSize.lg,
    marginTop: vars.space['2'],
});

export const detailsList = style({
    marginBottom: vars.space['8'],
});

export const detailRow = style({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: vars.space['3'],
    paddingBottom: vars.space['3'],
    borderBottom: `1px solid ${vars.color.glassBorder}`,

    selectors: {
        '&:last-child': {
            borderBottom: 'none',
            marginBottom: 0,
            paddingBottom: 0,
        }
    }
});

export const detailLabel = style({
    color: vars.color.textMuted,
    fontSize: vars.fontSize.sm,
});

export const detailValue = style({
    color: vars.color.textPrimary,
    fontSize: vars.fontSize.sm,
    fontWeight: vars.fontWeight.medium,
    fontFamily: vars.fontFamily.mono,
});

export const address = style({
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

export const errorMsg = style({
    color: vars.color.danger,
    textAlign: 'center',
    fontSize: vars.fontSize.sm,
    marginBottom: vars.space['4'],
    padding: vars.space['2'],
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: vars.borderRadius.md,
});

export const actions = style({
    display: 'flex',
    gap: vars.space['4'],
    marginTop: 'auto',
});
