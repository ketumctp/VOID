import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { notify } from '../../lib/toast';

import '../../ui/styles/global.css.ts';
import { darkTheme } from '../../ui/styles/theme.css';

// Imported Views
import { WelcomeView } from './components/WelcomeView';
import { CreateWalletView } from './components/CreateWalletView';
import { LockedView } from './components/LockedView';
import { ReceiveView } from './components/ReceiveView';
import { SendView } from './components/SendView';
import { ConfirmView } from './components/ConfirmView';
import { SuccessView } from './components/SuccessView';
import { ConnectRequestView } from './components/ConnectRequestView/ConnectRequestView';
import { SignRequestView } from './components/SignRequestView/SignRequestView';
import { DashboardView } from './components/DashboardView';
import { ImportTokenView } from './components/ImportTokenView';
import { TokenDetailView } from './components/TokenDetailView';
import { ConnectedSitesView } from './components/ConnectedSitesView/ConnectedSitesView';
import { SettingsHome } from '@/ui/settings/SettingsHome';
import { SecurityView } from '@/ui/settings/SecurityView';

// Hooks
import { useWalletState } from './hooks/useWalletState';
import { useNavigation } from './hooks/useNavigation';
import { useSendFlow } from './hooks/useSendFlow';

const Popup = () => {
    useEffect(() => {
        // Apply theme to body
        document.body.classList.add(darkTheme);

        // Access the environment check
        const isSidePanel = typeof window !== 'undefined' &&
            (window.location.search.includes('type=side_panel') || window.innerWidth > 400);

        if (isSidePanel) {
            document.body.classList.add('responsive-width');
            document.documentElement.classList.add('responsive-width');
        }
    }, []);

    // Hooks initialization
    // We need 'view' for wallet state polling optimization
    // But 'view' comes from useNavigation which needs 'wallet' state
    // To solve circular dependency:
    // 1. Init wallet state (loading, wallet object) independently using internal 'view' tracking or always poll on interval if unlocked
    // For now, I'll pass a dummy or refactor to let useNavigation control view and pass it to useWalletState

    // Problem: useNavigation sets 'view' based on 'wallet.hasWallet/isLocked'.
    // Solution:
    // useWalletState fetches the data.
    // useNavigation observes the data and decides the route.
    // useWalletState creates the polling effect based on the view passed to it.

    // Let's instantiate useWalletState first, but we can't pass 'view' yet.
    // Actually useWalletState needs 'view' prop for the polling effect [view === 'dashboard'].
    // We can lift the 'view' state up? No, useNavigation owns it.
    // We can modify useWalletState to accept 'view' as an argument that changes?
    // Yes, but we need to declare hooks in order.

    // WORKAROUND: We'll modify useNavigation to expose view, and useWalletState will take it.
    // But we need wallet data for useNavigation initial effect.
    // This is fine:
    // 1. useWalletState loads initial data (doesn't need view for initial load).
    // 2. useNavigation uses that initial data to set View.
    // 3. We pass the resulting View back to useWalletState (via function or effect? No, hooks rules).

    // Better: Split polling to a separate component/effect in the body?
    // Or just pass the view to a `usePolling` hook later.

    // Let's separate basic state from polling.
    // Actually, I can just use a simpler approach:
    // useWalletState returns { ... } and has an internal effect that depends on an external 'shouldPoll' param?
    // Or I just extract the polling effect to here in the main component.

    // Let's stick to the generated hooks but fix the polling dependency.
    // I'll instantiate hooks in order, but separate the polling effect.

    const {
        loading,
        wallet,
        tokens,
        transactions,
        refreshState, // Used by views to refresh data
        refreshBalance // Used by polling
    } = useWalletState('dummy'); // We'll handle polling manually here or in a separate effect

    const {
        view,
        setView,
        connectRequest,
        signRequest,
        handleLock
    } = useNavigation(wallet, loading);

    const {
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
    } = useSendFlow();

    // Manual Polling Effect (Moved from inside hook to here to resolve dependency)
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (view === 'dashboard' && !loading) {
            // Poll every 5 seconds
            intervalId = setInterval(() => {
                refreshBalance();
            }, 5000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [view, loading]);

    // VIEW RENDERING

    // SPLASH SCREEN
    // Show splash if loading OR if view hasn't been determined yet
    if ((loading && !wallet) || view === null) {
        return (
            <div className="container animate-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--bg-background)'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <img src="/logo/icon-128.png" alt="Void" style={{ width: 80, height: 80 }} />
                </div>
                <div className="spinner" style={{ width: '2rem', height: '2rem', borderTopColor: 'var(--primary)' }}></div>
            </div>
        );
    }

    // ERROR STATE (Connection Failed)
    if (!loading && !wallet) {
        return (
            <div className="container animate-fade-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-background)',
                color: 'var(--text-color)'
            }}>
                <div style={{ marginBottom: '1rem', color: 'var(--error)' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Connection Failed</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Could not connect to the wallet background service.
                </p>
                <button
                    onClick={() => refreshState()}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (view === 'welcome') {
        return <WelcomeView onGetStarted={() => setView('create')} />;
    }

    if (view === 'create') {
        return <CreateWalletView
            onBack={() => setView('welcome')}
            onSuccess={() => refreshState()}
            isSidePanel={typeof window !== 'undefined' && window.location.search.includes('type=side_panel')}
        />;
    }

    if (view === 'locked') {
        return <LockedView onUnlock={() => refreshState()} />;
    }

    if (view === 'connect_request' && connectRequest) {
        return (
            <ConnectRequestView
                origin={connectRequest.origin}
                requestId={connectRequest.requestId}
                onApprove={() => {
                    setView('dashboard');
                    refreshState();
                }}
                onReject={() => {
                    setView('dashboard');
                    refreshState();
                }}
            />
        );
    }

    if (view === 'sign_request' && signRequest) {
        return (
            <SignRequestView
                requestId={signRequest.requestId}
                signType={signRequest.signType}
                origin={signRequest.origin}
                onComplete={() => {
                    setView('dashboard');
                    refreshState();
                }}
            />
        );
    }

    if (view === 'receive') {
        return <ReceiveView publicKey={wallet?.publicKey} onBack={() => setView('dashboard')} />;
    }

    if (view === 'confirm') {
        return (
            <ConfirmView
                onBack={() => setView('send')}
                onSuccess={(sig) => {
                    setLastSignature(sig);
                    setView('success');
                    refreshState();
                }}
                amount={sendAmount}
                recipient={sendRecipient}
                selectedAsset={selectedAsset}
            />
        );
    }

    if (view === 'success') {
        return <SuccessView signature={lastSignature} onBack={() => setView('dashboard')} />;
    }

    if (view === 'send') {
        return (
            <SendView
                onBack={() => setView('dashboard')}
                onNext={() => setView('confirm')}
                tokens={tokens}
                amount={sendAmount}
                recipient={sendRecipient}
                selectedAsset={selectedAsset}
                setAmount={setSendAmount}
                setRecipient={setSendRecipient}
                setAsset={setSelectedAsset}
                nativeBalance={wallet?.balance ? parseFloat((parseInt(wallet.balance) / 1_000_000_000).toFixed(4)).toString() : '0'}
                isAssetFixed={isAssetFixed}
            />
        );
    }

    if (view === 'settings') {
        return (
            <SettingsHome
                onBack={() => setView('dashboard')}
                onNavigate={(target) => {
                    if (target === 'security_phrase') setView('security_phrase');
                    if (target === 'security_key') setView('security_key');
                    if (target === 'connected_sites') setView('connected_sites');
                }}
                onLock={handleLock}
                onReset={() => {
                    if (confirm('Are you sure you want to reset your wallet? All data will be lost. Make sure you have your recovery phrase.')) {
                        chrome.runtime.sendMessage({ type: 'LOCK_WALLET' });
                        chrome.storage.local.clear(() => {
                            chrome.storage.session.clear(() => {
                                notify.success('Wallet reset successfully');
                                setTimeout(() => window.location.reload(), 1000);
                            });
                        });
                    }
                }}
            />
        );
    }

    if (view === 'security_phrase') {
        return <SecurityView type="mnemonic" onBack={() => setView('settings')} />;
    }

    if (view === 'security_key') {
        return <SecurityView type="private_key" onBack={() => setView('settings')} />;
    }

    if (view === 'import_token') {
        return (
            <ImportTokenView
                onBack={() => setView('dashboard')}
                onSuccess={() => {
                    refreshState();
                    setView('dashboard');
                }}
            />
        );
    }

    if (view === 'connected_sites') {
        return <ConnectedSitesView onBack={() => setView('settings')} />;
    }

    if (view === 'token_detail') {
        return (
            <TokenDetailView
                token={selectedAsset}
                wallet={wallet}
                onBack={() => setView('dashboard')}
                onSend={() => {
                    setIsAssetFixed(true);
                    setView('send');
                }}
                onReceive={() => setView('receive')}
            />
        );
    }

    if (view === 'dashboard') {
        return (
            <DashboardView
                wallet={wallet}
                loading={loading}
                isRefreshing={false} // Handled by hook/state usually
                refreshState={refreshState}
                setView={setView}
                onSendClick={() => {
                    setIsAssetFixed(false);
                    setSelectedAsset(null);
                    setView('send');
                }}
                handleLock={handleLock}
                tokens={tokens}
                transactions={transactions}
                setSelectedAsset={setSelectedAsset}
                isSidePanel={typeof window !== 'undefined' && window.location.search.includes('type=side_panel')}
            />
        );
    }

    return null;
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
