/**
 * HireSmart AI - Interview Service
 * Manages interview scheduling, recruiter interview lists, details, and evaluation notes.
 */

import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
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

  async fetchLiveInterviews(): Promise<Interview[]> {
    if (env.useMock) return this.getInterviews()
    try {
      const res = await httpClient.get<{ success: boolean; data: any[] }>("/interviews")
      if (res?.data && Array.isArray(res.data)) {
        const mapped: Interview[] = res.data.map((item) => ({
          id: item._id,
          applicationId: item.application?._id || item.application || "",
          candidateId: item.candidate?._id || item.candidate || "",
          jobId: item.job?._id || item.job || "",
          type: (["Technical", "HR", "Managerial", "Final"].includes(item.mode) ? item.mode : "Technical") as InterviewType,
          date: item.scheduledAt ? new Date(item.scheduledAt).toISOString().split("T")[0] : "",
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          status: (["Scheduled", "Completed", "Cancelled"].includes(item.status) ? item.status : "Scheduled") as InterviewStatus,
          meetingLink: item.meetingLink || "",
          notes: item.notes || "",
        }))
        if (typeof window !== "undefined") {
          localStorage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(mapped))
          window.dispatchEvent(new Event("hiresmart_interviews_updated"))
        }
        return mapped
      }
    } catch (err) {
      console.warn("[InterviewService] Live fetch failed, using cached:", err)
    }
    return this.getInterviews()
  },

  scheduleInterview(interview: Omit<Interview, "id" | "status">): Interview {
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

    if (!env.useMock) {
      httpClient.post("/interviews", {
        applicationId: interview.applicationId,
        scheduledAt: `${interview.date}T${interview.time || "10:00:00"}`,
        mode: interview.type,
        meetingLink: interview.meetingLink,
        notes: interview.notes,
      }).catch((err) => {
        console.warn("[InterviewService] Live schedule sync warning:", err)
      })
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
    const list = this.getRecruiterInterviews()
    const index = list.findIndex(i => i.id === id)
    if (index === -1) return undefined

    const updated = { ...list[index], ...updates }
    list[index] = updated
    this.saveRecruiterInterviews(list)

    if (!env.useMock) {
      httpClient.patch(`/interviews/${id}`, {
        status: updates.status?.toLowerCase(),
        notes: updates.feedback?.comments,
        scheduledAt: updates.date && updates.time ? `${updates.date}T${updates.time}` : undefined,
      }).catch((err) => {
        console.warn("[InterviewService] Live update warning:", err)
      })
    }

    return updated
  },
}
