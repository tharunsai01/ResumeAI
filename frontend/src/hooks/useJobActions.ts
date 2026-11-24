import { useState, useEffect } from "react"
import type { Job } from "../data/mockJobs"
import { env } from "../config/env"
import { jobService } from "../services/jobService"
import { authService } from "../services/authService"
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
  const [isLoadingAppliedJobs, setIsLoadingAppliedJobs] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const loadApps = async () => {
      setIsLoadingAppliedJobs(true)
      try {
        const apps = env.useMock
          ? applicationService.getApplicationsByCandidate("c_currentUser")
          : await applicationService.fetchLiveApplications()

        const allJobs = await jobService.getJobs()
        const mapped: AppliedJob[] = apps.map(app => {
          const job = allJobs.find(j => j.id === app.jobId)
          if (!job) {
            // Provide a graceful fallback representation if job detail isn't in top mock list
            return {
              id: app.jobId,
              title: "Software Engineer",
              company: "Tech Corp",
              location: "Remote",
              category: "Engineering",
              salary: "Competitive",
              type: "Full-time" as const,
              workMode: "Remote" as const,
              experience: "2–5 Years" as const,
              description: "Job application submitted via HireSmart AI",
              aboutCompany: "Technology firm partner",
              additionalInfo: "",
              responsibilities: [],
              requirements: [],
              skills: [],
              postedDate: app.appliedDate,
              deadline: "",
              applicationId: app.id,
              appliedDate: app.appliedDate,
              status: app.status,
              matchScore: app.matchScore,
              timeline: app.timeline,
              notes: app.notes,
            }
          }
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
        if (isMounted) {
          setAppliedJobs(mapped)
          setIsLoadingAppliedJobs(false)
        }
      } catch (e) {
        console.error("Failed to load applications in useJobActions", e)
        if (isMounted) {
          setIsLoadingAppliedJobs(false)
        }
      }
    }

    loadApps()

    const handleUpdate = () => loadApps()
    window.addEventListener("hiresmart_applications_updated", handleUpdate)
    return () => {
      isMounted = false
      window.removeEventListener("hiresmart_applications_updated", handleUpdate)
    }
  }, [])

  const applyToJob = (job: Job, matchScore: number) => {
    if (appliedJobs.some(a => a.id === job.id)) return false
    
    const now = new Date().toISOString()
    const currentUser = authService.getCurrentUser()
    const newApp = applicationService.createApplication({
      jobId: job.id,
      candidateId: currentUser?.id || "c_currentUser",
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
        link: `/candidate/applications/${newApp.id}`,
        role: "candidate"
      }, "candidate")
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
          link: `/candidate/applications/${applicationId}`,
          role: "candidate"
        }, "candidate")
      }
    }
  }

  const getApplication = (applicationId: string) => appliedJobs.find(a => a.applicationId === applicationId)

  return {
    savedJobs,
    toggleSaveJob,
    isJobSaved,
    appliedJobs,
    isLoadingAppliedJobs,
    applyToJob,
    hasApplied,
    updateApplicationNote,
    withdrawApplication,
    getApplication
  }
}
