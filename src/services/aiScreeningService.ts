import type { Job } from "../data/mockJobs"
import { jobService } from "./jobService"
import { applicationService } from "./applicationService"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const aiScreeningService = {
  // Analyze a job description to extract requirements
  async analyzeJob(job: Partial<Job>) {
    await delay(800) // Mock AI processing delay
    
    // Naive mock extraction based on standard buzzwords
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
      keywords: ["scalable", "performance", "team", "architecture"]
    }
  },

  // Calculate match for a single application
  async calculateMatch(appId: string) {
    const app = applicationService.getApplication(appId)
    if (!app) throw new Error("Application not found")
    
    const job = await jobService.getJobById(app.jobId)
    if (!job) throw new Error("Job not found")

    await delay(300) // Simulated processing

    // Deterministic mock scoring based on string hashes or ID for demo purposes
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
      missingSkills
    }

    // Save to application service
    applicationService.updateAIScreening(app.id, screeningResult, overallScore)
    
    return overallScore
  },

  // Screen all candidates for a specific job
  async screenCandidatesForJob(jobId: string, onProgress?: (progress: number) => void) {
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
  }
}
