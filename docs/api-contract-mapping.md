# HireSmart AI — Backend API Contract Mapping & Integration Preparation

> **Phase 3 Batch 5 Specification Document**  
> Document Version: `1.0.0`  
> Inspection Date: `November 19, 2026`  
> Target Architecture: React Frontend &rarr; Express Backend (`/api/v1`) &rarr; MongoDB & AI Microservice

---

## 1. Executive Summary & Discovery Findings

During the Phase 3 Batch 5 inspection, the actual backend implementation was discovered on the remote branch **`remotes/origin/backend_test`** in the `server/` directory.

### Backend Infrastructure Discovered:
- **Framework**: Express `5.3.0` running under TypeScript with `tsx watch`.
- **Database**: MongoDB via Mongoose `9.12.1`.
- **Validation**: Zod `4.6.7`.
- **Security & Middleware**: Helmet `8.3.0`, CORS (`origin: http://localhost:5173`, `credentials: true`), Cookie-Parser `1.4.7`, Morgan, and Express-Rate-Limit (`windowMs: 15min`, `limit: 300`).
- **Standard Routing Prefix**: All application routes are mounted under **`/api/v1`** in `server/src/app.ts`.
- **Standard Success Envelope**: `{ success: true, data: T }` via `sendSuccess()`.
- **Standard Error Envelope**: `{ success: false, error: { message: string, details?: unknown, stack?: string } }` via `errorHandler()`.

### Implementation Status:
- **Live Implemented Endpoints**: Only **`GET /api/v1/health`** is currently mounted and active.
- **Feature Routes**: In `server/src/routes/index.ts`, feature routes (`/auth`, `/candidates`, `/resumes`, `/jobs`) are documented as comments for subsequent backend phases.
- **Database Models**: Full Mongoose schemas and seed scripts exist for 11 entities (`User`, `CandidateProfile`, `RecruiterProfile`, `Resume`, `Job`, `Application`, `MatchResult`, `Shortlist`, `Interview`, `Notification`, `Complaint`).
- **AI Microservice**: AI integration is designed to run asynchronously through the Express backend; no direct frontend connection to AI is allowed or planned.

---

## 2. API Contract Inventory

| Feature | Method | Path | Status | Auth Req | Confirmed Source |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **System** | `GET` | `/api/v1/health` | **Confirmed** | None | `server/src/routes/health.routes.ts` |
| **Auth** | `POST` | `/api/v1/auth/register` | *Pending confirmation* | None | Documented in route mounts & `User` schema |
| **Auth** | `POST` | `/api/v1/auth/login` | *Pending confirmation* | None | Documented in route mounts & `User` schema |
| **Auth** | `POST` | `/api/v1/auth/logout` | *Pending confirmation* | Cookie / Token | Documented in route mounts |
| **Auth** | `GET` | `/api/v1/auth/me` | *Pending confirmation* | Bearer / Cookie | Documented in route mounts |
| **Candidate** | `GET` | `/api/v1/candidates/profile` | *Pending confirmation* | Candidate | `server/src/models/CandidateProfile.ts` |
| **Candidate** | `PUT` | `/api/v1/candidates/profile` | *Pending confirmation* | Candidate | `server/src/models/CandidateProfile.ts` |
| **Candidate** | `POST` | `/api/v1/resumes/upload` | *Pending confirmation* | Candidate | `server/src/models/Resume.ts` |
| **Candidate** | `GET` | `/api/v1/resumes/active` | *Pending confirmation* | Candidate | `server/src/models/Resume.ts` |
| **Candidate** | `GET` | `/api/v1/resumes/:id` | *Pending confirmation* | Candidate | `server/src/models/Resume.ts` |
| **Jobs** | `GET` | `/api/v1/jobs` | *Pending confirmation* | Public / Optional | `server/src/models/job.ts` |
| **Jobs** | `GET` | `/api/v1/jobs/:id` | *Pending confirmation* | Public / Optional | `server/src/models/job.ts` |
| **Jobs** | `GET` | `/api/v1/jobs/recommended` | *Pending confirmation* | Candidate | Derived from `MatchResult` schema |
| **Application** | `POST` | `/api/v1/applications` | *Pending confirmation* | Candidate | `server/src/models/application.ts` |
| **Application** | `GET` | `/api/v1/applications/my` | *Pending confirmation* | Candidate | `server/src/models/application.ts` |
| **Recruiter** | `GET` | `/api/v1/recruiter/profile` | *Pending confirmation* | Recruiter | `server/src/models/RecruiterProfile.ts` |
| **Recruiter** | `PUT` | `/api/v1/recruiter/profile` | *Pending confirmation* | Recruiter | `server/src/models/RecruiterProfile.ts` |
| **Recruiter** | `POST` | `/api/v1/jobs` | *Pending confirmation* | Recruiter | `server/src/models/job.ts` |
| **Recruiter** | `PUT` | `/api/v1/jobs/:id` | *Pending confirmation* | Recruiter | `server/src/models/job.ts` |
| **Recruiter** | `GET` | `/api/v1/recruiter/jobs` | *Pending confirmation* | Recruiter | `server/src/models/job.ts` |
| **Recruiter** | `GET` | `/api/v1/recruiter/candidates` | *Pending confirmation* | Recruiter | `server/src/models/CandidateProfile.ts` |
| **Recruiter** | `GET` | `/api/v1/jobs/:jobId/screening` | *Pending confirmation* | Recruiter | `server/src/models/MatchResult.ts` |
| **Pipeline** | `GET` | `/api/v1/pipeline` | *Pending confirmation* | Recruiter | `server/src/models/Shortlist.ts` |
| **Pipeline** | `PATCH`| `/api/v1/applications/:id/status`| *Pending confirmation* | Recruiter | `server/src/models/application.ts` |
| **Interviews**| `POST` | `/api/v1/interviews` | *Pending confirmation* | Recruiter | `server/src/models/Interview.ts` |
| **Interviews**| `GET` | `/api/v1/interviews` | *Pending confirmation* | Recruiter/Cand | `server/src/models/Interview.ts` |
| **Notifications**| `GET` | `/api/v1/notifications` | *Pending confirmation* | Authenticated | `server/src/models/Notification.ts` |
| **Notifications**| `PATCH`| `/api/v1/notifications/:id/read` | *Pending confirmation* | Authenticated | `server/src/models/Notification.ts` |
| **Complaints**| `POST` | `/api/v1/complaints` | *Pending confirmation* | Authenticated | `server/src/models/Complaint.ts` |
| **Admin Users**| `GET` | `/api/v1/admin/users` | **Unavailable** | Admin | No Admin role in backend enums |
| **Admin Health**| `GET` | `/api/v1/admin/system-health` | **Unavailable** | Admin | Only public `/health` exists |
| **Admin Audits**| `GET` | `/api/v1/admin/audit-logs` | **Unavailable** | Admin | No audit log schema in backend |

---

## 3. Confirmed Endpoint Specification

### `GET /api/v1/health`
- **Feature**: System Health & Database Diagnostics
- **Status**: **CONFIRMED** (Implemented in `server/src/routes/health.routes.ts`)
- **HTTP Method**: `GET`
- **Authentication**: None required (Public)
- **Request Parameters / Body**: None
- **Success Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "uptime": 1420,
      "timestamp": "2026-11-19T14:15:22.000Z",
      "database": "connected"
    }
  }
  ```
- **Error Response (HTTP 500)**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Internal server error"
    }
  }
  ```
- **Relevant Frontend Service**: `adminDashboardService.getSystemHealth()`
- **Frontend Type**: `ServiceHealth` in `src/types/admin.ts`

---

## 4. Authentication Contract Findings

Based on inspection of `server/src/app.ts`, `server/src/config/env.ts`, `server/src/models/Users.ts`, and `server/package.json`:

1. **Session & Token Mechanism**:
   - `cookie-parser` is installed and registered in `app.ts`.
   - CORS is configured with `credentials: true` and `origin: env.CLIENT_URL` (`http://localhost:5173`).
   - `bcryptjs` is used to hash passwords (`passwordHash` with `select: false`).
   - **Important Gap**: `jsonwebtoken` (JWT) is **not yet installed** in `server/package.json`. No token generation, token refresh, or auth middleware (`protect`, `requireRole`) exists in the backend code yet.
2. **Authorized Roles in Backend**:
   - Backend `ROLES`: `['candidate', 'recruiter']` (defined in `server/src/constants/enums.ts`).
   - **Note**: The backend enum does **not** yet include `'admin'`.
3. **Password Requirements**:
   - Seed script uses standard complex passwords (e.g., `Password123!`).

---

## 5. Resume Upload & AI Workflow Contracts

Based on inspection of `server/src/models/Resume.ts`, `server/src/models/MatchResult.ts`, and `server/src/models/job.ts`:

1. **Storage & Format**:
   - `Resume` model stores:
     - `fileUrl`: Location of the uploaded binary file (e.g. S3, local storage, or blob storage).
     - `fileName`: Original file name string.
     - `mimeType`: String (e.g. `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
     - `sizeBytes`: Number (File size).
     - `rawText`: Extracted plain text (hidden by default via `select: false`).
2. **Asynchronous Processing Lifecycle**:
   - `parseStatus` enum: `['pending', 'processing', 'done', 'failed']`.
   - **Contract Implication**: Resume parsing is **asynchronous**. Uploading a resume file returns a record with `parseStatus: 'pending'` or `'processing'`. The frontend must query `GET /api/v1/resumes/:id` (polling) or receive an event when `parseStatus: 'done'`.
3. **Parsed Output Schema**:
   ```typescript
   parsedData: {
     skills: string[];
     totalExperienceYears: number;
     experience: Array<Record<string, unknown>>;
     education: Array<Record<string, unknown>>;
   }
   ```
4. **AI Job Matching & Screening Schema (`MatchResult`)**:
   - Stored in MongoDB collection `matchresults`:
     - `skillsScore`: 0–100
     - `experienceScore`: 0–100
     - `educationScore`: 0–100
     - `overallScore`: 0–100
     - `matchedSkills`: `string[]`
     - `missingSkills`: `string[]`
     - `explanation`: string
     - `meetsThreshold`: boolean (evaluated against `Job.screening.threshold`, default: 80)
5. **Architectural Rule**:
   - React Frontend calls **Express Backend ONLY**.
   - Express Backend interacts with MongoDB and the AI Microservice.
   - Frontend **never** communicates with the AI microservice directly.

---

## 6. Frontend Service to Backend Contract Mapping

| Frontend Service | Backend Target | Readiness Classification | Notes |
| :--- | :--- | :--- | :--- |
| `authService` | `/api/v1/auth/*` | **Requires backend confirmation** | Routes unmounted; JWT and auth middleware pending on backend. |
| `jobService` | `/api/v1/jobs/*` | **Partially ready** | Mongoose `Job` schema confirmed; requires case adapter (see §7). |
| `applicationService` | `/api/v1/applications/*` | **Partially ready** | Mongoose `Application` schema confirmed; routes unmounted. |
| `profileService` | `/api/v1/candidates/profile` | **Requires frontend type adjustment** | Backend stores `skills: string[]`; frontend uses skill objects. |
| `resumeService` | `/api/v1/resumes/*` | **Requires backend confirmation** | Mongoose `Resume` async lifecycle confirmed; file upload endpoint pending. |
| `recruiterCandidateService` | `/api/v1/recruiter/candidates` | **Requires backend confirmation** | Requires backend aggregation route joining User, CandidateProfile, Application, and MatchResult. |
| `interviewService` | `/api/v1/interviews/*` | **Partially ready** | Mongoose `Interview` schema confirmed; routes unmounted. |
| `pipelineService` | `/api/v1/pipeline` | **Partially ready** | Mongoose `Shortlist` and `Application` schemas confirmed. |
| `aiScreeningService` | `/api/v1/jobs/:id/screening` | **Partially ready** | Mongoose `MatchResult` schema confirmed; screening trigger route pending. |
| `notificationService` | `/api/v1/notifications/*` | **Partially ready** | Mongoose `Notification` schema confirmed; routes unmounted. |
| `settingsService` | `/api/v1/users/settings` | **Requires backend confirmation** | No dedicated settings schema; stored across User/Profile records. |
| `skillService` | `/api/v1/skills/*` | **Requires backend confirmation** | No independent skill taxonomy model on backend yet. |
| `adminDashboardService` | `/api/v1/admin/*` | **Requires backend confirmation** | Only `/api/v1/health` exists; Admin user management and audits pending. |

---

## 7. Type Mismatch Inventory & Transformation Strategy

A direct comparison between backend Mongoose models (`server/src/models/`) and frontend TypeScript definitions (`src/types/`) revealed the following mismatches:

| Field / Entity | Backend Format (`server/`) | Frontend Format (`src/types/`) | Transformation Strategy |
| :--- | :--- | :--- | :--- |
| **Object Identifiers** | `_id: ObjectId` | `id: string` | Map `id: item._id.toString()` in API response adapter. |
| **User Role** | `'candidate' \| 'recruiter'` | `'candidate' \| 'recruiter' \| 'admin'` | Backend needs `'admin'` added to `ROLES` enum. |
| **Job Status** | `'draft' \| 'open' \| 'closed'` | `'Draft' \| 'Active' \| 'Closed' \| 'Paused'` | Map `'open'` &harr; `'Active'`, `'closed'` &harr; `'Closed'`. |
| **Job Type** | `'full-time' \| 'part-time' \| 'contract' \| 'internship'` | `'Full-time' \| 'Part-time' \| 'Contract' \| 'Internship'` | Bidirectional case-conversion adapter. |
| **Work Mode** | `'onsite' \| 'remote' \| 'hybrid'` | `'On-site' \| 'Remote' \| 'Hybrid'` | Map `'onsite'` &harr; `'On-site'`. |
| **Application Status** | `'applied' \| 'screened' \| 'shortlisted' \| 'interview' \| 'hired' \| 'rejected' \| 'withdrawn'` | `'Applied' \| 'Under Review' \| 'Shortlisted' \| 'Interview' \| 'Offer' \| 'Rejected' \| 'Withdrawn'` | Map `'screened'` &harr; `'Under Review'`, `'hired'` &harr; `'Offer'`. |
| **Candidate Skills** | `string[]` (e.g. `['React', 'Node.js']`) | `Array<{ id, name, level, category }>` | Adapter maps `string[]` to `SkillData[]` with default level `'Intermediate'`. |
| **Salary** | `{ min: number, max: number, currency: string }` | `string` (e.g. `"₹6–10 LPA"`) | Format helper transforms `{ min, max, currency }` &rarr; display string. |
| **Dates** | MongoDB ISO `Date` | Formatted `string` | Parse with `new Date(item.date).toISOString()`. |

---

## 8. Environment & Configuration Audit

- **Frontend Configuration**:
  - `src/config/env.ts` defaults to:
    ```typescript
    apiBaseUrl: "http://localhost:5000/api",
    useMock: true
    ```
- **Backend Configuration**:
  - Express runs on port `5000` (`PORT: 5000` in `server/src/config/env.ts`).
  - Routes are mounted at **`/api/v1`** (`app.use('/api/v1', routes)`).
- **Required Alignment for Live Integration**:
  - When switching to live mode in future phases, the frontend base URL will need to target `http://localhost:5000/api/v1` (or be configured via `VITE_API_BASE_URL=http://localhost:5000/api/v1`).
  - `VITE_USE_MOCK` must remain `true` during Batch 5.

---

## 9. Missing Information Requiring Backend Teammate Confirmation

To proceed safely with live integration in subsequent batches, the backend team must confirm:
1. **Authentication Strategy**: Will auth tokens be delivered via httpOnly cookies or Authorization Bearer header? When will `jsonwebtoken` and auth middleware be implemented?
2. **Admin Role & Access**: Will the `'admin'` role and Admin route handlers (`/api/v1/admin/*`) be implemented in the Express backend?
3. **Resume File Upload**: What multipart middleware (Multer/Busboy) will be used for `POST /api/v1/resumes/upload`, and what field name should the file be uploaded under (e.g., `'resume'` vs `'file'`)?
4. **AI Asynchronous Polling**: Should the frontend poll `GET /api/v1/resumes/:id` for `parseStatus`, or will WebSockets / Server-Sent Events (SSE) be introduced?
5. **Casing & Enums**: Can backend enums accept Title Case or will the frontend adapter handle normalization?

---

## 10. Conclusion & Next Steps

The frontend architecture (`httpClient`, `ApiError`, domain types, and service abstractions) is 100% prepared to connect to the Express backend. However, because the backend feature routes are currently commented out and pending implementation, **live integration must wait until the backend team mounts the corresponding feature controllers**. The application will safely remain in mock mode.
