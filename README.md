# HireSmart AI

**An AI-assisted recruitment platform for resume understanding, job matching, candidate discovery, and hiring workflow management.**

HireSmart AI connects candidates, recruiters, and platform administrators through role-specific portals. It combines structured resume extraction, explainable job matching, semantic similarity, application tracking, and hiring pipeline tools in one full-stack application.

> **AI is decision support, not the hiring decision-maker.** The platform provides match evidence, score breakdowns, strengths, and gaps. Recruiters retain responsibility for reviewing candidates and making hiring decisions.

---

## Table of Contents

- [Project Overview](#1-project-overview)
- [Objectives](#2-project-objectives)
- [System Architecture](#3-system-architecture)
- [Technology Stack](#4-technology-stack)
- [Core Features](#5-core-features)
- [End-to-End Platform Workflow](#6-end-to-end-platform-workflow)
- [Dashboard Workflows](#7-dashboard-workflows)
- [AI Screening and Matching](#8-ai-screening-and-matching)
- [Security Implementation](#9-security-implementation)
- [AI Decision Principles](#10-ai-decision-principles)
- [Key Innovations](#11-key-innovations)
- [Data and Auditability](#12-data-management-and-auditability)
- [Project Structure](#13-project-structure)
- [Installation and Local Setup](#14-installation-and-local-setup)
- [Environment Configuration](#15-environment-configuration)
- [Docker Setup](#16-docker-setup)
- [Testing and Verification](#17-testing-and-verification)
- [API and Technical Documentation](#18-api-and-technical-documentation)
- [Known Limitations and Future Scope](#19-known-limitations-and-future-scope)

---

## 1. Project Overview

HireSmart AI is a full-stack recruitment and talent-matching system designed to make the hiring lifecycle more organized, data-informed, and explainable.

Traditional recruitment often involves manually reviewing large numbers of resumes, comparing candidate qualifications against job requirements, coordinating interviews, and maintaining application records across disconnected tools. HireSmart AI brings these activities into a single platform.

The system provides three primary user experiences:

- **Candidate Portal:** Candidates create profiles, upload resumes, discover jobs, receive recommendations, apply to openings, and track their applications.
- **Recruiter Portal:** Recruiters manage job postings, discover candidates, run AI-assisted screening, review match explanations, manage hiring stages, and coordinate interviews.
- **Administrator Portal:** Administrators oversee platform activity, manage users and complaints, maintain the skill taxonomy, inspect audit records, and review AI evaluation and system-health information.

The application is organized as a React frontend, an Express API backend, a MongoDB database, and a separately deployable Node.js AI service. The backend remains the central application and authorization layer.

## 2. Project Objectives

1. **Improve resume processing:** Extract structured information such as skills, education, experience, projects, and role history from supported resume formats.
2. **Make job matching explainable:** Compare candidate evidence with job requirements and expose the factors contributing to each match score.
3. **Support better recruiter workflows:** Bring job creation, candidate review, screening, pipeline management, and interview coordination into one workspace.
4. **Help candidates discover relevant roles:** Provide searchable job listings, recommendations, bookmarks, and application tracking.
5. **Protect candidate and platform data:** Apply authentication, role-based access, input validation, upload verification, and security monitoring.
6. **Promote responsible AI use:** Reduce unnecessary exposure of personal identifiers during screening and keep hiring decisions under human control.
7. **Provide administrative oversight:** Give platform administrators tools for user governance, complaint handling, audit review, and AI evaluation.

## 3. System Architecture

HireSmart AI uses a modular, service-oriented full-stack architecture.

### High-level architecture

```text
                         CANDIDATE / RECRUITER / ADMIN
                                      |
                                      v
                         React + TypeScript SPA
                         Vite | Tailwind CSS
                                      |
                              HTTPS / REST API
                                      |
                                      v
                       Node.js + Express Backend
                  Authentication | RBAC | Validation
                 Controllers | Domain Services | API Routes
                         /                 \
                        /                   \
                       v                     v
                MongoDB Database       AI Service (Node.js)
              Users and Profiles       Resume Processing
              Jobs and Applications    Text / Skill Extraction
              Resumes and Interviews   Injection Scanning
              Notifications             Matching / Evaluation
              Complaints and Logs               |
                                                v
                                      Configured AI Provider
                                      Groq / Embedding Model
```

### Architecture responsibilities

| Layer | Responsibility |
|---|---|
| Frontend | Role-specific user interfaces, navigation, forms, dashboards, visualizations, and API communication |
| Backend API | Authentication, authorization, validation, business rules, persistence, and coordination between application modules |
| AI service | Resume parsing, text cleaning, injection scanning, structured extraction, semantic matching, scoring, recommendations, and AI evaluation utilities |
| MongoDB | Persistent storage for users, profiles, resumes, jobs, applications, interviews, notifications, skills, complaints, evaluations, and audit records |
| External AI / model providers | Configurable language-model and embedding capabilities used by AI workflows |

### Request lifecycle

1. A user performs an action in the frontend.
2. The frontend sends a request to the backend API under `/api/v1`.
3. Backend middleware checks the request, session, role permissions, and payload.
4. The relevant controller and service execute the business operation.
5. The backend reads from or writes to MongoDB and calls the AI service when analysis is required.
6. The AI service returns structured results; the backend applies application rules and persists appropriate records.
7. The API returns a consistent response and the frontend refreshes the relevant view.

The frontend supports live API mode and a development mock mode. Live mode is configured with `VITE_USE_MOCK=false`.

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| TypeScript | Type-safe frontend development |
| Vite | Development server and production build |
| Tailwind CSS 4 | Utility-first styling |
| React Router DOM 7 | Client-side routing and protected routes |
| Framer Motion | UI transitions and animations |
| Lucide React | Icons |
| Recharts | Dashboard charts and data visualization |
| Playwright | Browser-based workflow tests |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server-side JavaScript runtime |
| Express 5 | REST API framework |
| TypeScript | Type-safe backend development |
| MongoDB 7 | Document database |
| Mongoose 9 | MongoDB object modelling |
| JSON Web Tokens | Access-token authentication |
| bcryptjs | Password hashing |
| Zod | Request and data validation |
| Multer | Multipart file upload handling |
| Helmet | HTTP security headers |
| express-rate-limit | API request rate limiting |
| CORS / cookie-parser | Cross-origin policy and cookie handling |
| Google Auth Library | Google OAuth token verification |
| pdf-parse / Mammoth | PDF and DOCX text extraction support |

### AI service

| Technology | Purpose |
|---|---|
| Node.js (ES modules) | Standalone AI service runtime |
| Express 5 | AI service HTTP interface |
| Groq SDK | Configurable LLM-based extraction and analysis |
| Hugging Face Transformers.js | Local embedding / semantic model support |
| PDF.js | PDF text extraction |
| Mammoth | DOCX text extraction |
| Zod | Structured AI output validation |
| SHA-256 | Resume fingerprinting and duplicate detection |

### Infrastructure and tooling

- Docker and Docker Compose for multi-service local orchestration.
- MongoDB container with persistent volume and health check.
- Jenkins pipeline definition for build/test automation workflows.
- npm for dependency management and scripts.

## 5. Core Features

### 5.1 Authentication and account management

- Candidate, recruiter, and administrator account roles.
- Registration and login flows.
- JWT-based access authentication and HTTP-only refresh-cookie handling.
- Google OAuth integration.
- Role-aware route protection and login restrictions.
- Profile and account management.
- Session cleanup and user-specific client-data isolation on logout.

### 5.2 Resume management and analysis

- Resume upload and management.
- PDF and DOCX parsing.
- Extraction of candidate details, skills, education, work experience, and projects.
- Structured extraction output validated against a schema.
- Resume review before extracted profile information is saved.
- Resume fingerprinting for duplicate detection.
- Resume analysis and skill evidence used by matching workflows.

### 5.3 Job discovery and applications

- Job search and filtering.
- Job details and eligibility information.
- Job bookmarking.
- Application submission using a candidate's resume.
- Application history and status tracking.
- Candidate-facing job recommendations.

### 5.4 Recruiter and hiring operations

- Job creation, editing, publishing, and closing.
- Candidate discovery and filtering.
- AI-assisted candidate screening and ranking.
- Match score breakdowns, strengths, and potential gaps.
- Applicant management.
- Hiring pipeline and stage updates.
- Interview scheduling, meeting details, feedback, and status tracking.
- Recruitment analytics.

### 5.5 Platform administration

- Platform overview and dashboard metrics.
- User search, filtering, moderation, suspension, and reactivation.
- Complaint review and resolution.
- Skill taxonomy management.
- Audit-log inspection.
- AI evaluation and fairness-related metrics.
- System-health information.

### 5.6 Shared platform capabilities

- Notifications.
- Candidate and recruiter profile management.
- Help, support, and complaint workflows.
- Live API and mock-data development modes.
- Seed data for local development and testing.

## 6. End-to-End Platform Workflow

### A. Candidate journey

1. The candidate visits the public landing page.
2. The candidate registers or signs in using the available authentication options.
3. The backend validates the account and establishes the session.
4. The candidate completes their profile or uploads a resume.
5. The resume is checked, parsed, cleaned, and analyzed.
6. Extracted information is presented for review before being saved to the candidate profile.
7. The candidate explores jobs using search and filters.
8. The platform can recommend relevant opportunities based on candidate and job information.
9. The candidate bookmarks interesting jobs or submits an application.
10. The application becomes available to the relevant recruiter.
11. The candidate tracks application progress and interview information through the portal.

### B. Recruiter journey

1. The recruiter signs in and opens the recruiter dashboard.
2. The recruiter creates or manages job postings.
3. Candidates apply to published jobs.
4. The recruiter opens the applicant list or candidate discovery area.
5. The recruiter runs AI-assisted screening for a job.
6. The system analyzes candidate evidence against the job requirements and generates match scores and explanations.
7. The recruiter reviews the score breakdown, strengths, gaps, and candidate profile.
8. The recruiter makes the decision to shortlist, move forward, reject, or otherwise update the application.
9. Selected candidates move through the hiring pipeline.
10. The recruiter schedules interviews, records feedback, and updates interview outcomes.
11. Recruitment analytics reflect the available hiring activity.

### C. Administrator journey

1. The administrator signs in with the authorized admin role.
2. The administrator reviews platform-level metrics and activity.
3. The administrator manages users and account status.
4. The administrator reviews and resolves complaints.
5. The administrator maintains the skill taxonomy.
6. The administrator inspects security and administrative audit logs.
7. The administrator reviews AI evaluation information and system-health metrics.

### Workflow summary

```text
Candidate Registration
        |
        v
Profile Creation / Resume Upload
        |
        v
Resume Validation and Parsing
        |
        v
Structured Candidate Profile
        |
        v
Job Discovery and Recommendations
        |
        v
Application Submission
        |
        v
Recruiter Applicant Management
        |
        v
AI-Assisted Screening and Ranking
        |
        v
Human Recruiter Review
        |
        v
Hiring Pipeline
        |
        v
Interview Scheduling and Feedback
        |
        v
Final Application Status
```

The administrator workflow runs alongside this lifecycle and provides platform governance, moderation, complaint handling, audit review, and operational oversight.

## 7. Dashboard Workflows

The platform uses separate dashboards so each role sees the information and actions relevant to its responsibilities.

### 7.1 Candidate dashboard workflow

**Dashboard purpose:** Help candidates manage their career profile, discover opportunities, and follow their applications.

| Area | Workflow and actions |
|---|---|
| Overview | Review application activity, interview information, profile strength, and recent updates |
| Resume | Upload, view, manage, and review parsed resume information |
| Jobs | Search and filter available jobs, inspect job details, and explore opportunities |
| Recommended | Review job recommendations and open relevant job details |
| Applications | View submitted applications and follow their current status |
| Application details | Inspect an individual application and its available progress information |
| Skills | Review extracted skills, skill categories, proficiency information, and skill insights |
| Profile | Update personal, education, experience, and professional profile information |
| Notifications | Review platform updates and application-related notifications |
| Support / Complaint | Submit an issue or complaint and follow its resolution where available |

**Typical navigation:** Dashboard → Resume/Profile → Jobs/Recommended → Job Details → Apply → Applications → Application Details.

### 7.2 Recruiter dashboard workflow

**Dashboard purpose:** Help recruiters manage vacancies and move applicants through a consistent hiring process.

| Area | Workflow and actions |
|---|---|
| Overview | Review active jobs, candidate volume, AI screening activity, and interview metrics |
| Job management | View, create, edit, publish, and close job postings |
| Create job | Enter role details, skills, experience, education, and other job requirements |
| Candidates | Discover and inspect candidate profiles and applicant records |
| Candidate profile | Review candidate information and relevant application context |
| Screening | Run AI-assisted screening and compare candidate match results |
| Job screening | Review ranked candidates and match explanations for a selected job |
| Hiring pipeline | Move applicants through stages such as Applied, Screened, Shortlisted, Interview, Hired, and Rejected |
| Interviews | Schedule interviews, manage meeting information, and record feedback or outcomes |
| Analytics | Review recruitment and job-related metrics |
| Recruiter profile | Maintain recruiter or organization information |

**Typical navigation:** Dashboard → Create/Manage Jobs → Candidates → Screening → Candidate Review → Hiring Pipeline → Interviews → Analytics.

### 7.3 Administrator dashboard workflow

**Dashboard purpose:** Provide oversight of platform usage, user activity, governance, and operational health.

| Area | Workflow and actions |
|---|---|
| Overview | Review user, job, application, and platform activity metrics |
| User management | Search, filter, inspect, suspend, and reactivate user accounts |
| User details | Review an individual account and its available administrative information |
| Complaints | Review submitted complaints and support issues |
| Complaint details | Inspect a complaint, add resolution information, and update its status |
| Skills | Maintain the platform skill taxonomy and review skill records |
| Audit logs | Inspect recorded administrative and security-related events |
| AI evaluation | Review model evaluation, fairness-related measurements, and screening diagnostics |
| System health | Inspect API and infrastructure health indicators |
| Help / Privacy | Access platform guidance and privacy information |

**Typical navigation:** Admin Dashboard → Users → User Details / Moderation → Complaints → Skills → Audit Logs → AI Evaluation → System Health.

> Dashboard labels and available actions may vary with permissions and the current application state. The tables describe the implemented role-oriented workflows rather than promising that every metric is available in every deployment.

## 8. AI Screening and Matching

The AI workflow converts resume content into structured candidate evidence and compares that evidence with a job description.

### 8.1 Resume intelligence pipeline

1. **File validation:** Check supported file type, file signature, and configured size/page limits.
2. **Text extraction:** Extract readable text from PDF or DOCX documents.
3. **Text normalization:** Clean extracted content and remove invisible or zero-width characters.
4. **Security inspection:** Scan for instruction-like or prompt-injection content; redact flagged lines before model processing.
5. **Structured extraction:** Use the configured language model to extract candidate facts into a validated schema.
6. **Skill normalization:** Normalize skill names and map recognized skills to the application's taxonomy.
7. **Evidence calculation:** Derive experience and skill evidence from roles, projects, dates, and resume content.
8. **Analysis storage:** Return structured analysis and metadata for use by the application.

Scanned image-only PDFs may not be readable because OCR is not currently part of the documented parsing flow.

### 8.2 Job matching formula

The default weighted matching model uses four components:

```text
Overall Match =
    (Skills Match       × 0.50)
  + (Experience Match   × 0.20)
  + (Education Match    × 0.10)
  + (Role Similarity    × 0.20)
```

| Component | Weight | What it evaluates |
|---|---:|---|
| Skills match | 50% | Evidence for required and preferred job skills |
| Experience match | 20% | Candidate experience compared with the job's experience requirement |
| Education match | 10% | Alignment between the stated education requirement and candidate education |
| Role similarity | 20% | Similarity between candidate role information and the target role |

The matching service also supports semantic similarity when the embedding model is available. If embeddings cannot be generated, the semantic layer falls back to the rule-based matching path.

### 8.3 Skill evidence and score explanations

- Required skills have greater influence than preferred skills within the skills component.
- Skills can be classified as matched, partial, or missing based on available evidence.
- A skill merely listed without supporting evidence is not treated as equivalent to demonstrated experience.
- Overlapping employment periods are handled to avoid counting the same time twice.
- Experience claims are compared with experience derived from dated roles where available.
- The result can include matched strengths and potential gaps to help recruiters understand the score.

### 8.4 Screening categories

The AI service defines configurable screening thresholds. The current defaults include an 80-point screening threshold and a 60-point potential-match minimum. These are configurable system values, not a guarantee of candidate quality or a final hiring decision.

### 8.5 AI provider resilience

The repository contains a separate AI service and backend-side AI integration. The application is designed to use configured AI capabilities and retain deterministic matching paths when optional semantic or external model capabilities are unavailable. Exact provider availability depends on environment configuration and service health.

## 9. Security Implementation

Security is applied across authentication, API access, file ingestion, AI processing, and administrative oversight.

### 9.1 Authentication and authorization

- JWT access-token authentication.
- HTTP-only refresh-cookie handling and refresh lifecycle.
- Password hashing with bcryptjs.
- Role-based authorization for candidate, recruiter, and admin operations.
- Protected frontend routes and backend authorization checks.
- Role-aware sign-in restrictions.
- Suspended-account checks.
- Google OAuth integration with state/nonce handling in the sign-in flow.

### 9.2 API and transport protections

- Helmet security headers.
- CORS allow-list configuration with credential support.
- API rate limiting, with production-specific limits.
- JSON request-size limits.
- Zod request validation.
- Centralized error and not-found handling.
- Disabled Express `X-Powered-By` header.

### 9.3 Resume upload protections

- File extension and content-signature checks.
- PDF and DOCX magic-byte verification.
- Upload size limits.
- PDF page-count limits in the AI parsing service.
- Rejection of unsupported or empty files.
- SHA-256 file hashing for fingerprinting and duplicate detection.
- Explicit handling of documents from which sufficient text cannot be extracted.

### 9.4 Prompt-injection protection

Resume content is treated as untrusted input. The AI service scans for patterns such as:

- Attempts to override previous instructions.
- Attempts to impersonate system, developer, or assistant roles.
- Instructions to manipulate a candidate's score or ranking.
- Directives telling the model to hire or shortlist a candidate.
- Suspicious chat-control markup.
- Concealment or output-control instructions.
- Unusual invisible-character usage.

Flagged lines are redacted before text is sent to the language model. The scanner reports findings and risk levels for review; a flagged resume is not automatically rejected solely because the scan found instruction-like content.

### 9.5 Privacy-aware screening

The AI matching implementation documents that scoring uses skills, years of experience, degree text, and role titles rather than name, email, location, company, or institution identifiers.

The AI service also provides blind-profile construction that removes or redacts selected direct identifiers and organization names from recruiter-facing screening data. Free-text content may still contain identifying clues, so blind screening should be treated as a risk-reduction measure rather than a guarantee of anonymity.

### 9.6 Audit and data isolation

- AI-related audit events capture analysis, scoring, screening, injection detection, and evaluation activity.
- AI audit events are designed not to include raw resume text, candidate names, email addresses, or locations.
- Administrative actions and security events can be inspected through the admin audit-log interface.
- User-specific browser data is cleared during logout to reduce cross-account data leakage.

## 10. AI Decision Principles

HireSmart AI follows a human-centred decision-support approach.

### 10.1 Human oversight

AI-generated scores and recommendations support recruiter review. The recruiter remains responsible for shortlisting, interviewing, rejecting, or hiring a candidate.

### 10.2 Explainability

The platform aims to show more than a single percentage. Screening results can include component scores, matched skills, strengths, and potential gaps so a recruiter can understand the basis of a match.

### 10.3 Job-related evaluation

The matching logic focuses on job-related evidence such as skills, experience, education, and role relevance. The scoring implementation explicitly avoids using direct personal identifiers such as name, email, and location as matching inputs.

### 10.4 Privacy-aware processing

Blind-profile functionality reduces exposure of selected personal and organizational identifiers during screening. Access to candidate information is also separated by application roles.

### 10.5 Security and robustness

Resume content is treated as untrusted data. Prompt-injection scanning, text sanitization, structured output validation, and deterministic matching paths help reduce the impact of malicious or malformed inputs.

### 10.6 Configurable and reviewable evaluation

Matching weights and thresholds are configurable in the AI service. Evaluation utilities include measurements related to skill extraction, score stability, fairness variants, and security attack scenarios. These tools support review; they do not by themselves establish that a model is unbiased or legally compliant.

### 10.7 No automated final hiring decision

A match score is not a probability of job performance and must not be treated as an automatic hire/reject instruction. Recruiters should review the candidate's underlying evidence and apply consistent, job-related criteria.

## 11. Key Innovations

1. **Explainable weighted matching:** A transparent 50/20/10/20 scoring model separates skills, experience, education, and role relevance.
2. **Evidence-aware skill scoring:** The system distinguishes skills with supporting evidence from skills that are only listed.
3. **Semantic matching support:** Embedding-based similarity can supplement structured matching when the model is available.
4. **Prompt-injection-aware resume processing:** Suspicious instruction-like text is detected and redacted before LLM processing.
5. **Blind-screening profile support:** Selected personal and organizational identifiers can be removed from recruiter-facing screening data.
6. **Structured LLM extraction:** Model output is validated against schemas before it becomes application data.
7. **Human-in-the-loop hiring:** AI assists with prioritization and explanation while recruiters retain decision authority.
8. **AI audit events:** Screening and security activities can be recorded without placing raw resume text or direct personal identifiers in AI event details.
9. **Role-based end-to-end workflow:** Candidate, recruiter, and administrator operations are connected through shared application data.
10. **Multi-service deployment:** The frontend, backend, database, and AI service can be orchestrated together using Docker Compose.

## 12. Data Management and Auditability

MongoDB is the primary persistence layer. The application models cover the main recruitment lifecycle, including:

- User accounts and role-specific profiles.
- Resumes and extracted candidate information.
- Jobs and skill requirements.
- Applications and screening results.
- Interviews and notifications.
- Complaints and support records.
- Skill taxonomy and AI evaluation data.
- Administrative and AI audit events.

The backend uses Mongoose models and service-layer operations to manage application data. AI results and their score breakdowns can be associated with the relevant application or screening context.

For detailed system and API information, see the [architecture documentation](docs/architecture.md), [API documentation](docs/api.md) when present, and [full-stack test report](docs/FULL_STACK_TEST_REPORT.md).

## 13. Project Structure

```text
ResumeAI/
├── ai-service/                 # Standalone AI processing and matching service
│   ├── src/
│   │   ├── audit/              # AI audit event construction and hashing
│   │   ├── blind/              # Blind-screening profiles and redaction
│   │   ├── evaluation/         # Evaluation and fairness/security metrics
│   │   ├── extraction/         # Structured resume extraction
│   │   ├── jobs/               # Job-description extraction
│   │   ├── llm/                # LLM request utilities
│   │   ├── matching/           # Weighted matching and scoring
│   │   ├── parsing/            # PDF/DOCX parsing and text cleaning
│   │   ├── recommend/          # Job recommendation logic
│   │   ├── security/           # Prompt-injection scanning
│   │   ├── semantic/           # Embedding-based similarity
│   │   └── index.js            # AI service exports and pipelines
│   ├── scripts/                # AI service test scripts
│   └── package.json
│
├── backend/                    # Express REST API
│   ├── src/
│   │   ├── config/             # Environment and database configuration
│   │   ├── constants/          # Shared domain constants
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── middleware/         # Auth, validation, and error handling
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Versioned API routes
│   │   ├── seed/               # Development database seed
│   │   ├── services/           # Business logic and AI integration
│   │   ├── utils/              # Shared helpers and response utilities
│   │   └── validators/         # Zod schemas
│   ├── tests/                  # Backend unit, integration, and workflow tests
│   └── package.json
│
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── components/         # Shared UI components and layouts
│   │   ├── contexts/           # Authentication and domain contexts
│   │   ├── hooks/              # Reusable React hooks
│   │   ├── pages/              # Public, candidate, recruiter, and admin pages
│   │   ├── services/           # API clients and domain services
│   │   ├── types/              # TypeScript types
│   │   └── App.tsx              # Application routes and layout
│   ├── tests/                  # Playwright browser tests
│   └── package.json
│
├── docs/                        # Architecture, presentation, and test documentation
├── scripts/                     # Project-level scripts
├── .env.example                 # Root environment template
├── docker-compose.yml           # Multi-service orchestration
├── Jenkinsfile                  # Jenkins pipeline definition
└── README.md
```

## 14. Installation and Local Setup

### Prerequisites

- Node.js 20 or later (the repository has also been tested with Node.js 24).
- npm.
- MongoDB 7 or a compatible MongoDB instance.
- Git.
- Optional: Groq credentials and any configured AI provider/model assets required by the AI features.

### 14.1 Clone the repository

```bash
git clone https://github.com/tharunsai01/ResumeAI.git
cd ResumeAI
```

### 14.2 Configure environment variables

Create the environment files described in [Environment Configuration](#15-environment-configuration). Do not commit real credentials or secrets.

### 14.3 Install backend dependencies

```bash
cd backend
npm install
```

### 14.4 Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 14.5 Install AI service dependencies

```bash
cd ../ai-service
npm install
```

### 14.6 Start MongoDB

Start a local MongoDB instance and ensure the configured `MONGODB_URI` is reachable.

### 14.7 Seed development data (optional)

```bash
cd backend
npm run seed
```

Use seed data only in a development or test database.

### 14.8 Start the services

Run each service in a separate terminal:

**Terminal 1 — Backend API**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

**Terminal 3 — AI service**

```bash
cd ai-service
npm run dev
```

The backend API is configured for port `5000`, the Vite frontend for port `5173`, and the AI service for port `8000` in the Docker service configuration. Check the service configuration and local environment if a port has been customized.

Open the frontend at [http://localhost:5173](http://localhost:5173).

Check backend health at [http://localhost:5000/health](http://localhost:5000/health).

## 15. Environment Configuration

The repository includes a root `.env.example`. Create a local `.env` from that template and configure values for your environment.

Common variables include:

| Variable | Purpose |
|---|---|
| `PORT` | Backend listening port |
| `NODE_ENV` | Runtime environment |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Allowed frontend origin |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used for refresh-token signing, where configured |
| `JWT_ACCESS_MINUTES` | Access-token lifetime |
| `JWT_REFRESH_DAYS` | Refresh-token lifetime |
| `AI_SERVICE_URL` | Backend-to-AI-service URL |
| `AI_SERVICE_KEY` | Shared key for AI service communication |
| `GROQ_API_KEY` | Optional Groq provider credential |
| `GROQ_MODEL` | Configured Groq model identifier |
| `GEMINI_API_KEY` | Optional Gemini credential where supported by backend integration |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Registered OAuth callback URI |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional SMTP configuration |
| `VITE_API_BASE_URL` | Frontend API base URL |
| `VITE_USE_MOCK` | Enables or disables frontend mock mode |

**Important configuration notes**

- Keep real API keys, OAuth secrets, SMTP passwords, database credentials, and JWT secrets out of source control.
- Use long, unique, randomly generated secrets in non-development environments.
- Configure OAuth redirect URIs to exactly match the provider console.
- The Docker Compose configuration requires `AI_SERVICE_KEY`.
- Frontend variables prefixed with `VITE_` are exposed to the browser bundle. Never put private credentials in frontend environment variables.
- Use `VITE_USE_MOCK=false` for backend-connected operation.

## 16. Docker Setup

The root `docker-compose.yml` defines the main services:

| Service | Role |
|---|---|
| `mongodb` | MongoDB database with persistent storage and health check |
| `backend` | Express API server |
| `frontend` | Built React application served by its container |
| `ai-service` | Resume processing and AI matching service |

Create the root `.env` and set the required `AI_SERVICE_KEY` and other environment-specific secrets, then run:

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

To stop the services and remove the named database/upload volumes (this deletes persisted local container data):

```bash
docker compose down -v
```

Do not use the volume-removal command if you need to preserve local MongoDB or uploaded-resume data.

## 17. Testing and Verification

### Backend

From the `backend/` directory:

```bash
npm run test:unit
npm test
npm run test:e2e
npm run test:all
npm run build
```

### Frontend browser tests

From the `frontend/` directory:

```bash
npx playwright install chromium
npm run test:browser
npm run build
npm run lint
```

### AI service tests

From the `ai-service/` directory, phase-based scripts are available:

```bash
npm run test:phase1
npm run test:phase2
npm run test:phase3
npm run test:phase4
npm run test:phase5
npm run test:phase6
npm run test:phase7
npm run test:phase8
```

Offline variants are also provided for phases that support them (for example, `npm run test:phase2:offline`). Review each script and its environment requirements before running it.

### Recorded full-stack verification

The repository's [Full-Stack Test Report](docs/FULL_STACK_TEST_REPORT.md) records a verification run dated November 24, 2026, with **113 tests reported passing**: 104 backend integration/workflow tests and 9 Playwright browser suites. Treat this as the result of that recorded run, not as a guarantee that every future commit or deployment has passed the same tests. Re-run the relevant suites after code or environment changes.

## 18. API and Technical Documentation

- [System Architecture](docs/architecture.md)
- [Full-Stack Test Report](docs/FULL_STACK_TEST_REPORT.md)
- [Presentation Notes](docs/PRESENTATION.md)
- [AI Service API Notes](ai-service/API.md)

The backend API is mounted under `/api/v1`. A health endpoint is available at `/health`. API documentation assets are served by the backend under `/api/docs` when included in the deployment.

## 19. Known Limitations and Future Scope

The following areas should be validated against deployment requirements before treating the project as a production hiring platform:

- **Production hosting and operations:** The repository includes Docker orchestration, but production cloud deployment, monitoring, backups, and disaster recovery require environment-specific setup.
- **Email delivery:** SMTP-related configuration exists, but reliable production delivery, provider setup, bounce handling, and email verification operations must be configured and verified.
- **Resume object storage:** The documented application uses backend-managed upload storage; managed object storage and lifecycle policies can be added for production scale.
- **OCR:** Scanned image-only resumes are not supported by the current text-extraction path.
- **Live video interviews:** Interview scheduling and meeting information are supported; a native embedded WebRTC video experience is not part of the current documented scope.
- **Billing:** Subscription and payment-gateway functionality is not part of the current documented scope.
- **Production AI governance:** Fairness metrics and evaluation utilities support testing and monitoring, but require representative datasets, periodic review, documented thresholds, and human governance to support responsible deployment.
- **Provider availability:** AI extraction and semantic functionality depend on configured providers, credentials, model availability, and service health. Verify the fallback behavior in the target environment.

---

## Responsible Use

HireSmart AI is intended to assist recruitment workflows, not to replace professional judgment. AI scores can be incomplete, affected by resume quality, or unsuitable for a particular role. Recruiters should review source evidence, consider relevant context, provide appropriate human oversight, and avoid using automated scores as the sole basis for employment decisions.
