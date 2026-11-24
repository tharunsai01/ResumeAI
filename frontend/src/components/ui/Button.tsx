import { motion, type HTMLMotionProps } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { duration, scale } from '@/config/motion';
import { cn } from '@/utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] font-semibold transition-[background-color,border-color,color,box-shadow,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'text-white bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklab,var(--primary)_55%,var(--violet)))] shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_8px_24px_-10px_var(--primary)] hover:shadow-[0_1px_0_rgba(255,255,255,.22)_inset,0_12px_30px_-10px_var(--primary)] hover:brightness-110',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-elevated hover:border-line-strong shadow-soft',
  outline: 'border border-line-strong text-ink hover:bg-elevated',
  ghost: 'text-ink-muted hover:text-ink hover:bg-elevated',
  danger: 'bg-danger text-white hover:brightness-110 shadow-[0_8px_24px_-12px_var(--danger)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[0.9375rem]',
  icon: 'size-10',
};

interface Common {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  success?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loadingText?: string;
}

export type ButtonProps = Common & Omit<HTMLMotionProps<'button'>, 'children'> & { children?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, success, icon, iconRight, loadingText, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const showIcon = loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : success ? <Check className="size-4" aria-hidden /> : icon;
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={disabled || loading ? undefined : { scale: scale.press }}
      transition={{ duration: duration.instant }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {showIcon}
      {loading && loadingText ? loadingText : children}
      {!loading && iconRight}
    </motion.button>
  );
});

export function ButtonLink({ variant = 'primary', size = 'md', className, icon, iconRight, children, ...rest }: Common & LinkProps & { children?: ReactNode }) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], 'active:scale-[0.97]', className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
