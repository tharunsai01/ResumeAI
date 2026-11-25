import { httpClient } from "./api/httpClient"
import type { AdminComplaint, ComplaintCategory, ComplaintStatus } from "../types/admin"

type ComplaintUser = { _id: string; fullName: string; email: string; role: string }

interface ComplaintRecord {
  _id: string
  title?: string
  description: string
  category: string
  user: ComplaintUser | string | null
  status: string
  createdAt: string
  updatedAt: string
  adminResponse?: string
  resolvedAt?: string
  resolvedBy?: ComplaintUser | string
}

const categories: Record<string, ComplaintCategory> = {
  account: "Account",
  resume: "Resume",
  ai_screening: "AI & Matching",
  job_posting: "Job/Recruiter",
  technical: "Technical",
  safety: "Privacy & Security",
}

const statuses: Record<string, ComplaintStatus> = {
  open: "Open",
  in_review: "In Review",
  in_progress: "In Review",
  resolved: "Resolved",
  closed: "Closed",
  dismissed: "Closed",
}

const apiStatuses: Record<ComplaintStatus, string> = {
  Open: "open",
  "In Review": "in_review",
  Resolved: "resolved",
  Closed: "closed",
}

export function mapComplaint(record: ComplaintRecord): AdminComplaint {
  const user = typeof record.user === "object" ? record.user : null
  const status = statuses[record.status] ?? "Open"
  const date = (value: string) => new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  })
  return {
    id: record._id,
    subject: record.title || "Complaint",
    description: record.description,
    submittedBy: {
      id: user?._id ?? "",
      name: user?.fullName || user?.email || "Unknown user",
      email: user?.email ?? "",
    },
    role: user?.role === "recruiter" ? "Recruiter" : user?.role === "admin" ? "Admin" : "Candidate",
    category: categories[record.category] ?? "Other",
    priority: "Medium",
    status,
    createdAt: date(record.createdAt),
    updatedAt: date(record.updatedAt),
    resolutionNotes: record.adminResponse,
    resolvedAt: record.resolvedAt ? date(record.resolvedAt) : undefined,
    resolvedBy: typeof record.resolvedBy === "object" ? record.resolvedBy.fullName : undefined,
    activity: [{ action: "Complaint submitted", time: date(record.createdAt) }],
  }
}

export const complaintService = {
  async submit(title: string, description: string, category: string) {
    return (await httpClient.post<{ data: ComplaintRecord }>("/complaints", { title, description, category })).data
  },
  async listMine() {
    return (await httpClient.get<{ data: ComplaintRecord[] }>("/complaints/my")).data
  },
  async listForAdmin() {
    return (await httpClient.get<{ data: ComplaintRecord[] }>("/admin/complaints")).data.map(mapComplaint)
  },
  async updateStatus(id: string, status: ComplaintStatus, notes?: string) {
    return (await httpClient.patch<{ data: ComplaintRecord }>(`/admin/complaints/${id}`, {
      status: apiStatuses[status], adminResponse: notes,
    })).data
  },
}
