const API_URL = import.meta.env.VITE_API_URL as string;

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'candidate' | 'recruiter';
  isVerified: boolean;
}
export interface Session {
  user: AuthUser;
  accessToken: string;
}

export class ApiClientError extends Error {
	status: number;
	details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let accessToken: string | null = null; // memory only: never localStorage
let refreshPromise: Promise<Session | null> | null = null;
let onAuthFailure: (() => void) | null = null;

export const setAccessToken = (t: string | null) => { accessToken = t; };
export const setAuthFailureHandler = (fn: (() => void) | null) => { onAuthFailure = fn; };

async function parse<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new ApiClientError(res.status, body?.error?.message ?? 'Request failed', body?.error?.details);
  }
  return body.data as T;
}

// Single-flight: concurrent callers share one refresh request
export function refreshSession(): Promise<Session | null> {
  refreshPromise ??= fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      const session = await parse<Session>(res);
      accessToken = session.accessToken;
      return session;
    })
    .catch(() => {
      accessToken = null;
      return null;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await send();

  if (res.status === 401 && auth) {
    const session = await refreshSession();
    if (session) res = await send(); // retry once with the new token
    else onAuthFailure?.();
  }
  return parse<T>(res);
}
