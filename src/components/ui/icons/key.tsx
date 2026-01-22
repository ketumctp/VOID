
import React from 'react';

export const KeyIcon = ({ size = 24, className = '', ...props }: { size?: number, className?: string } & React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="m21 2-2 2m-7.6 7.6a6.5 6.5 0 1 1-9-9 6.5 6.5 0 0 1 9 9Z" />
        <path d="M2 12v3l3 3 1-1-1-1 2-2V7" />
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
);
