# HireSmart AI

### AI-Based Resume Screening & Job Matching System

---

## 1. Project Idea

HireSmart AI is an AI-based recruitment platform designed to connect candidates with suitable job opportunities and help recruiters identify relevant candidates more efficiently.

The platform serves two main users:

**1. Candidate** — Candidates can create a professional profile, upload their resume, discover suitable jobs, receive AI-based job recommendations, apply for jobs, and track their applications.

**2. Recruiter** — Recruiters can create job postings, receive applications, analyze candidate resumes, compare candidate skills with job requirements, generate AI-assisted match scores, shortlist candidates, schedule and manage interviews, and monitor recruitment activity through analytics.

The main goal of HireSmart AI is to reduce the time and effort required for job searching and candidate screening by using AI-assisted resume analysis and job matching.

> **Important:** The AI assists recruiters and candidates throughout the process. It does not independently make final hiring decisions. The recruiter always retains full control over hiring outcomes.

---

## 2. How the Project Works

### Candidate Process

```
Candidate visits HireSmart AI
        ↓
Candidate Registration / Login
        ↓
Candidate Profile
        ↓
Upload Resume
        ↓
Resume Analysis
        ↓
Skills & Experience Extraction
        ↓
Find Jobs
        ↓
AI-Based Job Matching
        ↓
Recommended Jobs
        ↓
Apply for Job
        ↓
Track Application
        ↓
Interview
        ↓
Final Hiring Decision
```

### Recruiter Process

```
Recruiter Registration / Login
        ↓
Recruiter / Company Profile
        ↓
Create Job
        ↓
Receive Applications
        ↓
Resume Analysis
        ↓
Skill Extraction
        ↓
Compare Resume with Job Requirements
        ↓
Generate Match Score
        ↓
Rank Candidates
        ↓
Shortlist Candidates
        ↓
Interview
        ↓
Hiring Decision
```

### AI Screening Process

```
Applications
        ↓
Resume Analysis
        ↓
Skill Extraction
        ↓
Experience & Education Analysis
        ↓
Job Requirement Analysis
        ↓
Candidate–Job Matching
        ↓
Match Score
        ↓
Candidate Ranking
        ↓
Recruiter Review
        ↓
Shortlisting / Rejection
```

A configurable screening threshold (such as 80%) may be used to highlight stronger matches for recruiter review.

> **Important:** An 80%+ match does not automatically mean the candidate is hired. The score is only an AI-assisted recommendation. The recruiter makes the final decision.

---

## 3. What We Have Done So Far

Development is being done **frontend first**. The complete candidate and recruiter user interfaces are being built before implementing the backend, database, authentication, and AI pipeline.

### Project Foundation

- React + Vite frontend structure
- Main routing and navigation structure
- HireSmart AI branding
- Common UI components (buttons, cards, inputs, badges, modals)
- Responsive dashboard layout
- Sidebar navigation
- Header and navigation components

### Landing Page

- HireSmart AI landing page with project introduction
- Features section
- How It Works section (Candidate and Recruiter flows)
- Candidate section
- Recruiter section
- Sign In and Get Started buttons
- Navigation buttons linking to all sections
- AI Matching demonstration section
- Trust and Responsibility section
- Final call-to-action section
- Footer with product, support, and legal links

### Authentication UI

Frontend interfaces have been created for:

- Candidate Sign Up
- Candidate Login
- Recruiter Login
- Recruiter Registration
- Email-based authentication UI
- Google Sign-In UI

> **Note:** The Google authentication interface exists on the frontend, but the real Google OAuth and backend integration will be implemented in a later phase.

---

## 4. Candidate Dashboard

The Candidate Dashboard frontend has been completed.

### Navigation

- Dashboard
- My Resume
- Find Jobs
- Recommended
- Applications
- Skill Analysis
- Profile
- Settings

### Candidate Features

| Page | Description |
|---|---|
| **Dashboard** | Candidate overview showing activity, stats, and quick actions |
| **My Resume** | Resume upload interface with supported format information and analysis status |
| **Find Jobs** | Job discovery interface with search, filters, and sorting |
| **Recommended** | Recommended jobs interface designed for future AI-based recommendations |
| **Applications** | Application tracking interface with status updates |
| **Skill Analysis** | Candidate skills and analysis interface designed for future AI-generated insights |
| **Profile** | Candidate professional profile management |
| **Settings** | Candidate account and preference settings |

---

## 5. Help & Support

Both the Candidate and Recruiter Dashboards include a Help & Support section:

- **Help Center**
- **Report a Complaint**
- **More**
  - Safety Tips
  - Terms & Conditions
  - Privacy Policy
  - About HireSmart AI

All content has been designed specifically around the HireSmart AI recruitment platform.

### Help Center

Covers topics such as:
- Account & Profile
- Resume Upload
- Finding Jobs
- Applications
- AI Screening
- Skill Analysis
- Technical Issues

### Report a Complaint

Allows users to report recruitment-related or technical issues by selecting a category, describing the issue, attaching supporting files, and submitting the complaint.

### Safety Tips

Provides guidance about:
- Recognizing fake job offers
- Avoiding payment requests from recruiters
- Identifying suspicious recruiters
- Never sharing passwords or OTPs
- Protecting personal information
- Reporting suspicious activity

### Terms & Conditions

Covers account usage, job postings, candidate applications, recruiter responsibilities, AI-assisted screening, prohibited activities, and platform rules — all written specifically for HireSmart AI.

### Privacy Policy

Covers candidate data, recruiter data, resume data, job and application data, AI processing, data security, data retention, and user privacy — designed around HireSmart AI's platform and future AI processing.

---

## 6. Recruiter Dashboard

The Recruiter Dashboard frontend is currently being developed.

### Navigation

- Dashboard
- Jobs
- Candidates
- AI Screening
- Shortlist
- Interviews
- Analytics
- Settings

### Recruiter Features

| Page | Description |
|---|---|
| **Dashboard** | Overview including Active Jobs, Total Candidates, AI Screened, Shortlisted, Interviews, Hired, Candidate Pipeline, AI Screening Overview, Recent Jobs, and Create New Job |
| **Jobs** | Job posting management interface |
| **Candidates** | Applicant viewing and management interface |
| **AI Screening** | Resume screening workflow with candidate ranking, skills score, experience score, education score, overall match score, candidate status, search, filters, sorting, shortlist, and reject actions |
| **Shortlist** | Shortlisted candidate management interface |
| **Interviews** | Interview scheduling and management interface |
| **Analytics** | Recruitment statistics and insights interface |
| **Settings** | Recruiter profile and company details |

---

## 7. Current Development Status

### Completed

- ✅ Project frontend foundation
- ✅ Landing page
- ✅ Candidate authentication UI
- ✅ Recruiter authentication UI
- ✅ Candidate Dashboard frontend
- ✅ Candidate Resume page
- ✅ Candidate Find Jobs page
- ✅ Candidate Recommended page
- ✅ Candidate Applications page
- ✅ Candidate Skill Analysis page
- ✅ Candidate Profile page
- ✅ Candidate Settings page
- ✅ Candidate Help & Support
- ✅ Recruiter Dashboard frontend development started
- ✅ Recruiter AI Screening interface
- ✅ Recruiter navigation and dashboard structure

### In Progress

- 🔄 Completing and polishing Recruiter Dashboard frontend
- 🔄 Frontend navigation and interaction testing
- 🔄 Performance optimization
- 🔄 Responsive design improvements

### Not Implemented Yet

- ⏳ Backend (Node.js + Express.js)
- ⏳ MongoDB database
- ⏳ Real authentication
- ⏳ Google OAuth integration
- ⏳ Resume parsing backend
- ⏳ Real AI resume analysis
- ⏳ Real skill extraction
- ⏳ AI job matching
- ⏳ Real candidate scoring
- ⏳ Backend APIs
- ⏳ Frontend and backend integration

---

## 8. What We Need to Do Next

### Step 1 — Finish Recruiter Dashboard Frontend

Complete and test all Recruiter Dashboard pages:

- Dashboard
- Jobs
- Candidates
- AI Screening
- Shortlist
- Interviews
- Analytics
- Settings
- Help Center
- Report a Complaint
- Safety Tips
- Terms & Conditions
- Privacy Policy
- About HireSmart AI

Make sure every sidebar button and page works correctly.

### Step 2 — Frontend Testing & Performance

Before starting backend development:

- Fix any broken routes
- Fix any empty or incomplete pages
- Make every button functional
- Improve loading speed
- Add smooth page transitions
- Add fast button reactions
- Optimize unnecessary re-renders
- Improve responsive design across devices
- Ensure Candidate and Recruiter dashboards work consistently

**Main goal: Fast + Smooth + Responsive + Premium UI**

### Step 3 — Backend Development

Build the backend using **Node.js** and **Express.js** with REST APIs.

Create APIs for:
- Users
- Candidates
- Recruiters
- Jobs
- Applications
- Resumes
- Shortlists
- Interviews
- Notifications

### Step 4 — Database

Use **MongoDB** with **Mongoose** to store:

- Candidate profiles
- Recruiter profiles
- Company details
- Resumes
- Jobs
- Applications
- Skills
- Match results
- Shortlisted candidates
- Interviews

### Step 5 — Authentication

Implement real authentication:

- Email registration and login
- Password hashing
- Password reset
- Google OAuth
- Candidate and Recruiter roles
- Protected routes
- Session and token management

### Step 6 — AI Resume Screening

Implement the AI screening pipeline:

```
Resume Upload
    → Resume Text Extraction
    → Resume Parsing
    → Skill Extraction
    → Experience Extraction
    → Education Extraction
    → Job Requirement Extraction
    → Candidate–Job Matching
    → Match Score
    → Candidate Ranking
```

### Step 7 — AI Job Recommendations

Use candidate profile and resume information to recommend relevant jobs based on:

- Skills
- Experience
- Education
- Job requirements
- Role relevance

### Step 8 — Complete Integration

Connect all layers of the system:

```
Frontend  ↔  Backend APIs  ↔  MongoDB  ↔  AI Processing
```

Make the entire candidate and recruiter workflow fully functional end-to-end.

### Step 9 — Testing & Deployment

Perform comprehensive testing:

- Functional testing
- Authentication testing
- API testing
- Database testing
- AI testing
- Security testing
- Performance testing
- Responsive testing

Then deploy the application to production.

---

## 9. Technology Stack

### Frontend (Current)

- React
- Vite
- TypeScript
- HTML / CSS
- Tailwind CSS
- React Router
- Framer Motion (Animations)
- Lucide React (Icons)
- Recharts (Charts)

### Planned Backend

- Node.js
- Express.js
- REST APIs

### Planned Database

- MongoDB
- Mongoose

### Planned AI

- Resume text extraction and parsing
- Skill extraction
- Experience and education extraction
- Job requirement extraction
- Candidate–job matching
- Match scoring
- Candidate ranking

---

## 10. Project Structure

```text
src/
├── assets/          # Static assets
├── components/      # Reusable UI components (buttons, cards, inputs, modals, layout)
├── context/         # React Context providers (AuthContext)
├── data/            # Mock data used during the frontend phase
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers (animations, class merging)
├── pages/           # Page views (Landing, Candidate pages, Recruiter pages)
├── services/        # Frontend service layer (auth, jobs, applications, etc.)
├── App.tsx          # Main application component and routing
├── index.css        # Global CSS and design system
└── main.tsx         # Application entry point
```

---

## 11. Final Project Goal

The final goal of HireSmart AI is to create a complete recruitment platform where candidates can discover suitable jobs and recruiters can efficiently identify relevant candidates using AI-assisted resume screening and job matching.

The project is being developed in stages:

```
FRONTEND
    ↓
BACKEND
    ↓
DATABASE
    ↓
AUTHENTICATION
    ↓
AI
    ↓
INTEGRATION
    ↓
TESTING
    ↓
DEPLOYMENT
```

---
