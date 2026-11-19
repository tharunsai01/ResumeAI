import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, type User, type UserRole } from '../services/authService';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  googleAuth: (credential: string, role?: UserRole, company?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sync = () => setUser(authService.getCurrentUser());
    window.addEventListener('hiresmart_auth_changed', sync);

    authService.restoreSession().finally(() => setIsLoading(false));

    return () => window.removeEventListener('hiresmart_auth_changed', sync);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: authService.login,
    register: authService.register,
    googleAuth: authService.googleAuth,
    logout: authService.logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
