import React from 'react';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

interface RiskAlertProps {
    requestData: any;
}

export const RiskAlert: React.FC<RiskAlertProps> = ({ requestData }) => {
    if (!requestData?.data?.riskAssessment) return null;

    const { level, message } = requestData.data.riskAssessment;
    const isCritical = level === 'CRITICAL';

    return (
        <div style={{
            backgroundColor: isCritical ? '#ff4d4d' : '#ffaa00',
            color: isCritical ? 'white' : 'black',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontWeight: 'bold',
            border: '2px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center' }}>
                {isCritical ? (
                    <ShieldExclamationIcon className="w-6 h-6 mr-2" />
                ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                )}
                {isCritical ? 'CRITICAL WARNING' : 'HIGH VALUE ALERT'}
            </div>
            {message}
        </div>
    );
};
