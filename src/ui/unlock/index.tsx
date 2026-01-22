import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../ui/styles/global.css';

const Unlock = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleUnlock = () => {
        if (!password) return;

        chrome.runtime.sendMessage({
            type: 'UNLOCK_WALLET',
            password,
            id: Date.now().toString()
        }, (response: any) => {
            if (response && response.success) {
                // Determine if we should close or redirect.
                // For a standalone unlock page (like from a dApp request), we might close.
                window.close();
            } else {
                setError(response.error || 'Invalid password');
            }
        });
    };

    return (
        <div className="container animate-fade-in" style={{ justifyContent: 'center' }}>
            <div className="card text-center">
                <h2>Unlock Wallet</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Enter your password to continue</p>

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                <button className="btn-primary" style={{ width: '100%' }} onClick={handleUnlock}>Unlock</button>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <Unlock />
    </React.StrictMode>
);
