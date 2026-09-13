import { useState, useEffect } from "react"
import type { Job } from "../data/mockJobs"
import { jobService } from "../services/jobService"
import { notificationService } from "../services/notificationService"
import { settingsService } from "../services/settingsService"
import { applicationService, type ApplicationStatus, type TimelineEvent } from "../services/applicationService"

export type { ApplicationStatus, TimelineEvent }

export interface AppliedJob extends Job {
  applicationId: string
  appliedDate: string
  status: ApplicationStatus
  matchScore: number
  timeline: TimelineEvent[]
  notes: string
}

export function useJobActions() {
  // Saved Jobs
  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hiresmart_saved_jobs")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem("hiresmart_saved_jobs", JSON.stringify(savedJobs))
  }, [savedJobs])

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const isJobSaved = (jobId: string) => savedJobs.includes(jobId)

  // Applied Jobs synced with applicationService
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([])

  useEffect(() => {
    const loadApps = async () => {
      const apps = applicationService.getApplicationsByCandidate("c_currentUser")
      const allJobs = await jobService.getJobs()
      const mapped: AppliedJob[] = apps.map(app => {
        const job = allJobs.find(j => j.id === app.jobId)
        if (!job) return null
        return {
          ...job,
          applicationId: app.id,
          appliedDate: app.appliedDate,
          status: app.status,
          matchScore: app.matchScore,
          timeline: app.timeline,
          notes: app.notes
        }
      }).filter((a): a is AppliedJob => a !== null)
      
      mapped.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
      setAppliedJobs(mapped)
    }

    loadApps()

    const handleUpdate = () => loadApps()
    window.addEventListener("hiresmart_applications_updated", handleUpdate)
    return () => window.removeEventListener("hiresmart_applications_updated", handleUpdate)
  }, [])

  const applyToJob = (job: Job, matchScore: number) => {
    if (appliedJobs.some(a => a.id === job.id)) return false
    
    const now = new Date().toISOString()
    const newApp = applicationService.createApplication({
      jobId: job.id,
      candidateId: "c_currentUser",
      status: "Applied",
      matchScore,
      appliedDate: now,
      timeline: [{ status: "Applied", date: now }],
      notes: ""
    })

    // Generate notification if enabled
    const settings = settingsService.getSettings()
    if (settings.notifications.applicationStatusUpdates) {
      notificationService.addNotification({
        title: "Application Submitted",
        description: `You have successfully applied for ${job.title} at ${job.company}.`,
        type: "application",
        link: `/candidate/applications/${newApp.id}`
      })
    }

    return true
  }

  const hasApplied = (jobId: string) => appliedJobs.some(a => a.id === jobId)

  const updateApplicationNote = (applicationId: string, note: string) => {
    applicationService.updateApplicationNote(applicationId, note)
  }

  const withdrawApplication = (applicationId: string) => {
    const app = appliedJobs.find(a => a.applicationId === applicationId)
    if (app && app.status !== "Withdrawn") {
      applicationService.updateApplicationStatus(applicationId, "Withdrawn")
      
      // Generate notification if enabled
      const settings = settingsService.getSettings()
      if (settings.notifications.applicationStatusUpdates) {
        notificationService.addNotification({
          title: "Application Withdrawn",
          description: `You have withdrawn your application for ${app.title} at ${app.company}.`,
          type: "application",
          link: `/candidate/applications/${applicationId}`
        })
      }
    }
  }

  const getApplication = (applicationId: string) => appliedJobs.find(a => a.applicationId === applicationId)

  return {
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    appliedJobs,
    applyToJob,
    hasApplied,
    updateApplicationNote,
    withdrawApplication,
    getApplication
  }
}
