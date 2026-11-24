# Architecture

HireSmart AI is three services and a database. Each service owns one job, and only the Express API touches MongoDB.

```mermaid
flowchart LR
  subgraph Browser
    SPA[React 19 SPA<br/>Vite + Tailwind + Framer Motion]
  end
  subgraph Edge
    NGINX[Nginx<br/>static files + /api proxy]
  end
  subgraph Core
    API[Express 5 API<br/>auth, RBAC, business rules]
    AI[FastAPI AI service<br/>parsing, matching, fairness]
  end
  DB[(MongoDB)]
  FS[(Resume volume)]
  GROQ[Groq LLM<br/>optional]

  SPA -->|HTTPS| NGINX
  NGINX -->|/api/v1| API
  API -->|Mongoose| DB
  API -->|files| FS
  API -->|X-Internal-Token| AI
  AI -.->|structured extraction<br/>and narratives only| GROQ
```

## Responsibilities

| Component | Owns | Never does |
|---|---|---|
| Frontend (`frontend/`) | UI, routing, optimistic updates, client-side validation | Store primary data in browser storage. The access token lives in memory only. |
| Express API (`backend/`) | Authentication, refresh-token rotation, RBAC, every database write, file storage, audit log, notifications | Run AI logic. It sends structured data to the AI service and re-checks the score it gets back. |
| AI service (`ai-service/`) | Text extraction, skill taxonomy, the matching formula, prompt-injection scanning, fairness evaluation | Touch MongoDB, or accept requests without the shared internal token |
| MongoDB | Users, profiles, jobs, applications, match results, audit log and the rest of the 15 collections | |

## Request paths

Browser calls go to `/api/v1/*` on the same origin. In Docker Compose, Nginx inside the frontend container proxies them to `backend:5000`. In Kubernetes, the Ingress routes `/api` to the backend Service directly. Keeping the API on the same origin means the `hs_refresh` cookie stays first-party (`SameSite=Lax`, `HttpOnly`, scoped to `/api/v1/auth`).

The AI service has no public route. In Compose it sits on an `internal` network shared only with the backend; in Kubernetes a NetworkPolicy allows ingress only from backend pods.

## Resume processing

Uploads return `202 Accepted` straight away. The API then runs the pipeline in the background and writes each stage to the `Resume` document before starting it, so the progress the candidate sees is the real state.

```mermaid
sequenceDiagram
  participant C as Candidate (SPA)
  participant API as Express API
  participant FS as Upload volume
  participant AI as AI service
  participant DB as MongoDB

  C->>API: POST /resumes (multipart, progress tracked)
  API->>API: size limit, magic bytes, extension match, SHA-256 dedupe
  API->>FS: write file under uploads/<userId>/<uuid>.pdf
  API->>DB: Resume { status: uploaded }
  API-->>C: 202 { _id }
  loop every ~0.9s while processing
    C->>API: GET /resumes/:id
    API-->>C: status + stageHistory
  end
  API->>DB: status = validating
  API->>DB: status = extracting
  API->>AI: POST /resume/extract-text (file)
  AI-->>API: text, hidden spans, injection scan
  API->>DB: status = detecting_skills
  API->>AI: POST /resume/skills
  API->>DB: status = analysing_experience
  API->>AI: POST /resume/profile
  API->>DB: status = generating_report
  API->>AI: POST /resume/report
  API->>DB: status = completed, analysis, security flags
  API->>DB: Notification (+ AuditLog and admin alert if flagged)
```

## Matching

```mermaid
flowchart LR
  P[CandidateProfile<br/>+ active resume analysis] --> B[Backend builds<br/>CandidateInput]
  J[Job] --> B2[Backend builds<br/>JobInput]
  B --> H{Input hash<br/>unchanged?}
  B2 --> H
  H -- yes --> R[(Cached MatchResult)]
  H -- no --> AI[AI /match]
  AI --> V{Backend re-checks<br/>50/20/10/20 formula}
  V -- valid --> S[(Save MatchResult)]
  V -- invalid --> E[502 SCORE_VALIDATION_FAILED]
```

Protected attributes never reach the scorer: the AI service's input models ignore unknown fields, and the free-text summary is left out of the semantic role text.

## Human in the loop

The only status change automation can make is `applied → screened`, recorded with `actor: system`. Shortlisting, interviews, hiring and rejection are recruiter actions. Each one is logged in `statusHistory` and the audit log, and the candidate is notified.

## Directory layout

```
hiresmart-ai/
├── ai-service/          FastAPI app, taxonomy data, pytest suite
├── backend/             Express 5 + TypeScript API, Mongoose models, seed, vitest suites
├── frontend/            React 19 SPA, design system, Playwright suites, Nginx config
├── k8s/                 Kustomize manifests (namespace, workloads, ingress, network policies, HPA)
├── docs/                This documentation
├── .github/workflows/   CI (tests, live journey, image push) and manual deploy
├── Jenkinsfile          Equivalent Jenkins pipeline
└── docker-compose.yml   Full local stack
```
