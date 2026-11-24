/**
 * HireSmart AI - Environment Configuration
 * Safe, validated environment settings with offline mock mode active by default.
 */

export interface AppConfig {
  /** API Base URL for backend services */
  readonly apiBaseUrl: string
  /** AI Microservice endpoint URL */
  readonly aiServiceUrl: string
  /** Whether the application runs in offline/mock mode (defaults to true) */
  readonly useMock: boolean
  /** Application environment name */
  readonly appEnv: "development" | "production" | "test"
  /** Optional Google Client ID for Google OAuth / Sign-in */
  readonly googleClientId: string
  /** Optional LinkedIn Client ID for LinkedIn OAuth */
  readonly linkedinClientId: string
}

function resolveEnvString(value: string | undefined, defaultValue: string): string {
  if (!value || typeof value !== "string" || !value.trim()) {
    return defaultValue
  }
  return value.trim()
}

function resolveEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultValue
  }
  const normalized = String(value).trim().toLowerCase()
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false
  }
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true
  }
  return defaultValue
}

const globalProcess = typeof globalThis !== "undefined" ? (globalThis as any).process : undefined

const metaEnv: Record<string, any> =
  typeof import.meta !== "undefined" && (import.meta as any).env
    ? (import.meta as any).env
    : globalProcess?.env
    ? globalProcess.env
    : {}

export const env: AppConfig = {
  apiBaseUrl: resolveEnvString(metaEnv.VITE_API_BASE_URL, "http://localhost:5000/api/v1"),
  aiServiceUrl: resolveEnvString(metaEnv.VITE_AI_SERVICE_URL, "http://localhost:8000/api"),
  useMock: resolveEnvBoolean(metaEnv.VITE_USE_MOCK, true),
  appEnv: (metaEnv.MODE as AppConfig["appEnv"]) || "development",
  googleClientId: resolveEnvString(metaEnv.VITE_GOOGLE_CLIENT_ID, ""),
  linkedinClientId: resolveEnvString(metaEnv.VITE_LINKEDIN_CLIENT_ID, ""),
}
