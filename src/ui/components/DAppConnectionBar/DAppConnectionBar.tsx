import React from 'react';
import { useActiveTabConnection } from '../../hooks/useActiveTabConnection';
import * as styles from './DAppConnectionBar.css';
import { notify } from '../../../lib/toast';

export const DAppConnectionBar: React.FC = () => {
    const { status, disconnect } = useActiveTabConnection();

    const displayStatus = status || {
        origin: '',
        favicon: '',
        isConnected: false
    };

    const handleDisconnect = () => {
        disconnect();
        notify.success(`Disconnected from ${displayStatus.origin}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.appInfo}>
                <div className={styles.faviconContainer}>
                    {displayStatus.favicon ? (
                        <img src={displayStatus.favicon} alt="icon" className={styles.favicon} />
                    ) : (
                        <span>🌐</span>
                    )}
                </div>
                <div className={styles.domainInfo}>
                    <div className={styles.domainName}>{displayStatus.origin.replace(/^https?:\/\//, '')}</div>
                    <div className={styles.connectionStatus}>
                        <div className={`${styles.statusDot} ${displayStatus.isConnected ? styles.connected : ''}`}></div>
                        <span>{displayStatus.isConnected ? 'Connected' : 'Not Connected'}</span>
                    </div>
                </div>
            </div>

            {displayStatus.isConnected && (
                <button
                    className={styles.disconnectButton}
                    onClick={handleDisconnect}
                    title="Disconnect"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};
