import "../config.js"; // loads .env before the values below are read

const positiveInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const serverConfig = {
  port: positiveInt(process.env.PORT, 8000),
  // The backend sends this in the x-internal-key header. The service refuses to start without it.
  apiKey: process.env.AI_SERVICE_KEY || "",
  // At most this many model calls run at once; others wait in a queue (and are refused when the queue is full).
  maxConcurrentLlm: positiveInt(process.env.MAX_CONCURRENT_LLM, 2),
  maxQueue: positiveInt(process.env.MAX_LLM_QUEUE, 50),
  // Pause before each model call during an evaluation run (protects the provider's rate limit).
  evalPaceMs: positiveInt(process.env.EVAL_PACE_MS, 3000),
  // PDF and DOCX only in real use. Set ALLOW_TXT_UPLOADS=true to also accept .txt files while testing.
  allowTxtUploads: process.env.ALLOW_TXT_UPLOADS === "true",
};