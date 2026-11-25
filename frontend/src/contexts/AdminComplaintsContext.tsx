import React, { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { mockAdminComplaints } from "../data/mockAdminComplaints"
import type { AdminComplaint, ComplaintStatus, ComplaintPriority } from "../data/mockAdminComplaints"
import { authService } from "../services/authService"

import { env } from "../config/env"
import { complaintService, mapComplaint } from "../services/complaintService"

interface AdminComplaintsContextType {
  loading: boolean
  loadError: string
  complaints: AdminComplaint[]
  setComplaints: React.Dispatch<React.SetStateAction<AdminComplaint[]>>
  updateComplaintStatus: (id: string, status: ComplaintStatus, resolutionNotes?: string) => Promise<void>
  updateComplaintPriority: (id: string, priority: ComplaintPriority) => void
  addInternalNote: (id: string, note: string) => void
  getComplaintById: (id: string) => AdminComplaint | undefined
}

const AdminComplaintsContext = createContext<AdminComplaintsContextType | undefined>(undefined)

export function AdminComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<AdminComplaint[]>(env.useMock ? mockAdminComplaints : [])
  const [loading, setLoading] = useState(!env.useMock)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    if (env.useMock) return
    let active = true
    complaintService.listForAdmin().then(items => {
      if (active) setComplaints(items)
    }).catch(() => {
      if (active) setLoadError("Unable to load complaints. Refresh to retry.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const getCurrentAdminName = () => {
    const user = authService.getCurrentUser()
    return user ? user.name : "Admin User"
  }

  const updateComplaintStatus = async (id: string, status: ComplaintStatus, resolutionNotes?: string) => {
    const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    const adminName = getCurrentAdminName()
    
    if (!env.useMock) {
      const saved = mapComplaint(await complaintService.updateStatus(id, status, resolutionNotes))
      setComplaints(previous => previous.map(complaint => complaint.id === id ? {
        ...complaint,
        status: saved.status,
        updatedAt: saved.updatedAt,
        resolutionNotes: saved.resolutionNotes,
        resolvedAt: saved.resolvedAt,
      } : complaint))
      return
    }

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status, updatedAt: now.split(',')[0] }
        
        updated.activity = [
          ...c.activity, 
          { action: `Status changed to ${status}`, time: now, admin: adminName }
        ]

        if (status === "Resolved") {
          updated.resolutionNotes = resolutionNotes || c.resolutionNotes
          updated.resolvedBy = adminName
          updated.resolvedAt = now.split(',')[0]
        }
        return updated
      }
      return c
    }))
  }

  const updateComplaintPriority = (id: string, priority: ComplaintPriority) => {
    const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    const adminName = getCurrentAdminName()

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          priority, 
          updatedAt: now.split(',')[0],
          activity: [
            ...c.activity, 
            { action: `Priority changed to ${priority}`, time: now, admin: adminName }
          ]
        }
      }
      return c
    }))
  }

  const addInternalNote = (id: string, note: string) => {
    const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    const adminName = getCurrentAdminName()

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          updatedAt: now.split(',')[0],
          activity: [
            ...c.activity,
            { action: `Internal note added: "${note}"`, time: now, admin: adminName }
          ]
        }
      }
      return c
    }))
  }

  const getComplaintById = (id: string) => {
    return complaints.find(c => c.id === id)
  }

  return (
    <AdminComplaintsContext.Provider value={{ 
      complaints, loading, loadError, setComplaints, updateComplaintStatus, updateComplaintPriority, addInternalNote, getComplaintById
    }}>
      {children}
    </AdminComplaintsContext.Provider>
  )
}

export function AdminComplaintsOutlet() {
  return (
    <AdminComplaintsProvider>
      <Outlet />
    </AdminComplaintsProvider>
  )
}

export function useAdminComplaints() {
  const context = useContext(AdminComplaintsContext)
  if (context === undefined) {
    throw new Error("useAdminComplaints must be used within an AdminComplaintsProvider")
  }
  return context
}
