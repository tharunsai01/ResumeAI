import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { duration, ease } from '@/config/motion';
import { useSpotlight } from '@/hooks';
import { cn, initials, scoreTone } from '@/utils/format';
import { Button } from './Button';

// --- Card ---------------------------------------------------------------------------
export function Card({ className, spotlight, interactive, children, ...rest }: HTMLAttributes<HTMLDivElement> & { spotlight?: boolean; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useSpotlight(ref);
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-card)] border border-line bg-surface shadow-soft',
        spotlight && 'spotlight-border',
        interactive && 'transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lifted motion-reduce:hover:translate-y-0',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5', className)}>
      <div className="min-w-0">
        <h3 className="text-[0.9375rem] font-bold text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// --- Badge ----------------------------------------------------------------------------
type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'cyan' | 'violet';
const toneClass: Record<Tone, string> = {
  neutral: 'bg-elevated text-ink-muted border-line',
  primary: 'bg-primary-soft text-primary border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  warning: 'bg-warning-soft text-warning border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  cyan: 'bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-cyan border-transparent',
  violet: 'bg-[color-mix(in_oklab,var(--violet)_14%,transparent)] text-violet border-transparent',
};
export function Badge({ tone = 'neutral', className, children, dot }: { tone?: Tone; className?: string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', toneClass[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

// --- Avatar ---------------------------------------------------------------------------
const AVATAR_HUES = ['from-indigo-500 to-violet-500', 'from-cyan-500 to-indigo-500', 'from-violet-500 to-fuchsia-500', 'from-sky-500 to-cyan-400', 'from-indigo-400 to-sky-500'];
export function Avatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const hue = AVATAR_HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_HUES.length];
  const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg' };
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white', hue, sizes[size], className)} aria-hidden>
      {initials(name)}
    </span>
  );
}

// --- Progress -------------------------------------------------------------------------
const barTone = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', neutral: 'bg-ink-faint', primary: 'bg-[linear-gradient(90deg,var(--primary),var(--cyan))]' };
export function ProgressBar({ value, tone = 'primary', label, className, showValue }: { value: number; tone?: keyof typeof barTone; label?: string; className?: string; showValue?: boolean }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-caption">
          {label && <span className="font-medium text-ink-muted">{label}</span>}
          {showValue && <span className="tabular font-semibold text-ink">{Math.round(pct)}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
        <motion.div
          className={cn('h-full rounded-full', barTone[tone])}
          initial={{ width: reduce ? `${pct}%` : 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: duration.deliberate, ease: ease.out }}
        />
      </div>
    </div>
  );
}

// --- Score ring -------------------------------------------------------------------------
const ringColor = { success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)', neutral: 'var(--ink-faint)' };
export function ScoreRing({ score, size = 96, stroke = 8, label, className }: { score: number | null | undefined; size?: number; stroke?: number; label?: string; className?: string }) {
  const r = (size - stroke) / 2;
  const tone = scoreTone(score);
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const reduce = useReducedMotion();
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }} role="img" aria-label={label ?? (score == null ? 'Not scored yet' : `Match score ${score.toFixed(0)} out of 100`)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--elevated)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? pct : 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: duration.deliberate * 1.4, ease: ease.out }}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-extrabold text-ink" style={{ fontSize: size * 0.27 }}>
          {score == null ? '–' : <AnimatedNumber value={score} decimals={0} />}
        </span>
      </span>
    </div>
  );
}

// --- Animated number ------------------------------------------------------------------
export function AnimatedNumber({ value, decimals = 0, suffix = '', className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(display, value, { duration: 1.1, ease: ease.out, onUpdate: setDisplay });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduce]);
  return (
    <span ref={ref} className={cn('tabular', className)}>
      {display.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

// --- Skeletons ---------------------------------------------------------------------------
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} aria-hidden />;
}
export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <Card className={cn('p-5', className)}>
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
        ))}
      </div>
    </Card>
  );
}
export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-3">
        <Skeleton className="h-3 w-40" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="hidden h-3 w-24 sm:block" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </Card>
  );
}
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={1} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonCard lines={6} className="lg:col-span-2" />
        <SkeletonCard lines={6} />
      </div>
    </div>
  );
}

// --- Empty and error states -------------------------------------------------------------
export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line-strong px-6 py-12 text-center', className)}>
      {icon && <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">{icon}</div>}
      <h3 className="text-[0.9375rem] font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-danger/30 bg-danger-soft px-6 py-10 text-center', className)}>
      <AlertCircle className="size-6 text-danger" aria-hidden />
      <p className="max-w-md text-sm font-medium text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw className="size-3.5" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

// --- Tooltip (hover + focus) ----------------------------------------------------------------
export function Tooltip({ content, children, side = 'top' }: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-lifted transition-opacity duration-150 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  );
}

// --- Page header and stat card ----------------------------------------------------------------
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-h2 font-extrabold text-ink">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, hint, tone = 'primary', decimals = 0, suffix }: { label: string; value: number | null | undefined; icon?: ReactNode; hint?: ReactNode; tone?: 'primary' | 'cyan' | 'violet' | 'success' | 'warning'; decimals?: number; suffix?: string }) {
  const iconTone = {
    primary: 'bg-primary-soft text-primary',
    cyan: 'bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-cyan',
    violet: 'bg-[color-mix(in_oklab,var(--violet)_14%,transparent)] text-violet',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
  }[tone];
  return (
    <Card spotlight className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-ink-muted">{label}</p>
        {icon && <span className={cn('flex size-9 items-center justify-center rounded-xl', iconTone)}>{icon}</span>}
      </div>
      <p className="mt-3 text-[2rem] leading-none font-extrabold tracking-tight text-ink">{value == null ? '–' : <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />}</p>
      {hint && <p className="mt-2 text-caption text-ink-faint">{hint}</p>}
    </Card>
  );
}
