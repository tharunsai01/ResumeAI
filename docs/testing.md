# Testing

## Results from the last full run

Run on 24 November 2026 in the development workspace (Node 22, Python 3.13, Chrome).

| Suite | Command | Result |
|---|---|---|
| AI service | `cd ai-service && python -m pytest -q` | **51 passed** |
| Backend typecheck | `cd backend && npm run typecheck` | passed |
| Backend unit and HTTP tests | `cd backend && npm test` | **21 passed**, 13 skipped (integration suite, no MongoDB in that workspace) |
| Backend build | `npm run build` | passed |
| Frontend typecheck and build | `cd frontend && npm run build` | passed; live bundle contains no demo data layer |
| Frontend UI (Playwright) | `cd frontend && npx playwright test` | **35 passed** (32 desktop, 3 mobile) |
| Backend ↔ AI contract | backend `aiClient` against a running AI service | passed: extraction, hidden-text flagging, skills, report, match verified by the backend, 80-profile fairness benchmark |
| Kubernetes manifests | `kubernetes-validate -k 1.30.0 --strict` | 20 of 20 resources valid |
| Compose file | `docker compose config` | valid |

**Not run in that workspace:** the backend integration suite and the live Playwright journey both need MongoDB, which could not be started there. CI runs both: the `backend` job with a MongoDB 7 service container, and the `e2e-live` job against the full Docker Compose stack. Treat them as unverified until your first CI run passes.

## AI service (pytest, 51 tests)

| File | Covers |
|---|---|
| `test_extraction.py` | PDF and DOCX extraction; empty, executable, malformed PDF and corrupt DOCX files; extension mismatch; hidden text in PDF (1 pt white) and DOCX; alias normalisation (ReactJS to React); ambiguous short skills; experience entries and merged overlapping date ranges; education level, field, institution, year; job parser required versus preferred |
| `test_matching.py` | Official weights; formula arithmetic; category boundaries (79.99, 80, 59.99, 60); exact, alias and related skill credit; experience scaling; optional versus strict education; semantic similarity ordering; unrelated profiles score low; protected attributes dropped from input; tampered results fail validation |
| `test_security_and_api.py` | Five injection patterns; clean resumes not flagged; hidden-instruction severity; markup neutralisation; public health check; internal token enforcement; resume analyse endpoint; bad file rejection; injected PDF flagged end to end; match, screen, recommend, skill gap; job extraction; custom taxonomy aliases; Groq failure falls back to deterministic parsing; LLM hallucinated skills removed; counterfactual fairness, stability, four-fifths rule; stability regression |

## Backend (vitest + supertest)

`tests/unit` (no database): magic bytes, path traversal, display-name sanitising, NoSQL operator stripping, JWT tampering, refresh token hashing, frozen weights, independent score verification, transition rules, password policy, admin self-registration blocked, salary validation, partial updates not injecting defaults, 404 format, security headers, OAuth not configured (501), 401 on protected routes, CSRF header requirement, validation before database access, malformed JSON, CORS allow-list.

`tests/integration/flow.test.ts` (set `MONGO_URI_TEST`): the API journey with the AI client stubbed. Recruiter registers and publishes; candidate registers with an empty profile; resume upload with all seven recorded stages; disguised executable rejected; search and validated match; apply once, duplicate rejected; RBAC between roles; screening, invalid transition refused, shortlist; interview scheduled and candidate notified; admin analytics, audit log, suspension blocks access; refresh rotation with reuse detection; lockout after five failures.

```bash
docker run -d -p 27017:27017 mongo:7
MONGO_URI_TEST=mongodb://localhost:27017/hiresmart_test npm test
```

## Frontend (Playwright)

UI tests run against the demo build (`npm run build:mock`), so they need no backend. The demo layer is excluded from real builds at compile time, and CI checks the live bundle for it.

| File | Covers |
|---|---|
| `public.spec.ts` | Hero and sections, nav scrolling, CTA routing, sample-data labelling, reduced-motion final state, theme persistence, info pages and 404, skip link, login validation, bad credentials, password reveal, disabled OAuth buttons, protected-route redirects and wrong-role redirects, registration with company field, strength meter, terms, empty new profile, logout |
| `portals.spec.ts` | Candidate: dashboard, search and apply, bookmarks, match breakdown, upload stages and analysis, file validation, profile editing, application tracker. Recruiter: dashboard, AI-assisted job creation, job validation, screening and shortlist, pipeline move via menu, interview scheduling. Admin: alerts to security review, suspension requires a reason, fairness benchmark, taxonomy review, health, Escape closes drawers |
| `responsive.spec.ts` (Pixel 7) | Mobile menu, dashboard drawer and reachable account menu, tables as stacked cards with no horizontal scroll |
| `live-journey.spec.ts` | The 15-step journey against the real stack (see below) |

```bash
npx playwright install chromium        # or set CHROME_PATH to an installed Chrome
npx playwright test                    # UI suite
E2E_LIVE=1 BASE_URL=http://localhost:8080 npx playwright test   # live journey
```

## Live end-to-end journey

`frontend/tests/e2e/live-journey.spec.ts` drives the real frontend, API, MongoDB and AI service:

1. Recruiter registers
2. Recruiter creates a job (with AI skill suggestions) and publishes it
3. Candidate registers
4. Candidate uploads a generated text PDF
5. The AI service analyses it (all stages)
6. Candidate reviews the extracted data and copies it to the profile
7. Candidate finds the job by search
8. Candidate opens the validated match report
9. Candidate applies
10. Recruiter sees the application in screening
11. Recruiter runs AI screening
12. Recruiter shortlists the candidate
13. Recruiter schedules an interview
14. Candidate sees the interview notification and status
15. Administrator reviews platform activity and finds the event in the audit log
