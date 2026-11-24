import type { Response } from 'express';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Every successful response: { success: true, data, meta? } */
export function ok<T>(res: Response, data: T, meta?: PageMeta | Record<string, unknown>, status = 200) {
  return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, undefined, 201);
}

export function paginate(query: { page?: number; limit?: number }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(page: number, limit: number, total: number): PageMeta {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
}
