import { config } from "../config.js";
import { embedTexts } from "../semantic/embedder.js";
import { createApp } from "./app.js";
import { serverConfig } from "./serverConfig.js";

const embeddingState = { value: "loading" };

let app;
try {
  app = createApp({ embeddingState });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!config.groq.apiKey) console.warn("Warning: GROQ_API_KEY is not set, so analysis endpoints will fail until it is.");

const server = app.listen(serverConfig.port, () => {
  console.log(`hiresmart-ai-service listening on port ${serverConfig.port}`);
});

// Load the embedding model in the background so the first matching request is not slow.
embedTexts(["warm up"])
  .then(() => {
    embeddingState.value = "ready";
    console.log("embedding model ready");
  })
  .catch((error) => {
    embeddingState.value = "unavailable";
    console.warn(`embedding model unavailable (matching falls back to rule-based scores): ${error.message}`);
  });

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));