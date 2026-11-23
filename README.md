# HireSmart AI — AI-Based Resume Screening and Job Matching System

HireSmart AI is an intelligent recruitment and job matching platform that bridges the gap between candidates and recruiters. It features automated resume parsing, prompt-injection security scanning, multi-tier AI candidate screening using a calibrated 50/20/10/20 weighted matching formula, and role-based workflows for Candidates, Recruiters, and Administrators.

---

## 1. Project Organization

The repository is cleanly structured around two main parts:

```text
ResumeAI/
│
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── assets/               # Branding, logos, and illustrations
│   │   ├── components/           # Reusable UI components & dialogs
│   │   ├── pages/                # Candidate, Recruiter, Admin, and Public views
│   │   ├── context/              # Auth & session context providers
│   │   ├── contexts/             # Admin domain context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API client services with live & mock support
│   │   ├── types/                # TypeScript interfaces & domain types
│   │   ├── data/                 # Mock datasets for offline mock mode
│   │   ├── config/               # Client environment configuration
│   │   ├── App.tsx               # Main routing & application layout
│   │   └── main.tsx              # React application entry point
│   ├── Dockerfile                # Nginx production container
│   ├── package.json              # Frontend scripts & dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite bundler configuration
│
├── backend/                      # Node.js + Express + TypeScript + MongoDB
│   ├── src/
│   │   ├── config/               # Database connection (db.ts) & env variables (env.ts)
│   │   ├── constants/            # Enums & system constants
│   │   ├── controllers/          # Route controllers (Auth, Candidate, Recruiter, Admin, etc.)
│   │   ├── middleware/           # JWT auth, RBAC authorization, validation, error handler
│   │   ├── models/               # Mongoose schemas (User, Resume, Job, Application, etc.)
│   │   ├── routes/               # Express REST API routes mounted at /api/v1
│   │   ├── seed/                 # Database seeding script with realistic data
│   │   ├── services/             # Business logic, audit logging, & AI engine
│   │   │   └── ai/               # In-backend AI engine (Groq, Gemini, 50/20/10/20 matcher)
│   │   ├── utils/                # ApiError, ApiResponse, magic-bytes file validator
│   │   ├── validators/           # Zod request payload schemas
│   │   ├── app.ts                # Express app configuration & middleware pipeline
│   │   └── server.ts             # Server entry point
│   ├── tests/                    # Automated integration test suite
│   ├── uploads/                  # Local resume storage directory
│   ├── Dockerfile                # Multi-stage production container
│   ├── package.json              # Backend scripts & dependencies
│   └── tsconfig.json             # TypeScript server configuration
│
├── docs/                         # Architecture, API specifications, and algorithms
│   ├── architecture.md           # System design and component interactions
│   ├── api.md                    # Complete REST API reference
│   └── ...
│
├── .gitignore                    # Git ignore rules for node_modules, dist, .env, uploads
├── .env.example                  # Global environment variables template
├── docker-compose.yml            # Multi-container orchestration (MongoDB + Backend + Frontend)
└── README.md                     # This file
```

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS
- **Icons & Motion**: Lucide React & Framer Motion
- **Charts**: Recharts
- **Routing**: React Router DOM 7
- **Linter**: Oxlint

### Backend
- **Runtime**: Node.js v20+ / v24
- **Framework**: Express 5 (TypeScript)
- **Database**: MongoDB 7 with Mongoose 9 ODM
- **Authentication**: JWT (Access Tokens + HTTP-only Refresh Cookie) & bcryptjs
- **Validation**: Zod schema validation
- **File Handling**: Multer with magic-bytes buffer inspection (`%PDF` / `PK\x03\x04`)
- **AI Matching**: Server-side Composite AI provider (Groq `openai/gpt-oss-20b`, Google Gemini, and deterministic calibrated 50/20/10/20 rule engine)

---

## 3. How Frontend and Backend Communicate

1. **API Gateway**: The Express backend serves REST endpoints under `/api/v1` and health status at `/health`.
2. **Stateless JWT**: When a user registers or logs in via `/api/v1/auth/login`, the backend issues a signed JWT access token in the JSON body and sets an HTTP-only refresh cookie.
3. **HTTP Client**: The frontend `httpClient` automatically attaches `Authorization: Bearer <token>` to requests and handles seamless token refresh.
4. **Dual Mode Flexibility**:
   - **Live Backend Mode (`VITE_USE_MOCK=false`)**: Full end-to-end integration with the Express backend and live MongoDB database.
   - **Offline Mock Mode (`VITE_USE_MOCK=true`)**: Operates 100% offline using localStorage and rich mock datasets, perfect for frontend UI development.

---

## 4. Environment Variables Setup

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/hiresmart
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=hiresmart_super_secure_jwt_access_secret_key_2026_at_least_32_chars
JWT_ACCESS_MINUTES=15
JWT_REFRESH_DAYS=7

# Direct AI Provider Credentials (Kept on server side)
GROQ_API_KEY=
GEMINI_API_KEY=
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_USE_MOCK=false
```

---

## 5. Getting Started (Local Development)

### Prerequisites
- Node.js v20+ or v24
- MongoDB running on `127.0.0.1:27017`

### Step 1: Install Dependencies

#### Install Frontend Dependencies:
```bash
cd frontend
npm install
```

#### Install Backend Dependencies:
```bash
cd backend
pnpm install # or npm install
```

### Step 2: Seed the Database
Populate the database with realistic test candidates, recruiters, jobs, skills, applications, and evaluations:
```bash
cd backend
npm run seed
```

### Step 3: Run the Backend Server
```bash
cd backend
npm run dev
```
The backend starts at `http://localhost:5000`. Test the health endpoint:
```bash
curl http://localhost:5000/health
```

### Step 4: Run the Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 6. Running Tests

### Backend Automated Integration Test Suite
Executes 36 end-to-end integration tests against the live Express server & local MongoDB:
```bash
cd backend
npm test
```
Tests cover:
- System Health & Gateway Diagnostics
- Authentication, Password Hashing & RBAC
- Account Suspension & Security Rejections
- Candidate Profile CRUD & Real Dashboard Metrics
- Resume Upload, Magic Bytes Validation & Prompt Injection Defense
- Recruiter Job Posting, Applicant Tracking & Job Stats
- Job Discovery, Bookmarks & Duplicate Application Prevention
- AI 50/20/10/20 Candidate Screening Calculation
- Interview Scheduling & Notifications
- Admin Analytics, Unknown Skill Approval & Audit Logs

### Frontend Lint & Production Build
```bash
cd frontend
npm run lint    # Runs oxlint
npm run build   # Runs TypeScript check (tsc -b) and Vite production build
```

---

## 7. Running with Docker Compose

To run MongoDB, the Backend, and the Frontend together:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `localhost:27017`

---

## 8. Default Seeded Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@hiresmart.ai` | `admin123` | Full admin analytics, user moderation, audit logs, skill review |
| **Recruiter** | `recruiter@test.com` | `Password123!` | Job postings, applicant screening, interview scheduling |
| **Candidate (Senior)** | `alice@test.com` | `Password123!` | Senior Full Stack Engineer (React, TypeScript, Node, Docker) |
| **Candidate (Junior)** | `bob@test.com` | `Password123!` | Junior Frontend Developer |
