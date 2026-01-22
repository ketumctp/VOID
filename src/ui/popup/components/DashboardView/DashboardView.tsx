/**
 * DashboardView Component - Rialo Wallet
 * Halaman utama wallet dengan balance, actions, dan token list
 */
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon } from '@/components/ui/icons/arrow-up';
import { ArrowDownIcon } from '@/components/ui/icons/arrow-down';
import { DropletIcon } from '@/components/ui/icons/droplet';

import { TransactionList, type Transaction } from '@/components/TransactionList';
import type { TokenInfo } from '../../../../shared/types';
import { Logo } from '@/components/ui/Logo';
import { DAppConnectionBar } from '../../../components/DAppConnectionBar/DAppConnectionBar';
import * as styles from './DashboardView.css';
import { SOL_SYMBOL } from '../../../../shared/rialo-core';

// =============================================================================
// TYPES
// =============================================================================
interface DashboardViewProps {
    wallet: any;
    loading: boolean;
    isRefreshing: boolean;
    refreshState: () => void;
    setView: (view: any) => void;
    onSendClick: () => void;

    handleLock: () => void;
    tokens: TokenInfo[];
    transactions: Transaction[];
    setSelectedAsset: (token: TokenInfo | null) => void;
    isSidePanel?: boolean;

}

// =============================================================================
// ICON COMPONENTS
// =============================================================================
const NavHomeIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const NavSettingsIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export const DashboardView: React.FC<DashboardViewProps> = ({
    wallet,
    loading,
    setView,
    onSendClick,

    tokens,
    transactions,
    setSelectedAsset,
    isSidePanel
}) => {
    const [activeTab, setActiveTab] = useState<'tokens' | 'activity'>('tokens');
    const [navTab, setNavTab] = useState<'home' | 'settings'>('home');

    // ... (format functions unchanged)

    const formatTokenBalance = (token: TokenInfo) => {
        const balance = token.balance;
        if (balance === 0) return '0';
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0
        }).format(balance);
    };

    const formatNativeBalance = () => {
        if (!wallet?.balance) return '0.00';
        return parseFloat((parseInt(wallet.balance) / 1_000_000_000).toFixed(4));
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <div className={styles.mobileWrapper}>
                <DAppConnectionBar />
                <Toaster />

                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.logoGroup}>
                        <Logo variant="lockup" size={110} />
                    </div>
                    <div className={styles.networkBadge}>RIALO DEVNET</div>
                    {!isSidePanel && (
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                marginLeft: '8px'
                            }}
                            title="Open in Side Panel"
                            onClick={() => {
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
                                }
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                            </svg>
                        </button>
                    )}
                </header>

                {/* Balance Section */}
                <section className={styles.balanceSection}>
                    <div className={styles.balanceLabel}>Total Balance</div>
                    {loading && !wallet?.balance ? (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Skeleton width="120px" height="3rem" />
                        </div>
                    ) : (
                        <div className={styles.balanceAmount}>
                            {formatNativeBalance()}
                            <span className={styles.balanceSymbol}>{SOL_SYMBOL}</span>
                        </div>
                    )}
                </section>

                {/* Action Buttons */}
                <div className={styles.actionsRow}>
                    <div className={styles.actionButton}>
                        <button className={styles.actionCircle} onClick={() => setView('receive')}>
                            <ArrowDownIcon size={24} />
                        </button>
                        <span className={styles.actionLabel}>Receive</span>
                    </div>

                    <div className={styles.actionButton}>
                        <button className={styles.actionCircle} onClick={onSendClick}>
                            <ArrowUpIcon size={24} />
                        </button>
                        <span className={styles.actionLabel}>Send</span>
                    </div>

                    <div className={styles.actionButton}>
                        <button
                            className={styles.actionCircle}
                            onClick={() => window.open('https://faucet.rialo-community.xyz/', '_blank')}
                        >
                            <DropletIcon size={24} />
                        </button>
                        <span className={styles.actionLabel}>Faucet</span>
                    </div>
                </div>

                {/* Content Area with Tabs */}
                <div className={styles.contentArea}>
                    <div className={styles.tabsRow}>
                        <button
                            className={styles.tab}
                            data-active={activeTab === 'tokens'}
                            onClick={() => setActiveTab('tokens')}
                        >
                            Tokens
                        </button>
                        <button
                            className={styles.tab}
                            data-active={activeTab === 'activity'}
                            onClick={() => setActiveTab('activity')}
                        >
                            Activity
                        </button>
                    </div>

                    {activeTab === 'tokens' && (
                        <div className={styles.tokenList}>
                            {/* Native Token */}
                            <div
                                className={styles.tokenItem}
                                onClick={() => { setSelectedAsset(null); setView('token_detail'); }}
                            >
                                <div className={styles.tokenInfo}>
                                    <div className={styles.tokenIcon}>
                                        <img
                                            src="/TOKEN/RIALO.png"
                                            alt="RIALO"
                                            className={styles.tokenIconImg}
                                        />
                                    </div>
                                    <div>
                                        <div className={styles.tokenName}>{SOL_SYMBOL}</div>
                                        <div className={styles.tokenType}>Native Token</div>
                                    </div>
                                </div>
                                <div className={styles.tokenBalance}>
                                    {formatNativeBalance()}
                                </div>
                            </div>

                            {/* SPL Tokens */}
                            {tokens.map((token: TokenInfo) => (
                                <div
                                    key={token.mint}
                                    className={styles.tokenItem}
                                    onClick={() => { setSelectedAsset(token); setView('token_detail'); }}
                                >
                                    <div className={styles.tokenInfo}>
                                        <div className={styles.tokenIcon}>
                                            {token.logoURI ? (
                                                <img
                                                    src={token.logoURI}
                                                    alt={token.symbol || 'Token'}
                                                    className={styles.tokenIconImg}
                                                />
                                            ) : (
                                                <span>{token.symbol?.[0]}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className={styles.tokenName}>
                                                {token.symbol || 'Unknown'}
                                            </div>
                                            <div className={styles.tokenType}>SPL Token</div>
                                        </div>
                                    </div>
                                    <div className={styles.tokenBalance}>
                                        {formatTokenBalance(token)}
                                    </div>
                                </div>
                            ))}

                            {/* Import Button */}
                            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                <button
                                    className={styles.importButton}
                                    onClick={() => setView('import_token')}
                                >
                                    + Import Token
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && <TransactionList transactions={transactions} />}
                </div>

                {/* Bottom Navigation */}
                <nav className={styles.bottomNav}>
                    <button
                        className={styles.navItem}
                        data-active={navTab === 'home'}
                        onClick={() => setNavTab('home')}
                    >
                        <NavHomeIcon active={navTab === 'home'} />
                        <span className={styles.navLabel}>Home</span>
                    </button>
                    <button
                        className={styles.navItem}
                        data-active={navTab === 'settings'}
                        onClick={() => { setNavTab('settings'); setView('settings'); }}
                    >
                        <NavSettingsIcon active={navTab === 'settings'} />
                        <span className={styles.navLabel}>Settings</span>
                    </button>
                </nav>
            </div>
        </div>
    );
};

export default DashboardView;
