import { useState } from 'react';
import type { TokenInfo } from '../../../shared/types';

export const useSendFlow = () => {
    const [sendAmount, setSendAmount] = useState('');
    const [sendRecipient, setSendRecipient] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<TokenInfo | null>(null); // null = Native Rialo
    const [isAssetFixed, setIsAssetFixed] = useState(false);
    const [lastSignature, setLastSignature] = useState('');

    const resetSendFlow = () => {
        setSendAmount('');
        setSendRecipient('');
        setSelectedAsset(null);
        setIsAssetFixed(false);
        setLastSignature('');
    };

    return {
        sendAmount,
        setSendAmount,
        sendRecipient,
        setSendRecipient,
        selectedAsset,
        setSelectedAsset,
        isAssetFixed,
        setIsAssetFixed,
        lastSignature,
        setLastSignature,
        resetSendFlow
    };
};
