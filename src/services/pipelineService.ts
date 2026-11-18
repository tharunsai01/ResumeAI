import { initialPipelineCandidates } from "../data/pipelineMockData"
import type { PipelineCandidate, PipelineStage } from "../data/pipelineMockData"
import { applicationService } from "./applicationService"

const PIPELINE_STORAGE_KEY = "hiresmart_pipeline_candidates"
const RECRUITER_CANDIDATES_KEY = "hiresmart_recruiter_candidates"

export const VALID_PIPELINE_STAGES: PipelineStage[] = [
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Decision Pending",
  "Hired",
  "Rejected"
]

export const pipelineService = {
  getCandidates(): PipelineCandidate[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PIPELINE_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse stored pipeline candidates", e)
        }
      }
      // Initialize with mock data if not set
      this.saveCandidates(initialPipelineCandidates)
      return initialPipelineCandidates
    }
    return initialPipelineCandidates
  },

  saveCandidates(candidates: PipelineCandidate[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(candidates))
      window.dispatchEvent(new Event("hiresmart_pipeline_updated"))
    }
  },

  getCandidateById(id: string): PipelineCandidate | undefined {
    if (!id) return undefined
    const list = this.getCandidates()
    return list.find(c => c.id === id)
  },

  updateCandidateStage(id: string, stage: PipelineStage): PipelineCandidate | null {
    if (!id || !VALID_PIPELINE_STAGES.includes(stage)) {
      return null
    }

    const candidates = this.getCandidates()
    const targetIndex = candidates.findIndex(c => c.id === id)
    if (targetIndex === -1) {
      return null
    }

    const updatedCandidate: PipelineCandidate = {
      ...candidates[targetIndex],
      stage
    }

    const updatedList = [...candidates]
    updatedList[targetIndex] = updatedCandidate
    this.saveCandidates(updatedList)

    // Synchronize application service if corresponding application exists
    try {
      const apps = applicationService.getApplications()
      const matchingApp = apps.find(a => a.candidateId === id)
      if (matchingApp) {
        let appStatus: any = "Shortlisted"
        if (stage === "Interview Scheduled" || stage === "Interview Completed" || stage === "Decision Pending") {
          appStatus = "Interview"
        } else if (stage === "Hired") {
          appStatus = "Hired"
        } else if (stage === "Rejected") {
          appStatus = "Rejected"
        }
        applicationService.updateApplicationStatus(matchingApp.id, appStatus)
      }
    } catch {
      // Ignore if applicationService storage is unavailable
    }

    // Synchronize recruiter candidates storage if exists
    if (typeof window !== "undefined") {
      try {
        const storedRecruiterCand = localStorage.getItem(RECRUITER_CANDIDATES_KEY)
        if (storedRecruiterCand) {
          const rList = JSON.parse(storedRecruiterCand)
          const rIndex = rList.findIndex((rc: any) => rc.id === id)
          if (rIndex !== -1) {
            let rStatus = "Shortlisted"
            if (stage === "Interview Scheduled" || stage === "Interview Completed" || stage === "Decision Pending") {
              rStatus = "Interview"
            } else if (stage === "Hired") {
              rStatus = "Hired"
            } else if (stage === "Rejected") {
              rStatus = "Rejected"
            }
            rList[rIndex].status = rStatus
            localStorage.setItem(RECRUITER_CANDIDATES_KEY, JSON.stringify(rList))
            window.dispatchEvent(new Event("hiresmart_recruiter_candidates_updated"))
          }
        }
      } catch {
        // Ignore parsing issues
      }
    }

    return updatedCandidate
  },

  addCandidate(candidate: PipelineCandidate): PipelineCandidate {
    const list = this.getCandidates()
    const existingIndex = list.findIndex(c => c.id === candidate.id)
    if (existingIndex !== -1) {
      // Update existing record, avoid duplicates
      const updated = [...list]
      updated[existingIndex] = { ...updated[existingIndex], ...candidate }
      this.saveCandidates(updated)
      return updated[existingIndex]
    }
    const updated = [candidate, ...list]
    this.saveCandidates(updated)
    return candidate
  },

  removeCandidate(id: string): boolean {
    const list = this.getCandidates()
    const filtered = list.filter(c => c.id !== id)
    if (filtered.length !== list.length) {
      this.saveCandidates(filtered)
      return true
    }
    return false
  },

  getStageCounts(): Record<PipelineStage, number> {
    const list = this.getCandidates()
    const counts: Record<PipelineStage, number> = {
      "Shortlisted": 0,
      "Interview Scheduled": 0,
      "Interview Completed": 0,
      "Decision Pending": 0,
      "Hired": 0,
      "Rejected": 0
    }
    for (const cand of list) {
      if (counts[cand.stage] !== undefined) {
        counts[cand.stage]++
      }
    }
    return counts
  },

  resetPipeline(): PipelineCandidate[] {
    this.saveCandidates(initialPipelineCandidates)
    return initialPipelineCandidates
  }
}
