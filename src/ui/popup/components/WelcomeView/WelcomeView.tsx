/**
 * WelcomeView Component - Rialo Wallet
 */
import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import * as styles from './WelcomeView.css';

interface WelcomeViewProps {
    onGetStarted: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onGetStarted }) => {
    return (
        <div className={`${styles.container} ${styles.animateFadeIn}`}>
            {/* Top Right Actions */}
            {/* Top Right Actions - REMOVED */}

            <div className={styles.content}>
                {/* Hero Section */}
                <div className={styles.logoWrapper}>
                    {/* Horizontal Logo (Lockup) on the Left */}
                    <Logo variant="lockup" size={240} animated={true} />

                    {/* Description Text Below */}
                    <div className="font-inter" style={{
                        color: '#999',
                        fontSize: '16px',
                        lineHeight: '1.5',
                        textAlign: 'center', // Center aligned again
                        maxWidth: '300px', // Slightly wider to balance larger logo
                        marginTop: '16px'
                    }}>
                        Click get startedd to create wallet to connect rialo ddevnet
                    </div>
                </div>

                {/* Action Section - Moved Inside Card */}
                <div className={styles.actionSection}>
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={onGetStarted}
                    >
                        Get Started
                    </Button>

                    {/* Devnet Disclaimer */}
                    <div className="font-inter" style={{
                        marginTop: '16px',
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.4)',
                        textAlign: 'center',
                        lineHeight: '1.4'
                    }}>
                        Disclaimer: This wallet is for Rialo Devnet use only.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
