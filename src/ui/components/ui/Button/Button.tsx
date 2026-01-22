/**
 * Button Component - Rialo Wallet
 * Type-safe button dengan variant composition
 */
import React from 'react';
import * as styles from './Button.css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

// =============================================================================
// TYPES
// =============================================================================
type ButtonRecipeVariants = NonNullable<RecipeVariants<typeof styles.button>>;
type IconButtonRecipeVariants = NonNullable<RecipeVariants<typeof styles.iconButton>>;

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonRecipeVariants {
    children: React.ReactNode;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    IconButtonRecipeVariants {
    icon: React.ReactNode;
    'aria-label': string; // Required untuk aksesibilitas
    loading?: boolean;
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        children,
        variant,
        size,
        fullWidth,
        rounded,
        loading,
        leftIcon,
        rightIcon,
        disabled,
        className,
        ...props
    }, ref) => {
        return (
            <button
                ref={ref}
                className={styles.button({ variant, size, fullWidth, rounded })}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <span className={styles.spinner}>⟳</span>
                ) : (
                    <>
                        {leftIcon}
                        {children}
                        {rightIcon}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

// =============================================================================
// ICON BUTTON COMPONENT
// =============================================================================
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({
        icon,
        variant,
        size,
        rounded,
        loading,
        disabled,
        className,
        ...props
    }, ref) => {
        return (
            <button
                ref={ref}
                className={styles.iconButton({ variant, size, rounded })}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? <span className={styles.spinner}>⟳</span> : icon}
            </button>
        );
    }
);

IconButton.displayName = 'IconButton';
