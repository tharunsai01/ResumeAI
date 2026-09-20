import React, { createContext, useContext, useState } from "react"
import { Outlet } from "react-router-dom"
import { mockSystemHealthData } from "../data/mockAdminSystemHealth"

type SystemHealthData = typeof mockSystemHealthData

interface AdminSystemHealthContextType {
  healthData: SystemHealthData
  refreshHealth: () => void
}

const AdminSystemHealthContext = createContext<AdminSystemHealthContextType | undefined>(undefined)

export const AdminSystemHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthData, setHealthData] = useState<SystemHealthData>(mockSystemHealthData)

  const refreshHealth = () => {
    // Generate a fresh mock timestamp
    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    
    setHealthData(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        lastChecked: `Today at ${timeString}`
      },
      services: prev.services.map(s => ({
        ...s,
        lastChecked: `Today at ${timeString}`
      }))
    }))
  }

  return (
    <AdminSystemHealthContext.Provider value={{ healthData, refreshHealth }}>
      {children}
    </AdminSystemHealthContext.Provider>
  )
}

export const useAdminSystemHealth = () => {
  const context = useContext(AdminSystemHealthContext)
  if (context === undefined) {
    throw new Error("useAdminSystemHealth must be used within an AdminSystemHealthProvider")
  }
  return context
}

export const AdminSystemHealthOutlet = () => {
  return (
    <AdminSystemHealthProvider>
      <Outlet />
    </AdminSystemHealthProvider>
  )
}
