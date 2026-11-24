import { Monitor, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/format';
import { Dropdown } from '../ui';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <defs>
        <linearGradient id="hs-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="0.6" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" className="fill-ink dark:fill-[#161C33]" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeOpacity=".18" strokeWidth="3" className="text-white" />
      <path d="M16 7.5a8.5 8.5 0 1 1-8.1 11.1" fill="none" stroke="url(#hs-logo)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" fill="#F8FAFC" />
    </svg>
  );
}

export function Logo({ to = '/', className, compact }: { to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="HireSmart AI home">
      <LogoMark />
      {!compact && (
        <span className="text-[1.0625rem] font-extrabold tracking-tight text-ink">
          HireSmart <span className="font-semibold text-ink-muted">AI</span>
        </span>
      )}
    </Link>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, resolved, setPreference } = useTheme();
  const Icon = resolved === 'dark' ? Moon : Sun;
  return (
    <Dropdown
      label="Theme"
      trigger={(props) => (
        <button {...props} className={cn('flex size-10 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-elevated hover:text-ink', className)} aria-label={`Theme: ${preference}. Change theme`}>
          <Icon className="size-[1.15rem]" />
        </button>
      )}
      items={[
        { label: 'Light', icon: <Sun className="size-4" />, onSelect: () => setPreference('light') },
        { label: 'Dark', icon: <Moon className="size-4" />, onSelect: () => setPreference('dark') },
        { label: 'Match system', icon: <Monitor className="size-4" />, onSelect: () => setPreference('system') },
      ]}
    />
  );
}

/** Brand marks are not part of the icon set, so they are drawn here. */
export const SocialIcons = {
  linkedin: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2.04c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .3" />
    </svg>
  ),
};
