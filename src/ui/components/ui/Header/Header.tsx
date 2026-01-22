/**
 * Header Component - Rialo Wallet
 */
import React from 'react';
import { ArrowLeftIcon } from '@/components/ui/icons/arrow-left';
import * as styles from './Header.css';

interface HeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
    return (
        <header className={styles.header}>
            {/* Left side - Back button */}
            <div className={styles.leftSection}>
                {onBack && (
                    <button
                        onClick={onBack}
                        className={styles.backButton}
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon size={20} />
                    </button>
                )}
            </div>

            {/* Center - Title */}
            <div className={styles.centerSection}>
                <h2 className={styles.title}>{title}</h2>
            </div>

            {/* Right side - Optional action */}
            {/* Right side - Optional action */}
            {/* Right side - Optional action */}
            <div className={styles.rightSection}>
                {rightAction}
                <button
                    className={styles.iconButton}
                    title="Open in Side Panel"
                    onClick={() => {
                        // Strict check for Side Panel API
                        // @ts-ignore
                        if (chrome.sidePanel && typeof chrome.sidePanel.open === 'function') {
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                                if (tabs[0]?.windowId) {
                                    // @ts-ignore
                                    chrome.sidePanel.open({ windowId: tabs[0].windowId })
                                        .catch((err: any) => console.error('SidePanel Error:', err));
                                    window.close();
                                }
                            });
                        } else {
                            console.error('Side Panel API not available');
                        }
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                </button>
            </div>
        </header>
    );
};
