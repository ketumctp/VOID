/**
 * ImportTokenView Styles - Rialo Wallet
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
    padding: 0,
});

export const content = style({
    padding: `${vars.space['6']} ${vars.space['6']}`,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
});

export const tipBox = style({
    padding: vars.space['4'],
    background: vars.color.warningBg,
    border: `1px solid ${vars.color.warningBorder}`,
    borderRadius: vars.borderRadius.lg,
    marginTop: vars.space['6'],
});

export const tipText = style({
    fontSize: vars.fontSize.xs,
    color: vars.color.textSecondary,
    margin: 0,
    lineHeight: vars.lineHeight.relaxed,
});
