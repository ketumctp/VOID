"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface ExternalLinkIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface ExternalLinkIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
}

const BOX_VARIANTS: Variants = {
    normal: { pathLength: 1, opacity: 1 },
    animate: { pathLength: 1, opacity: 1 }
};

const ARROW_VARIANTS: Variants = {
    normal: { translateX: 0, translateY: 0 },
    animate: {
        translateX: 2,
        translateY: -2,
        transition: {
            duration: 0.3,
            repeat: 1,
            repeatType: "reverse",
            ease: "easeInOut",
        },
    },
};

const ExternalLinkIcon = forwardRef<ExternalLinkIconHandle, ExternalLinkIconProps>(
    ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
        const controls = useAnimation();
        const isControlledRef = useRef(false);

        useImperativeHandle(ref, () => {
            isControlledRef.current = true;

            return {
                startAnimation: () => controls.start("animate"),
                stopAnimation: () => controls.start("normal"),
            };
        });

        const handleMouseEnter = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseEnter?.(e);
                } else {
                    controls.start("animate");
                }
            },
            [controls, onMouseEnter]
        );

        const handleMouseLeave = useCallback(
            (e: React.MouseEvent<HTMLDivElement>) => {
                if (isControlledRef.current) {
                    onMouseLeave?.(e);
                } else {
                    controls.start("normal");
                }
            },
            [controls, onMouseLeave]
        );

        return (
            <div
                className={cn(className)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                <svg
                    fill="none"
                    height={size}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width={size}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                        variants={BOX_VARIANTS}
                        animate={controls}
                    />
                    <motion.path
                        d="M15 3h6v6"
                        variants={ARROW_VARIANTS}
                        animate={controls}
                    />
                    <motion.line
                        x1="10"
                        y1="14"
                        x2="21"
                        y2="3"
                        variants={ARROW_VARIANTS}
                        animate={controls}
                    />
                </svg>
            </div>
        );
    }
);

ExternalLinkIcon.displayName = "ExternalLinkIcon";

export { ExternalLinkIcon };
