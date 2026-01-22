import { useState, useEffect } from 'react';
import { notify } from '../../../lib/toast';

export type ViewState =
    | null
    | 'welcome'
    | 'create'
    | 'dashboard'
    | 'locked'
    | 'send'
    | 'receive'
    | 'confirm'
    | 'success'
    | 'settings'
    | 'security_phrase'
    | 'security_key'
    | 'import_token'
    | 'token_detail'
    | 'connect_request'
    | 'sign_request'
    | 'connected_sites';

export const useNavigation = (wallet: any, loading: boolean) => {
    const [view, setView] = useState<ViewState | null>(null);
    const [connectRequest, setConnectRequest] = useState<{ origin: string, requestId: string } | null>(null);
    const [signRequest, setSignRequest] = useState<{ requestId: string, signType: string, origin: string } | null>(null);

    // Determines initial view based on wallet state
    useEffect(() => {
        if (!loading && wallet) {
            if (wallet.hasWallet) {
                if (wallet.isLocked) {
                    setView('locked');
                } else {
                    setView((prevView) => {
                        // Don't override request views if already set by listener
                        if (prevView === 'connect_request' || prevView === 'sign_request') return prevView;
                        return 'dashboard';
                    });
                }
            } else {
                setView('welcome');
            }
        }
    }, [loading, wallet?.hasWallet, wallet?.isLocked]);

    // Force Full-Page Onboarding if no wallet - REMOVED per user feedback
    // The popup is sufficient for onboarding.
    useEffect(() => {
        // Legacy redirection logic removed.
    }, []);

    // Listener for Side Panel Delegation
    useEffect(() => {
        const messageListener = (message: any, _sender: any, sendResponse: any) => {
            if (message.type === 'CHECK_SIDEPANEL_ACTIVE') {
                sendResponse({ active: true });
                return true;
            }
            if (message.type === 'OPEN_CONNECT_VIEW') {
                console.log('Received connection request in Side Panel:', message);
                setConnectRequest({ origin: message.origin, requestId: message.requestId });
                setView('connect_request');
            }
            if (message.type === 'OPEN_SIGN_VIEW') {
                console.log('Received sign request in Side Panel:', message);
                setSignRequest({ requestId: message.requestId, signType: message.signType, origin: message.origin });
                setView('sign_request');
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, []);

    const handleLock = () => {
        chrome.runtime.sendMessage({ type: 'LOCK_WALLET', id: Date.now().toString() }, () => {
            chrome.storage.local.set({ unlocked: false });
            notify.success('Wallet locked');
            setView('locked');
        });
    };

    return {
        view,
        setView,
        connectRequest,
        signRequest,
        handleLock
    };
};
