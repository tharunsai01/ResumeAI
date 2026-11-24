import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, Loader2, X } from 'lucide-react';
import type { ResumeStage } from '@/types';
import { cn } from '@/utils/format';

export const PIPELINE_STAGES: { key: 'uploading' | ResumeStage; label: string; detail: string }[] = [
  { key: 'uploading', label: 'Uploading', detail: 'Sending your file over an encrypted connection' },
  { key: 'validating', label: 'Validating', detail: 'Checking file signature, size and format' },
  { key: 'extracting', label: 'Extracting text', detail: 'Reading text and scanning for hidden content' },
  { key: 'detecting_skills', label: 'Detecting skills', detail: 'Matching terms against the skill taxonomy' },
  { key: 'analysing_experience', label: 'Analysing experience', detail: 'Reading roles, dates and education' },
  { key: 'generating_report', label: 'Generating report', detail: 'Building your profile summary and suggestions' },
];

const ORDER = ['uploading', 'uploaded', 'validating', 'extracting', 'detecting_skills', 'analysing_experience', 'generating_report', 'completed'];

/**
 * Shows the real processing state. The client controls only the upload step;
 * every later step reflects the stage the server has recorded.
 */
export function AIProcessing({ stage, uploadPct, error, fileName }: { stage: 'uploading' | ResumeStage; uploadPct?: number; error?: string | null; fileName?: string }) {
  const failed = stage === 'failed';
  const current = stage === 'uploaded' ? 'validating' : stage;
  const currentIndex = ORDER.indexOf(current);
  const done = stage === 'completed';
  const activeLabel = PIPELINE_STAGES.find((s) => s.key === current);

  return (
    <div className="grid gap-6 md:grid-cols-[13rem_1fr] md:items-center">
      {/* Document being read */}
      <div className="relative mx-auto flex h-60 w-44 items-center justify-center">
        {!done && !failed && (
          <div className="animate-orbit absolute inset-0" aria-hidden>
            {[0, 120, 240].map((deg) => (
              <span key={deg} className="absolute top-1/2 left-1/2 size-2 rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" style={{ transform: `rotate(${deg}deg) translateX(104px)` }} />
            ))}
          </div>
        )}
        <div className={cn('relative h-52 w-40 overflow-hidden rounded-2xl border bg-surface p-4 shadow-lifted', failed ? 'border-danger/50' : 'border-line-strong')}>
          <FileText className="size-5 text-primary" aria-hidden />
          <div className="mt-3 space-y-2" aria-hidden>
            {[90, 70, 82, 55, 76, 64, 88, 48].map((w, i) => (
              <div key={i} className={cn('h-1.5 rounded-full transition-colors duration-500', currentIndex > 3 + (i % 3) || done ? 'bg-primary/40' : 'bg-elevated')} style={{ width: `${w}%` }} />
            ))}
          </div>
          {!done && !failed && <div className="animate-scan absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-cyan/25 to-transparent" aria-hidden><div className="absolute inset-x-0 bottom-1/2 h-px bg-cyan shadow-[0_0_10px_var(--cyan)]" /></div>}
          <AnimatePresence>
            {(done || failed) && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn('absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-full text-white', done ? 'bg-success' : 'bg-danger')}>
                {done ? <Check className="size-5" /> : <X className="size-5" />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage list */}
      <div>
        {fileName && <p className="mb-3 truncate text-sm font-semibold text-ink">{fileName}</p>}
        <ol className="space-y-1.5" aria-label="Processing stages">
          {PIPELINE_STAGES.map((s) => {
            const idx = ORDER.indexOf(s.key);
            const state = done || idx < currentIndex ? 'done' : idx === currentIndex && !failed ? 'active' : failed && idx === currentIndex ? 'failed' : 'pending';
            return (
              <li key={s.key} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 transition-colors', state === 'active' && 'bg-primary-soft')} aria-current={state === 'active' ? 'step' : undefined}>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] font-bold',
                    state === 'done' && 'border-success bg-success text-white',
                    state === 'active' && 'border-primary text-primary',
                    state === 'pending' && 'border-line-strong text-ink-faint',
                    state === 'failed' && 'border-danger bg-danger text-white',
                  )}
                >
                  {state === 'done' ? <Check className="size-3.5" /> : state === 'active' ? <Loader2 className="size-3.5 animate-spin" /> : state === 'failed' ? <X className="size-3.5" /> : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-semibold', state === 'pending' ? 'text-ink-faint' : 'text-ink')}>{s.label}</p>
                  {state === 'active' && <p className="text-caption text-ink-muted">{s.detail}</p>}
                </div>
                {s.key === 'uploading' && state === 'active' && uploadPct !== undefined && <span className="tabular text-caption font-semibold text-primary">{uploadPct}%</span>}
              </li>
            );
          })}
        </ol>
        <p className="sr-only" aria-live="polite">
          {failed ? `Processing failed: ${error ?? ''}` : done ? 'Analysis complete' : activeLabel ? `${activeLabel.label}` : ''}
        </p>
        {failed && error && <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}

/** Compact inline indicator for "AI is working" states (screening, evaluation). */
export function AIWorking({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3" role="status">
      <span className="relative flex size-8 items-center justify-center">
        <span className="animate-pulse-soft absolute inset-0 rounded-full bg-primary/30" />
        <span className="animate-orbit absolute inset-0">
          <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-cyan" />
        </span>
        <span className="size-2.5 rounded-full bg-primary" />
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
    </div>
  );
}
