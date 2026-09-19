export interface MockInterview {
  id: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  date: string
  time: string
  duration: string
  type: string
  interviewer: string
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show" | "Needs Decision"
  feedback?: {
    overall: number
    technical: number
    communication: number
    problemSolving: number
    comments: string
    recommendation: "Strong Hire" | "Hire" | "Further Review" | "Do Not Proceed"
  }
}

export type PipelineStage = "Shortlisted" | "Interview Scheduled" | "Interview Completed" | "Decision Pending" | "Hired" | "Rejected"

export interface PipelineCandidate {
  id: string
  name: string
  role: string
  experience: string
  skills: string[]
  overallMatch: number
  stage: PipelineStage
  interviewId?: string
}

export const initialInterviews: MockInterview[] = [
  {
    id: "int_1",
    candidateId: "cand_1",
    candidateName: "Rahul Sharma",
    jobId: "job_101",
    jobTitle: "Software Engineer",
    date: "2026-09-22",
    time: "10:30 AM",
    duration: "60 min",
    type: "Technical",
    interviewer: "Recruiter",
    status: "Scheduled"
  },
  {
    id: "int_2",
    candidateId: "cand_5",
    candidateName: "Priya Singh",
    jobId: "job_102",
    jobTitle: "AI Engineer",
    date: "2026-09-20",
    time: "02:00 PM",
    duration: "45 min",
    type: "HR",
    interviewer: "Hiring Manager",
    status: "Completed",
    feedback: {
      overall: 4,
      technical: 5,
      communication: 4,
      problemSolving: 5,
      comments: "Strong technical background, answered ML questions confidently.",
      recommendation: "Hire"
    }
  }
]

export const initialPipelineCandidates: PipelineCandidate[] = [
  {
    id: "cand_1",
    name: "Rahul Sharma",
    role: "Software Engineer",
    experience: "2 years",
    skills: ["React", "Node.js", "MongoDB"],
    overallMatch: 96,
    stage: "Interview Scheduled",
    interviewId: "int_1"
  },
  {
    id: "cand_5",
    name: "Priya Singh",
    role: "AI Engineer",
    experience: "3 years",
    skills: ["Python", "ML", "TensorFlow"],
    overallMatch: 93,
    stage: "Decision Pending",
    interviewId: "int_2"
  },
  {
    id: "cand_7",
    name: "Neha Gupta",
    role: "Software Engineer",
    experience: "4 years",
    skills: ["Node.js", "MongoDB", "TypeScript"],
    overallMatch: 88,
    stage: "Shortlisted"
  },
  {
    id: "cand_3",
    name: "Ananya Patel",
    role: "Frontend Developer",
    experience: "2 years",
    skills: ["React", "TypeScript", "AWS"],
    overallMatch: 89,
    stage: "Shortlisted"
  }
]
