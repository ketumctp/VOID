/**
 * Card Component - Rialo Wallet
 */
import React from 'react';
import * as styles from './Card.css';
import type { RecipeVariants } from '@vanilla-extract/recipes';

// =============================================================================
// TYPES
// =============================================================================
type CardVariants = NonNullable<RecipeVariants<typeof styles.card>>;
type StackVariants = NonNullable<RecipeVariants<typeof styles.stack>>;
type RowVariants = NonNullable<RecipeVariants<typeof styles.row>>;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CardVariants {
    children: React.ReactNode;
    as?: 'div' | 'section' | 'article';
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, StackVariants {
    children: React.ReactNode;
}

export interface RowProps extends React.HTMLAttributes<HTMLDivElement>, RowVariants {
    children: React.ReactNode;
}

// =============================================================================
// CARD COMPONENT
// =============================================================================
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, padding, variant, fullWidth, as = 'div', className, ...props }, ref) => {
        const Component = as;
        return (
            <Component
                ref={ref}
                className={styles.card({ padding, variant, fullWidth })}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={styles.cardHeader} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h3 className={styles.cardTitle} {...props}>
        {children}
    </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
    children,
    className,
    ...props
}) => (
    <p className={styles.cardDescription} {...props}>
        {children}
    </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={styles.cardContent} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={styles.cardFooter} {...props}>
        {children}
    </div>
);

// =============================================================================
// LAYOUT COMPONENTS
// =============================================================================

// Container untuk popup utama
export const Container: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    withNav?: boolean
}> = ({ children, withNav, className, ...props }) => (
    <div
        className={withNav ? styles.containerWithNav : styles.container}
        {...props}
    >
        {children}
    </div>
);

// Page layout
export const Page: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    center?: boolean
}> = ({ children, center, className, ...props }) => (
    <div
        className={center ? styles.pageCenter : styles.page}
        {...props}
    >
        {children}
    </div>
);

// Stack layout (vertical)
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
    ({ children, gap, align, className, ...props }, ref) => (
        <div
            ref={ref}
            className={styles.stack({ gap, align })}
            {...props}
        >
            {children}
        </div>
    )
);

Stack.displayName = 'Stack';

// Row layout (horizontal)
export const Row = React.forwardRef<HTMLDivElement, RowProps>(
    ({ children, gap, justify, className, ...props }, ref) => (
        <div
            ref={ref}
            className={styles.row({ gap, justify })}
            {...props}
        >
            {children}
        </div>
    )
);

Row.displayName = 'Row';

// Scroll content area
export const ScrollContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => (
    <div className={styles.scrollContent} {...props}>
        {children}
    </div>
);
