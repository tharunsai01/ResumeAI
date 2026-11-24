import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { mockJobs } from "../data/mockJobs"
import type { ApplicationStatus, TimelineEvent, Application, ApplicationAiScreening } from "../types/application"

export type { ApplicationStatus, TimelineEvent, Application, ApplicationAiScreening }

const STORAGE_KEY = "hiresmart_all_applications"

export const applicationService = {
  getApplications(): Application[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      
      // In live mode, return empty array without seeding mock data
      if (!env.useMock) {
        return []
      }

      // Seed data if empty (mock mode only)
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

  async fetchLiveApplications(): Promise<Application[]> {
    if (env.useMock) {
      return this.getApplications()
    }
    try {
      const res = await httpClient.get<{ success: boolean; data: any[] }>("/applications/me")
      if (res?.data && Array.isArray(res.data)) {
        const mapped: Application[] = res.data.map((item) => ({
          id: item._id,
          jobId: item.job?._id || item.job,
          candidateId: item.candidate?._id || item.candidate,
          status: (item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : "Applied") as ApplicationStatus,
          matchScore: 85,
          appliedDate: item.createdAt || new Date().toISOString(),
          timeline: Array.isArray(item.statusHistory)
            ? item.statusHistory.map((h: any) => ({
                status: (h.status ? (h.status.charAt(0).toUpperCase() + h.status.slice(1)) : "Applied") as ApplicationStatus,
                date: h.changedAt || new Date().toISOString(),
              }))
            : [{ status: "Applied", date: item.createdAt || new Date().toISOString() }],
          notes: "",
        }))
        this.saveApplications(mapped)
        return mapped
      }
    } catch (err) {
      console.warn("[ApplicationService] Live fetch failed, using cached applications:", err)
    }
    return this.getApplications()
  },

  createApplication(app: Omit<Application, "id">): Application {
    const apps = this.getApplications()
    const newApp = { ...app, id: Math.random().toString(36).substr(2, 9) }
    apps.unshift(newApp)
    this.saveApplications(apps)

    if (!env.useMock) {
      httpClient.post<{ success: boolean; data: any }>("/applications", {
        jobId: app.jobId,
        resumeId: (app as any).resumeId,
        coverLetter: (app as any).coverLetter || app.notes,
      }).then(res => {
        if (res?.data?._id) {
          const currentApps = this.getApplications()
          const idx = currentApps.findIndex(a => a.id === newApp.id)
          if (idx !== -1) {
            currentApps[idx].id = res.data._id
            this.saveApplications(currentApps)
          }
        }
      }).catch((err) => {
        console.warn("[ApplicationService] Live submit application sync warning:", err)
      })
    }
    return newApp
  },

  async withdrawApplication(id: string): Promise<boolean> {
    const apps = this.getApplications().filter(a => a.id !== id)
    this.saveApplications(apps)
    if (!env.useMock) {
      try {
        await httpClient.patch(`/applications/${id}/withdraw`)
        return true
      } catch (e) {
        console.warn("[ApplicationService] Live withdraw error:", e)
      }
    }
    return true
  },

  updateApplicationStatus(id: string, status: ApplicationStatus) {
    const apps = this.getApplications()
    const app = apps.find(a => a.id === id)
    if (app) {
      app.status = status
      app.timeline.push({ status, date: new Date().toISOString() })
      this.saveApplications(apps)

      if (!env.useMock) {
        const backendStatus = status.toLowerCase() === "ai screened" ? "screened" : status.toLowerCase()
        httpClient.patch(`/applications/${id}/status`, { status: backendStatus }).catch((err) => {
          console.warn("[ApplicationService] Live status update warning:", err)
        })
      }
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
