/**
 * HTTP client for the FastAPI AI microservice. All AI logic lives there;
 * this module only transports data and checks the shape of what comes back.
 */
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

async function call<T>(path: string, init: { json?: unknown; form?: FormData; timeoutMs?: number; method?: string } = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? env.AI_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.AI_SERVICE_URL}${path}`, {
      method: init.method ?? 'POST',
      headers: {
        'X-Internal-Token': env.AI_SERVICE_TOKEN,
        ...(init.json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
      signal: controller.signal,
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const message = typeof body?.detail === 'string' ? body.detail : 'AI service rejected the request';
      throw new ApiError(res.status === 422 ? 422 : 502, message, 'AI_SERVICE_ERROR');
    }
    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.warn({ path, err: (err as Error).name }, 'AI service unreachable');
    throw ApiError.unavailable('AI service is unavailable. Please try again shortly.');
  } finally {
    clearTimeout(timer);
  }
}

export interface MatchComponents {
  skills: number;
  experience: number;
  education: number;
  role: number;
}

export interface AiMatchResult {
  candidate_id: string | null;
  job_id: string | null;
  overall_score: number;
  category: 'Strong Match' | 'Potential Match' | 'Low Match';
  components: MatchComponents;
  matched_skills: unknown[];
  related_skills: unknown[];
  missing_skills: unknown[];
  strengths: string[];
  gaps: string[];
  explanation: string;
  narrative?: string;
  recommendations: string[];
  details: unknown;
  model_version: string;
  embedding_backend: string;
  llm_used: boolean;
  validated: boolean;
  timestamp: string;
  rank?: number;
}

export const aiClient = {
  health: () => call<Record<string, unknown>>('/health', { method: 'GET', timeoutMs: 5000 }),
  extractText: (file: Buffer, name: string) => {
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(file)]), name);
    return call<{ text: string; file_type: string; pages: number; truncated: boolean; hidden_text: string[]; security: any }>(
      '/resume/extract-text',
      { form },
    );
  },
  skills: (text: string, customSkills: unknown[]) => call<{ skills: any[]; unknown_skills: string[] }>('/resume/skills', { json: { text, custom_skills: customSkills } }),
  profile: (text: string) => call<Record<string, any>>('/resume/profile', { json: { text } }),
  report: (text: string, hiddenText: string[], customSkills: unknown[]) =>
    call<Record<string, any>>('/resume/report', { json: { text, hidden_text: hiddenText, custom_skills: customSkills } }),
  extractJob: (title: string, description: string, customSkills: unknown[]) =>
    call<Record<string, any>>('/jobs/extract', { json: { title, description, custom_skills: customSkills } }),
  match: (payload: unknown) => call<AiMatchResult>('/match', { json: payload }),
  screen: (payload: unknown) => call<{ count: number; results: AiMatchResult[] }>('/screen', { json: payload, timeoutMs: 120000 }),
  recommend: (payload: unknown) => call<{ results: AiMatchResult[] }>('/recommend', { json: payload }),
  skillGap: (payload: unknown) => call<Record<string, any>>('/skill-gap', { json: payload }),
  evaluate: (payload: unknown) => call<Record<string, any>>('/evaluation/run', { json: payload, timeoutMs: 180000 }),
};
