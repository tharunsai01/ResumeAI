import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { mockJobs } from "../data/mockJobs"
import type { Job, JobMatchResult, RecruiterJob, JobExperienceLevel } from "../types/job"
import { mockResumeAnalysis } from "../data/mockResume"
import type { ResumeAnalysisResult } from "../data/mockResume"
import { profileService } from "./profileService"
import { initialRecruiterJobs } from "../data/recruiterMockData"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export type { JobMatchResult }

const STORAGE_KEY = "hiresmart_created_jobs"
const RECRUITER_STORAGE_KEY = "hiresmart_recruiter_jobs"

function mapBackendJobToFrontend(b: any): Job {
  const expLevel: JobExperienceLevel = b.minExperienceYears
    ? (b.minExperienceYears >= 5 ? "5+ Years" : b.minExperienceYears <= 2 ? "0–2 Years" : "2–5 Years")
    : "2–5 Years"

  return {
    id: b._id || b.id,
    title: b.title,
    company: b.companyName || b.company || "HireSmart Partner",
    location: b.location || "Remote",
    category: b.department || "Engineering",
    salary: b.salaryRange ? `$${b.salaryRange.min ?? 80000} - $${b.salaryRange.max ?? 140000}` : "$90,000 - $130,000",
    type: (b.jobType ? (b.jobType.charAt(0).toUpperCase() + b.jobType.slice(1)) : "Full-time") as any,
    experience: expLevel,
    description: b.description || "",
    aboutCompany: b.companyOverview || b.description || "",
    additionalInfo: b.niceToHaveSkills?.join(", ") || "",
    responsibilities: b.responsibilities || [],
    requirements: b.requirements || [],
    skills: b.requiredSkills || b.skills || [],
    postedDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recently",
  }
}

function mapBackendJobToRecruiterJob(b: any): RecruiterJob {
  return {
    id: b._id || b.id,
    title: b.title,
    company: b.companyName || "My Company",
    location: b.location || "Remote",
    workMode: (b.workMode ? (b.workMode.charAt(0).toUpperCase() + b.workMode.slice(1)) : "Remote") as any,
    jobType: (b.jobType ? (b.jobType.charAt(0).toUpperCase() + b.jobType.slice(1)) : "Full-time") as any,
    experience: b.minExperienceYears ? `${b.minExperienceYears}+ Years` : "2–5 Years",
    salary: b.salaryRange ? `$${b.salaryRange.min} - $${b.salaryRange.max}` : "$100k - $140k",
    skills: b.requiredSkills || b.skills || [],
    description: b.description || "",
    status: (b.status === "open" ? "Active" : b.status === "closed" ? "Closed" : "Draft") as any,
    applications: b.applicationCount || 0,
    postedDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recently",
  }
}

export const jobService = {
  getRecruiterJobs: async (): Promise<RecruiterJob[]> => {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: any[] }>("/jobs/recruiter/mine")
        if (res?.data && Array.isArray(res.data)) {
          return res.data.map(mapBackendJobToRecruiterJob)
        }
      } catch (err) {
        console.warn("[JobService] Live getRecruiterJobs failed, using local cache:", err)
      }
    }

    await delay(0)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECRUITER_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse recruiter jobs from localStorage", e)
        }
      }
      // Initialize with initialRecruiterJobs if not stored
      localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(initialRecruiterJobs))
    }
    return [...initialRecruiterJobs]
  },

  getRecruiterJobById: async (id: string): Promise<RecruiterJob | undefined> => {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: any }>(`/jobs/${id}`)
        if (res?.data) {
          return mapBackendJobToRecruiterJob(res.data)
        }
      } catch (err) {
        console.warn("[JobService] Live getRecruiterJobById failed:", err)
      }
    }
    await delay(0)
    const jobs = await jobService.getRecruiterJobs()
    return jobs.find(j => j.id === id)
  },

  getJobs: async (): Promise<Job[]> => {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: { jobs: any[] } }>("/jobs")
        if (res?.data?.jobs && Array.isArray(res.data.jobs)) {
          return res.data.jobs.map(mapBackendJobToFrontend)
        }
      } catch (err) {
        console.warn("[JobService] Live getJobs failed, using local cache:", err)
      }
    }

    await delay(0)
    let customJobs: Job[] = []
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          customJobs = JSON.parse(stored)
        } catch { }
      }
    }
    return [...customJobs, ...mockJobs]
  },

  getJobById: async (id: string): Promise<any | undefined> => {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: any }>(`/jobs/${id}`)
        if (res?.data) {
          return mapBackendJobToFrontend(res.data)
        }
      } catch (err) {
        console.warn("[JobService] Live getJobById failed:", err)
      }
    }
    await delay(0)
    const recruiterJob = await jobService.getRecruiterJobById(id)
    if (recruiterJob) return recruiterJob
    const allJobs = await jobService.getJobs()
    return allJobs.find(j => j.id === id)
  },

  createJob: async (jobData: any): Promise<RecruiterJob> => {
    const skillsList: string[] = jobData.skills
      ? jobData.skills
      : Array.from(new Set([
        ...(jobData.requiredSkills || []),
        ...(jobData.preferredSkills || [])
      ]))

    if (!env.useMock) {
      try {
        const payload = {
          title: jobData.title,
          companyName: jobData.company || "HireSmart Technologies",
          description: jobData.description || "Exciting career opportunity.",
          location: jobData.location || "Remote",
          workMode: (jobData.workMode?.toLowerCase() === "on-site" ? "onsite" : jobData.workMode?.toLowerCase()) || "remote",
          jobType: jobData.jobType?.toLowerCase() || "full-time",
          requiredSkills: skillsList.length > 0 ? skillsList : ["Communication"],
          minExperienceYears: 2,
          status: "open",
        }
        const res = await httpClient.post<{ success: boolean; data: any }>("/jobs", payload)
        if (res?.data) {
          return mapBackendJobToRecruiterJob(res.data)
        }
      } catch (err) {
        console.warn("[JobService] Live createJob failed, fallback to local:", err)
      }
    }

    await delay(0)
    const jobs = await jobService.getRecruiterJobs()
    const newId = `job_${Date.now()}`

    const newJob: RecruiterJob = {
      id: newId,
      title: jobData.title,
      company: jobData.company || "HireSmart Technologies",
      location: jobData.location,
      workMode: jobData.workMode || "Hybrid",
      jobType: jobData.jobType || jobData.type || "Full-time",
      experience: jobData.experience || "1–3 years",
      salary: jobData.salaryNotDisclosed ? "Salary not disclosed" : (jobData.salary || "Salary not disclosed"),
      skills: skillsList,
      description: jobData.description || "",
      status: jobData.status || "Active",
      applications: jobData.applications !== undefined ? jobData.applications : 0,
      postedDate: jobData.postedDate || "Just now"
    }

    const updatedJobs = [newJob, ...jobs]
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(updatedJobs))

      // Also sync to candidate customJobs so it appears across candidate recommendations & searches
      let customJobs: any[] = []
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try { customJobs = JSON.parse(stored) } catch { }
      }
      customJobs.unshift({
        ...newJob,
        category: jobData.category || "Software Development",
        type: newJob.jobType,
        aboutCompany: "We are a leading organization in our sector, committed to innovation and excellence.",
        additionalInfo: "",
        responsibilities: [],
        requirements: newJob.skills
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customJobs))

      window.dispatchEvent(new Event("hiresmart_jobs_updated"))
    }
    return newJob
  },

  updateJob: async (id: string, updates: any): Promise<RecruiterJob | undefined> => {
    if (!env.useMock) {
      try {
        const payload: Record<string, any> = {}
        if (updates.title) payload.title = updates.title
        if (updates.description) payload.description = updates.description
        if (updates.status) payload.status = updates.status.toLowerCase() === "active" ? "open" : updates.status.toLowerCase()
        if (updates.skills) payload.requiredSkills = updates.skills
        await httpClient.patch(`/jobs/${id}`, payload)
      } catch (err) {
        console.warn("[JobService] Live updateJob failed:", err)
      }
    }

    await delay(0)
    const jobs = await jobService.getRecruiterJobs()
    const index = jobs.findIndex(j => j.id === id)
    if (index === -1) return undefined

    const existing = jobs[index]
    const updatedSkills = updates.skills
      ? updates.skills
      : (updates.requiredSkills
        ? Array.from(new Set([...updates.requiredSkills, ...(updates.preferredSkills || [])]))
        : existing.skills)

    const updatedJob: RecruiterJob = {
      ...existing,
      ...updates,
      skills: updatedSkills,
      jobType: updates.jobType || updates.type || existing.jobType,
      workMode: updates.workMode || existing.workMode,
      salary: updates.salaryNotDisclosed ? "Salary not disclosed" : (updates.salary !== undefined ? updates.salary : existing.salary)
    }

    jobs[index] = updatedJob
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(jobs))

      // Also update in candidate customJobs if exists
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          let customJobs: any[] = JSON.parse(stored)
          const cIndex = customJobs.findIndex(j => j.id === id)
          if (cIndex !== -1) {
            customJobs[cIndex] = { ...customJobs[cIndex], ...updatedJob, type: updatedJob.jobType }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customJobs))
          }
        } catch { }
      }

      window.dispatchEvent(new Event("hiresmart_jobs_updated"))
    }
    return updatedJob
  },

  deleteJob: async (id: string): Promise<boolean> => {
    await delay(0)
    const jobs = await jobService.getRecruiterJobs()
    const filtered = jobs.filter(j => j.id !== id)
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(filtered))

      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          let customJobs: any[] = JSON.parse(stored)
          customJobs = customJobs.filter(j => j.id !== id)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(customJobs))
        } catch { }
      }

      window.dispatchEvent(new Event("hiresmart_jobs_updated"))
    }
    return true
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
