import React from 'react';
import { cn } from '../../lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  innerClassName?: string;
}

export function PremiumCard({ className, innerClassName, children, ...props }: PremiumCardProps) {
  return (
    <>
      <style>
        {`
          @keyframes borderRotate {
            100% {
              transform: rotate(360deg);
            }
          }

          .premium-card-wrapper {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 24px;
            padding: 1.5px; /* Slightly thicker border for light mode visibility */
            background: transparent;
            isolation: isolate;
            transition: transform 0.48s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.48s cubic-bezier(0.23, 1, 0.32, 1);
          }

          /* Ambient glow on hover */
          .premium-card-wrapper::after {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(59, 130, 246, 0.2);
            filter: blur(15px);
            opacity: 0;
            transition: opacity 0.88s cubic-bezier(0.23, 1, 0.32, 1);
            z-index: -3;
            border-radius: 24px;
          }

          .dark .premium-card-wrapper::after {
            background: rgba(59, 130, 246, 0.1); /* Much softer glow in dark mode */
            filter: blur(20px);
          }

          /* The border container */
          .premium-card-border {
            position: absolute;
            inset: 0;
            border-radius: 24px;
            overflow: hidden; /* Clips the rotating gradient */
            z-index: -2;
          }

          /* The rotating gradient */
          .premium-card-border::before {
            content: '';
            position: absolute;
            inset: -50%;
            background: conic-gradient(
              from 0deg,
              transparent 60%,
              rgba(59, 130, 246, 0.4) 80%,
              rgba(79, 70, 229, 1) 100%
            );
            animation: borderRotate 4.8s linear infinite;
            animation-play-state: paused;
            opacity: 0;
            transition: opacity 0.88s cubic-bezier(0.23, 1, 0.32, 1);
          }

          /* Inner card */
          .premium-card-inner {
            background-color: #ffffff;
            border-radius: 22.5px;
            height: 100%;
            width: 100%;
            position: relative;
            z-index: 1;
            transition: background-color 0.48s cubic-bezier(0.23, 1, 0.32, 1);
          }

          .dark .premium-card-inner {
            background-color: #0F172A; /* Match theme */
          }

          /* Hover states */
          .premium-card-wrapper:hover {
            transform: scale(1.05);
            box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.15);
          }

          .dark .premium-card-wrapper:hover {
            box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.08); /* Less bright shadow in dark mode */
          }

          .premium-card-wrapper:hover .premium-card-border::before {
            opacity: 1;
            animation-play-state: running;
          }

          .premium-card-wrapper:hover::after {
            opacity: 1;
          }

          /* Text color transitions on hover */
          .premium-card-wrapper:hover .premium-card-text {
            color: #000000;
          }
          
          .dark .premium-card-wrapper:hover .premium-card-text {
            color: #ffffff;
          }

          .premium-card-text {
            transition: color 0.48s cubic-bezier(0.23, 1, 0.32, 1);
          }
        `}
      </style>
      <div className={cn('premium-card-wrapper', className)} {...props}>
        <div className="premium-card-border" />
        <div className={cn('premium-card-inner', innerClassName)}>
          {children}
        </div>
      </div>
    </>
  );
}

export function PremiumCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

export function PremiumCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("premium-card-text font-display font-semibold leading-none tracking-tight text-slate-800 dark:text-slate-200", className)}
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
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
