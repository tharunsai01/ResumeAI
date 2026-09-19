import type { AppStatus, AIScreeningStatus } from "./recruiterMockData"

export const AI_SCREENING_THRESHOLD = 80

export interface ScreeningJob {
  id: string
  title: string
  location: string
  applications: number
  screened: number
  strongMatches: number
  pending: number
}

export const screeningJobs: ScreeningJob[] = [
  {
    id: "job_101",
    title: "Software Engineer",
    location: "Bangalore · Hybrid",
    applications: 42,
    screened: 35,
    strongMatches: 12,
    pending: 7
  },
  {
    id: "job_102",
    title: "AI Engineer",
    location: "Hyderabad · On-site",
    applications: 18,
    screened: 18,
    strongMatches: 5,
    pending: 0
  },
  {
    id: "job_103",
    title: "Frontend Developer",
    location: "Remote",
    applications: 31,
    screened: 10,
    strongMatches: 2,
    pending: 21
  }
]

export const jobRequirements = {
  "job_101": {
    title: "Software Engineer",
    requiredSkills: ["React", "Node.js", "MongoDB", "TypeScript"],
    preferredSkills: ["AWS", "Docker", "GraphQL"],
    experience: "2–4 years",
    education: "B.Tech/B.E. in Computer Science or equivalent",
    responsibilities: [
      "Build scalable and responsive web applications.",
      "Design and implement RESTful APIs.",
      "Collaborate with cross-functional teams to define, design, and ship new features."
    ]
  }
}

export interface DetailedScreeningCandidate {
  id: string
  name: string
  role: string
  location: string
  experience: string
  skills: { name: string; proficiency: string; matchType: "Matched" | "Partial" | "Missing" }[]
  overallMatch: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  roleSimilarity: number
  keywordMatch: number
  status: AppStatus
  screeningStatus: AIScreeningStatus
  appliedDate: string
  matchedStrengths: string[]
  potentialGaps: string[]
}

export const initialScreeningCandidates: DetailedScreeningCandidate[] = [
  {
    id: "cand_1",
    name: "Rahul Sharma",
    role: "Software Engineer",
    location: "Bangalore",
    experience: "2 years",
    overallMatch: 96,
    skillMatch: 94,
    experienceMatch: 89,
    educationMatch: 100,
    roleSimilarity: 95,
    keywordMatch: 93,
    status: "Shortlisted",
    screeningStatus: "Strong Match",
    appliedDate: "Today",
    skills: [
      { name: "React", proficiency: "Strong", matchType: "Matched" },
      { name: "Node.js", proficiency: "Strong", matchType: "Matched" },
      { name: "MongoDB", proficiency: "Intermediate", matchType: "Matched" },
      { name: "TypeScript", proficiency: "Intermediate", matchType: "Matched" },
      { name: "AWS", proficiency: "Basic", matchType: "Partial" },
      { name: "Docker", proficiency: "Basic", matchType: "Missing" }
    ],
    matchedStrengths: [
      "Has required React experience",
      "Strong Node.js background",
      "Relevant software engineering projects",
      "Meets education requirements precisely"
    ],
    potentialGaps: [
      "Limited Docker experience",
      "AWS exposure could be stronger"
    ]
  },
  {
    id: "cand_5",
    name: "Priya Singh",
    role: "Software Engineer",
    location: "Mumbai",
    experience: "3 years",
    overallMatch: 93,
    skillMatch: 92,
    experienceMatch: 95,
    educationMatch: 90,
    roleSimilarity: 94,
    keywordMatch: 91,
    status: "Screening",
    screeningStatus: "Strong Match",
    appliedDate: "Yesterday",
    skills: [
      { name: "React", proficiency: "Strong", matchType: "Matched" },
      { name: "TypeScript", proficiency: "Strong", matchType: "Matched" },
      { name: "PostgreSQL", proficiency: "Strong", matchType: "Missing" },
      { name: "Node.js", proficiency: "Intermediate", matchType: "Partial" }
    ],
    matchedStrengths: [
      "Strong frontend background with React and TypeScript",
      "Meets overall experience requirements strongly",
      "Relevant role history"
    ],
    potentialGaps: [
      "Missing MongoDB experience",
      "Node.js experience is only intermediate"
    ]
  },
  {
    id: "cand_6",
    name: "Vikram Rao",
    role: "Software Engineer",
    location: "Pune",
    experience: "1 year",
    overallMatch: 78,
    skillMatch: 75,
    experienceMatch: 60,
    educationMatch: 100,
    roleSimilarity: 82,
    keywordMatch: 70,
    status: "Applied",
    screeningStatus: "Potential Match",
    appliedDate: "2 days ago",
    skills: [
      { name: "React", proficiency: "Intermediate", matchType: "Matched" },
      { name: "JavaScript", proficiency: "Strong", matchType: "Partial" },
      { name: "Python", proficiency: "Basic", matchType: "Missing" }
    ],
    matchedStrengths: [
      "Meets educational requirements",
      "Basic React competency"
    ],
    potentialGaps: [
      "Falls short of the 2-4 years experience requirement",
      "Missing core backend skills (Node.js, MongoDB)"
    ]
  },
  {
    id: "cand_7",
    name: "Neha Gupta",
    role: "Software Engineer",
    location: "Delhi",
    experience: "4 years",
    overallMatch: 88,
    skillMatch: 85,
    experienceMatch: 98,
    educationMatch: 90,
    roleSimilarity: 92,
    keywordMatch: 80,
    status: "Applied",
    screeningStatus: "Not Screened",
    appliedDate: "3 days ago",
    skills: [
      { name: "Angular", proficiency: "Strong", matchType: "Missing" },
      { name: "Node.js", proficiency: "Strong", matchType: "Matched" },
      { name: "MongoDB", proficiency: "Strong", matchType: "Matched" },
      { name: "TypeScript", proficiency: "Strong", matchType: "Matched" }
    ],
    matchedStrengths: [
      "Excellent backend and database experience",
      "Strong TypeScript background",
      "Highly experienced"
    ],
    potentialGaps: [
      "Strong Angular background but missing React experience"
    ]
  }
]
