import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ThemePref } from '@/types';

interface ThemeState {
  preference: ThemePref;
  resolved: 'light' | 'dark';
  setPreference: (p: ThemePref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const KEY = 'hs-theme';

function readStored(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPref] = useState<ThemePref>(readStored);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSystemDark(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#080B16' : '#F6F7FB');
  }, [resolved]);

  const setPreference = useCallback((p: ThemePref) => {
    setPref(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {
      /* private mode */
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, setPreference, toggle: () => setPreference(resolved === 'dark' ? 'light' : 'dark') }),
    [preference, resolved, setPreference],
  ) as ThemeState;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
