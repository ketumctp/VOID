import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../ui/styles/global.css';

import { UnlockForm } from './components/UnlockForm';
import { ConnectionRequest } from './components/ConnectionRequest';
import { SignRequest } from './components/SignRequest';
import { useApprove } from './hooks/useApprove';

const Approve = () => {
    const {
        origin,
        isLocked,
        checkingLock,
        loading,
        requestType,
        requestData,
        password,
        unlockError,
        countdown,
        confirmText,
        typedProgramId,

        setPassword,
        setConfirmText,
        setTypedProgramId,

        handleApprove,
        handleReject,
        handleUnlock,

        getRiskLevel,
        getRiskAssessment,
        isApproveDisabled
    } = useApprove();

    if (loading || checkingLock) {
        return <div className="container animate-fade-in text-center"><p>Loading...</p></div>;
    }

    if (isLocked) {
        return <UnlockForm
            isLocked={isLocked}
            unlockError={unlockError}
            password={password}
            setPassword={setPassword}
            handleUnlock={handleUnlock}
            handleReject={handleReject}
            origin={(origin && !origin.includes('locked')) ? origin : 'dApp'}
        />;
    }

    if (requestType === 'connect') {
        return (
            <ConnectionRequest
                origin={origin}
                handleApprove={handleApprove}
                handleReject={handleReject}
            />
        );
    }

    return (
        <SignRequest
            origin={origin}
            requestData={requestData}
            countdown={countdown}
            confirmText={confirmText}
            setConfirmText={setConfirmText}
            typedProgramId={typedProgramId}
            setTypedProgramId={setTypedProgramId}
            handleApprove={handleApprove}
            handleReject={handleReject}
            getRiskLevel={getRiskLevel}
            getRiskAssessment={getRiskAssessment}
            isApproveDisabled={isApproveDisabled}
        />
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <Approve />
    </React.StrictMode>
);
