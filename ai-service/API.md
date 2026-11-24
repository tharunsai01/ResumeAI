# HireSmart AI service: API contract

The AI service is called **only by the backend** (never by the browser). It is stateless: it stores nothing.
The backend keeps the data (resumes, analyses, jobs, applications, audit logs) and sends what is needed with each call.

- **Base URL:** `http://ai-service:8000` (port set by `PORT`)
- **Format:** JSON in, JSON out (except the resume upload, which is `multipart/form-data`)
- **Secret:** every `/v1/*` request needs the header `x-internal-key: <AI_SERVICE_KEY>`. `/health` is open.
- **Tracing:** send `x-request-id` (letters, digits, `.`, `_`, `-`, up to 64 characters) to follow a request through the logs. It is echoed back, or generated if missing.

## What the backend stores

| After this call | Store this | Why |
|---|---|---|
| `POST /v1/resume/analyze` | `analysis`, `text`, `fileHash`, `security`, `meta` | `analysis` is the input to every later call. `text` improves keyword matching. `fileHash` lets you skip re-analysing the same file. |
| `POST /v1/jobs/extract` | `job` (after the recruiter reviews and edits it) | The job form should show the extracted skills for review before saving. |
| any response with `auditEvents` | each event as a row in the audit log | They contain no names, emails or resume text. |
| `POST /v1/evaluation/run` (finished) | `result.record` | It is the row shown in the evaluation history. |

The **report**, **skill gap**, **match** and **recommendations** can be recomputed at any time from a stored `analysis`, so they do not need to be stored.
Calls that read a model (`resume/analyze`, `resume/analyze-text`, `jobs/extract`) take 1 to 5 seconds. All the others are fast.

## Errors

Every error looks like this:

```json
{ "error": { "code": "TOO_LARGE", "message": "The file is larger than 5 MB.", "requestId": "..." } }
```

| HTTP | `code` | Meaning | What the backend should do |
|---|---|---|---|
| 400 | `VALIDATION_ERROR` | The request body is wrong. `error.details` lists the fields. | Fix the request (a bug on our side). |
| 400 | `INVALID_JSON` | The body is not JSON. | Fix the request. |
| 400 | `EMPTY_FILE`, `INVALID_FILE`, `EMPTY_TEXT` | The file or text is empty or not what its name says. | Tell the user. |
| 401 | `UNAUTHORIZED` | Missing or wrong `x-internal-key`. | Check the secret. |
| 404 | `NOT_FOUND` | No such endpoint or run. | |
| 409 | `EVALUATION_BUSY` | An evaluation is already running. | Wait and retry. |
| 413 | `TOO_LARGE`, `PAYLOAD_TOO_LARGE` | File over 5 MB, or body over 10 MB. | Tell the user. |
| 415 | `UNSUPPORTED_TYPE` | Only PDF and DOCX resumes are accepted. | Tell the user. |
| 422 | `NO_TEXT_FOUND`, `TOO_LONG` | A scanned (image) PDF, or more than 10 pages. | Tell the user to upload a text-based file. |
| 429 | `RATE_LIMITED` | The AI provider's limit was reached. Has `Retry-After`. | Retry later, or queue the job. |
| 502 | `AI_OUTPUT_INVALID`, `AI_PROVIDER_ERROR` | The model failed or answered unusably. | Retry once, then show a friendly error. |
| 503 | `BUSY` | Too many model calls are waiting. Has `Retry-After`. | Retry shortly. |
| 500 | `INTERNAL`, `SERVICE_MISCONFIGURED` | Our bug or a missing setting. | Alert someone. |

## Endpoints

### `GET /health` (open)
`{ "status": "ok", "service": "hiresmart-ai-service", "version": "0.1.0" }`

### `GET /v1/status`
Details for monitoring: model names, whether the embedding model is `ready`, `loading` or `unavailable`, queue length.

### `POST /v1/resume/analyze` (multipart)
Fields: `file` (PDF or DOCX, up to 5 MB, up to 10 pages), `resumeRef` (optional, your resume id, echoed into the audit event).

```bash
curl -X POST http://localhost:8000/v1/resume/analyze \
  -H "x-internal-key: $AI_SERVICE_KEY" \
  -F "file=@resume.pdf" -F "resumeRef=res_123"
```

Response:

```json
{
  "file": { "type": "pdf", "pageCount": 2, "wordCount": 612 },
  "fileHash": "sha256 hex of the file",
  "security": { "riskLevel": "clean | suspicious | high", "findings": [], "invisibleCount": 0 },
  "text": "sanitised resume text (instruction-like lines removed)",
  "analysis": { "...": "see below" },
  "meta": { "model": "...", "attempts": 1, "ms": 1850 },
  "report": { "...": "same shape as the frontend ResumeAnalysisResult" },
  "auditEvents": [ { "type": "RESUME_ANALYZED", "...": "..." } ]
}
```

`analysis` (this is what you store and send back to later calls):

```json
{
  "candidate": { "name": "", "email": "", "location": "" },
  "experienceYears": { "stated": 2, "computed": 3 },
  "skills": [
    { "name": "Java", "category": "Programming", "known": true, "score": 72, "level": "Advanced",
      "evidence": { "inSkillsSection": true, "experienceRoles": 1, "projects": 1, "years": 2 } }
  ],
  "unknownSkills": ["Kafka"],
  "experience": [ { "title": "", "company": "", "duration": "2024 – Present", "startYear": 2024, "endYear": null,
                    "isCurrent": true, "description": [""], "technologies": [""] } ],
  "education": [ { "degree": "", "institution": "", "duration": "2021 – 2025" } ],
  "projects": [ { "name": "", "techStack": [""], "description": "" } ]
}
```

### `POST /v1/resume/analyze-text`
Body: `{ "text": "...", "resumeRef": "res_123" }`. Same response as above (with `file.type = "text"`). Useful for pasted resumes and tests.

### `POST /v1/resume/report`
Body: `{ "analysis": {...} }` returns `{ "report": {...} }` (the Resume Analysis page).

### `POST /v1/resume/skill-gap`
Body: `{ "analysis": {...}, "jobs": [...] }` (`jobs` optional: the jobs the demand is measured against).
Returns `{ "skillGap": { "skills": [...], "careerPaths": [...], "roleComparisons": [...], "categoryScores": [...], "demandSource": "jobs", "jobsConsidered": 6 } }` (the Skill Analysis page).

### `POST /v1/resume/blind-profile`
Body: `{ "analysis": {...}, "id": "<your opaque candidate id>", "keepEducationDates": false }`.
Returns `{ "profile": {...} }`: skills, experience and education with name, contact details, location, links, company names, institution names and education dates removed, plus a stable alias such as `"Candidate 7F3A"`.
**Use an opaque id** (never a file name or a name): it is shown in the profile.

### `POST /v1/match`
Body:

```json
{
  "resume": { "analysis": {...}, "text": "optional, improves keywordMatch" },
  "job": { "id": "job_101", "title": "", "requiredSkills": [], "preferredSkills": [], "experience": "2-4 years",
           "education": "", "description": "", "responsibilities": [] },
  "weights": { "skills": 0.5, "experience": 0.2, "education": 0.1, "roleSimilarity": 0.2 },
  "threshold": 80,
  "semantic": true,
  "resumeRef": "res_123"
}
```

`weights`, `threshold` and `semantic` are optional (defaults: 0.5 / 0.2 / 0.1 / 0.2, 80, true). Weights do not have to add up to 1.
`job` can also be a frontend job-board job (its `skills`, `requirements` and `experience` fields are understood).
Returns `{ "match": {...}, "auditEvents": [...] }`. `match` has `overallMatch`, `skillMatch`, `experienceMatch`, `educationMatch`, `roleSimilarity`, `keywordMatch`, `screeningStatus` (`Strong Match` | `Potential Match` | `Low Match`), `skills[]` (`matchType`: `Matched` | `Partial` | `Missing`, `proficiency`: `Strong` | `Intermediate` | `Basic` | `None`), `matchedStrengths[]`, `potentialGaps[]`, `weightsUsed`.

### `POST /v1/screen`
Body: `{ "candidates": [ { "id": "cand_1", "analysis": {...}, "text": "optional" } ], "job": {...}, "weights": {...}, "threshold": 80, "semantic": true, "jobRef": "job_101" }` (up to 1000 candidates).
Returns `{ "ranked": [ { "id": "cand_1", ...same fields as match } ], "auditEvents": [...] }`, best first.
Changing the weights and calling again re-ranks without any model call.

### `POST /v1/recommend`
Body: `{ "resume": { "analysis": {...} }, "jobs": [...], "limit": 10, "minScore": 40, "semantic": true }` (up to 500 jobs).
Returns `{ "recommendations": [ { "jobId", "jobTitle", "match", "screeningStatus", "matchedSkills", "partialSkills", "missingSkills", "reasons", "gaps" } ] }`.

### `POST /v1/jobs/extract`
Body: `{ "text": "pasted job description", "jobRef": "job_9" }`.
Returns `{ "job": { "title", "requiredSkills", "preferredSkills", "experience", "experienceRange", "education", "description", "responsibilities", "unknownSkills" }, "security": {...}, "meta": {...}, "auditEvents": [...] }`.
The recruiter should review and edit the extracted skills before the job is saved.

### `GET /v1/taxonomy`
`{ "categories": [...], "skills": [ { "name", "category", "aliases": [] } ] }` (read-only view of the built-in skill list).

### `POST /v1/skills/unknown`
Body: `{ "analyses": [ { "unknownSkills": [] } ], "jobs": [ { "unknownSkills": [] } ] }`.
Returns `{ "skills": [ { "name", "resumes", "jobs", "total" } ] }`, most common first (the admin "skills pending review" list).

### Evaluation (admin, runs in the background)
`POST /v1/evaluation/run`:

```json
{
  "resumes": [ { "id": "res_1", "text": "plain resume text" } ],
  "jobs": [ { "id": "job_101", "title": "", "requiredSkills": [], "preferredSkills": [], "experience": "", "education": "" } ],
  "truth": { "resumes": [ { "id": "res_1", "skills": ["Java", "React"] } ] },
  "baseline": { "res_1": { "analysis": {...} } },
  "options": { "components": ["skills", "stability", "fairness", "security", "blind"], "stabilityRuns": 5, "datasetName": "Release 1" }
}
```

Returns `202 { "id": "run_ab12cd34", "status": "running" }`. A full run makes about 25 model calls and takes a few minutes.
`GET /v1/evaluation/{id}` returns `{ "status": "running | completed | failed", "progress": [...], "result": { "report": {...}, "record": {...}, "auditEvents": [...] }, "error": null }`.
`report` has the sections of the admin AI Evaluation page; store `result.record` in the evaluation history.
Only one evaluation runs at a time (`409 EVALUATION_BUSY`), and runs are kept in memory only.

## Audit events

Every event: `{ "id", "timestamp", "type", "service": { "name", "version" }, "summary", "details" }`.
Types: `RESUME_ANALYZED`, `MATCH_SCORED`, `SCREENING_RUN`, `JOB_EXTRACTED`, `INJECTION_DETECTED`, `EVALUATION_RUN`.
Pass your own ids (`resumeRef`, `jobRef`) to be able to find the matching rows.

## Running it

```bash
cd ai-service
npm install
npm start            # http://localhost:8000
```

Needs `GROQ_API_KEY` and `AI_SERVICE_KEY` in `ai-service/.env` (see `.env.example`).
Docker: `docker build -t hiresmart-ai-service ai-service` then `docker run -p 8000:8000 --env-file ai-service/.env hiresmart-ai-service`.