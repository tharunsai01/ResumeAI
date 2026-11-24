import React from 'react';
import { cn } from '../../lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  innerClassName?: string;
}

export function PremiumCard({ className, innerClassName, children, ...props }: PremiumCardProps) {
  return (
    <div className={cn('premium-card-wrapper', className)} {...props}>
      <div className="premium-card-border" />
      <div className={cn('premium-card-inner', innerClassName)}>
        {children}
      </div>
    </div>
  );
}

export function PremiumCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)} {...props} />;
}

export function PremiumCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("premium-card-text font-display font-semibold leading-snug tracking-tight text-slate-800 dark:text-slate-200", className)}
      {...props}
    />
  );
}

export function PremiumCardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("premium-card-text text-sm text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  );
}

export function PremiumCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-6 pt-0", className)} {...props} />;
}
