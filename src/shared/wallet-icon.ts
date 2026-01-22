/**
 * Rialo Wallet Icon (base64 encoded SVG)
 */

import type { WalletIcon } from '@wallet-standard/base';

// Simple Rialo logo SVG - you can replace this with your actual logo
const RIALO_SVG = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="24" fill="#6366f1"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">R</text>
</svg>`;

// Convert to base64 data URI
const svgBase64 = btoa(RIALO_SVG);

export const RIALO_WALLET_ICON: WalletIcon = `data:image/svg+xml;base64,${svgBase64}` as WalletIcon;
