import { useState, useEffect } from 'react';

export const useApprove = () => {
    const [origin, setOrigin] = useState<string>('');
    const [requestId, setRequestId] = useState<string | null>(null);
    const [requestType, setRequestType] = useState<string>('connect');
    const [requestData, setRequestData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // PHASE 0: NO CHECKBOX - Use delay and CONFIRM text instead
    const [countdown, setCountdown] = useState<number | null>(null);
    const [confirmText, setConfirmText] = useState('');
    const [typedProgramId, setTypedProgramId] = useState('');

    // Lock state
    const [isLocked, setIsLocked] = useState(false);
    const [checkingLock, setCheckingLock] = useState(true);
    const [password, setPassword] = useState('');
    const [unlockError, setUnlockError] = useState('');

    useEffect(() => {
        // Initial param parsing
        const params = new URLSearchParams(window.location.search);
        const originParam = params.get('origin');
        const reqIdParam = params.get('requestId');
        const typeParam = params.get('type') || 'connect';

        if (originParam) setOrigin(originParam);
        if (reqIdParam) setRequestId(reqIdParam);
        setRequestType(typeParam);

        // Check lock status
        checkLockStatus();

        if (typeParam === 'sign' && reqIdParam) {
            setLoading(true);
            chrome.runtime.sendMessage({
                type: 'GET_PENDING_REQUEST',
                requestId: reqIdParam,
                id: Date.now().toString()
            }, (response: any) => {
                setLoading(false);
                if (response && response.success && response.data) {
                    setRequestData(response.data);
                    if (response.data.origin) setOrigin(response.data.origin);
                }
            });
        }

        // HEARTBEAT: Keep Service Worker alive
        const interval = setInterval(() => {
            chrome.runtime.sendMessage({ type: 'PING', id: 'heartbeat' });
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    const checkLockStatus = () => {
        chrome.runtime.sendMessage({ type: 'GET_WALLET_STATE', id: 'check_lock' }, (response) => {
            if (response && response.success) {
                setIsLocked(response.data.isLocked);
            }
            setCheckingLock(false);
        });
    };

    const handleApprove = () => {
        const msgType = requestType === 'connect' ? 'APPROVE_CONNECTION' : 'RESOLVE_REQUEST';
        // SECURITY FIX: Always pass requestId to prevent ID guessing attacks on Connection
        const payload = requestType === 'connect' ? { origin, requestId } : { requestId };

        chrome.runtime.sendMessage({
            type: msgType,
            ...payload,
            id: Date.now().toString()
        });
        window.close();
    };

    const handleReject = () => {
        const msgType = requestType === 'connect' ? 'REJECT_CONNECTION' : 'REJECT_REQUEST';
        const payload = requestType === 'connect' ? { origin, requestId } : { requestId };

        chrome.runtime.sendMessage({
            type: msgType,
            ...payload,
            id: Date.now().toString()
        });
        window.close();
    };

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setUnlockError('');

        chrome.runtime.sendMessage({
            type: 'UNLOCK_WALLET',
            password: password,
            id: Date.now().toString()
        }, (response) => {
            if (response && response.success) {
                setIsLocked(false);
                setPassword('');
            } else {
                setUnlockError(response.error || 'Incorrect password');
            }
        });
    };

    // Get risk level from backend assessment
    const getRiskLevel = (): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
        return requestData?.data?.riskAssessment?.level || 'LOW';
    };

    const getRiskAssessment = () => requestData?.data?.riskAssessment;

    // PHASE 4: Risk-based delay initialization
    useEffect(() => {
        const ra = getRiskAssessment();
        if (!ra) return;

        const level = ra.level;
        if (level === 'MEDIUM') {
            setCountdown(2);
        } else if (level === 'HIGH' || level === 'CRITICAL') {
            setCountdown(5);
        }
    }, [requestData]);

    // Countdown timer
    useEffect(() => {
        if (countdown === null || countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c !== null ? c - 1 : null), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const isApproveDisabled = (): boolean => {
        const ra = getRiskAssessment();
        if (!ra) return true; // No risk assessment = blocked

        // PHASE 1: HARD BLOCK only if explicitly requested by backend
        // Now mostly used for true malformed TXs, not just simulation failures
        if (ra.hardBlocked) {
            return true; // ABSOLUTELY NO BYPASS
        }

        // PHASE 4: Countdown not finished
        if (countdown !== null && countdown > 0) {
            return true;
        }

        const level = ra.level;

        // PHASE 3: Unknown program = must type FULL program ID
        if (ra.requireProgramIdInput && ra.unknownProgramId) {
            const fullId = ra.unknownProgramId;
            // STRICT SECURITY: No short IDs allowed anymore
            if (typedProgramId !== fullId) {
                return true;
            }
        }

        // PHASE 4: HIGH/CRITICAL = must type CONFIRM
        // This includes SIMULATION FAILED cases now (which are CRITICAL)
        if ((level === 'HIGH' || level === 'CRITICAL') && confirmText !== 'CONFIRM') {
            return true;
        }

        // LOW/MEDIUM after delay = enabled
        return false;
    };

    return {
        // State
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

        // Setters
        setPassword,
        setConfirmText,
        setTypedProgramId,

        // Actions
        handleApprove,
        handleReject,
        handleUnlock,

        // Helpers
        getRiskLevel,
        getRiskAssessment,
        isApproveDisabled
    };
};
