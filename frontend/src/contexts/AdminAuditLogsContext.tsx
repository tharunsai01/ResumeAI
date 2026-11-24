import React, { createContext, useContext, useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import type { AuditLog } from "../data/mockAdminAuditLogs"
import { initialAuditLogs } from "../data/mockAdminAuditLogs"

import { env } from "../config/env"
import { httpClient } from "../services/api/httpClient"

interface ApiAuditLog {
  _id: string
  action: string
  actorId?: string
  actorEmail?: string
  actorRole?: string
  targetType?: string
  targetId?: string
  createdAt: string
  status: "success" | "failure"
  details?: AuditLog["metadata"]
}

function eventType(action: string): AuditLog["eventType"] {
  if (/^(ADMIN_USER_|USER_)/.test(action)) return "User Management"
  if (action.startsWith("COMPLAINT_")) return "Complaint"
  if (action.startsWith("SKILL_")) return "Skill Taxonomy"
  if (action.startsWith("AI_")) return "AI Processing"
  if (action === "ADMIN_AI_EVALUATION_TRIGGER") return "AI Configuration"
  if (action.startsWith("AUTH_")) return "Authentication"
  if (/^(JOB_|ADMIN_JOB_|APPLICATION_|INTERVIEW_|RECRUITER_)/.test(action)) return "Recruitment Activity"
  return "System"
}

function toAuditLog(log: ApiAuditLog): AuditLog {
  const roles: Record<string, AuditLog["actorRole"]> = { admin: "Administrator", candidate: "Candidate", recruiter: "Recruiter" }
  return {
    id: log._id,
    eventType: eventType(log.action),
    description: log.action === "ADMIN_USER_STATUS_UPDATE"
      ? `User status changed to ${log.details?.newStatus ?? "unknown"}`
      : log.action.replaceAll("_", " "),
    actorId: log.actorId ?? "",
    actorName: log.actorEmail || roles[log.actorRole ?? ""] || "System",
    actorRole: roles[log.actorRole ?? ""] ?? "System",
    resourceType: log.targetType ?? "System",
    resourceId: log.targetId ?? "—",
    severity: log.status === "failure" ? "Warning" : "Info",
    timestamp: log.createdAt,
    metadata: log.details,
  }
}

interface AdminAuditLogsContextType {
  auditLogs: AuditLog[]
  loadError: boolean
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void
}

const AdminAuditLogsContext = createContext<AdminAuditLogsContextType | undefined>(undefined)

export const AdminAuditLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (env.useMock) {
      setAuditLogs(initialAuditLogs)
      return
    }
    let active = true
    void httpClient.get<{ data: { logs: ApiAuditLog[] } }>("/admin/audit-logs?limit=100")
      .then(({ data }) => { if (active) setAuditLogs(data.logs.map(toAuditLog)) })
      .catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [])

  const addLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    if (!env.useMock) return
    const newLog: AuditLog = {
      ...log,
      id: `AL-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  return (
    <AdminAuditLogsContext.Provider value={{ auditLogs, loadError, addLog }}>
      {children}
    </AdminAuditLogsContext.Provider>
  )
}

export const useAdminAuditLogs = () => {
  const context = useContext(AdminAuditLogsContext)
  if (context === undefined) {
    throw new Error("useAdminAuditLogs must be used within an AdminAuditLogsProvider")
  }
  return context
}

export const AdminAuditLogsOutlet = () => {
  return (
    <AdminAuditLogsProvider>
      <Outlet />
    </AdminAuditLogsProvider>
  )
}
