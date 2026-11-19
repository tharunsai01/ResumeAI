import Groq from "groq-sdk";
import { config } from "../config.js";

export class LlmError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "LlmError";
    this.code = code;
  }
}

let sharedClient = null;
function getClient() {
  if (!config.groq.apiKey) {
    throw new LlmError("NO_API_KEY", "GROQ_API_KEY is missing. Create ai-service/.env (see .env.example).");
  }
  sharedClient ??= new Groq({ apiKey: config.groq.apiKey, timeout: config.groq.timeoutMs });
  return sharedClient;
}

function explainApiError(err) {
  const status = err?.status;
  if (status === 401) return "Groq rejected the API key. Check GROQ_API_KEY in .env.";
  if (status === 429) return "Groq rate limit reached. Wait a minute and try again.";
  if (status === 400 || status === 404) {
    return `Groq rejected the request (${err.message}). If the model was retired, set GROQ_MODEL in .env (see console.groq.com/docs/models).`;
  }
  return `Groq request failed: ${err?.message ?? "unknown error"}`;
}

function parseJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}

function issuesToText(error) {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}

/**
 * Asks the model for ONE JSON object, validates it with a Zod schema and, if it is invalid,
 * retries once telling the model what was wrong.
 * { system, user, schema, client?, maxTokens? } -> { data, attempts }
 */
export async function callJsonModel({ system, user, schema, client, maxTokens }) {
  const api = client ?? getClient();
  const messages = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  const maxAttempts = 1 + config.groq.retries;
  let lastProblem = "";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let content;
    try {
      const completion = await api.chat.completions.create({
        model: config.groq.model,
        messages,
        temperature: config.groq.temperature,
        seed: config.groq.seed,
        max_tokens: maxTokens ?? config.groq.maxTokens,
        response_format: { type: "json_object" },
      });
      content = completion.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      throw new LlmError("API_ERROR", explainApiError(err));
    }

    let problem = "";
    try {
      const parsed = schema.safeParse(parseJson(content));
      if (parsed.success) return { data: parsed.data, attempts: attempt };
      problem = issuesToText(parsed.error);
    } catch {
      problem = "the output was not valid JSON";
    }

    lastProblem = problem;
    messages.push({ role: "assistant", content });
    messages.push({
      role: "user",
      content: `Your previous answer was rejected: ${problem}\nReturn only one valid JSON object in the required shape.`,
    });
  }

  throw new LlmError(
    "INVALID_MODEL_OUTPUT",
    `The model did not return valid JSON after ${maxAttempts} attempts (${lastProblem}).`
  );
}