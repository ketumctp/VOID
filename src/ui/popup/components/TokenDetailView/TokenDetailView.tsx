/**
 * TokenDetailView Component - Rialo Wallet
 */
import React from 'react';
import { Header } from '../../../components/ui/Header';
import { ArrowUpIcon } from '@/components/ui/icons/arrow-up';
import { ArrowDownIcon } from '@/components/ui/icons/arrow-down';
import type { TokenInfo } from '../../../../shared/types';
import * as styles from './TokenDetailView.css';

interface TokenDetailViewProps {
    token: TokenInfo | null; // null = Native RIALO
    wallet: any;
    onBack: () => void;
    onSend: () => void;
    onReceive: () => void;
}

export const TokenDetailView: React.FC<TokenDetailViewProps> = ({
    token,
    wallet,
    onBack,
    onSend,
    onReceive
}) => {
    // Determine Display Data
    const isNative = !token;
    const symbol = isNative ? 'RIALO' : (token?.symbol || 'Unknown');
    const balance = isNative
        ? (wallet?.balance ? parseFloat((parseInt(wallet.balance) / 1_000_000_000).toFixed(4)) : '0.00')
        : (token?.balance ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(token.balance) : '0');

    // Use token logo or fallback
    const renderLogo = () => {
        if (isNative) {
            return <img src="/TOKEN/RIALO.png" alt="RIALO" className={styles.logoImg} />;
        }
        if (token?.logoURI) {
            return <img src={token.logoURI} alt={symbol} className={styles.logoImg} />;
        }
        return <div className={styles.logoFallback}>{symbol[0]}</div>;
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Header title={symbol} onBack={onBack} />

            {/* Main Content */}
            <div className={styles.content}>
                <div className={styles.logoWrapper}>
                    <div className={styles.logoContainer}>
                        {renderLogo()}
                    </div>
                </div>

                <div className={styles.balanceWrapper}>
                    <div className={styles.balanceAmount}>
                        {balance} {symbol}
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actionsRow}>
                    <div className={styles.actionButton}>
                        <button className={styles.actionCircle} onClick={onReceive}>
                            <ArrowDownIcon size={24} />
                        </button>
                        <span className={styles.actionLabel}>Receive</span>
                    </div>

                    <div className={styles.actionButton}>
                        <button className={styles.actionCircle} onClick={onSend}>
                            <ArrowUpIcon size={24} />
                        </button>
                        <span className={styles.actionLabel}>Send</span>
                    </div>
                </div>
            </div>

            {/* Token Info (Optional) */}
            {!isNative && token && (
                <div className={styles.infoSection}>
                    <div className={styles.infoLabel}>Mint Address</div>
                    <div className={styles.infoValue}>
                        <a
                            href={`https://explorer.rialo-community.xyz/token/${token.mint}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                        >
                            {token.mint} ↗
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TokenDetailView;
