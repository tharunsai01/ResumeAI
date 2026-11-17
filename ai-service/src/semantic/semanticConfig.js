import "../config.js"; // loads .env before the values below are read

export const SEMANTIC = {
  // Same MiniLM sentence-embedding model family as "Sentence Transformers", in ONNX form.
  model: process.env.EMBEDDING_MODEL || "onnx-community/all-MiniLM-L6-v2-ONNX",
  dtype: process.env.EMBEDDING_DTYPE || "fp32", // plain model.onnx, about 90 MB, downloaded once
  maxChars: 1500, // the model reads about 256 tokens, so keep texts short

  // Raw cosine similarity -> 0-100: at or below `low` is 0, at or above `high` is 100.
  // Tune these after looking at the cosines printed by `npm run test:phase4`.
  low: 0.2,
  high: 0.7,

  // Inside roleSimilarity: share of the semantic score (the rest is the rule-based score).
  blend: 0.6,
};