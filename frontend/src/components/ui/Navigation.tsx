import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { popIn, spring } from '@/config/motion';
import { cn } from '@/utils/format';

// --- Tabs with a sliding indicator ---------------------------------------------------------
export function Tabs<T extends string>({ tabs, value, onChange, className, label }: { tabs: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; label: string }) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].value);
  };
  return (
    <div role="tablist" aria-label={label} className={cn('scrollbar-thin flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => onChange(t.value)}
            className={cn('relative flex shrink-0 items-center gap-2 px-3.5 pt-2 pb-3 text-sm font-semibold transition-colors', active ? 'text-ink' : 'text-ink-muted hover:text-ink')}
          >
            {t.label}
            {t.count !== undefined && <span className={cn('tabular rounded-full px-1.5 py-px text-[0.6875rem]', active ? 'bg-primary-soft text-primary' : 'bg-elevated text-ink-faint')}>{t.count}</span>}
            {active && <motion.span layoutId={`tab-${id}`} transition={spring.layout} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}

// --- Segmented control -----------------------------------------------------------------------
export function Segmented<T extends string>({ options, value, onChange, label, size = 'md' }: { options: { value: T; label: ReactNode; icon?: ReactNode }[]; value: T; onChange: (v: T) => void; label: string; size?: 'sm' | 'md' }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line bg-elevated p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn('relative flex items-center gap-1.5 rounded-lg font-semibold transition-colors', size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm', active ? 'text-ink' : 'text-ink-muted hover:text-ink')}
          >
            {active && <motion.span layoutId={`seg-${id}`} transition={spring.layout} className="absolute inset-0 rounded-lg bg-surface shadow-soft" />}
            <span className="relative flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- Dropdown menu ------------------------------------------------------------------------------
export function Dropdown({ trigger, items, align = 'right', label }: { trigger: (props: { onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' }) => ReactNode; items: { label: ReactNode; onSelect: () => void; icon?: ReactNode; danger?: boolean; disabled?: boolean }[]; align?: 'left' | 'right'; label: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const els = Array.from(wrap.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []);
        const i = els.indexOf(document.activeElement as HTMLButtonElement);
        els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    setTimeout(() => wrap.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus(), 20);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={wrap} className="relative inline-flex">
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label={label}
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn('absolute top-full z-50 mt-2 min-w-48 rounded-2xl border border-line-strong bg-surface p-1.5 shadow-lifted', align === 'right' ? 'right-0' : 'left-0')}
          >
            {items.map((item, i) => (
              <button
                key={i}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn('flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none hover:bg-elevated focus:bg-elevated disabled:opacity-40', item.danger ? 'text-danger' : 'text-ink')}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Pagination ---------------------------------------------------------------------------------
export function Pagination({ page, pages, onChange, total }: { page: number; pages: number; onChange: (p: number) => void; total?: number }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-4">
      <p className="text-caption text-ink-muted">
        Page <span className="tabular font-semibold text-ink">{page}</span> of <span className="tabular">{pages}</span>
        {total !== undefined && <span className="hidden sm:inline"> ({total.toLocaleString()} results)</span>}
      </p>
      <div className="flex gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="flex size-9 items-center justify-center rounded-xl border border-line-strong text-ink hover:bg-elevated disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= pages} className="flex size-9 items-center justify-center rounded-xl border border-line-strong text-ink hover:bg-elevated disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
