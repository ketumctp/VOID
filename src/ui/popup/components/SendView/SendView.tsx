/**
 * SendView Component - Rialo Wallet
 */
import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { notify } from '../../../../lib/toast';
import type { TokenInfo } from '../../../../shared/types';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import * as styles from './SendView.css';
import { validatePubkey, validateLamports } from '../../../../shared/rialo-api-types';
import { LAMPORTS_PER_SOL, SOL_SYMBOL } from '../../../../shared/rialo-core';

// Simple Chevron Icon
const ChevronDown = ({ style }: { style?: string }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={style}
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

interface SendViewProps {
    onBack: () => void;
    onNext: () => void;
    tokens: TokenInfo[];
    amount: string;
    recipient: string;
    selectedAsset: TokenInfo | null;
    setAmount: (val: string) => void;
    setRecipient: (val: string) => void;
    setAsset: (token: TokenInfo | null) => void;
    nativeBalance: string;
    isAssetFixed: boolean;
}

export const SendView: React.FC<SendViewProps> = ({
    onBack, onNext, tokens, amount, recipient, selectedAsset,
    setAmount, setRecipient, setAsset, nativeBalance, isAssetFixed
}) => {
    const [error, setError] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSend = () => {
        if (!amount || !recipient) {
            setError('Amount and recipient are required');
            notify.error('Please fill all fields');
            return;
        }

        // Strict Validation (Rialo)
        try {
            validatePubkey(recipient);
        } catch (e: any) {
            setError(e.message);
            notify.error('Invalid recipient address');
            return;
        }

        try {
            const amountNum = parseFloat(amount);
            if (isNaN(amountNum) || amountNum <= 0) throw new Error('Invalid amount');

            // Convert to lamports for validation check
            // Note: BigInt conversion from float can be imprecise, this is a basic check.
            const lamports = BigInt(Math.floor(amountNum * LAMPORTS_PER_SOL));
            validateLamports(lamports);
        } catch (e: any) {
            setError(e.message);
            notify.error('Invalid amount: ' + e.message);
            return;
        }

        setError('');
        onNext();
    };

    const formatTokenBalance = (token: TokenInfo) => {
        const balance = token.balance;
        if (balance === 0) return '0';
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0
        }).format(balance);
    };

    const isNative = !selectedAsset;
    const symbol = isNative ? SOL_SYMBOL : (selectedAsset?.symbol || 'Token');

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Toaster />

            <Header
                title={`Send ${symbol}`}
                onBack={onBack}
            />

            <div className={styles.content}>
                {error && <div className={styles.errorMsg}>{error}</div>}

                {/* Asset Selection */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>Asset</label>
                    <div className={styles.relativeContainer}>
                        <button
                            onClick={() => !isAssetFixed && setDropdownOpen(!dropdownOpen)}
                            className={styles.assetSelectorTrigger}
                            disabled={isAssetFixed}
                            type="button"
                        >
                            <div className={styles.assetIcon}>
                                {isNative ? (
                                    <img src="/TOKEN/RIALO.png" alt={SOL_SYMBOL} className={styles.assetIconImg} />
                                ) : (
                                    selectedAsset?.logoURI ?
                                        <img src={selectedAsset.logoURI} alt={symbol} className={styles.assetIconImg} /> :
                                        <span>{symbol[0]}</span>
                                )}
                            </div>
                            <div className={styles.assetInfo}>
                                <div className={styles.assetSymbol}>{symbol}</div>
                                <div className={styles.assetBalance}>
                                    Balance: {isNative ? nativeBalance : formatTokenBalance(selectedAsset!)}
                                </div>
                            </div>
                            {!isAssetFixed && (
                                <div style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                                    <ChevronDown />
                                </div>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                {/* Native Option */}
                                <button
                                    onClick={() => { setAsset(null); setDropdownOpen(false); }}
                                    className={styles.dropdownItem}
                                    data-selected={isNative}
                                    type="button"
                                >
                                    <div className={styles.assetIcon}>
                                        <img src="/TOKEN/RIALO.png" alt="RIALO" className={styles.assetIconImg} />
                                    </div>
                                    <div className={styles.assetInfo}>
                                        <div className={styles.assetSymbol}>{SOL_SYMBOL}</div>
                                        <div className={styles.assetBalance}>{nativeBalance} {SOL_SYMBOL}</div>
                                    </div>
                                </button>

                                {/* SPL Options */}
                                {tokens.map((token: TokenInfo) => (
                                    <button
                                        key={token.mint}
                                        onClick={() => { setAsset(token); setDropdownOpen(false); }}
                                        className={styles.dropdownItem}
                                        data-selected={selectedAsset?.mint === token.mint}
                                        type="button"
                                    >
                                        <div className={styles.assetIcon}>
                                            {token.logoURI ?
                                                <img src={token.logoURI} alt={token.symbol} className={styles.assetIconImg} /> :
                                                <span>{token.symbol?.[0]}</span>
                                            }
                                        </div>
                                        <div className={styles.assetInfo}>
                                            <div className={styles.assetSymbol}>{token.symbol || 'Unknown'}</div>
                                            <div className={styles.assetBalance}>{formatTokenBalance(token)} {token.symbol}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recipient Input */}
                <div className={styles.formGroup}>
                    <Input
                        label="Recipient Address"
                        placeholder="Public Key (Base58)"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                    />
                </div>

                {/* Amount Input */}
                <div className={styles.formGroup}>
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>

                <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSend}
                    size="lg"
                    style={{ marginTop: '16px' }}
                >
                    Send Transaction
                </Button>
            </div>
        </div>
    );
};

export default SendView;
