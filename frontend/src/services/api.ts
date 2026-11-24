import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { ApiEnvelope, User } from '@/types';

export const IS_MOCK = __MOCK__;

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  timeout: 60000,
});

// The access token lives only in memory. The refresh token is an httpOnly cookie.
let accessToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`);
  config.headers.set('X-Requested-With', 'HireSmart');
  return config;
});

let refreshing: Promise<string | null> | null = null;

export async function refreshSession(): Promise<{ user: User; accessToken: string } | null> {
  try {
    const res = await api.post<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/refresh', undefined, { _skipRefresh: true } as never);
    setAccessToken(res.data.data.accessToken);
    return res.data.data;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error?: { code?: string } }>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean; _skipRefresh?: boolean }) | undefined;
    const code = error.response?.data?.error?.code;
    if (error.response?.status === 401 && original && !original._retried && !original._skipRefresh && code === 'TOKEN_INVALID') {
      original._retried = true;
      refreshing ??= refreshSession().then((s) => s?.accessToken ?? null).finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) return api(original);
      onSessionExpired?.();
    }
    return Promise.reject(error);
  },
);

/** Install the in-browser sample data layer. Only reachable in `--mode mock` builds. */
export async function setupApi() {
  if (__MOCK__) {
    const { installMockAdapter } = await import('./mock/mockAdapter');
    installMockAdapter(api);
  }
}

export interface ApiErrorShape {
  message: string;
  code?: string;
  details?: { path: string; message: string }[];
  status?: number;
}

export function toApiError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { error?: { message?: string; code?: string; details?: ApiErrorShape['details'] } } | undefined;
    if (body?.error?.message) return { message: body.error.message, code: body.error.code, details: body.error.details, status: err.response?.status };
    if (err.code === 'ECONNABORTED') return { message: 'The request timed out. Check your connection and try again.' };
    if (!err.response) return { message: 'Cannot reach the HireSmart server. Check your connection and try again.' };
    return { message: `Request failed (${err.response.status})`, status: err.response.status };
  }
  return { message: (err as Error)?.message || 'Something went wrong' };
}

/** Unwrap the { success, data, meta } envelope. */
export async function unwrap<T>(p: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  return (await p).data.data;
}
export async function unwrapPage<T>(p: Promise<{ data: ApiEnvelope<T[]> }>) {
  const res = (await p).data;
  return { items: res.data, meta: res.meta };
}
