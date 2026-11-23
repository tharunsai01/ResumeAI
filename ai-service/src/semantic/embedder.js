import { SEMANTIC } from "./semanticConfig.js";

// The embedding library is loaded only when needed, so the rest of the service
// (and the offline tests) work even if it is not installed or the model cannot download.
let extractorPromise = null;

async function loadExtractor() {
  const { pipeline, env } = await import("@huggingface/transformers");
  // Docker downloads the model into a fixed folder at build time (EMBEDDING_CACHE_DIR) so containers start offline.
  if (process.env.EMBEDDING_CACHE_DIR) env.cacheDir = process.env.EMBEDDING_CACHE_DIR;
  return pipeline("feature-extraction", SEMANTIC.model, { dtype: SEMANTIC.dtype });
}

/** texts[] -> one normalised vector (number[]) per text. The model downloads on first use. */
export async function embedTexts(texts) {
  extractorPromise ??= loadExtractor().catch((err) => {
    extractorPromise = null; // allow a retry next time
    throw err;
  });
  const extractor = await extractorPromise;
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}