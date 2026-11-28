/**
 * HireSmart AI - Lightweight HTTP API Client
 * Built on native browser fetch with timeout handling, standardized error mapping,
 * and seamless support for JSON and FormData payloads.
 */

import { env } from "../../config/env"
import { ApiError } from "./apiError"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"

export interface HttpRequestOptions extends Omit<RequestInit, "body" | "method"> {
  responseType?: "blob"
  /** Optional URL query parameters serialized into the URL */
  params?: Record<string, string | number | boolean | undefined | null>
  /** Custom request headers */
  headers?: Record<string, string>
  /** Request body: plain object/array (serialized to JSON), string, or FormData */
  body?: unknown
  /** Request timeout in milliseconds (defaults to 15,000ms) */
  timeoutMs?: number
}

export interface HttpClientConfig {
  /** Base URL for API requests */
  baseUrl?: string
  /** Default timeout in milliseconds */
  defaultTimeoutMs?: number
  /** Default headers applied to every request */
  defaultHeaders?: Record<string, string>
}

const DEFAULT_TIMEOUT_MS = 15000
const ACCESS_TOKEN_KEY = "hiresmart_access_token"
export const SESSION_KEY = "hiresmart_session"
const SESSION_LOCK = "hiresmart-session-refresh"

/**
 * Reusable HTTP Client wrapping native fetch.
 */
export class HttpClient {
  readonly baseUrl: string
  readonly defaultTimeoutMs: number
  readonly defaultHeaders: Record<string, string>
  private authToken: string | null = null
  private refreshRequest: Promise<boolean> | null = null

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? env.apiBaseUrl
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS
    this.defaultHeaders = { ...(config.defaultHeaders ?? {}) }
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
    }
  }

  getAuthToken(): string | null {
    return typeof window === "undefined" ? this.authToken : localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  async endSession(): Promise<void> {
    const logout = async () => {
      await this.refreshRequest?.catch(() => {})
      await this.post("/auth/logout")
    }
    if (navigator.locks) {
      await navigator.locks.request(SESSION_LOCK, async () => { await this.post("/auth/logout") })
    } else {
      await logout()
    }
  }

  private refreshSession(rejectedToken: string): Promise<boolean> {
    if (this.refreshRequest) return this.refreshRequest
    const renew = async () => {
      const current = this.getAuthToken()
      if (current !== rejectedToken) return Boolean(current)

      const response = await fetch(this.buildUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        signal: AbortSignal.timeout(this.defaultTimeoutMs),
      })
      if (this.getAuthToken() !== rejectedToken) return false
      if (response.status === 401 || response.status === 403) {
        this.setAuthToken(null)
        localStorage.removeItem(SESSION_KEY)
        window.dispatchEvent(new Event("hiresmart_auth_changed"))
        return false
      }
      if (!response.ok) throw ApiError.fromResponse(response)
      const { data } = await response.json()
      if (typeof data?.accessToken !== "string" || !data.accessToken) {
        throw new ApiError("Session renewal returned no access token.")
      }
      if (this.getAuthToken() !== rejectedToken) return false
      this.setAuthToken(data.accessToken)
      return true
    }

    const renewal = navigator.locks ? navigator.locks.request(SESSION_LOCK, renew) : renew()
    this.refreshRequest = renewal.finally(() => { this.refreshRequest = null })
    return this.refreshRequest
  }

  /**
   * Resolves the target URL from base URL, relative endpoint, and query params.
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    let resolvedUrl: string

    if (/^https?:\/\//i.test(endpoint)) {
      resolvedUrl = endpoint
    } else {
      const cleanBase = this.baseUrl.replace(/\/+$/, "")
      const cleanEndpoint = endpoint.replace(/^\/+/, "")
      resolvedUrl = cleanEndpoint ? `${cleanBase}/${cleanEndpoint}` : cleanBase
    }

    if (params && Object.keys(params).length > 0) {
      const urlObj = new URL(
        resolvedUrl,
        typeof window !== "undefined" ? window.location.origin : "http://localhost"
      )

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value))
        }
      })

      // If resolvedUrl was relative or absolute, construct appropriately
      if (/^https?:\/\//i.test(resolvedUrl)) {
        return urlObj.toString()
      } else {
        return `${urlObj.pathname}${urlObj.search}${urlObj.hash}`
      }
    }

    return resolvedUrl
  }

  /**
   * Prepares request headers and body, ensuring proper content type handling
   * for both JSON and FormData without breaking boundary headers.
   */
  private preparePayload(
    body: unknown,
    customHeaders?: Record<string, string>
  ): { headers: Record<string, string>; finalBody?: BodyInit } {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(customHeaders ?? {}),
    }

    const token = this.getAuthToken()
    if (token && !headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${token}`
    }

    if (body === undefined || body === null) {
      return { headers }
    }

    // Handle browser FormData - never set Content-Type so browser sets boundary
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      // Remove any user-supplied content-type to allow boundary injection
      Object.keys(headers).forEach((key) => {
        if (key.toLowerCase() === "content-type") {
          delete headers[key]
        }
      })
      return { headers, finalBody: body }
    }

    // Handle Blob, ArrayBuffer, URLSearchParams
    if (
      (typeof Blob !== "undefined" && body instanceof Blob) ||
      (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) ||
      (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams)
    ) {
      return { headers, finalBody: body as BodyInit }
    }

    // Handle raw string
    if (typeof body === "string") {
      if (!Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
        headers["Content-Type"] = "text/plain;charset=UTF-8"
      }
      return { headers, finalBody: body }
    }

    // Handle JSON object or array
    if (!Object.keys(headers).some((k) => k.toLowerCase() === "content-type")) {
      headers["Content-Type"] = "application/json"
    }
    if (!Object.keys(headers).some((k) => k.toLowerCase() === "accept")) {
      headers["Accept"] = "application/json"
    }

    return {
      headers,
      finalBody: JSON.stringify(body),
    }
  }

  /**
   * Core request execution with timeout and standardized error mapping.
   */
  async request<T = unknown>(
    endpoint: string,
    options: HttpRequestOptions = {},
    method: HttpMethod = "GET",
    retryAfterRefresh = true
  ): Promise<T> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs
    const url = this.buildUrl(endpoint, options.params)
    const { headers, finalBody } = this.preparePayload(options.body, options.headers)

    const controller = new AbortController()
    let isTimedOut = false

    // Chain caller's signal if provided
    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort(options.signal.reason)
      } else {
        options.signal.addEventListener("abort", () => {
          controller.abort(options.signal?.reason)
        })
      }
    }

    const timer = setTimeout(() => {
      isTimedOut = true
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch(url, {
        credentials: "include",
        ...options,
        method,
        headers,
        body: finalBody,
        signal: controller.signal,
      })

      const usedToken = headers.Authorization
      const authPath = url.split("?")[0].split("/auth/")[1]
      if (
        response.status === 401 && retryAfterRefresh && !env.useMock && typeof window !== "undefined" &&
        !controller.signal.aborted && !/^https?:\/\//i.test(endpoint) &&
        (!authPath || authPath === "me") && usedToken?.startsWith("Bearer ") &&
        !Object.keys(options.headers ?? {}).some(key => key.toLowerCase() === "authorization")
      ) {
        if (await this.refreshSession(usedToken.slice(7)) && !controller.signal.aborted) {
          return await this.request<T>(endpoint, options, method, false)
        }
      }

      // Handle non-2xx responses
      if (!response.ok) {
        let errorBody: unknown = null
        try {
          const rawText = await response.text()
          if (rawText && rawText.trim()) {
            try {
              errorBody = JSON.parse(rawText)
            } catch {
              errorBody = rawText
            }
          }
        } catch {
          errorBody = null
        }
        throw ApiError.fromResponse(response, errorBody)
      }

      // 204 No Content, 205 Reset Content, or HEAD response
      if (response.status === 204 || response.status === 205 || method === "HEAD") {
        return null as T
      }

      if (options.responseType === "blob") return await response.blob() as T

      // Safe body extraction
      const text = await response.text()
      if (!text || !text.trim()) {
        return null as T
      }

      try {
        return JSON.parse(text) as T
      } catch {
        return text as unknown as T
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        throw error
      }
      if (isTimedOut) {
        throw ApiError.timeoutError(timeoutMs)
      }
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("Request was aborted.", { details: error })
      }
      if (error instanceof TypeError) {
        // Standard browser fetch failure for network/CORS/offline
        throw ApiError.networkError(error)
      }
      throw ApiError.unexpectedError(error)
    } finally {
      clearTimeout(timer)
    }
  }

  get<T = unknown>(endpoint: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, options, "GET")
  }

  post<T = unknown>(endpoint: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, body }, "POST")
  }

  put<T = unknown>(endpoint: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, body }, "PUT")
  }

  patch<T = unknown>(endpoint: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, body }, "PATCH")
  }

  delete<T = unknown>(endpoint: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>(endpoint, options, "DELETE")
  }
}

/**
 * Default singleton instance configured with application environment settings.
 */
export const httpClient = new HttpClient({
  baseUrl: env.apiBaseUrl,
  defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
})
