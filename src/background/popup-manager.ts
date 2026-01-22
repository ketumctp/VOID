/**
 * Popup Manager - Manages extension popup windows
 * Enforces single-window policy to prevent focus stealing and race conditions.
 */

interface PopupState {
    id: number;
    type: 'dapp_connect' | 'transaction' | 'other';
    timestamp: number;
}

const STORAGE_KEY = 'rialo_active_popup';

// Listen for window removal to clear state
chrome.windows.onRemoved.addListener(async (windowId) => {
    try {
        const stored = await chrome.storage.session.get(STORAGE_KEY);
        const activePopup = stored[STORAGE_KEY] as PopupState | null;

        if (activePopup && activePopup.id === windowId) {
            console.log('[Rialo] Active popup closed:', windowId);
            await chrome.storage.session.remove(STORAGE_KEY);
        }
    } catch (e) {
        console.error('Error in window removal listener:', e);
    }
});

export const popupManager = {
    /**
     * Get active popup state
     */
    async getActivePopup(): Promise<PopupState | null> {
        const stored = await chrome.storage.session.get(STORAGE_KEY);
        return (stored[STORAGE_KEY] as PopupState) || null;
    },

    /**
     * Open a new popup if none exists. Rejects if one is already open.
     */
    async openPopup(url: string, type: 'dapp_connect' | 'transaction' | 'other', width = 420, height = 600): Promise<chrome.windows.Window> {
        const activePopup = await this.getActivePopup();

        if (activePopup) {
            // Check if window actually exists (integrity check)
            try {
                await chrome.windows.get(activePopup.id);
                // If we get here, window exists. Reject new request.
                await chrome.windows.update(activePopup.id, { focused: true });
                throw new Error('Wallet is busy. Please complete the pending request first.');
            } catch (e) {
                // Window doesn't exist, clear stale state
                await chrome.storage.session.remove(STORAGE_KEY);
            }
        }

        return new Promise((resolve, reject) => {
            chrome.windows.create({
                url,
                type: 'popup',
                width,
                height,
                focused: true
            }, async (window) => {
                if (window && window.id) {
                    const newState: PopupState = {
                        id: window.id,
                        type,
                        timestamp: Date.now()
                    };
                    await chrome.storage.session.set({ [STORAGE_KEY]: newState });
                    resolve(window);
                } else {
                    reject(new Error('Failed to create popup window'));
                }
            });
        });
    },

    /**
     * Close the active popup
     */
    async closePopup() {
        const activePopup = await this.getActivePopup();
        if (activePopup) {
            try {
                await chrome.windows.remove(activePopup.id);
            } catch (e) {
                // Ignore if already closed
            }
            await chrome.storage.session.remove(STORAGE_KEY);
        }
    },

    /**
     * Check if a popup is currently open
     */
    async isPopupOpen(): Promise<boolean> {
        const activePopup = await this.getActivePopup();
        return activePopup !== null;
    }
};
