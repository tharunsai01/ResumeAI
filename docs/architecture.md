# HireSmart AI — System Architecture

## 1. Overview
HireSmart AI is organized around two clean, decoupled application tiers:
- **`frontend/`**: Single-Page Application (SPA) built with React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide React.
- **`backend/`**: RESTful API server built with Node.js, Express, TypeScript, Mongoose (MongoDB), and an embedded AI screening engine.

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|   React 19 + TypeScript + Vite + Tailwind CSS + Lucide     |
+-------------------------------------------------------------+
                              |
                     HTTP / JSON REST API
                              |
                              v
+-------------------------------------------------------------+
|                    Express Backend (Port 5000)              |
|  - Middleware (Auth, RBAC, Validation, Helmet, RateLimit)   |
|  - Controllers & Services (Candidate, Recruiter, Admin)     |
|  - Resume Parser & Antivirus Magic Bytes Checker            |
|  - Embedded Multi-Tier AI Matching Engine                   |
+-------------------------------------------------------------+
            |                                    |
            v                                    v
+-----------------------+              +----------------------+
| MongoDB (Port 27017)  |              | Direct AI Providers  |
| - Users & Profiles    |              | - Groq API           |
| - Resumes & Jobs      |              |   (gpt-oss-20b)      |
| - Applications        |              | - Gemini Flash       |
| - Audit Logs & Skills |              | - 50/20/10/20 Engine |
+-----------------------+              +----------------------+
```

## 2. Decoupled Communication
- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer token in the `Authorization: Bearer <token>` header for stateless API calls, paired with an HTTP-only secure cookie for refresh tokens.
- **Dual Mode Operation**:
  - `VITE_USE_MOCK=false`: Client makes real asynchronous HTTP calls to the backend via `httpClient`.
  - `VITE_USE_MOCK=true`: Frontend gracefully operates offline using localStorage and rich mock dataset fixtures without making network requests.

## 3. Embedded AI Engine
The AI candidate evaluation pipeline operates entirely on the server side:
1. **Resume Processing**: Validates file magic bytes (`%PDF` / `PK\x03\x04`), enforces a 10MB limit, hashes with SHA-256 for duplicate detection, scans for prompt-injection overrides, and extracts candidate skills and experience.
2. **Scoring Breakdown**: Calibrated formula allocating:
   - 50% Required & Nice-to-Have Skills
   - 20% Experience Level & Seniority
   - 10% Education Qualifications
   - 20% Role Title & Industry Keyword Similarity
3. **Decision Support**: Human recruiters retain ultimate authority to advance, shortlist, interview, or reject candidates.
