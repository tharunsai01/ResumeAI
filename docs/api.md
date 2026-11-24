# API reference

Base path: `/api/v1`. JSON in, JSON out.

```json
{ "success": true, "data": { }, "meta": { "page": 1, "limit": 20, "total": 42, "pages": 3 } }
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "Validation failed", "details": [{ "path": "email", "message": "Invalid email" }] } }
```

Authenticated endpoints need `Authorization: Bearer <accessToken>` (15-minute JWT). The refresh token is the `hs_refresh` httpOnly cookie. Cookie-based endpoints (`/auth/refresh`, `/auth/logout`) also require `X-Requested-With: HireSmart`, which forces a CORS preflight as CSRF protection.

Roles: **C** candidate, **R** recruiter, **A** admin, **any** any signed-in user, **public** no auth.

## Auth and account

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/auth/providers` | public | Which OAuth providers are configured |
| POST | `/auth/register` | public | `{ name, email, password, role: candidate\|recruiter, company? }`. Admins cannot self-register |
| POST | `/auth/login` | public | Locks for 15 min after 5 failures |
| POST | `/auth/refresh` | cookie | Rotates the refresh token; reuse revokes the whole family |
| POST | `/auth/logout` | cookie | Revokes the token family |
| GET | `/auth/me` | any | |
| GET | `/auth/oauth/:provider` | public | `google` or `linkedin`; `?role=recruiter` for new recruiter accounts. 501 when not configured |
| GET | `/auth/oauth/:provider/callback` | public | Sets the refresh cookie and redirects to `/auth/callback` |
| PATCH | `/users/me/preferences` | any | `{ theme?, emailNotifications? }` |
| PATCH | `/users/me/password` | any | Revokes other sessions |

## Profiles and talent

| Method | Path | Role |
|---|---|---|
| GET, PUT | `/candidates/me` | C |
| GET | `/candidates/:userId` | R (applied or opted in), A |
| GET, PUT | `/recruiters/me` | R |
| GET | `/talent?q&skills&minYears&education&jobId&page&limit` | R |

## Resumes

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/resumes` | C | multipart `file`; PDF/DOCX, 5 MB; returns 202 and processes in the background |
| GET | `/resumes` | C | |
| GET | `/resumes/:id` | owner, R with an application using it, A | Poll for `status` and `stageHistory` |
| GET | `/resumes/:id/download` | same as above | `Content-Disposition: attachment`, `no-store` |
| PATCH | `/resumes/:id/activate` | C | |
| POST | `/resumes/:id/apply-to-profile` | C | `{ sections?: ["skills","experience","education","summary"] }` |
| POST | `/resumes/:id/reprocess` | C | |
| DELETE | `/resumes/:id` | C | Deletes the file and extracted text |

## Jobs

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/jobs?q&workMode&employmentType&location&skills&minSalary&maxExperience&sort&page&limit` | public (adds match and bookmark for candidates) | Published only |
| GET | `/jobs/:id` | public; owner sees drafts | |
| GET | `/jobs/mine?status&q` | R | |
| POST | `/jobs` | R | `{ ...fields, publish?: boolean }`; description is scanned for injection |
| POST | `/jobs/extract` | R | AI skill and requirement suggestions |
| PUT | `/jobs/:id` | owner R, A | Partial update; omitted fields are untouched |
| POST | `/jobs/:id/publish`, `/jobs/:id/close` | owner R, A | |
| DELETE | `/jobs/:id` | owner R, A | Drafts without applications only |
| GET | `/jobs/:id/analytics` | owner R, A | |
| POST, DELETE | `/jobs/:id/bookmark` | C | |
| GET | `/jobs/bookmarks` | C | |

## Applications

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/applications` | C | `{ jobId, coverLetter?, resumeId? }`; scored right away when auto-screening is on |
| GET | `/applications/me` | C | |
| GET | `/applications?jobId&status&q&minScore` | R | Sorted by match score |
| GET | `/applications/:id` | owner C, owning R, A | Recruiter notes hidden from candidates |
| PATCH | `/applications/:id/withdraw` | C | |
| PATCH | `/applications/:id/status` | owning R, A | `{ status, note? }`; only allowed transitions |
| PATCH | `/applications/:id/notes` | R | |

Allowed transitions: applied → screened, shortlisted, rejected; screened → applied, shortlisted, rejected; shortlisted → screened, interview, rejected; interview → shortlisted, hired, rejected; rejected → applied, screened, shortlisted. Hired and withdrawn are final.

## Matching and screening

| Method | Path | Role |
|---|---|---|
| GET | `/matching/jobs/:jobId?narrative=true` | C |
| GET | `/matching/me` | C |
| GET | `/matching/recommendations?limit` | C |
| GET | `/matching/skill-gap` | C |
| POST | `/screening/jobs/:jobId/run` | owning R, A |
| GET | `/screening/jobs/:jobId` | owning R, A |
| GET, PUT | `/screening/jobs/:jobId/settings` | owning R, A |

## Interviews, notifications, support, skills

| Method | Path | Role |
|---|---|---|
| POST | `/interviews` | R (rejects clashes with the recruiter's other interviews) |
| GET | `/interviews?from&to&status` | any (scoped to the caller) |
| PATCH | `/interviews/:id` | R (reschedule or change status; candidate notified) |
| POST | `/interviews/:id/feedback` | R |
| GET | `/notifications?page&limit&unread` | any |
| GET | `/notifications/unread-count` | any |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | any |
| POST | `/complaints` | any |
| GET | `/complaints/mine`, `/complaints/:id` | any (own) or A |
| POST | `/complaints/:id/responses` | owner or A |
| GET | `/skills?q&category&status` | public (approved only unless admin) |
| POST, PUT, DELETE | `/skills[/:id]` | A |
| GET | `/analytics/candidate` | C |
| GET | `/analytics/recruiter` | R |

## Admin

All under `/admin`, role A.

| Method | Path |
|---|---|
| GET | `/admin/analytics` |
| GET | `/admin/users?q&role&status`, `/admin/users/:id` |
| PATCH | `/admin/users/:id/suspend` (`{ reason }`), `/admin/users/:id/reactivate` |
| GET, PATCH | `/admin/complaints`, `/admin/complaints/:id` |
| GET | `/admin/audit-logs?q&category&severity&from&to` |
| GET | `/admin/security-events` |
| PATCH | `/admin/resumes/:id/review` (`{ decision: cleared\|rejected, note? }`) |
| POST, GET | `/admin/ai-evaluations` (`{ mode: benchmark\|job, jobId? }`), `/admin/ai-evaluations/:id` |
| GET | `/admin/health` |

## Status codes

`400` validation, `401` unauthenticated or token invalid (`TOKEN_INVALID` triggers a client refresh), `403` role or ownership, `404`, `409` duplicate, `413` file too large, `422` the AI service could not read a document, `429` rate limit or account lock, `501` OAuth provider not configured, `502` AI result failed validation, `503` AI service unavailable.

Rate limits: 300 requests per minute per IP on the API, 30 per 15 minutes on auth endpoints, 30 uploads per hour.
