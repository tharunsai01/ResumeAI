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

export const env: AppConfig = Object.freeze({
  apiBaseUrl: resolveEnvString(import.meta.env.VITE_API_BASE_URL, "http://localhost:5000/api/v1"),
  aiServiceUrl: resolveEnvString(import.meta.env.VITE_AI_SERVICE_URL, "http://localhost:8000/api"),
  useMock: resolveEnvBoolean(import.meta.env.VITE_USE_MOCK, true),
  appEnv: (import.meta.env.MODE as AppConfig["appEnv"]) || "development",
})
