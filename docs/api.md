# HireSmart AI — API Reference

All protected endpoints require an `Authorization: Bearer <accessToken>` header.

## Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register new candidate or recruiter account |
| `POST` | `/login` | Public | Authenticate user; returns access token & sets refresh cookie |
| `POST` | `/refresh` | Public (Cookie) | Exchange refresh token for fresh access token |
| `POST` | `/logout` | Authenticated | Invalidate refresh token and clear cookie |
| `GET` | `/me` | Authenticated | Retrieve current user profile and role |
| `PUT` | `/profile` | Authenticated | Update user full name and profile fields |
| `POST` | `/change-password` | Authenticated | Change account password with current password verification |

## Candidates (`/api/v1/candidates`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/profile` | Candidate | Retrieve candidate profile, skills, education, and resume link |
| `PUT` | `/profile` | Candidate | Update candidate headline, bio, experience, skills |
| `GET` | `/dashboard` | Candidate | Real statistics: total applications, shortlisted, interviews |
| `GET` | `/recommended-jobs` | Candidate | AI-matched job recommendations based on profile skills |
| `POST` | `/bookmarks/:jobId` | Candidate | Bookmark a job posting |
| `DELETE` | `/bookmarks/:jobId` | Candidate | Remove a job bookmark |

## Resumes (`/api/v1/resumes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/upload` | Candidate | Upload resume PDF/DOCX (Magic bytes validated, prompt injection scanned) |
| `GET` | `/` | Candidate | List all uploaded resumes for the candidate |
| `GET` | `/:id` | Owner/Recruiter/Admin | View resume details, extracted skills, and security scan |
| `GET` | `/:id/download` | Owner/Recruiter/Admin | Download original uploaded resume file |
| `PATCH` | `/:id/active` | Candidate | Set specific resume as active for future applications |

## Jobs (`/api/v1/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Search and filter published job listings with pagination |
| `GET` | `/:id` | Public | Retrieve full job posting requirements and details |
| `POST` | `/` | Recruiter/Admin | Create new job posting |
| `PUT` | `/:id` | Recruiter/Admin | Update job title, description, skills, salary, or status |
| `GET` | `/:id/stats` | Recruiter/Admin | Dynamic application counts and applicant stage metrics |

## Applications (`/api/v1/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Candidate | Submit job application (prevents duplicate applications) |
| `GET` | `/me` | Candidate | View candidate's submitted applications and stages |
| `GET` | `/:id` | Owner/Recruiter | View application details and match score |
| `PATCH` | `/:id/status` | Recruiter | Advance or reject candidate in the hiring pipeline |
| `POST` | `/:id/notes` | Recruiter | Add private recruiter evaluation note |

## Recruiter Management (`/api/v1/recruiter`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Recruiter | Recruiter dashboard: active jobs, applicants, pipeline stats |
| `GET` | `/candidates` | Recruiter | Candidate discovery and resume talent pool search |
| `GET` | `/pipeline` | Recruiter | Kanban pipeline view with applications by stage |
| `GET/PUT` | `/profile` | Recruiter | Manage recruiter company profile and designation |

## AI Screening (`/api/v1/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/screen/:applicationId` | Recruiter | Run AI matching formula on an application |
| `POST` | `/screen/job/:jobId/bulk` | Recruiter | Bulk screen all unscreened applicants for a job |
| `GET` | `/insights/job/:jobId` | Recruiter | Aggregate skill distribution and candidate quality metrics |

## Interviews & Notifications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/interviews` | Recruiter | Schedule technical or HR interview |
| `GET` | `/api/v1/interviews` | Candidate/Recruiter | List scheduled interviews |
| `PATCH` | `/api/v1/interviews/:id` | Recruiter | Update interview status, link, or feedback |
| `GET` | `/api/v1/notifications` | Authenticated | Retrieve unread user alerts and status updates |

## Admin (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/stats` | Admin | System statistics across users, jobs, applications |
| `PATCH` | `/users/:id/status` | Admin | Moderation: Activate or suspend user account |
| `GET` | `/audit-logs` | Admin | Query security audit events with PII redaction |
| `GET` | `/ai-evaluations` | Admin | Retrieve AI fairness, stability, and bias reports |
| `POST` | `/skills` | Admin | Add verified skill to taxonomy |
| `PATCH` | `/skills/:id/approve` | Admin | Review and approve AI-discovered unknown skills |
