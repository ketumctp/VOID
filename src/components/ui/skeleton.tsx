
import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    style = {},
    width,
    height,
    borderRadius
}) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
                ...style
            }}
        />
    );
};
