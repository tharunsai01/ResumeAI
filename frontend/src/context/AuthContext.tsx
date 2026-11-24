import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { refreshSession, setAccessToken, setSessionExpiredHandler } from '@/services/api';
import { authApi } from '@/services/endpoints';
import type { Role, User } from '@/types';
import { useTheme } from './ThemeContext';

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (email: string, password: string) => Promise<User>;
  register: (body: Parameters<typeof authApi.register>[0]) => Promise<User>;
  logout: () => Promise<void>;
  completeOAuth: () => Promise<User | null>;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const homeFor = (role: Role) => (role === 'admin' ? '/admin' : role === 'recruiter' ? '/recruiter' : '/candidate');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const { setPreference } = useTheme();

  const accept = useCallback(
    (u: User, token: string) => {
      setAccessToken(token);
      setUser(u);
      setStatus('authenticated');
      if (u.preferences?.theme) setPreference(u.preferences.theme);
      return u;
    },
    [setPreference],
  );

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setAccessToken(null);
      setUser(null);
      setStatus('anonymous');
    });
    // Restore the session from the httpOnly refresh cookie
    refreshSession().then((s) => {
      if (s) accept(s.user, s.accessToken);
      else setStatus('anonymous');
    });
  }, [accept]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      login: async (email, password) => {
        const r = await authApi.login(email, password);
        return accept(r.user, r.accessToken);
      },
      register: async (body) => {
        const r = await authApi.register(body);
        return accept(r.user, r.accessToken);
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          setAccessToken(null);
          setUser(null);
          setStatus('anonymous');
        }
      },
      completeOAuth: async () => {
        const s = await refreshSession();
        if (!s) return null;
        return accept(s.user, s.accessToken);
      },
      setUser,
    }),
    [user, status, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
