import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/ui/Header';
import { GlobeIcon } from '@/components/ui/icons/globe';
import { notify } from '../../../../lib/toast';
import * as styles from './ConnectedSitesView.css';

interface ConnectedSitesViewProps {
    onBack: () => void;
}

export const ConnectedSitesView: React.FC<ConnectedSitesViewProps> = ({ onBack }) => {
    const [connectedOrigins, setConnectedOrigins] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConnectedSites = () => {
        setLoading(true);
        chrome.runtime.sendMessage({ type: 'GET_CONNECTED_DAPPS' }, (response) => {
            if (response && response.success) {
                // Fix: Backend returns ConnectedDapp[] directly in data
                const data = response.data;
                if (Array.isArray(data)) {
                    // Map ConnectedDapp objects to origin strings
                    const origins = data.map((d: any) => d.origin || d);
                    setConnectedOrigins(origins);
                } else if (data?.connectedOrigins) {
                    // Fallback for previous structure
                    setConnectedOrigins(data.connectedOrigins);
                }
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchConnectedSites();
    }, []);

    const handleDisconnect = async (origin: string) => {
        // Optimistic update
        setConnectedOrigins(prev => prev.filter(o => o !== origin));
        notify.success(`Disconnected from ${new URL(origin).hostname}`);

        chrome.runtime.sendMessage({
            type: 'DISCONNECT_DAPP',
            origin
        }, (response) => {
            if (!response || !response.success) {
                // Revert on failure
                fetchConnectedSites();
                notify.error('Failed to disconnect');
            }
        });
    };

    const getFaviconUrl = (origin: string) => {
        try {
            const url = new URL(origin);
            return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
        } catch {
            return '';
        }
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Header title="Connected Sites" onBack={onBack} />

            <div className={styles.content}>
                {loading ? (
                    <div className="spinner" style={{ margin: 'auto' }} />
                ) : connectedOrigins.length === 0 ? (
                    <div className={styles.emptyState}>
                        <GlobeIcon size={48} color="var(--text-muted)" />
                        <div>No connected sites found</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-2)' }}>
                            Connect to dApps to see them listed here.
                        </div>
                    </div>
                ) : (
                    <div className={styles.listContainer}>
                        {connectedOrigins.map((origin) => {
                            let hostname = origin;
                            try { hostname = new URL(origin).hostname; } catch { }

                            return (
                                <div key={origin} className={styles.siteItem}>
                                    <div className={styles.siteInfo}>
                                        <img
                                            src={getFaviconUrl(origin)}
                                            alt="Icon"
                                            className={styles.siteFavicon}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div className={styles.siteName}>{hostname}</div>
                                            <div className={styles.siteOrigin}>{origin}</div>
                                        </div>
                                    </div>
                                    <button
                                        className={styles.disconnectButton}
                                        onClick={() => handleDisconnect(origin)}
                                        title="Disconnect"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
