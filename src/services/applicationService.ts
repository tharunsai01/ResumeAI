import { mockJobs } from "../data/mockJobs"

export type ApplicationStatus = "Applied" | "AI Screened" | "Under Review" | "Shortlisted" | "Interview" | "Offer" | "Rejected" | "Withdrawn" | "Hired"

export interface TimelineEvent {
  status: ApplicationStatus
  date: string
}

export interface Application {
  id: string
  jobId: string
  candidateId: string
  status: ApplicationStatus
  matchScore: number
  appliedDate: string
  timeline: TimelineEvent[]
  notes: string
  aiScreening?: {
    skillMatch: number
    experienceMatch: number
    educationMatch: number
    roleMatch: number
    strengths: string[]
    missingSkills: string[]
  }
}

const STORAGE_KEY = "hiresmart_all_applications"

export const applicationService = {
  getApplications(): Application[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      
      // Seed data if empty
      const seeded = this.seedData()
      this.saveApplications(seeded)
      return seeded
    }
    return []
  },

  saveApplications(apps: Application[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
      window.dispatchEvent(new Event('hiresmart_applications_updated'))
    }
  },

  seedData(): Application[] {
    const generateId = () => Math.random().toString(36).substr(2, 9)
    
    // Seed some applications for current user to mockJobs
    const currentUserApps: Application[] = [
      {
        id: generateId(),
        jobId: mockJobs[0].id,
        candidateId: "c_currentUser",
        status: "Under Review",
        matchScore: 92,
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: "Applied", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "Under Review", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        notes: "Remember to follow up next Monday."
      },
      {
        id: generateId(),
        jobId: mockJobs[1].id,
        candidateId: "c_currentUser",
        status: "Interview",
        matchScore: 87,
        appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: "Applied", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "Under Review", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "Shortlisted", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "Interview", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        notes: "First round technical interview scheduled for Thursday."
      }
    ]

    // Seed some applications for other candidates to the first job
    const otherApps: Application[] = [
      {
        id: generateId(),
        jobId: mockJobs[0].id, // Software Engineer - TCS
        candidateId: "c_1",
        status: "Applied",
        matchScore: 96,
        appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [{ status: "Applied", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }],
        notes: ""
      },
      {
        id: generateId(),
        jobId: mockJobs[0].id, 
        candidateId: "c_2",
        status: "Applied",
        matchScore: 65,
        appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [{ status: "Applied", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }],
        notes: ""
      },
      {
        id: generateId(),
        jobId: mockJobs[0].id, 
        candidateId: "c_4",
        status: "AI Screened",
        matchScore: 88,
        appliedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          { status: "Applied", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "AI Screened", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        notes: "",
        aiScreening: {
          skillMatch: 90,
          experienceMatch: 85,
          educationMatch: 100,
          roleMatch: 80,
          strengths: ["Strong backend", "Cloud infrastructure"],
          missingSkills: ["Frontend performance"]
        }
      }
    ]

    return [...currentUserApps, ...otherApps]
  },

  getApplicationsByCandidate(candidateId: string): Application[] {
    return this.getApplications().filter(a => a.candidateId === candidateId)
  },

  getApplicationsByJob(jobId: string): Application[] {
    return this.getApplications().filter(a => a.jobId === jobId)
  },

  getApplication(id: string): Application | undefined {
    return this.getApplications().find(a => a.id === id)
  },

  createApplication(app: Omit<Application, "id">): Application {
    const apps = this.getApplications()
    const newApp = { ...app, id: Math.random().toString(36).substr(2, 9) }
    apps.unshift(newApp)
    this.saveApplications(apps)
    return newApp
  },

  updateApplicationStatus(id: string, status: ApplicationStatus) {
    const apps = this.getApplications()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.status = status
      app.timeline.push({ status, date: new Date().toISOString() })
      this.saveApplications(apps)
    }
  },

  updateApplicationNote(id: string, note: string) {
    const apps = this.getApplications()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.notes = note
      this.saveApplications(apps)
    }
  },
  
  updateAIScreening(id: string, screening: Application["aiScreening"], matchScore: number) {
    const apps = this.getApplications()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.aiScreening = screening
      app.matchScore = matchScore
      app.status = "AI Screened"
      app.timeline.push({ status: "AI Screened", date: new Date().toISOString() })
      this.saveApplications(apps)
    }
  }
}
