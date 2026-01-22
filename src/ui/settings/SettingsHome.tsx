/**
 * SettingsHome Component - Rialo Wallet
 */
import React from 'react';
import { Header } from '../components/ui/Header';
import { LockIcon } from '@/components/ui/icons/lock';
import { ChevronRightIcon } from '@/components/ui/icons/chevron-right';
import { TrashIcon } from '@/components/ui/icons/trash';
import { KeyIcon } from '@/components/ui/icons/key';
import { ShieldIcon } from '@/components/ui/icons/shield';
import { GlobeIcon } from '@/components/ui/icons/globe';
import * as styles from './SettingsHome.css';

interface SettingsHomeProps {
    onBack: () => void;
    onNavigate: (view: string) => void;
    onLock: () => void;
    onReset: () => void;
}

export const SettingsHome: React.FC<SettingsHomeProps> = ({ onBack, onNavigate, onLock, onReset }) => {
    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Header title="Settings" onBack={onBack} />

            <div className={styles.content}>
                <div className={styles.sectionTitle}>Security</div>

                <button
                    onClick={() => onNavigate('security_phrase')}
                    className={styles.menuItem}
                >
                    <div className={styles.menuItemGroup}>
                        <div className={styles.iconBox}>
                            <ShieldIcon size={18} />
                        </div>
                        <div className={styles.menuContent}>
                            <div className={styles.menuLabel}>Secret Phrase</div>
                            <div className={styles.menuDescription}>View your 12-word recovery phrase</div>
                        </div>
                    </div>
                    <ChevronRightIcon size={18} color="var(--text-muted)" />
                </button>

                <button
                    onClick={() => onNavigate('security_key')}
                    className={styles.menuItem}
                >
                    <div className={styles.menuItemGroup}>
                        <div className={styles.iconBox}>
                            <KeyIcon size={18} />
                        </div>
                        <div className={styles.menuContent}>
                            <div className={styles.menuLabel}>Private Key</div>
                            <div className={styles.menuDescription}>Export your private key</div>
                        </div>
                    </div>
                    <ChevronRightIcon size={18} color="var(--text-muted)" />
                </button>

                <div className={styles.spacer} />

                <div className={styles.sectionTitle}>Connections</div>

                <button
                    onClick={() => onNavigate('connected_sites')}
                    className={styles.menuItem}
                >
                    <div className={styles.menuItemGroup}>
                        <div className={styles.iconBox}>
                            <GlobeIcon size={18} />
                        </div>
                        <div className={styles.menuContent}>
                            <div className={styles.menuLabel}>Connected Sites</div>
                            <div className={styles.menuDescription}>Manage connected dApps</div>
                        </div>
                    </div>
                    <ChevronRightIcon size={18} color="var(--text-muted)" />
                </button>

                <div className={styles.spacer} />

                <div className={styles.sectionTitle}>Session</div>

                <button
                    onClick={onLock}
                    className={styles.menuItem}
                >
                    <div className={styles.menuItemGroup}>
                        <div className={styles.iconBox}>
                            <LockIcon size={18} />
                        </div>
                        <span className={styles.menuLabel}>Lock Wallet</span>
                    </div>
                </button>

                <button
                    onClick={onReset}
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                >
                    <div className={styles.menuItemGroup}>
                        <div className={`${styles.iconBox} ${styles.iconBoxDanger}`}>
                            <TrashIcon size={18} />
                        </div>
                        <span className={styles.menuLabel}>Reset Wallet</span>
                    </div>
                </button>

                <div className={styles.footer}>
                    <p className={styles.versionText}>VOID - Experimental Build v1.0.0-beta</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsHome;
