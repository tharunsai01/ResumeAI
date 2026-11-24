import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/format';

const control =
  'w-full rounded-[var(--radius-control)] border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 outline-none focus:border-primary focus:ring-4 focus:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-60';

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-[0.8125rem] font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
        </label>
      )}
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className="text-caption text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode; hint?: ReactNode; error?: string; leading?: ReactNode; wrapperClassName?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, leading, className, wrapperClassName, required, type, ...rest }, ref) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-faint">{leading}</span>}
          <input
            ref={ref}
            id={id}
            type={isPassword && reveal ? 'text' : type}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            required={required}
            className={cn(control, 'h-11', leading && 'pl-10', isPassword && 'pr-11', invalid ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong', className)}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute inset-y-0 right-1.5 my-auto flex size-8 items-center justify-center rounded-lg text-ink-faint hover:bg-elevated hover:text-ink"
              aria-label={reveal ? 'Hide password' : 'Show password'}
              aria-pressed={reveal}
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      )}
    </Field>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode; hint?: ReactNode; error?: string; wrapperClassName?: string };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, className, wrapperClassName, required, ...rest }, ref) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea
          ref={ref}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={required}
          className={cn(control, 'min-h-28 py-3 leading-relaxed', invalid ? 'border-danger' : 'border-line-strong', className)}
          {...rest}
        />
      )}
    </Field>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; hint?: ReactNode; error?: string; options: { value: string | number; label: string }[]; wrapperClassName?: string };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, hint, error, options, className, wrapperClassName, required, ...rest }, ref) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            required={required}
            className={cn(control, 'h-11 cursor-pointer appearance-none pr-10', invalid ? 'border-danger' : 'border-line-strong', className)}
            {...rest}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-ink-faint" aria-hidden />
        </div>
      )}
    </Field>
  );
});

export function Switch({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50', checked ? 'bg-primary' : 'bg-line-strong')}
      >
        <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
      </button>
    </div>
  );
}

/** Free-text tag entry: Enter or comma adds a tag. Used for skills. */
export function TagInput({ value, onChange, label, placeholder, hint, suggestions = [], max = 40 }: { value: string[]; onChange: (v: string[]) => void; label?: string; placeholder?: string; hint?: string; suggestions?: string[]; max?: number }) {
  const [draft, setDraft] = useState('');
  const listId = useId();
  const add = (raw: string) => {
    const t = raw.trim().replace(/,$/, '');
    if (!t || value.some((v) => v.toLowerCase() === t.toLowerCase()) || value.length >= max) return;
    onChange([...value, t]);
    setDraft('');
  };
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-[var(--radius-control)] border border-line-strong bg-surface px-2 py-1.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary-soft">
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-primary-soft py-1 pr-1 pl-2.5 text-[0.8125rem] font-semibold text-primary">
              {tag}
              <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} className="rounded p-0.5 hover:bg-primary/15" aria-label={`Remove ${tag}`}>
                ×
              </button>
            </span>
          ))}
          <input
            id={id}
            aria-describedby={describedBy}
            list={suggestions.length ? listId : undefined}
            value={draft}
            onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add(draft);
              } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
            }}
            onBlur={() => draft && add(draft)}
            placeholder={value.length ? '' : placeholder}
            className="h-8 min-w-32 flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-ink-faint"
          />
          {suggestions.length > 0 && (
            <datalist id={listId}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>
      )}
    </Field>
  );
}
