import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { backdrop, drawerFromRight, popIn } from '@/config/motion';
import { cn } from '@/utils/format';
import { Button } from './Button';
import { Textarea } from './Field';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Focus trap + Escape + scroll lock + focus restore for dialogs and drawers. */
function useDialogBehaviour(open: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel.current)?.focus();
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);
  return panel;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panel = useDialogBehaviour(open, onClose);
  const titleId = useId();
  const descId = useId();
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div variants={backdrop} initial="hidden" animate="show" exit="exit" className="absolute inset-0 bg-[#050711]/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line-strong bg-surface shadow-lifted sm:rounded-3xl', widths[size])}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 id={titleId} className="text-h3 font-bold text-ink">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1 text-sm text-ink-muted">
                    {description}
                  </p>
                )}
              </div>
              <button onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink-faint hover:bg-elevated hover:text-ink" aria-label="Close dialog">
                <X className="size-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-elevated/50 px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, footer, width = 'max-w-xl' }: Omit<ModalProps, 'size'> & { width?: string }) {
  const panel = useDialogBehaviour(open, onClose);
  const titleId = useId();
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div variants={backdrop} initial="hidden" animate="show" exit="exit" className="absolute inset-0 bg-[#050711]/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
          <motion.aside
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            variants={drawerFromRight}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn('absolute inset-y-0 right-0 flex w-full flex-col border-l border-line-strong bg-surface shadow-lifted', width)}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h2 id={titleId} className="truncate text-h3 font-bold text-ink">
                {title}
              </h2>
              <button onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink-faint hover:bg-elevated hover:text-ink" aria-label="Close panel">
                <X className="size-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void> | void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  withNote?: boolean;
  noteLabel?: string;
  noteRequired?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, tone = 'primary', withNote, noteLabel = 'Note (optional)', noteRequired }: ConfirmProps) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  useEffect(() => {
    if (open) setNote('');
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={
        <span className="flex items-center gap-2">
          {tone === 'danger' && <AlertTriangle className="size-5 text-danger" aria-hidden />}
          {title}
        </span>
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            loading={busy}
            disabled={noteRequired && note.trim().length < 3}
            data-autofocus
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(note.trim());
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-muted">{description}</div>
      {withNote && <Textarea wrapperClassName="mt-4" label={noteLabel} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="min-h-20" required={noteRequired} />}
    </Modal>
  );
}
