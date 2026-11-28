/**
 * HireSmart AI - Interview Service
 * Manages interview scheduling, recruiter interview lists, details, and evaluation notes.
 */

import { env } from "../config/env"
import { authService } from "./authService"
import { httpClient } from "./api/httpClient"
import type { Interview, InterviewType, InterviewStatus } from "../types/interview"
import type { MockInterview } from "../types/pipeline"
import { initialInterviews } from "../data/pipelineMockData"

export type { Interview, InterviewType, InterviewStatus, MockInterview }

const CANDIDATE_STORAGE_KEY = "hiresmart_interviews"
const RECRUITER_STORAGE_KEY = "hiresmart_recruiter_interviews"

function recruiterStorageKey() {
  if (env.useMock) return RECRUITER_STORAGE_KEY
  return `${RECRUITER_STORAGE_KEY}_${authService.getCurrentUser()?.id ?? "anonymous"}`
}

export interface InterviewSchedule {
  applicationId: string
  candidateId: string
  candidateName: string
  jobTitle: string
  date: string
  time: string
  duration: string
  type: string
  interviewer: string
  notes: string
  mode?: "video" | "phone" | "onsite"
  meetingLink?: string
  location?: string
}

function localInterviewDate(value: string) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function interviewPayload(data: InterviewSchedule) {
  return {
    applicationId: data.applicationId,
    scheduledAt: new Date(`${data.date}T${data.time}`).toISOString(),
    title: data.type,
    durationMins: Number.parseInt(data.duration, 10),
    mode: data.mode || "video",
    interviewer: data.interviewer,
    meetingLink: data.meetingLink,
    location: data.location,
    notes: data.notes,
  }
}

export const interviewService = {
  async createRecruiterInterview(data: InterviewSchedule) {
    if (env.useMock) {
      const interview: MockInterview = { ...data, id: `int_${Date.now()}`, jobId: "", status: "Scheduled" }
      this.saveRecruiterInterviews([interview, ...this.getRecruiterInterviews()])
      return this.getRecruiterInterviews()
    }
    await httpClient.post("/interviews", interviewPayload(data))
    return this.fetchLiveRecruiterInterviews()
  },

  async rescheduleRecruiterInterview(id: string, data: InterviewSchedule) {
    if (env.useMock) return this.updateRecruiterInterview(id, data)
    await httpClient.patch(`/interviews/${id}`, interviewPayload(data))
    return (await this.fetchLiveRecruiterInterviews()).find(interview => interview.id === id)
  },

  async cancelRecruiterInterview(id: string) {
    if (env.useMock) return this.updateRecruiterInterview(id, { status: "Cancelled" })
    await httpClient.patch(`/interviews/${id}/cancel`)
  },

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
          scheduledAt: item.scheduledAt,
          jobTitle: item.job?.title,
          company: item.job?.companyName,
          durationMins: item.durationMins,
          location: item.location,
          mode: item.mode,
          interviewer: item.interviewer || item.recruiter?.fullName,
          applicationId: item.application?._id || item.application || "",
          candidateId: item.candidate?._id || item.candidate || "",
          jobId: item.job?._id || item.job || "",
          type: (item.title || "Technical") as InterviewType,
          date: item.scheduledAt ? new Date(item.scheduledAt).toISOString().split("T")[0] : "",
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          status: (item.status === "completed" ? "Completed" : item.status === "cancelled" ? "Cancelled" : "Scheduled") as InterviewStatus,
          meetingLink: item.meetingLink || "",
          notes: item.notes || "",
        }))
        return mapped
      }
    } catch (err) {
      console.warn("[InterviewService] Live fetch failed, using cached:", err)
    }
    throw new Error("Couldn’t load interviews. Please try again.")
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

  async fetchLiveRecruiterInterviews(): Promise<MockInterview[]> {
    if (env.useMock) return this.getRecruiterInterviews()
    const recruiterId = authService.getCurrentUser()?.id
    try {
      const res = await httpClient.get<{ success: boolean; data: any[] }>("/interviews")
      if (authService.getCurrentUser()?.id !== recruiterId) return []
      if (res?.data && Array.isArray(res.data)) {
        const mapped: MockInterview[] = res.data.map((item) => ({
          id: item._id,
          applicationId: item.application?._id || item.application,
          candidateId: item.candidate?._id || item.candidate || "",
          candidateName: item.candidate?.fullName || "Candidate",
          jobId: item.job?._id || item.job || "",
          jobTitle: item.job?.title || "Role",
          date: item.scheduledAt ? localInterviewDate(item.scheduledAt) : "",
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          duration: `${item.durationMins || 45} mins`,
          type: item.title || "Technical",
          interviewer: item.interviewer || item.recruiter?.fullName || "Hiring Manager",
          status: item.status === "completed" ? "Completed" : item.status === "cancelled" ? "Cancelled" : "Scheduled",
          feedback: item.notes ? {
            overall: 4,
            technical: 4,
            communication: 4,
            problemSolving: 4,
            comments: item.notes,
            recommendation: "Hire"
          } : undefined,
        }))
        this.saveRecruiterInterviews(mapped)
        return mapped
      }
    } catch (err) {
      console.warn("[InterviewService] Live recruiter interview fetch failed:", err)
    }
    return this.getRecruiterInterviews()
  },

  getRecruiterInterviews(): MockInterview[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(recruiterStorageKey())
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse recruiter interviews", e)
        }
      }
      if (!env.useMock) {
        return []
      }
      this.saveRecruiterInterviews(initialInterviews)
      return initialInterviews
    }
    return env.useMock ? [...initialInterviews] : []
  },

  saveRecruiterInterviews(interviews: MockInterview[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(recruiterStorageKey(), JSON.stringify(interviews))
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
