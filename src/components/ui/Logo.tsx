import React from 'react';
import { motion, type Variants } from 'motion/react';

interface LogoProps {
    className?: string;
    variant?: 'icon' | 'lockup' | 'vertical';
    animated?: boolean;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({
    className = "",
    variant = 'icon',
    animated = false,
    size
}) => {
    // Default sizes based on variant
    const defaultSize = variant === 'icon' ? 48 : variant === 'vertical' ? 128 : 200;
    const finalSize = size || defaultSize;

    const pathVariants: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 2,
                ease: "easeInOut",
                repeat: animated ? 0 : 0
            }
        }
    };

    const containerVariants: Variants = {
        idle: {
            y: [0, -8, 0],
            filter: [
                "drop-shadow(0 0 8px rgba(232, 227, 213, 0.2))",
                "drop-shadow(0 0 16px rgba(232, 227, 213, 0.4))",
                "drop-shadow(0 0 8px rgba(232, 227, 213, 0.2))"
            ],
            transition: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity
            }
        },
        hover: {
            scale: 1.05,
            filter: "drop-shadow(0 0 20px rgba(232, 227, 213, 0.6))",
            transition: { duration: 0.3 }
        }
    };

    const Wrapper = animated ? motion.div : 'div';

    // Render content based on variant logic
    // Using explicit SVG ViewBoxes from Brand Kit for perfect alignment

    const renderContent = () => {
        const commonPathProps = {
            d: "M2 2L12 22L22 2H16L12 10L8 2H2ZM12 14L15 8H9L12 14Z",
            fillRule: "evenodd" as const,
            stroke: "#e8e3d5",
            strokeWidth: animated ? 0.5 : 0,
            fill: animated ? "rgba(232, 227, 213, 1)" : "#e8e3d5",
            initial: animated ? "hidden" : "visible",
            animate: "visible",
            variants: pathVariants
        };

        if (variant === 'vertical') {
            // User-provided strict alignment structure
            // Verbatim copy of the requested SVG logic
            return (
                <svg
                    width={finalSize}
                    height={finalSize}
                    viewBox="0 0 512 512"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="translate(112, 80) scale(12)">
                        <motion.path
                            d="M2 2L12 22L22 2H16L12 10L8 2H2ZM12 14L15 8H9L12 14Z"
                            fillRule="evenodd"
                            // Only apply animation props if truly animated, otherwise keep it pure
                            {...(animated ? {
                                stroke: "#e8e3d5",
                                strokeWidth: 0.5 / 12,
                                fill: "rgba(232, 227, 213, 1)",
                                initial: "hidden",
                                animate: "visible",
                                variants: pathVariants
                            } : {
                                fill: "#e8e3d5"
                            })}
                        />
                    </g>
                    <text
                        x="256"
                        y="420"
                        fontFamily="'Outfit', 'Inter', sans-serif"
                        fontWeight="bold"
                        fontSize="72"
                        textLength="240"
                        lengthAdjust="spacing"
                        fill="#e8e3d5"
                        textAnchor="middle"
                    >
                        VOID
                    </text>
                </svg>
            );
        }

        if (variant === 'lockup') {
            // Brand Kit Section 2: Horizontal Lockup (Visual Balance)
            // Icon: 48px height (Scale 2)
            // Text: 42px height
            // Gap: 20px
            return (
                <svg
                    width={finalSize}
                    height={finalSize * (60 / 200)} // Dynamic height based on aspect ratio
                    viewBox="0 0 200 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="translate(0, 6) scale(2)">
                        <motion.path
                            d="M2 2L12 22L22 2H16L12 10L8 2H2ZM12 14L15 8H9L12 14Z"
                            fillRule="evenodd"
                            {...(animated ? {
                                stroke: "#e8e3d5",
                                strokeWidth: 0.5 / 2,
                                fill: "rgba(232, 227, 213, 1)",
                                initial: "hidden",
                                animate: "visible",
                                variants: pathVariants
                            } : {
                                fill: "#e8e3d5"
                            })}
                        />
                    </g>
                    <text
                        x="68"
                        y="47"
                        fontFamily="'Outfit', 'Inter', sans-serif"
                        fontWeight="bold"
                        fontSize="42"
                        letterSpacing="4"
                        fill="#e8e3d5"
                        textAnchor="start"
                    >
                        VOID
                    </text>
                </svg>
            );
        }

        // Icon Only
        return (
            <svg
                width={finalSize}
                height={finalSize}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <motion.path {...commonPathProps} />
            </svg>
        );
    };

    return (
        // @ts-ignore
        <Wrapper
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: variant === 'lockup' ? undefined : finalSize,
                height: variant === 'lockup' ? undefined : finalSize
            }}
            initial={animated ? "idle" : undefined}
            animate={animated ? "idle" : undefined}
            whileHover={animated ? "hover" : undefined}
            variants={containerVariants}
        >
            {renderContent()}
        </Wrapper>
    );
};
