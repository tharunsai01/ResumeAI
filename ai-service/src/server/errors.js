import { ZodError } from "zod";
import { ResumeParseError } from "../parsing/parseResume.js";
import { ExtractionError } from "../extraction/extractResume.js";
import { LlmError } from "../llm/jsonCall.js";
import { MatchError } from "../matching/jobSchema.js";
import { BusyError } from "./limiter.js";

/** An error we meant to send to the caller. */
export class ApiError extends Error {
  constructor(status, code, message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.headers = options.headers ?? {};
    this.details = options.details;
  }
}

const PARSE_STATUS = {
  INVALID_FILE: 400,
  EMPTY_FILE: 400,
  UNSUPPORTED_TYPE: 415,
  TOO_LARGE: 413,
  TOO_LONG: 422,
  NO_TEXT_FOUND: 422,
};

const isRateLimit = (error) => /rate limit/i.test(error?.message ?? "");

/**
 * Turns anything thrown into { status, code, message, headers, details }.
 * Only messages written by us are sent out. Unknown errors become a generic 500 (the real one is logged).
 */
export function describeError(error) {
  if (error instanceof ApiError) {
    return { status: error.status, code: error.code, message: error.message, headers: error.headers, details: error.details };
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "The request is not valid.",
      details: error.issues.slice(0, 10).map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    };
  }
  if (error?.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") return { status: 413, code: "TOO_LARGE", message: "The file is larger than 5 MB." };
    return { status: 400, code: "UPLOAD_ERROR", message: "The file upload could not be read." };
  }
  if (error?.type === "entity.too.large") return { status: 413, code: "PAYLOAD_TOO_LARGE", message: "The request body is too large." };
  if (error?.type === "entity.parse.failed") return { status: 400, code: "INVALID_JSON", message: "The request body is not valid JSON." };
  if (error instanceof ResumeParseError) {
    return { status: PARSE_STATUS[error.code] ?? 400, code: error.code, message: error.message };
  }
  if (error instanceof MatchError) return { status: 400, code: error.code, message: error.message };
  if (error instanceof ExtractionError || error instanceof LlmError) {
    if (error.code === "EMPTY_TEXT") return { status: 400, code: "EMPTY_TEXT", message: error.message };
    if (error.code === "NO_API_KEY") return { status: 500, code: "SERVICE_MISCONFIGURED", message: "The AI service is not configured." };
    if (error.code === "INVALID_MODEL_OUTPUT") {
      return { status: 502, code: "AI_OUTPUT_INVALID", message: "The AI model returned an answer that could not be used. Please try again." };
    }
    if (error.code === "API_ERROR" && isRateLimit(error)) {
      return { status: 429, code: "RATE_LIMITED", message: "The AI provider's rate limit was reached. Please try again in a minute.", headers: { "Retry-After": "60" } };
    }
    return { status: 502, code: "AI_PROVIDER_ERROR", message: "The AI provider request failed." };
  }
  if (error instanceof BusyError) {
    return { status: 503, code: "BUSY", message: "The service is busy. Please try again shortly.", headers: { "Retry-After": "5" } };
  }
  return { status: 500, code: "INTERNAL", message: "Something went wrong." };
}