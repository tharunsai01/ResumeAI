# HireSmart AI
### AI-Based Resume Screening & Job Matching System

HireSmart AI is an AI-assisted recruitment platform designed to connect candidates and recruiters. The system helps candidates discover jobs, track applications, and analyze their skills, while enabling recruiters to screen resumes efficiently using AI, extract skills, and match candidates against job requirements. 

## Project Status

Frontend: Candidate Dashboard ✅
Frontend: Recruiter Dashboard 🔄
Backend: ⏳ Planned
Database: ⏳ Planned
AI: ⏳ Planned
Authentication Integration: ⏳ Planned

> **Important Note on Development:**
> This project is currently being developed frontend-first. Candidate and Recruiter dashboards are being completed before implementing the backend, database, authentication services, and AI pipeline. Do not assume backend, database, AI models, real authentication, or API integrations are completed yet.

---

## 1. Project Overview

HireSmart AI is a web-based AI-assisted recruitment platform designed to bridge the gap between candidates and recruiters. 

**The system will eventually help candidates:**
- Upload resumes
- Analyze their skills
- Discover relevant jobs
- Receive job recommendations
- Apply for jobs
- Track applications
- Understand their skill profile

**The system will help recruiters:**
- Create and manage jobs
- View candidates
- Screen resumes using AI
- Extract candidate skills
- Match candidates against job requirements
- Generate match scores
- Rank candidates
- Shortlist candidates
- Manage interviews
- Track recruitment analytics

*Note: AI-generated scores are intended to assist recruiters and do not automatically make final hiring decisions.*

---

## 2. Project Workflow

### Candidate Workflow
Register/Login → Create Profile → Upload Resume → Resume Analysis → Skill Extraction → Job Matching → Recommended Jobs → Apply → Track Application → Interview → Hiring

### Recruiter Workflow
Register/Login → Complete Recruiter/Company Profile → Create Job → Receive Applications → Resume Analysis → Skill Extraction → Requirement Matching → Candidate Match Score → Candidate Ranking → Shortlist → Interview → Hiring

---

## 3. Current Development Status

| Module | Status | Details |
|---|---|---|
| Project Foundation | Completed | Initial HireSmart AI frontend structure |
| Landing Page | Completed | Main landing page and navigation |
| Candidate Authentication UI | Completed | Candidate signup/login interface |
| Recruiter Authentication UI | Completed | Recruiter login/registration interface |
| Google Authentication UI | Frontend Ready | Google sign-in interface prepared; real OAuth integration pending |
| Candidate Dashboard | Completed | Main candidate dashboard frontend |
| My Resume | Completed | Resume upload interface |
| Find Jobs | Frontend Completed | Job discovery interface |
| Recommended | Frontend Completed | Recommended jobs interface |
| Applications | Frontend Completed | Application tracking interface |
| Skill Analysis | Frontend Completed | Candidate skill analysis interface |
| Profile | Frontend Completed | Candidate profile interface |
| Candidate Settings | Frontend Completed | Candidate settings interface |
| Candidate Help Center | Completed | Project-specific help content |
| Candidate Complaint | Completed | Complaint/reporting interface |
| Candidate Safety Tips | Completed | Recruitment safety guidance |
| Candidate Terms & Conditions | Completed | HireSmart AI terms interface |
| Candidate Privacy Policy | Completed | Privacy information interface |
| Candidate About | Completed | About HireSmart AI interface |
| Recruiter Dashboard | In Progress | Recruiter dashboard frontend |
| Recruiter Jobs | In Progress/Frontend | Job management interface |
| Recruiter Candidates | In Progress/Frontend | Candidate management interface |
| Recruiter AI Screening | Frontend Completed | AI screening UI and candidate ranking interface |
| Recruiter Shortlist | Frontend | Shortlisting interface |
| Recruiter Interviews | Frontend | Interview management interface |
| Recruiter Analytics | Frontend | Recruitment analytics interface |
| Recruiter Settings | Frontend | Recruiter and company details |
| Backend | Planned | Node.js + Express |
| Database | Planned | MongoDB + Mongoose |
| Real Authentication | Planned | Email + Google OAuth |
| Resume Parsing | Planned | Resume text extraction |
| AI Screening | Planned | AI-based candidate analysis |
| Job Matching | Planned | Candidate-job matching |
| API Integration | Planned | Frontend/backend integration |
| Deployment | Planned | Production deployment |

---

## 4. Candidate Dashboard

The Candidate Dashboard frontend is currently completed and includes the following features:

### Navigation
- Dashboard
- My Resume
- Find Jobs
- Recommended
- Applications
- Skill Analysis
- Profile
- Settings

### Help & Support
- Help Center
- Report a Complaint
- More
  - Safety Tips
  - Terms & Conditions
  - Privacy Policy
  - About HireSmart AI

### Candidate Features
- Dashboard overview
- Resume upload
- Job discovery
- Recommended jobs
- Application tracking
- Skill analysis
- Profile management
- Settings
- Help and support

---

## 5. Recruiter Dashboard

The Recruiter Dashboard frontend is currently being developed with the following structure:

### Navigation
- Dashboard
- Jobs
- Candidates
- AI Screening
- Shortlist
- Interviews
- Analytics
- Settings

### Help & Support
- Help Center
- Report a Complaint
- More
  - Safety Tips
  - Terms & Conditions
  - Privacy Policy
  - About HireSmart AI

### Recruiter Dashboard Overview
- Active Jobs
- Total Candidates
- AI Screened
- Shortlisted
- Interviews
- Hired
- Candidate Pipeline
- AI Screening Overview
- Recent Jobs
- Create New Job

---

## 6. AI Screening Concept

The planned AI screening workflow is designed as follows:

**Applications → Resume Analysis → Skill Extraction → Job Requirement Matching → Candidate Score → Candidate Ranking**

The frontend currently contains the AI Screening interface which visualizes this concept with:
- Candidate ranking
- Skill score
- Experience score
- Education score
- Overall match score
- Candidate status
- Search
- Filters
- Sorting
- Shortlist action
- Reject action

*Note: The real AI calculation will be implemented later in the backend/AI phase. The system may use a configurable matching threshold such as 80% as a screening criterion. However, this 80% threshold does not automatically mean the candidate is hired. The AI should only assist the recruiter, and the final hiring decision remains with the recruiter.*

---

## 7. Help & Support

Help & Support content has been customized specifically for HireSmart AI and includes:

### Help Center
Topics related to: Account & Profile, Resume Upload, Finding Jobs, Recommended Jobs, Applications, AI Screening, Skill Analysis, Technical Issues, and Further Assistance.

### Report a Complaint
Allows users to: Select complaint category, describe the issue, attach supporting files, and submit a complaint.

### Safety Tips
Covers: Avoiding fraudulent job offers, never sharing passwords or OTPs, being careful with financial/payment requests, protecting personal information, reporting suspicious recruiters/jobs, and using secure communication.

### Terms & Conditions
Covers: Account usage, job postings, candidate applications, recruiter responsibilities, AI-assisted screening, prohibited activities, and platform rules.

### Privacy Policy
Covers: Candidate data, recruiter data, resume data, job/application data, AI processing, data security, data retention, and user privacy.

### About HireSmart AI
Explains: Project purpose, candidate experience, recruiter experience, AI-assisted recruitment, and future development.

---

## 8. Performance & UI/UX

Our frontend performance goals are focused on delivering:
**"Fast reactions + smooth navigation + premium UI."**

The website is designed to provide:
- Fast page navigation
- Immediate button feedback
- Smooth transitions
- Lightweight animations
- Responsive design
- No unnecessary loading delays
- Efficient component rendering
- Consistent UI across candidate and recruiter dashboards

*We intentionally avoid excessive animations or heavy visual effects that might slow down the application.*

---

## 9. Technology Stack

### Frontend (Current)
- React
- Vite
- TypeScript
- HTML
- CSS
- React Router
- Lucide React (Icons)
- Framer Motion (Animations)

### Planned Backend
- Node.js
- Express.js

### Planned Database
- MongoDB
- Mongoose

### Planned AI
- Resume parsing
- NLP/LLM-based resume analysis
- Skill extraction
- Job requirement extraction
- Candidate-job matching
- Match scoring
- Candidate ranking

---

## 10. Development Roadmap

### PHASE 1–9: Current frontend development and project UI implementation.

**Stage 1 — Frontend**
- [x] Candidate Dashboard
- [ ] Recruiter Dashboard
- [ ] Frontend testing and optimization

**Stage 2 — Backend**
- [ ] Node.js
- [ ] Express.js
- [ ] REST APIs
- [ ] Authentication APIs
- [ ] Job APIs
- [ ] Application APIs

**Stage 3 — Database**
- [ ] MongoDB
- [ ] User collections
- [ ] Candidate profiles
- [ ] Recruiter profiles
- [ ] Jobs
- [ ] Applications
- [ ] Interviews

**Stage 4 — Authentication**
- [ ] Email authentication
- [ ] Password security
- [ ] Google OAuth
- [ ] Protected routes
- [ ] Role-based access

**Stage 5 — AI**
- [ ] Resume upload processing
- [ ] Resume text extraction
- [ ] Skill extraction
- [ ] Experience extraction
- [ ] Education extraction
- [ ] Job requirement extraction
- [ ] Candidate-job matching
- [ ] Match score
- [ ] Candidate ranking

**Stage 6 — Integration**
- [ ] Connect frontend with backend
- [ ] Connect database
- [ ] Connect AI pipeline
- [ ] Real-time application status
- [ ] Recruiter screening workflow

**Stage 7 — Testing & Deployment**
- [ ] Functional testing
- [ ] UI testing
- [ ] Security testing
- [ ] Performance optimization
- [ ] Deployment

---

## 11. Project Structure

The current frontend is organized as follows:

```text
src/
├── assets/          # Static assets (images, fonts)
├── components/      # Reusable UI components (buttons, inputs, layout, modals, etc.)
├── context/         # React Context providers (AuthContext, etc.)
├── data/            # Mock data used for the frontend phase
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers (animations, cn)
├── pages/           # Page views (Candidate pages, Recruiter pages, Landing page)
├── services/        # Frontend service layer handling logic and state (auth, jobs, etc.)
├── App.tsx          # Main application component and routing
├── index.css        # Global CSS and Tailwind directives
└── main.tsx         # Application entry point
```
