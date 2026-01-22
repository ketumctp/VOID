/**
 * dApp Connection Manager
 * Manages connected dApps and permissions
 */

import { STORAGE_KEYS } from '../shared/constants';
import type { ConnectedDapp } from '../shared/types';

/**
 * Get all connected dApps
 */
export async function getConnectedDapps(): Promise<ConnectedDapp[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.CONNECTED_DAPPS);
    return (result[STORAGE_KEYS.CONNECTED_DAPPS] as ConnectedDapp[]) || [];
}

// Helper to normalize origin (remove trailing slash)
function normalizeOrigin(url: string): string {
    try {
        return new URL(url).origin;
    } catch {
        return url; // fallback
    }
}

/**
 * Check if dApp is connected
 */
export async function isConnected(origin: string): Promise<boolean> {
    const dapps = await getConnectedDapps();
    const target = normalizeOrigin(origin);
    const result = dapps.some(d => normalizeOrigin(d.origin) === target);
    return result;
}

/**
 * Connect a dApp
 */
export async function connectDapp(origin: string): Promise<void> {
    const dapps = await getConnectedDapps();
    const target = normalizeOrigin(origin);

    // Check if already connected
    const existing = dapps.find(d => normalizeOrigin(d.origin) === target);
    if (existing) {
        existing.lastUsed = Date.now();
    } else {
        dapps.push({
            origin: target, // Store normalized origin
            connectedAt: Date.now(),
            lastUsed: Date.now()
        });
    }

    await chrome.storage.local.set({
        [STORAGE_KEYS.CONNECTED_DAPPS]: dapps
    });
}

/**
 * Disconnect a dApp
 */
export async function disconnectDapp(origin: string): Promise<void> {
    const dapps = await getConnectedDapps();
    const target = normalizeOrigin(origin);
    const filtered = dapps.filter(d => normalizeOrigin(d.origin) !== target);

    await chrome.storage.local.set({
        [STORAGE_KEYS.CONNECTED_DAPPS]: filtered
    });
}

/**
 * Update last used timestamp for dApp
 */
export async function updateDappUsage(origin: string): Promise<void> {
    const dapps = await getConnectedDapps();
    const target = normalizeOrigin(origin);
    const dapp = dapps.find(d => normalizeOrigin(d.origin) === target);

    if (dapp) {
        dapp.lastUsed = Date.now();
        await chrome.storage.local.set({
            [STORAGE_KEYS.CONNECTED_DAPPS]: dapps
        });
    }
}

/**
 * Disconnect all dApps
 */
export async function disconnectAllDapps(): Promise<void> {
    await chrome.storage.local.set({
        [STORAGE_KEYS.CONNECTED_DAPPS]: []
    });
}
