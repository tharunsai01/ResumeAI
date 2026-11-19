/**
 * HireSmart AI - Interview Service
 * Manages interview scheduling, recruiter interview lists, details, and evaluation notes.
 */

import { env } from "../config/env"
import type { Interview, InterviewType, InterviewStatus } from "../types/interview"
import type { MockInterview } from "../types/pipeline"
import { initialInterviews } from "../data/pipelineMockData"

export type { Interview, InterviewType, InterviewStatus, MockInterview }

const CANDIDATE_STORAGE_KEY = "hiresmart_interviews"
const RECRUITER_STORAGE_KEY = "hiresmart_recruiter_interviews"

export const interviewService = {
  // --- Candidate-facing interview methods ---

  getInterviews(): Interview[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CANDIDATE_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse candidate interviews", e)
        }
      }
    }
    return []
  },

  scheduleInterview(interview: Omit<Interview, "id" | "status">): Interview {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for interviewService.")
    }
    const interviews = this.getInterviews()
    const newInterview: Interview = {
      ...interview,
      id: Math.random().toString(36).substr(2, 9),
      status: "Scheduled",
    }
    interviews.unshift(newInterview)
    if (typeof window !== "undefined") {
      localStorage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(interviews))
      window.dispatchEvent(new Event("hiresmart_interviews_updated"))
    }
    return newInterview
  },

  // --- Recruiter-facing interview methods ---

  getRecruiterInterviews(): MockInterview[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECRUITER_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse recruiter interviews", e)
        }
      }
      this.saveRecruiterInterviews(initialInterviews)
    }
    return [...initialInterviews]
  },

  saveRecruiterInterviews(interviews: MockInterview[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_STORAGE_KEY, JSON.stringify(interviews))
      window.dispatchEvent(new Event("hiresmart_recruiter_interviews_updated"))
    }
  },

  getRecruiterInterviewById(id: string): MockInterview | undefined {
    if (!id) return undefined
    const list = this.getRecruiterInterviews()
    return list.find(i => i.id === id)
  },

  updateRecruiterInterview(id: string, updates: Partial<MockInterview>): MockInterview | undefined {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for interviewService.")
    }
    const list = this.getRecruiterInterviews()
    const index = list.findIndex(i => i.id === id)
    if (index === -1) return undefined

    const updated = { ...list[index], ...updates }
    list[index] = updated
    this.saveRecruiterInterviews(list)
    return updated
  },
}
