import React, { createContext, useContext, useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { defaultMockAdminAccount } from "../data/mockAdminSettings"
import type { AdminAccountState } from "../data/mockAdminSettings"
import { settingsService } from "../services/settingsService"

interface AdminSettingsContextType {
  settings: AdminAccountState
  updateSettings: (section: keyof AdminAccountState, newValues: any) => void
  signoutOtherSessions: () => void
}

const AdminSettingsContext = createContext<AdminSettingsContextType | undefined>(undefined)

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminAccountState>(defaultMockAdminAccount)

  // On mount, apply the theme from appearance settings
  useEffect(() => {
    settingsService.applyTheme(settings.appearance.theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateSettings = (section: keyof AdminAccountState, newValues: any) => {
    setSettings(prev => {
      let updatedValue;
      if (typeof prev[section] === 'object' && prev[section] !== null && !Array.isArray(prev[section])) {
        updatedValue = { ...prev[section], ...newValues };
      } else {
        updatedValue = newValues;
      }
      
      const updated = {
        ...prev,
        [section]: updatedValue
      }
      
      // If appearance changed, apply theme
      if (section === 'appearance' && newValues.theme) {
        settingsService.applyTheme(newValues.theme)
      }
      
      return updated
    })
  }

  const signoutOtherSessions = () => {
    setSettings(prev => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        activeList: prev.sessions.activeList.filter(s => s.isCurrent)
      }
    }))
  }

  return (
    <AdminSettingsContext.Provider value={{ settings, updateSettings, signoutOtherSessions }}>
      {children}
    </AdminSettingsContext.Provider>
  )
}

export const useAdminSettings = () => {
  const context = useContext(AdminSettingsContext)
  if (context === undefined) {
    throw new Error("useAdminSettings must be used within an AdminSettingsProvider")
  }
  return context
}

export const AdminSettingsOutlet = () => {
  return (
    <AdminSettingsProvider>
      <Outlet />
    </AdminSettingsProvider>
  )
}
