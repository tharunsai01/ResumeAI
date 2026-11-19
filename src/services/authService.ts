import { api, refreshSession, setAccessToken, setAuthFailureHandler, type AuthUser, type Session } from './httpClient';

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string; // recruiters; filled from the profile API in Phase 3
  isVerified?: boolean;
}

const AUTH_EVENT = 'hiresmart_auth_changed';

// The old mock stored users and plaintext passwords here: delete them
localStorage.removeItem('hiresmart_users');
localStorage.removeItem('hiresmart_session');

let currentUser: User | null = null;

function setUser(user: User | null) {
  currentUser = user;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function toUser(u: AuthUser): User {
  return { id: u.id, email: u.email, name: u.fullName, role: u.role, isVerified: u.isVerified };
}

// If a refresh fails mid-session, api.ts calls this and the app logs the user out
setAuthFailureHandler(() => setUser(null));

async function startSession(path: string, body: unknown, company?: string): Promise<User> {
  const session = await api<Session>(path, { method: 'POST', body, auth: false });
  setAccessToken(session.accessToken);
  const user = { ...toUser(session.user), ...(company ? { company } : {}) };
  setUser(user);
  return user;
}

export const authService = {
  // Same name as the mock: returns whoever is logged in right now (in memory)
  getCurrentUser(): User | null {
    return currentUser;
  },

  isAuthenticated(): boolean {
    return currentUser !== null;
  },

  // NEW: call once on app start to restore the session from the refresh cookie
  async restoreSession(): Promise<User | null> {
    const session = await refreshSession();
    setUser(session ? toUser(session.user) : null);
    return currentUser;
  },

  login(email: string, password: string): Promise<User> {
    return startSession('/auth/login', { email, password });
  },

  register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    company?: string;
  }): Promise<User> {
    if (data.role === 'admin') throw new Error('Invalid role');
    return startSession(
      '/auth/register',
      {
        fullName: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        companyName: data.company,
      },
      data.company,
    );
  },

  // CHANGED: needs the credential from Google's button (see below)
  googleAuth(credential: string, role?: UserRole, company?: string): Promise<User> {
    return startSession('/auth/google', { credential, role, companyName: company }, company);
  },

  async logout(): Promise<void> {
    setAccessToken(null);
    setUser(null); // the UI updates immediately
    await api('/auth/logout', { method: 'POST', auth: false }).catch(() => {});
  },

  verifyEmail: (token: string) =>
    api('/auth/verify-email', { method: 'POST', body: { token }, auth: false }),
  resendVerification: () => api('/auth/resend-verification', { method: 'POST' }),
  forgotPassword: (email: string) =>
    api('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (token: string, password: string) =>
    api('/auth/reset-password', { method: 'POST', body: { token, password }, auth: false }),
};
