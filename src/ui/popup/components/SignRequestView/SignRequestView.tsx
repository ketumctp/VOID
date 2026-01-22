/**
 * SignRequestView - Handles sign/approve requests in Side Panel
 * Refactored for better maintainability (Phase 1)
 */
import React from 'react';
import { useSignRequest } from './hooks/useSignRequest';
import { NetworkBanner } from './components/NetworkBanner';
import { RequestHeader } from './components/RequestHeader';
import { RiskWarning } from './components/RiskWarning';
import { TransactionDetails } from './components/TransactionDetails';
import { ActionButtons } from './components/ActionButtons';

interface SignRequestViewProps {
    requestId: string;
    signType: string;
    origin: string;
    onComplete: () => void;
}

export const SignRequestView: React.FC<SignRequestViewProps> = ({
    requestId,
    signType,
    origin,
    onComplete
}) => {
    const {
        loading,
        submitting,
        requestData,
        insufficientBalance,
        requiredAmount,
        isHighRisk,
        handleApprove,
        handleReject
    } = useSignRequest(requestId, onComplete);

    if (loading) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface)',
                color: 'var(--text-body)'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    const highRisk = isHighRisk();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            color: 'var(--text-body)',
            padding: '24px',
            overflow: 'auto'
        }}>
            <NetworkBanner />

            <RequestHeader
                signType={signType}
                origin={origin}
                fromAddress={requestData?.data?.from}
            />

            <RiskWarning
                riskAssessment={requestData?.data?.riskAssessment}
                isHighRisk={highRisk}
                insufficientBalance={insufficientBalance}
                requiredAmount={requiredAmount}
            />

            <TransactionDetails requestData={requestData} />

            <ActionButtons
                onApprove={handleApprove}
                onReject={handleReject}
                isHighRisk={highRisk}
                submitting={submitting}
                insufficientBalance={insufficientBalance}
            />
        </div>
    );
};
