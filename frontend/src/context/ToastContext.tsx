import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { spring } from '@/config/motion';
import { cn } from '@/utils/format';

type Tone = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
}
interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
const TONES = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
  warning: 'text-warning',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (tone: Tone, title: string, description?: string) => {
      const id = next.current++;
      setToasts((t) => [...t.slice(-3), { id, tone, title, description }]);
      setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, d) => push('success', t, d),
      error: (t, d) => push('error', t, d),
      info: (t, d) => push('info', t, d),
      warning: (t, d) => push('warning', t, d),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-5 sm:items-end">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: spring.snappy }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
                role={t.tone === 'error' ? 'alert' : 'status'}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line-strong p-4 shadow-lifted"
              >
                <Icon className={cn('mt-0.5 size-5 shrink-0', TONES[t.tone])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-ink-muted">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="rounded-md p-1 text-ink-faint hover:bg-elevated hover:text-ink" aria-label="Dismiss notification">
                  <X className="size-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
