import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import type { ApplicationStatus, Job, MatchCategory } from '@/types';

// Teach tailwind-merge about the custom type scale; otherwise `text-caption`
// is mistaken for a colour and dropped when a `text-ink-*` class follows it.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'caption'] }] } },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
export function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return 'just now';
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return formatDate(iso);
}

export const formatDate = (iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Intl.DateTimeFormat('en', opts).format(new Date(iso)) : '';

export const formatDateTime = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso)) : '';

export function formatSalary(salary?: Job['salary']) {
  if (!salary || (!salary.min && !salary.max)) return null;
  const fmt = new Intl.NumberFormat('en', { style: 'currency', currency: salary.currency || 'USD', notation: 'compact', maximumFractionDigits: 1 });
  const per = { year: '/yr', month: '/mo', hour: '/hr' }[salary.period] ?? '';
  if (salary.min && salary.max) return `${fmt.format(salary.min)} to ${fmt.format(salary.max)}${per}`;
  return `${salary.min ? 'From ' + fmt.format(salary.min) : 'Up to ' + fmt.format(salary.max!)}${per}`;
}

export const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export const EDUCATION_LABELS = ['Not specified', 'High school', 'Associate or diploma', "Bachelor's", "Master's", 'Doctorate'];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screened: 'Screened',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  hired: 'Hired',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};

export const WORK_MODE_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' } as const;

export function scoreTone(score?: number | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (score === undefined || score === null) return 'neutral';
  return score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
}
export const categoryTone = (c?: MatchCategory) => (c === 'Strong Match' ? 'success' : c === 'Potential Match' ? 'warning' : c ? 'danger' : 'neutral');

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

export const plural = (n: number, word: string, pluralWord = word + 's') => `${n} ${n === 1 ? word : pluralWord}`;
