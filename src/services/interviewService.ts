export interface Interview {
  id: string
  applicationId: string
  jobId: string
  candidateId: string
  date: string
  time: string
  type: "Technical" | "HR" | "Managerial" | "Final"
  meetingLink: string
  notes: string
  status: "Scheduled" | "Completed" | "Cancelled"
}

const STORAGE_KEY = "hiresmart_interviews"

export const interviewService = {
  getInterviews(): Interview[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return []
  },

  scheduleInterview(interview: Omit<Interview, "id" | "status">): Interview {
    const interviews = this.getInterviews()
    const newInterview: Interview = {
      ...interview,
      id: Math.random().toString(36).substr(2, 9),
      status: "Scheduled"
    }
    interviews.unshift(newInterview)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews))
      window.dispatchEvent(new Event('hiresmart_interviews_updated'))
    }
    return newInterview
  }
}
