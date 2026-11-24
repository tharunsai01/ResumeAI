# Development progress

Status key: **Done**, **Done (CI-verified only)** = written and wired into CI but not executable in the build environment, **Partial**.

| Phase | Status | Notes |
|---|---|---|
| 1. Repository inspection and architecture | Done | Empty workspace. Three services plus MongoDB; AI service stateless and token-protected. |
| 2. Project initialisation and design system | Done | Tokens for light and dark themes, Manrope variable font, motion tokens, UI component kit. |
| 3. MongoDB and backend foundation | Done | 15 Mongoose models, env validation, structured logging, standard responses, central error handling. |
| 4. Authentication and authorisation | Done | bcrypt, 15-minute JWT, refresh rotation with reuse detection, lockout, RBAC, ownership checks, OAuth (Google, LinkedIn) behind configuration. |
| 5. AI microservice | Done | FastAPI, extraction, taxonomy (127 skills), Groq client with validation and fallback, MiniLM with TF-IDF fallback, injection scanner, fairness evaluation. 51 tests. |
| 6. Resume parsing and AI matching | Done | Six-stage pipeline with real stage tracking, official 50/20/10/20 formula validated in both services, match caching by input hash. |
| 7. Frontend public pages and authentication | Done | Landing page with the signature match animation, split-screen auth, password strength, role selection, info pages. |
| 8. Candidate portal | Done | Dashboard, profile editor, resume hub, job discovery, match report, skill analysis, applications tracker, saved jobs. |
| 9. Recruiter portal | Done | Dashboard, job editor with AI suggestions, screening hub with comparison and blind review, Kanban pipeline, interviews, talent pool, company profile. |
| 10. Administrator portal | Done | Overview, users, tickets, taxonomy, security review, audit log, AI evaluation, system health. |
| 11. Frontend, backend and AI integration | Done | Typed API client with silent refresh; backend-to-AI contract tested against a running AI service. |
| 12. Security and performance | Done | See docs/security.md. Route-level code splitting; charts load only where used; decorative motion pauses when hidden and respects reduced motion. |
| 13. Automated testing | Done (CI-verified only for DB suites) | pytest 51 passed, vitest 21 passed, Playwright 35 passed. Backend integration (13 tests) and the live journey (5 grouped steps covering all 15) need MongoDB; they run in CI. |
| 14. Docker and Docker Compose | Done | Multi-stage images, health checks, internal networks, read-only filesystems, dropped capabilities. `docker compose config` valid; images not built locally. |
| 15. GitHub Actions and Jenkins | Done | CI with service container and Compose journey, GHCR push, manual deploy; Jenkinsfile with parallel tests and approval. |
| 16. Kubernetes | Done | Kustomize set, NetworkPolicies, HPAs, hardened pods. 20/20 resources pass strict v1.30 validation. |
| 17. Final QA and documentation | Done | 13 docs, README with screenshots, this log. |

# Defects found and fixed during QA

| Found by | Defect | Fix |
|---|---|---|
| Fairness benchmark | Reordering or re-casing skills changed the semantic role score | Role text uses de-duplicated, sorted, lower-cased skills and normalised whitespace; regression test added |
| Fairness design review | Free-text summaries could carry names and pronouns into the role score | Summary excluded from scoring; identity terms scrubbed from headlines and titles |
| Unit test | `PUT /jobs/:id` with a partial body reset other fields to Zod defaults | Separate create and update schemas; regression test added |
| Code review | Global `sanitizeFilter` would also have neutralised the server's own `$regex` and `$in` filters | Replaced by layered input controls (documented in security.md) |
| Screenshot review | Mobile headline wrapped to six lines; theme-inlined font sizes ignored the media query | Fluid `clamp()` type scale |
| Screenshot review | Hero score card hid the last job requirement | Cards restaged without overlap |
| Screenshot review | `text-caption` silently dropped by `tailwind-merge` | Custom font sizes registered with `extendTailwindMerge` |
| Playwright | Account menu had no accessible name on phones | Explicit `aria-label` |
| Playwright | Demo data lost on full page reload | Demo layer persists per tab in sessionStorage |
| Build review | 500 KB charts chunk preloaded on every page | Manual chunking removed; charts load with the pages that use them |

# Next steps

1. Run CI once on GitHub to execute the MongoDB-backed suites and the live journey.
2. Add an email provider for interview invitations and decisions.
3. Move resume storage to object storage to allow several backend replicas.
4. Add a month view and time-zone selection to the interview calendar.
