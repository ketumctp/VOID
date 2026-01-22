/**
 * Input Component - Rialo Wallet
 */
import React from 'react';
import * as styles from './Input.css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

// =============================================================================
// TYPES
// =============================================================================
type InputVariants = NonNullable<RecipeVariants<typeof styles.input>>;

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    variant?: 'default' | 'error';
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        helperText,
        error,
        leftIcon,
        rightIcon,
        size,
        variant,
        className,
        id,
        ...props
    }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const computedVariant = error ? 'error' : variant;

        return (
            <div className={styles.formGroup}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <div className={styles.inputWrapper}>
                    {leftIcon && (
                        <span className={styles.inputIcon({ position: 'left' })}>
                            {leftIcon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={styles.input({
                            size,
                            variant: computedVariant,
                            hasLeftIcon: !!leftIcon,
                            hasRightIcon: !!rightIcon,
                        })}
                        {...props}
                    />

                    {rightIcon && (
                        <span className={styles.inputIcon({ position: 'right' })}>
                            {rightIcon}
                        </span>
                    )}
                </div>

                {error ? (
                    <span className={styles.errorText}>{error}</span>
                ) : helperText ? (
                    <span className={styles.helperText}>{helperText}</span>
                ) : null}
            </div>
        );
    }
);

Input.displayName = 'Input';

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({
        label,
        helperText,
        error,
        variant,
        className,
        id,
        ...props
    }, ref) => {
        const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
        const computedVariant = error ? 'error' : variant;

        return (
            <div className={styles.formGroup}>
                {label && (
                    <label htmlFor={inputId} className={styles.label}>
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={inputId}
                    className={styles.textarea({ variant: computedVariant })}
                    {...props}
                />

                {error ? (
                    <span className={styles.errorText}>{error}</span>
                ) : helperText ? (
                    <span className={styles.helperText}>{helperText}</span>
                ) : null}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
