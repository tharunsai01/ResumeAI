# HireSmart AI

### AI-Based Resume Screening & Job Matching System

> An AI-assisted recruitment platform that helps candidates discover relevant opportunities and enables recruiters to screen and match candidates using explainable AI.

---

## 📌 Overview

**HireSmart AI** is a role-based recruitment platform designed to simplify the hiring process through AI-assisted resume analysis, job matching, candidate screening, and responsible AI practices.

The platform provides dedicated experiences for:

* 👤 **Candidate** — Resume management, job discovery, recommendations, applications, and skill analysis.
* 🏢 **Recruiter** — Job management, candidate screening, AI matching, shortlisting, interviews, and analytics.
* 🛡️ **Administrator** — User management, complaints, skill taxonomy, audit logs, AI evaluation, and system health.

The system is designed around a **human-in-the-loop approach**, where AI provides recommendations and explanations while the recruiter remains responsible for the final hiring decision.

---

# ✨ Key Features

## 👤 Candidate Portal

### Dashboard

* Profile strength
* Jobs applied
* Shortlisted applications
* Interviews
* Offers
* Recommended jobs
* Top job matches
* Resume analysis overview

### 📄 Resume Management

* Resume upload
* PDF/DOCX support
* Resume analysis
* Skill extraction
* Education and experience analysis
* Resume processing status
* Resume security checks

### 🔎 Job Discovery

* Search jobs
* Filter jobs
* View job details
* Apply for jobs
* Save jobs
* Recommended jobs

### 🤖 AI-Assisted Job Matching

Provides an explainable matching breakdown:

* Overall match score
* Skills score
* Experience score
* Education score
* Semantic similarity score
* Matched skills
* Missing skills

### 📊 Skill Gap Analysis

Helps candidates identify:

* Required skills
* Preferred skills
* Missing skills
* Areas for improvement

### 📋 Application Tracking

* View applications
* Track application status
* View application details
* Monitor recruiter actions

### ⚙️ Profile & Settings

* Candidate profile
* Account settings
* Privacy settings
* AI-related preferences

---

# 🏢 Recruiter Portal

## 📊 Recruiter Dashboard

Provides an overview of:

* Active jobs
* Total candidates
* AI-screened candidates
* Shortlisted candidates
* Interviews
* Hired candidates
* Candidate pipeline
* AI screening overview
* Average matching score
* Recent jobs

---

## 💼 Job Management

Recruiters can:

* Create jobs
* Edit jobs
* View jobs
* Close jobs
* Manage job requirements

Job information includes:

* Job title
* Company
* Description
* Required skills
* Experience
* Education
* Location
* Work mode
* Employment type
* Salary
* Status

---

## 🤖 AI Candidate Screening

The screening workflow is designed as:

```text
Applications
      ↓
Resume Analysis
      ↓
Skill Extraction
      ↓
Requirement Matching
      ↓
Candidate Scoring
      ↓
Candidate Ranking
      ↓
Recruiter Review
```

### AI Matching Components

The matching system considers four major components:

| Component           | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| Skills              | Compare candidate skills with job requirements       |
| Experience          | Compare relevant experience                          |
| Education           | Compare educational requirements                     |
| Semantic Similarity | Measure semantic relationship between resume and job |

The recruiter can configure the weighting of these components.

### Screening Threshold

A default screening threshold of **80%** is used in the current design and can be configured.

> AI recommendations do not automatically hire, reject, or make the final recruitment decision.

---

# 🔍 Explainable AI Matching

HireSmart AI does not rely only on a single matching score.

Example:

```text
Overall Match           86%

Skills                  90%
Experience              85%
Education               80%
Semantic Similarity     88%

Matched Skills
✓ Python
✓ React
✓ MongoDB
✓ REST API

Missing Skills
• Docker
• Kubernetes
```

This allows recruiters to understand **why** a candidate received a particular matching result.

---

# 👁️ Blind Screening

Recruiters can use **Blind Screening** to hide selected identity-related information during the initial screening process.

The purpose is to reduce the influence of unnecessary identity-related information during candidate evaluation.

> Blind screening is intended as a bias-reduction measure and does not claim to eliminate bias completely.

---

# 🛡️ Resume Security & Prompt Injection Protection

Resume content is treated as **untrusted input**.

The designed security workflow is:

```text
Resume Upload
      ↓
Resume Parsing
      ↓
Security Check
      ↓
Suspicious Instruction Detection
      ↓
Content Isolation
      ↓
Structured AI Processing
      ↓
Schema Validation
      ↓
AI Result
```

The system is designed to prevent instruction-like content inside resumes from being treated as trusted AI instructions.

Structured AI output is used to make AI processing more predictable and controllable.

---

# ⚖️ Responsible AI

HireSmart AI includes responsible-AI concepts for evaluating and monitoring AI-assisted recruitment.

## AI Evaluation

The system considers:

* Skill extraction accuracy
* Score stability
* Fairness evaluation
* Blind screening evaluation
* Resume security
* Prompt injection detection
* Model information
* Evaluation history

## Fairness Evaluation

The system can compare equivalent resumes while changing identity-related information and examine whether the resulting scores differ.

The purpose is to identify potential differences in system behavior rather than claim that the system is completely bias-free.

---

# 📋 Audit Logging

The platform includes an audit-log design for tracking important platform and AI-related actions.

Audit information can include:

* Event type
* Actor
* Actor role
* Timestamp
* Severity
* AI score
* Model version
* Job ID
* Resume ID
* Recruiter actions
* AI configuration changes
* Blind screening usage

Auditability helps provide traceability for important system activities.

---

# 🛡️ Administrator Portal

The Admin portal provides platform-level management and monitoring.

## 📊 Admin Dashboard

Includes:

* Total users
* Active users
* Active jobs
* Open complaints
* Resumes processed
* AI evaluation status
* Platform activity
* Complaint overview
* Responsible-AI overview
* Recent audit activity
* System health
* Skill taxonomy overview

---

## 👥 User Management

Administrators can manage:

* Candidates
* Recruiters
* Administrators
* Account status
* Verification status

Features include:

* Search
* Filtering
* User details
* Suspend/reactivate
* Pagination
* CSV export
* User activity

---

## 📝 Complaint Management

Complaint categories include:

* Account
* Resume
* AI & Matching
* Job/Recruiter
* Technical
* Privacy & Security
* Other

### Status

```text
Open
In Review
Resolved
Closed
```

### Priority

```text
Low
Medium
High
Critical
```

Resolution notes are required when resolving complaints.

---

## 🧠 Skill Taxonomy

Administrators can manage the platform's skill taxonomy.

Features include:

* Skill search
* Category filtering
* Active/inactive skills
* Add skill
* Edit skill
* Activate/deactivate skill
* Category management
* Duplicate protection
* Usage information
* Taxonomy activity

The taxonomy is intended to support resume processing, job matching, skill-gap analysis, and AI screening.

---

## 📊 AI Evaluation & Fairness

The Admin portal provides a dedicated AI evaluation area containing:

* Skill extraction accuracy
* Score stability
* Fairness testing
* Blind screening evaluation
* Resume security evaluation
* Prompt injection monitoring
* Model information
* Evaluation history

---

## ❤️ System Health

System health monitoring covers:

* Application
* API
* Database
* Authentication
* Resume Processing
* AI Processing
* File Storage
* System Resources

Health information includes:

* Service status
* Response time
* Last checked time
* Health history
* Recent system events

---

# 🎨 UI/UX

The platform uses a modern, premium dashboard-oriented interface.

### UI Features

* Responsive layouts
* Reusable components
* Premium dashboard design
* Smooth page transitions
* Card animations
* Hover effects
* Micro-interactions
* Responsive tables
* Drawers
* Modals
* Toast notifications
* Loading states
* Empty states
* Error states
* Role-based navigation

### Responsive Design

The interface is designed for:

```text
320px
375px
430px
768px
1024px
1280px
1440px
```

Animations are designed to remain smooth without unnecessary artificial loading delays.

The interface also considers reduced-motion preferences.

---

# 🏗️ Project Architecture

```text
frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── ui/
│   │
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── candidate/
│   │   └── recruiter/
│   │
│   ├── services/
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

# 👥 User Roles

| Role              | Main Responsibilities                                               |
| ----------------- | ------------------------------------------------------------------- |
| **Candidate**     | Resume, jobs, applications, recommendations, skill analysis         |
| **Recruiter**     | Jobs, candidates, AI screening, shortlist, interviews, analytics    |
| **Administrator** | Users, complaints, skills, audit logs, AI evaluation, system health |

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* HTML5
* CSS3
* Component-based UI architecture

### Planned Backend

* Node.js
* Express.js
* MongoDB
* REST APIs

### Planned AI Layer

* Resume parsing
* Skill extraction
* Semantic matching
* Explainable scoring
* Prompt injection protection
* AI evaluation

> The current frontend uses mock/demo data for functionality that has not yet been connected to backend services.

---

# 🔐 Security Considerations

The project incorporates security considerations including:

* Protected routes
* Role-based access
* Authentication architecture
* Resume security
* Prompt injection protection
* Blind screening
* Explainable AI
* Audit logging
* Environment-variable protection
* Privacy-aware candidate information handling

Sensitive environment files are excluded through `.gitignore`.

---

# 📈 Current Development Status

## ✅ Completed

* [x] Candidate Portal
* [x] Recruiter Portal
* [x] Administrator Portal
* [x] Candidate Dashboard
* [x] Recruiter Dashboard
* [x] Admin Dashboard
* [x] Resume Management UI
* [x] Job Management
* [x] Candidate Management
* [x] AI Screening UI
* [x] Explainable Matching
* [x] Skill Gap Analysis
* [x] Shortlist Management
* [x] Interview Management
* [x] Recruiter Analytics
* [x] Admin User Management
* [x] Complaint Management
* [x] Skill Taxonomy
* [x] Audit Logs
* [x] AI Evaluation & Fairness UI
* [x] System Health
* [x] Admin Account Settings
* [x] Blind Screening Concept
* [x] Prompt Injection Protection Concept
* [x] Responsive UI
* [x] Global Animation & Interaction Polish
* [x] Git Configuration

---

# 🚧 Backend & AI Integration

The following work is planned for the next development phase:

* [ ] Backend project setup
* [ ] MongoDB integration
* [ ] Authentication APIs
* [ ] Role-based authorization
* [ ] Candidate APIs
* [ ] Recruiter APIs
* [ ] Admin APIs
* [ ] Resume upload backend
* [ ] Resume parsing
* [ ] Real AI skill extraction
* [ ] Semantic job matching
* [ ] AI scoring engine
* [ ] Prompt injection detection implementation
* [ ] Persistent audit logs
* [ ] Fairness evaluation pipeline
* [ ] Frontend-backend integration
* [ ] Security testing
* [ ] Production deployment

---

# 🔮 Future Enhancements

Potential future improvements include:

* Advanced resume parsing
* Improved semantic matching
* Enhanced candidate insights
* Advanced recruiter recommendations
* AI-assisted skill taxonomy expansion with admin review
* Advanced fairness reports
* Production file storage
* Notification system
* Advanced analytics
* Cloud deployment

---

# 🎯 Project Workflow

The overall recruitment workflow is:

```text
                    HireSmart AI
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      Candidate       Recruiter      Admin
          │              │              │
          ↓              ↓              ↓
       Resume          Jobs          Users
          │          Candidates      Complaints
          ↓              │           Skills
      Job Search         ↓           Audits
          │         AI Screening     AI Eval
          ↓              │           System Health
     Applications        ↓
          │          Match & Rank
          │              │
          └──────→ Recruiter Review
                         │
                         ↓
                 Human Decision
```

---

# 🧠 AI Decision Principle

HireSmart AI follows a **human-in-the-loop recruitment model**:

```text
AI
│
├── Understand Resume
├── Extract Skills
├── Match Job Requirements
├── Calculate Scores
├── Explain Results
└── Recommend Candidates
             │
             ↓
      Recruiter Review
             │
             ↓
      Final Human Decision
```

**AI assists the recruitment process; it does not replace the recruiter's final decision.**

---

## 👨‍💻 Development Note

The project is being developed incrementally, with the frontend, role-based workflows, responsible-AI features, security concepts, and administrative controls implemented before connecting the production backend and AI services.
