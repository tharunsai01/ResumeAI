import React, { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { Outlet } from "react-router-dom"
import { mockAdminComplaints } from "../data/mockAdminComplaints"
import type { AdminComplaint, ComplaintStatus, ComplaintPriority } from "../data/mockAdminComplaints"
import { authService } from "../services/authService"

interface AdminComplaintsContextType {
  complaints: AdminComplaint[]
  setComplaints: React.Dispatch<React.SetStateAction<AdminComplaint[]>>
  updateComplaintStatus: (id: string, status: ComplaintStatus, resolutionNotes?: string) => void
  updateComplaintPriority: (id: string, priority: ComplaintPriority) => void
  addInternalNote: (id: string, note: string) => void
  getComplaintById: (id: string) => AdminComplaint | undefined
}

const AdminComplaintsContext = createContext<AdminComplaintsContextType | undefined>(undefined)

export function AdminComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<AdminComplaint[]>(mockAdminComplaints)

  const getCurrentAdminName = () => {
    const user = authService.getCurrentUser()
    return user ? user.name : "Admin User"
  }

  const updateComplaintStatus = (id: string, status: ComplaintStatus, resolutionNotes?: string) => {
    const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    const adminName = getCurrentAdminName()
    
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
      complaints, setComplaints, updateComplaintStatus, updateComplaintPriority, addInternalNote, getComplaintById 
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
