import { useState, useEffect } from 'react';

interface TabConnectionStatus {
    url: string;
    origin: string;
    favicon: string;
    isConnected: boolean;
    title: string;
}

export const useActiveTabConnection = () => {
    const [status, setStatus] = useState<TabConnectionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const checkStatus = () => {
        // Query active tab using chrome.tabs API
        // Use lastFocusedWindow to work correctly in Side Panel and Popup
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs.length === 0 || !tabs[0].url) {
                setLoading(false);
                return;
            }

            const tab = tabs[0];
            const url = new URL(tab.url || '');
            // Only care about http/https
            if (!url.protocol.startsWith('http')) {
                setStatus(null);
                setLoading(false);
                return;
            }

            const origin = url.origin;

            // Ask background if this origin is connected
            chrome.runtime.sendMessage({
                type: 'CHECK_CONNECTION_STATUS',
                origin: origin
            }, (response) => {
                setStatus({
                    url: tab.url || '',
                    origin: origin,
                    favicon: tab.favIconUrl || '',
                    title: tab.title || '',
                    isConnected: response?.data?.isConnected || false
                });
                setLoading(false);
            });
        });
    };

    useEffect(() => {
        checkStatus();

        // Poll every 2 seconds to keep sync
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const disconnect = () => {
        if (!status) return;
        chrome.runtime.sendMessage({
            type: 'DISCONNECT_ORIGIN',
            origin: status.origin
        }, (response) => {
            if (response?.success) {
                checkStatus(); // Refresh immediately
            }
        });
    };

    return { status, loading, disconnect };
};
