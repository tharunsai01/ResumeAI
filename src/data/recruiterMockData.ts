import type { JobStatus, JobType, WorkMode, RecruiterJob } from "../types/job"
import type { 
  AppStatus, 
  AIScreeningStatus, 
  CandidateExperience, 
  CandidateEducation, 
  CandidateProject, 
  RecruiterCandidate 
} from "../types/recruiter"

export type { 
  JobStatus, 
  JobType, 
  WorkMode, 
  RecruiterJob,
  AppStatus, 
  AIScreeningStatus, 
  CandidateExperience, 
  CandidateEducation, 
  CandidateProject, 
  RecruiterCandidate 
}

export const initialRecruiterJobs: RecruiterJob[] = [
  {
    id: "job_101",
    title: "Software Engineer",
    company: "HireSmart Technologies",
    location: "Bangalore",
    workMode: "Hybrid",
    jobType: "Full-time",
    experience: "2–4 years",
    salary: "₹12 LPA – ₹18 LPA",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    description: "We are looking for a skilled Software Engineer to build robust web applications and lead our core frontend development...",
    status: "Active",
    applications: 42,
    postedDate: "2 days ago"
  },
  {
    id: "job_102",
    title: "AI Engineer",
    company: "HireSmart Technologies",
    location: "Hyderabad",
    workMode: "On-site",
    jobType: "Full-time",
    experience: "3–5 years",
    salary: "₹18 LPA – ₹30 LPA",
    skills: ["Python", "TensorFlow", "NLP", "Machine Learning"],
    description: "Join our AI lab to train and deploy advanced machine learning models for document parsing and matching algorithms...",
    status: "Active",
    applications: 18,
    postedDate: "3 days ago"
  },
  {
    id: "job_103",
    title: "Frontend Developer",
    company: "HireSmart Technologies",
    location: "Remote",
    workMode: "Remote",
    jobType: "Full-time",
    experience: "1–3 years",
    salary: "₹8 LPA – ₹14 LPA",
    skills: ["React", "Tailwind CSS", "Redux", "Framer Motion"],
    description: "Looking for a creative frontend developer to build stunning and responsive user interfaces...",
    status: "Active",
    applications: 31,
    postedDate: "1 week ago"
  },
  {
    id: "job_104",
    title: "Backend Developer",
    company: "HireSmart Technologies",
    location: "Pune",
    workMode: "Hybrid",
    jobType: "Full-time",
    experience: "2–5 years",
    salary: "Salary not disclosed",
    skills: ["Go", "PostgreSQL", "Docker", "Kubernetes"],
    description: "Draft job posting for a backend developer role focused on scalable microservices architecture...",
    status: "Draft",
    applications: 0,
    postedDate: "Just now"
  },
  {
    id: "job_105",
    title: "Product Designer",
    company: "HireSmart Technologies",
    location: "Remote",
    workMode: "Remote",
    jobType: "Contract",
    experience: "3–5 years",
    salary: "₹15 LPA – ₹20 LPA",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    description: "Closed position. Was looking for a product designer to revamp our candidate portal...",
    status: "Closed",
    applications: 112,
    postedDate: "1 month ago"
  }
]

export const initialRecruiterCandidates: RecruiterCandidate[] = [
  {
    id: "cand_1",
    name: "Rahul Sharma",
    title: "Software Engineer",
    location: "Bangalore",
    email: "rahul.s@example.com",
    experience: "2 years",
    skills: [
      { name: "React", proficiency: "Strong" },
      { name: "Node.js", proficiency: "Strong" },
      { name: "MongoDB", proficiency: "Intermediate" },
      { name: "TypeScript", proficiency: "Intermediate" }
    ],
    education: [
      { degree: "B.Tech Computer Science", institution: "ABC University", year: "2022" }
    ],
    projects: [
      { title: "AI Resume Screening System", technologies: ["React", "Node.js", "MongoDB"], description: "Built a full-stack ATS portal..." }
    ],
    matchScore: 92,
    status: "Shortlisted",
    appliedRole: "Software Engineer",
    appliedDate: "Today",
    screeningStatus: "Strong Match",
    applicationHistory: [
      { role: "Software Engineer", date: "Sep 18, 2026", status: "Shortlisted" }
    ]
  },
  {
    id: "cand_2",
    name: "Ananya Patel",
    title: "AI Engineer",
    location: "Hyderabad",
    email: "ananya.p@example.com",
    experience: "3 years",
    skills: [
      { name: "Python", proficiency: "Strong" },
      { name: "Machine Learning", proficiency: "Strong" },
      { name: "TensorFlow", proficiency: "Intermediate" }
    ],
    education: [
      { degree: "M.Tech Artificial Intelligence", institution: "IIT Hyderabad", year: "2021" }
    ],
    projects: [
      { title: "Document Parser AI", technologies: ["Python", "TensorFlow"], description: "Automated document text extraction..." }
    ],
    matchScore: 88,
    status: "Screening",
    appliedRole: "AI Engineer",
    appliedDate: "Yesterday",
    screeningStatus: "Screened",
    applicationHistory: [
      { role: "AI Engineer", date: "Sep 17, 2026", status: "Screening" }
    ]
  },
  {
    id: "cand_3",
    name: "Arjun Kumar",
    title: "Backend Developer",
    location: "Pune",
    email: "arjun.k@example.com",
    experience: "4 years",
    skills: [
      { name: "Node.js", proficiency: "Strong" },
      { name: "AWS", proficiency: "Strong" },
      { name: "PostgreSQL", proficiency: "Strong" },
      { name: "Docker", proficiency: "Intermediate" }
    ],
    education: [
      { degree: "B.E. Computer Engineering", institution: "Pune University", year: "2020" }
    ],
    projects: [
      { title: "Microservices Architecture Setup", technologies: ["Node.js", "Docker", "AWS"], description: "Migrated monolith to microservices..." }
    ],
    matchScore: 84,
    status: "Applied",
    appliedRole: "Backend Developer",
    appliedDate: "2 days ago",
    screeningStatus: "Not Screened",
    applicationHistory: [
      { role: "Backend Developer", date: "Sep 16, 2026", status: "Applied" },
      { role: "Software Engineer", date: "Aug 10, 2025", status: "Rejected" }
    ]
  },
  {
    id: "cand_4",
    name: "Priya Desai",
    title: "Frontend Developer",
    location: "Remote",
    email: "priya.d@example.com",
    experience: "1 year",
    skills: [
      { name: "React", proficiency: "Intermediate" },
      { name: "Tailwind CSS", proficiency: "Strong" },
      { name: "Framer Motion", proficiency: "Basic" }
    ],
    education: [
      { degree: "B.Sc. Information Technology", institution: "Mumbai University", year: "2024" }
    ],
    projects: [
      { title: "Portfolio Website", technologies: ["React", "Framer Motion"], description: "Interactive personal portfolio..." }
    ],
    matchScore: 65,
    status: "Rejected",
    appliedRole: "Frontend Developer",
    appliedDate: "1 week ago",
    screeningStatus: "Low Match",
    applicationHistory: [
      { role: "Frontend Developer", date: "Sep 10, 2026", status: "Rejected" }
    ]
  },
  {
    id: "cand_5",
    name: "Priya Singh",
    title: "AI Engineer",
    location: "Mumbai",
    email: "priya.s@example.com",
    experience: "3 years",
    skills: [
      { name: "Python", proficiency: "Strong" },
      { name: "Machine Learning", proficiency: "Strong" },
      { name: "TensorFlow", proficiency: "Strong" }
    ],
    education: [
      { degree: "B.Tech Computer Science", institution: "IIT Bombay", year: "2021" }
    ],
    projects: [
      { title: "NLP Document Classifier", technologies: ["Python", "TensorFlow"], description: "Built scalable NLP models..." }
    ],
    matchScore: 93,
    status: "Interview",
    appliedRole: "AI Engineer",
    appliedDate: "3 days ago",
    screeningStatus: "Strong Match",
    applicationHistory: [
      { role: "AI Engineer", date: "Sep 15, 2026", status: "Interview" }
    ]
  },
  {
    id: "cand_7",
    name: "Neha Gupta",
    title: "Software Engineer",
    location: "Delhi",
    email: "neha.g@example.com",
    experience: "4 years",
    skills: [
      { name: "Node.js", proficiency: "Strong" },
      { name: "MongoDB", proficiency: "Strong" },
      { name: "TypeScript", proficiency: "Strong" }
    ],
    education: [
      { degree: "B.Tech Information Technology", institution: "Delhi Technological University", year: "2020" }
    ],
    projects: [
      { title: "High-throughput API Gateway", technologies: ["Node.js", "TypeScript"], description: "Microservices gateway handling 50k req/sec..." }
    ],
    matchScore: 88,
    status: "Shortlisted",
    appliedRole: "Software Engineer",
    appliedDate: "4 days ago",
    screeningStatus: "Strong Match",
    applicationHistory: [
      { role: "Software Engineer", date: "Sep 14, 2026", status: "Shortlisted" }
    ]
  }
]
