/**
 * ImportTokenView Component - Rialo Wallet
 */
import React, { useState } from 'react';
import { notify } from '../../../../lib/toast';
import { Header } from '../../../components/ui/Header';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import * as styles from './ImportTokenView.css';

interface ImportTokenViewProps {
    onBack: () => void;
    onSuccess: () => void;
}

export const ImportTokenView: React.FC<ImportTokenViewProps> = ({ onBack, onSuccess }) => {
    const [mintAddress, setMintAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImport = () => {
        if (!mintAddress) return;
        setLoading(true);
        const toastId = notify.loading('Sedang mengimpor token...');

        chrome.runtime.sendMessage({
            type: 'ADD_TOKEN',
            mint: mintAddress,
            id: Date.now().toString()
        }, (response: any) => {
            notify.dismiss(toastId);
            setLoading(false);
            if (response && response.success) {
                notify.success('Token berhasil diimpor');
                onSuccess();
            } else {
                notify.error(response.error || 'Gagal mengimpor token.');
            }
        });
    };

    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            <Header title="Impor Token" onBack={onBack} />

            <div className={styles.content}>
                <Input
                    label="Alamat Mint Token"
                    placeholder="Masukkan Alamat Mint Solana"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    disabled={loading}
                />

                <div className={styles.tipBox}>
                    <p className={styles.tipText}>
                        Tip: Anda dapat menemukan alamat mint di Solana Explorer atau Solscan. Pastikan Anda mempercayai token tersebut sebelum mengimpor.
                    </p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleImport}
                        disabled={loading || !mintAddress}
                    >
                        {loading ? 'Memproses...' : 'Impor Token'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportTokenView;
