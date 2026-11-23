/**
 * HireSmart AI - Centralized API Error Handling
 * Standardized error representation for HTTP requests, network failures, and timeouts.
 */

export interface ApiErrorOptions {
  /** HTTP status code (e.g., 400, 404, 500) if available */
  status?: number
  /** Detailed error payload returned by the server or underlying error */
  details?: unknown
  /** Flag indicating request failed due to connectivity/DNS/CORS issues */
  isNetworkError?: boolean
  /** Flag indicating request timed out */
  isTimeout?: boolean
  /** Original underlying error or cause */
  cause?: unknown
}

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request. Please verify the submitted information.",
  401: "Authentication required. Please sign in to continue.",
  403: "Access forbidden. You do not have permission to perform this action.",
  404: "Requested resource not found.",
  408: "Request timed out on the server.",
  409: "Conflict detected. The resource may already exist or has been modified.",
  422: "Validation failed. Please correct the highlighted errors.",
  429: "Too many requests. Please slow down and try again shortly.",
  500: "Internal server error. Please try again later.",
  502: "Bad gateway. The server encountered an invalid upstream response.",
  503: "Service temporarily unavailable. Please try again later.",
  504: "Gateway timeout. The upstream service took too long to respond.",
}

/**
 * Standard application error for API requests.
 */
export class ApiError extends Error {
  readonly status?: number
  readonly details?: unknown
  readonly isNetworkError: boolean
  readonly isTimeout: boolean

  constructor(message: string, options?: ApiErrorOptions) {
    super(message)
    this.name = "ApiError"
    this.status = options?.status
    this.details = options?.details
    this.isNetworkError = Boolean(options?.isNetworkError)
    this.isTimeout = Boolean(options?.isTimeout)

    if (options?.cause !== undefined) {
      this.cause = options.cause
    }

    // Maintain correct prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Constructs an ApiError from an HTTP Response and optional raw response body.
   */
  static fromResponse(response: Response, rawBody?: unknown): ApiError {
    let extractedMessage = ""

    if (typeof rawBody === "string" && rawBody.trim()) {
      const trimmed = rawBody.trim()
      // Only use text body if it is not an HTML error document and reasonably concise
      if (!trimmed.toLowerCase().includes("<html") && trimmed.length <= 256) {
        extractedMessage = trimmed
      }
    } else if (rawBody && typeof rawBody === "object") {
      const record = rawBody as Record<string, unknown>
      if (typeof record.message === "string" && record.message.trim()) {
        extractedMessage = record.message.trim()
      } else if (typeof record.error === "string" && record.error.trim()) {
        extractedMessage = record.error.trim()
      } else if (record.error && typeof record.error === "object") {
        const nested = record.error as Record<string, unknown>
        if (typeof nested.message === "string" && nested.message.trim()) {
          extractedMessage = nested.message.trim()
        }
      } else if (typeof record.msg === "string" && record.msg.trim()) {
        extractedMessage = record.msg.trim()
      }
    }

    const fallbackMessage =
      HTTP_STATUS_MESSAGES[response.status] ||
      `Request failed with status ${response.status}${response.statusText ? ` (${response.statusText})` : ""}.`

    const message = extractedMessage || fallbackMessage

    return new ApiError(message, {
      status: response.status,
      details: rawBody,
    })
  }

  /**
   * Constructs an ApiError for network connectivity / DNS / CORS failures.
   */
  static networkError(originalError?: unknown): ApiError {
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine
    const message = isOffline
      ? "You appear to be offline. Please check your internet connection."
      : "Network error. Unable to reach the server. Please verify your connection."

    return new ApiError(message, {
      isNetworkError: true,
      details: originalError,
      cause: originalError,
    })
  }

  /**
   * Constructs an ApiError for requests aborted due to timeouts.
   */
  static timeoutError(timeoutMs: number): ApiError {
    return new ApiError(`Request timed out after ${timeoutMs}ms. Please try again.`, {
      isTimeout: true,
      details: { timeoutMs },
    })
  }

  /**
   * Constructs an ApiError for unexpected client-side exceptions during a request.
   */
  static unexpectedError(originalError?: unknown): ApiError {
    const message =
      originalError instanceof Error && originalError.message
        ? originalError.message
        : "An unexpected error occurred while processing the request."

    return new ApiError(message, {
      details: originalError,
      cause: originalError,
    })
  }
}
