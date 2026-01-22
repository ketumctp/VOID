/**
 * Wallet Messenger
 * Handles window.postMessage communication with persistence and correlation
 */

export class WalletMessenger {
    /**
     * Send message to content script and await response
     */
    sendMessage(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const handler = (event: MessageEvent) => {
                if (event.source !== window) return;
                const data = event.data;

                // Ignore own outgoing messages (which don't have _RESPONSE suffix)
                if (data.id === id && data.type?.endsWith('_RESPONSE')) {
                    window.removeEventListener('message', handler);

                    if (data.success) {
                        resolve(data.result);
                    } else {
                        reject(new Error(data.error || 'Request failed'));
                    }
                }
            };

            window.addEventListener('message', handler);

            window.postMessage({ ...message, id }, '*');

            // Timeout after 1 hour (practically infinite for user interaction)
            setTimeout(() => {
                window.removeEventListener('message', handler);
                reject(new Error('Request timeout'));
            }, 3600000);
        });
    }

    /**
     * Setup persistent message listener for events
     */
    setupListener(callback: (data: any) => void): void {
        window.addEventListener('message', (event) => {
            if (event.source !== window) return;
            // Filter for relevant wallet events
            if (event.data?.type?.startsWith('RIALO_WALLET_')) {
                callback(event.data);
            }
        });
    }
}
