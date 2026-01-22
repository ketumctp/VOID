"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface ArrowUpRightIconHandle {
    startAnimation: () => void;
    stopAnimation: () => void;
}

interface ArrowUpRightIconProps extends HTMLAttributes<HTMLDivElement> {
    size?: number;
}

const VARIANTS: Variants = {
    normal: { pathLength: 1, opacity: 1, translateX: 0, translateY: 0 },
    animate: {
        translateX: 1,
        translateY: -1,
        transition: {
            duration: 0.3,
            repeat: 1,
            repeatType: "reverse"
        }
    }
};

const ArrowUpRightIcon = forwardRef<ArrowUpRightIconHandle, ArrowUpRightIconProps>(
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
                        d="M7 17L17 7"
                        variants={VARIANTS}
                        animate={controls}
                    />
                    <motion.path
                        d="M7 7h10v10"
                        variants={VARIANTS}
                        animate={controls}
                    />
                </svg>
            </div>
        );
    }
);

ArrowUpRightIcon.displayName = "ArrowUpRightIcon";

export { ArrowUpRightIcon };
