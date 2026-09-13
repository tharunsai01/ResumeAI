import { mockJobs } from "../data/mockJobs"
import type { Job } from "../data/mockJobs"
import { mockResumeAnalysis } from "../data/mockResume"
import type { ResumeAnalysisResult } from "../data/mockResume"
import { profileService } from "./profileService"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export interface JobMatchResult {
  job: Job
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  roleSimilarity: number
  overallMatch: number
  matchedSkills: string[]
  missingSkills: string[]
  explanation: {
    strengths: string[]
    improvements: string[]
  }
}

const STORAGE_KEY = "hiresmart_created_jobs"

export const jobService = {
  getJobs: async (): Promise<Job[]> => {
    await delay(0)
    let customJobs: Job[] = []
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        customJobs = JSON.parse(stored)
      }
    }
    return [...customJobs, ...mockJobs]
  },

  getJobById: async (id: string): Promise<Job | undefined> => {
    await delay(0)
    const allJobs = await jobService.getJobs()
    return allJobs.find(j => j.id === id)
  },

  createJob: async (job: Omit<Job, "id">): Promise<Job> => {
    await delay(0)
    const newJob: Job = { ...job, id: `job-${Date.now()}` }
    let customJobs: Job[] = []
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) customJobs = JSON.parse(stored)
      customJobs.unshift(newJob)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customJobs))
    }
    return newJob
  },

  updateJob: async (id: string, updates: Partial<Job>): Promise<Job | undefined> => {
    await delay(0)
    if (typeof window !== "undefined") {
      let customJobs: Job[] = []
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) customJobs = JSON.parse(stored)
      
      const idx = customJobs.findIndex(j => j.id === id)
      if (idx !== -1) {
        customJobs[idx] = { ...customJobs[idx], ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customJobs))
        return customJobs[idx]
      }
    }
    return undefined
  },

  calculateJobMatch: (candidate: ResumeAnalysisResult, job: Job): JobMatchResult => {
    // Deterministic calculation based on candidate skills vs job requirements
    const candidateSkillNames = candidate.skills.map(s => s.name.toLowerCase())
    
    const matchedSkills = job.skills.filter(s => candidateSkillNames.includes(s.toLowerCase()))
    const missingSkills = job.skills.filter(s => !candidateSkillNames.includes(s.toLowerCase()))
    
    // Skill Match
    const skillMatch = job.skills.length > 0 
      ? Math.round((matchedSkills.length / job.skills.length) * 100) 
      : 100

    // Experience Match - simple heuristic based on job experience requirement
    let experienceMatch = 85
    if (job.experience === "Fresher" || job.experience === "0–2 Years") experienceMatch = 100
    if (job.experience === "5+ Years") experienceMatch = 60

    // Education Match
    const educationMatch = 100 // Mocking that B.Tech satisfies everything

    // Role Similarity - Mock based on title matching
    const roleSimilarity = job.title.toLowerCase().includes("engineer") || job.title.toLowerCase().includes("developer") ? 90 : 70

    // Career Preferences Match
    const prefs = profileService.getCandidateProfile().careerPreferences
    let prefMatch = 0
    let prefFactors = 0
    
    if (prefs.preferredLocations.length > 0) {
      prefFactors++
      if (prefs.preferredLocations.some(l => job.location.toLowerCase().includes(l.toLowerCase()))) {
        prefMatch += 100
      } else if (prefs.willingToRelocate) {
        prefMatch += 50
      }
    }
    
    if (prefs.preferredJobType.length > 0) {
      prefFactors++
      if (prefs.preferredJobType.some(t => job.type.toLowerCase().includes(t.toLowerCase()))) {
        prefMatch += 100
      }
    }
    
    if (prefs.preferredJobTitles.length > 0) {
      prefFactors++
      if (prefs.preferredJobTitles.some(t => job.title.toLowerCase().includes(t.toLowerCase()))) {
        prefMatch += 100
      }
    }
    
    const preferenceMatchScore = prefFactors > 0 ? prefMatch / prefFactors : 100

    // Overall Match (Weighted average incorporating preferences)
    const overallMatch = Math.round(
      (skillMatch * 0.45) + 
      (experienceMatch * 0.20) + 
      (roleSimilarity * 0.10) + 
      (educationMatch * 0.10) +
      (preferenceMatchScore * 0.15)
    )

    // Generate explanations
    const strengths = [
      `You possess ${matchedSkills.length} of the ${job.skills.length} required skills.`,
      `Your experience level is a ${experienceMatch >= 80 ? 'strong' : 'decent'} fit for this role.`,
      `Your educational background aligns perfectly with the requirements.`,
    ]

    if (matchedSkills.includes("React") || matchedSkills.includes("Java") || matchedSkills.includes("Python")) {
      strengths.push(`Your core programming expertise is highly relevant to this position.`)
    }

    const improvements = missingSkills.map(skill => `Gain experience or certifications in ${skill}.`)
    if (improvements.length === 0) {
      improvements.push("Your profile perfectly matches the technical requirements.")
    } else if (experienceMatch < 80) {
      improvements.push(`This role typically requires ${job.experience}, which may require demonstrating additional leadership.`)
    }

    return {
      job,
      skillMatch,
      experienceMatch,
      educationMatch,
      roleSimilarity,
      overallMatch,
      matchedSkills,
      missingSkills,
      explanation: {
        strengths,
        improvements
      }
    }
  },

  getRecommendedJobs: async (): Promise<JobMatchResult[]> => {
    await delay(600)
    const candidate = mockResumeAnalysis
    const scored = mockJobs.map(job => jobService.calculateJobMatch(candidate, job))
    // Sort descending
    return scored.sort((a, b) => b.overallMatch - a.overallMatch)
  }
}
