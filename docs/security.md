# Security

## Threats and controls

| Threat | Controls | Where |
|---|---|---|
| Credential stuffing, brute force | bcrypt (cost 12), account lock after 5 failures for 15 minutes, auth rate limit (30 per 15 min per IP), timing-equalised responses for unknown emails, generic error messages | `auth.controller.ts`, `middleware/security.ts` |
| Stolen sessions | 15-minute access JWT kept in memory only; opaque refresh token in an httpOnly cookie, stored as an HMAC hash; rotation on every refresh; reuse of an old token revokes the whole family and raises a critical audit event; logout and password change revoke sessions | `auth.controller.ts`, `utils/tokens.ts` |
| CSRF | Refresh and logout need a custom header, which forces a CORS preflight; strict CORS allow-list; `SameSite=Lax` cookie scoped to `/api/v1/auth` | `routes/index.ts`, `app.ts` |
| Privilege escalation | Role checked on every route; ownership checked in every handler; admins cannot self-register; suspensions apply immediately because `authenticate` re-reads the user on each request | `middleware/auth.ts`, controllers |
| NoSQL injection | Express 5 "simple" query parser (no nested objects), Zod parses every input into typed primitives, `$` and dotted keys stripped from bodies, `strictQuery`, user search strings regex-escaped | `app.ts`, `validators/schemas.ts`, `middleware/security.ts`, `utils/response.ts` |
| Malicious uploads | 5 MB limit, one file, extension and MIME allow-list, magic-byte detection, extension must match content, DOCX zip-bomb guard, PDF page cap, password-protected PDFs refused, files kept in memory until verified | `middleware/upload.ts`, `utils/fileSecurity.ts`, `ai-service/app/extractors/document.py` |
| Path traversal | Stored names are random UUIDs; every path goes through `safeJoin()`, which refuses anything outside the upload root; the original name is display-only | `utils/fileSecurity.ts` |
| Unauthorised downloads | Owner, admin, or a recruiter with an application that used that resume; `Content-Disposition: attachment`, `nosniff`, `no-store`; recruiter and admin downloads are audited | `resume.controller.ts` |
| Prompt injection in resumes or jobs | Pattern scanner, hidden-text detection, LLM never sees flagged documents, documents wrapped as untrusted data, structured outputs validated, LLM output cannot set scores, formula checked twice | `ai-service/app/security/injection.py`, `services/llm.py`, `docs/ai-engine.md` |
| Unauthorised AI service access | Internal network only, NetworkPolicy, constant-time shared-token check, service refuses to run open if no token is set | `ai-service/app/core/security.py`, `k8s/networkpolicy.yaml` |
| Bias and protected traits | Input models ignore unknown fields, free-text summary excluded from scoring, identity terms scrubbed, counterfactual tests in every evaluation run, blind review option | `docs/matching-algorithm.md` |
| Common web attacks | Helmet (CSP `default-src 'none'` on the API, frame-ancestors none, nosniff), Nginx CSP for the SPA, `x-powered-by` off, JSON body limit 200 KB | `app.ts`, `frontend/nginx.conf` |
| Secrets exposure | Env validated at startup (minimum lengths); `.env` files git-ignored; Kubernetes secrets created out of band; logger redacts authorization headers, cookies, passwords and tokens | `config/env.ts`, `.gitignore`, `utils/logger.ts` |
| Container breakout | Non-root users, read-only root filesystems, all capabilities dropped, `no-new-privileges`, seccomp RuntimeDefault in Kubernetes | Dockerfiles, `docker-compose.yml`, `k8s/*.yaml` |

## Audit log

Events are written to `AuditLog` with actor, role, IP, user agent and metadata. Writes never fail the request that triggered them.

| Category | Examples |
|---|---|
| auth | `auth.register`, `auth.login`, `auth.login_failed` (warning), `auth.account_locked` (critical), `auth.refresh_reuse_detected` (critical), `auth.password_changed` |
| admin | `admin.user_suspended`, `admin.user_reactivated`, `skill.*`, `complaint.updated`, `ai.evaluation_run` |
| resume | `resume.uploaded`, `resume.rejected_magic_bytes` (warning), `resume.downloaded`, `resume.deleted` |
| ai_security | `resume.flagged` (warning or critical), `admin.resume_cleared`, `admin.resume_rejected` |
| application, job, interview | status changes, publishing, closing, scheduling, screening runs |

## Known gaps

- No email delivery service is wired in, so the email notification preference is stored but nothing is sent yet.
- Rate limits are per process. Behind several backend replicas, use a shared store (Redis) for `express-rate-limit`.
- Malware scanning (for example ClamAV) is not included; files are only parsed, never executed or served inline.
- Resume files are stored on a volume, not encrypted at the application level. Use encrypted storage classes in production.
