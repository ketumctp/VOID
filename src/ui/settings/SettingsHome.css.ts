/**
 * SettingsHome Styles - Rialo Wallet
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
    padding: `0 ${vars.space['5']}`,
    overflowY: 'auto',
});

export const sectionTitle = style({
    fontSize: vars.fontSize.xs,
    fontWeight: vars.fontWeight.semibold,
    color: vars.color.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: vars.space['3'],
    paddingLeft: vars.space['1'],
});

export const menuItem = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: vars.space['4'],
    background: vars.color.bgCard,
    border: `1px solid ${vars.color.glassBorder}`,
    borderRadius: vars.borderRadius.md,
    marginBottom: vars.space['3'],
    cursor: 'pointer',
    transition: vars.transition.fast,
    color: vars.color.textPrimary,
    textAlign: 'left',

    ':hover': {
        background: vars.color.bgElevated,
        borderColor: vars.color.textSecondary,
    }
});

export const menuItemDanger = style({
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: vars.color.danger,

    ':hover': {
        background: 'rgba(239, 68, 68, 0.05)',
        borderColor: vars.color.danger,
    }
});

export const menuItemGroup = style({
    display: 'flex',
    alignItems: 'center',
});

export const iconBox = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: vars.borderRadius.sm,
    background: vars.color.bgDeep,
    color: vars.color.textPrimary,
    marginRight: vars.space['4'],
});

export const iconBoxDanger = style({
    background: 'rgba(239, 68, 68, 0.1)',
    color: vars.color.danger,
});

export const menuContent = style({
    display: 'flex',
    flexDirection: 'column',
});

export const menuLabel = style({
    fontSize: vars.fontSize.base,
    fontWeight: vars.fontWeight.medium,
    lineHeight: vars.lineHeight.tight,
    marginBottom: vars.space['1'],
});

export const menuDescription = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
});

export const spacer = style({
    height: vars.space['6'],
});

export const footer = style({
    marginTop: vars.space['8'],
    textAlign: 'center',
    paddingBottom: vars.space['8'],
});

export const versionText = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
});
