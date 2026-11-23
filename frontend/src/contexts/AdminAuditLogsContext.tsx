import React, { createContext, useContext, useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import type { AuditLog } from "../data/mockAdminAuditLogs"
import { initialAuditLogs } from "../data/mockAdminAuditLogs"

interface AdminAuditLogsContextType {
  auditLogs: AuditLog[]
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void
}

const AdminAuditLogsContext = createContext<AdminAuditLogsContextType | undefined>(undefined)

export const AdminAuditLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  useEffect(() => {
    // In a real app, fetch from API here. Using mock data.
    setAuditLogs([...initialAuditLogs])
  }, [])

  const addLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...log,
      id: `AL-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    setAuditLogs(prev => [newLog, ...prev])
  }

  return (
    <AdminAuditLogsContext.Provider value={{ auditLogs, addLog }}>
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
