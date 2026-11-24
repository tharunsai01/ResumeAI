/**
 * HireSmart AI - AI Screening Service
 * Powers AI candidate screening, requirement extraction, match calculations,
 * and recruiter screening workflows.
 */

import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import type { Job } from "../types/job"
import { jobService } from "./jobService"
import { applicationService } from "./applicationService"
import {
  screeningJobs,
  initialScreeningCandidates,
  jobRequirements,
  AI_SCREENING_THRESHOLD as DEFAULT_AI_SCREENING_THRESHOLD,
} from "../data/screeningMockData"
import type { ScreeningJob, DetailedScreeningCandidate } from "../types/screening"

export const AI_SCREENING_THRESHOLD = DEFAULT_AI_SCREENING_THRESHOLD

export type { ScreeningJob, DetailedScreeningCandidate }

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const aiScreeningService = {
  /**
   * Retrieves all jobs configured for AI screening.
   */
  getScreeningJobs(): ScreeningJob[] {
    return screeningJobs
  },

  /**
   * Retrieves a specific screening job by ID.
   */
  getScreeningJobById(jobId: string): ScreeningJob | undefined {
    return screeningJobs.find(j => j.id === jobId)
  },

  /**
   * Retrieves candidate screening profiles.
   */
  getScreeningCandidates(_jobId?: string): DetailedScreeningCandidate[] {
    return [...initialScreeningCandidates]
  },

  /**
   * Retrieves a single candidate screening profile by ID.
   */
  getScreeningCandidateById(candidateId: string): DetailedScreeningCandidate | undefined {
    return initialScreeningCandidates.find(c => c.id === candidateId)
  },

  /**
   * Retrieves job requirements configuration for a job ID.
   */
  getJobRequirements(jobId: string) {
    return jobRequirements[jobId as keyof typeof jobRequirements] || jobRequirements["job_101"]
  },

  /**
   * Returns the minimum threshold required for a strong AI match.
   */
  getScreeningThreshold(): number {
    return AI_SCREENING_THRESHOLD
  },

  /**
   * Analyze a job description to extract requirements
   */
  async analyzeJob(job: Partial<Job>) {
    await delay(800) // Processing delay
    
    // Skill extraction based on standard keywords
    const allSkills = ["React", "Python", "Java", "Docker", "Kubernetes", "AWS", "SQL", "MongoDB", "Node.js", "TypeScript"]
    const text = `${job.title} ${job.description} ${job.requirements?.join(" ")}`.toLowerCase()
    
    const requiredSkills = allSkills.filter(s => text.includes(s.toLowerCase()))
    
    if (requiredSkills.length === 0) {
      requiredSkills.push("JavaScript", "React") // Fallback
    }

    return {
      requiredSkills,
      preferredSkills: ["Git", "Agile", "CI/CD"],
      experienceRequired: job.experience || "Entry Level",
      keywords: ["scalable", "performance", "team", "architecture"],
    }
  },

  /**
   * Calculate match for a single application
   */
  async calculateMatch(appId: string) {
    if (!env.useMock) {
      try {
        const res = await httpClient.post<{ success: boolean; data: any }>(`/ai/screen/${appId}`)
        if (res?.data?.screening) {
          const s = res.data.screening
          const screeningResult = {
            skillMatch: s.skillsScore ?? 85,
            experienceMatch: s.experienceScore ?? 80,
            educationMatch: s.educationScore ?? 85,
            roleMatch: s.overallScore ?? 85,
            strengths: s.strengths || [],
            missingSkills: s.missingRequirements || [],
          }
          applicationService.updateAIScreening(appId, screeningResult, s.overallScore)
          return s.overallScore
        }
      } catch (err) {
        console.warn("[AIScreeningService] Live screening error, fallback to local match:", err)
      }
    }

    const app = applicationService.getApplication(appId)
    if (!app) throw new Error("Application not found")
    
    const job = await jobService.getJobById(app.jobId)
    if (!job) throw new Error("Job not found")

    await delay(300) // Simulated processing

    // Deterministic scoring based on string hashes or ID for demo purposes
    const hash = Array.from(app.id + job.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const skillMatch = 70 + (hash % 30) // 70-99
    const experienceMatch = 65 + (hash % 35) // 65-100
    const educationMatch = 80 + (hash % 20) // 80-99
    const roleMatch = 75 + (hash % 25) // 75-99
    
    const overallScore = Math.round((skillMatch * 0.4) + (experienceMatch * 0.3) + (roleMatch * 0.2) + (educationMatch * 0.1))
    
    const strengths = ["Strong background in relevant technologies.", "Good cultural fit based on previous roles."]
    const missingSkills = ["Advanced Cloud Architecture", "Specific Domain Knowledge"]

    const screeningResult = {
      skillMatch,
      experienceMatch,
      educationMatch,
      roleMatch,
      strengths,
      missingSkills,
    }

    // Save to application service
    applicationService.updateAIScreening(app.id, screeningResult, overallScore)
    
    return overallScore
  },

  /**
   * Screen all candidates for a specific job
   */
  async screenCandidatesForJob(jobId: string, onProgress?: (progress: number) => void) {
    if (!env.useMock) {
      try {
        const res = await httpClient.post<{ success: boolean; data: any }>(`/ai/screen/job/${jobId}/bulk`, {
          batchSize: 10,
        })
        if (res?.data?.succeeded !== undefined) {
          if (onProgress) onProgress(100)
          return applicationService.getApplicationsByJob(jobId)
        }
      } catch (err) {
        console.warn("[AIScreeningService] Live bulk screening error, fallback to local simulation:", err)
      }
    }

    const apps = applicationService.getApplicationsByJob(jobId)
    const unscreenedApps = apps.filter(a => a.status === "Applied")
    
    let processed = 0
    for (const app of unscreenedApps) {
      await this.calculateMatch(app.id)
      processed++
      if (onProgress) {
        onProgress(Math.round((processed / unscreenedApps.length) * 100))
      }
    }
    
    return applicationService.getApplicationsByJob(jobId)
  },
}
