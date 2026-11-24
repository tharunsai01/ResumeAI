# AI engine

The AI service (`ai-service/`) is a FastAPI application. It is stateless, never writes to MongoDB, and rejects every request except `GET /health` unless the `X-Internal-Token` header matches `INTERNAL_SERVICE_TOKEN` (compared in constant time).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Status, model version, embedding backend (`loading` while MiniLM warms up), LLM configuration |
| POST | `/resume/analyze` | One-shot: file in, full report out |
| POST | `/resume/extract-text` | File to text, hidden-text spans and an injection scan (pipeline stage 3) |
| POST | `/resume/skills` | Text to skills and unknown skills (stage 4) |
| POST | `/resume/profile` | Text to experience, titles, education (stage 5) |
| POST | `/resume/report` | Text to the full report, optionally enriched by Groq (stage 6) |
| POST | `/jobs/extract` | Job title and description to required/preferred skills, years, education, work mode, injection scan |
| POST | `/match` | One candidate against one job; optional LLM narrative |
| POST | `/screen` | Rank many candidates for a job |
| POST | `/recommend` | Rank many jobs for a candidate |
| POST | `/skill-gap` | Missing skills across jobs, with bridges and learning suggestions |
| POST | `/evaluation/run` | Fairness, stability and model-comparison report |
| POST | `/security/scan` | Injection scan for arbitrary text |

The granular resume endpoints exist so the backend can report real progress between stages.

## Document extraction (`app/extractors/document.py`)

- File type comes from magic bytes (`%PDF-`, or a ZIP containing `word/document.xml`), never from the name.
- The extension must match the detected type.
- PDFs: PyMuPDF, at most 20 pages, password-protected files refused. Spans smaller than 3 pt or with near-white colour are collected as hidden text.
- DOCX: python-docx, paragraphs and table cells. Runs that are hidden, tiny or white are collected as hidden text. Archives that inflate past 50 MB are refused.
- Zero-width and bidi control characters are stripped, text is capped at 60,000 characters, and image-only scans are rejected with a clear message.

## Deterministic parsing (`resume_parser.py`, `job_parser.py`)

Always available, and also used to check LLM output.

- **Sections** by heading aliases (Experience, Work history, Education, Skills, Certifications...).
- **Experience**: date ranges such as `Jan 2019 - Present`, `03/2018 – 06/2020`, `2017 to 2019`. Overlapping ranges are merged before years are totalled, so concurrent jobs do not double count. "6+ years of experience" statements are a fallback.
- **Education**: degree level from patterns (PhD, M.Tech, MBA, B.E., BSc, diploma...), field, institution and year.
- **Skills**: taxonomy aliases matched with boundaries that handle `C++`, `C#`, `.NET`, `Node.js`. Ambiguous short names (`C`, `R`, `Go`, `REST`, `Spark`...) count only when they appear as explicit items in a Skills list.
- **Jobs**: requirement and nice-to-have sections set required versus preferred; inline "is a plus" phrasing marks a line as preferred.

## Groq LLM (`app/services/llm.py`)

Model `openai/gpt-oss-20b` (configurable) with `temperature: 0` and JSON response format. It is used for two things only:

1. **Extraction enrichment**: headline, summary, extra skills, suspicious-instruction detection.
2. **Narratives**: an optional three-sentence explanation of a match from given facts.

Safeguards:

- The system prompt says the document is untrusted data and forbids scores, rankings and decisions.
- Document text is wrapped in `<document>` tags after markup such as `<system>` and code fences is neutralised.
- Responses are parsed with Pydantic models with length limits; anything invalid is discarded.
- Skills the LLM returns are kept only if they literally appear in the document (anti-hallucination test included).
- Narratives that mention hiring or rejecting are discarded.
- Documents already flagged by the injection scanner are never sent to the LLM.
- Network errors, timeouts and bad JSON fall back to deterministic output, and the report records `llm_used: false` and `llm_error`.

The LLM never produces or changes a number in a match result.

## Embeddings (`app/embeddings/encoder.py`)

`sentence-transformers/all-MiniLM-L6-v2` on CPU, loaded in a background thread at startup and cached in the Docker image (`HF_HUB_OFFLINE=1` at runtime). If loading fails, a TF-IDF encoder is used instead. Embeddings are memoised (LRU, 2,048 texts).

## Prompt-injection detection (`app/security/injection.py`)

Regex families with severities: instruction override, role hijack, system-prompt probing, score manipulation, decision manipulation, formula tampering, prompt markup, data exfiltration, tool abuse. Additional signals: hidden text (severity 5 if it contains an instruction), invisible characters, keyword stuffing.

`risk_score = min(100, Σ severity × 12)`; flagged at 40 or above. Flagged resumes are processed deterministically, marked `reviewStatus: pending`, logged as `ai_security` audit events and raised to administrators. The score is unaffected either way, because it is computed from structured data.

## Fairness evaluation (`app/evaluation/fairness.py`)

| Check | Method | Pass condition |
|---|---|---|
| Counterfactual invariance | Swap pronouns and names, add age and affinity-group text, re-score | Max delta = 0 |
| Stability | Shuffle and re-case skills, pad whitespace, re-score | Max delta ≤ 0.5 |
| Adverse impact | Selection rate per evaluation group at threshold 60 | Lowest/highest ≥ 0.8 (four-fifths rule) |
| Formula validation | `validate_result` on every result | All valid |
| Model comparison | Role scores from the active encoder against TF-IDF | Reported: mean absolute difference, Spearman rank correlation |

Group labels exist only in the synthetic benchmark (`backend/src/seed/benchmark.ts`): 40 matched pairs that differ only in identity text. Real applicants have no group labels because the platform never collects protected characteristics.

## Configuration

See `ai-service/.env.example`. Key settings: `INTERNAL_SERVICE_TOKEN`, `GROQ_API_KEY`, `GROQ_MODEL`, `EMBEDDINGS_ENABLED`, `MAX_FILE_MB`.
