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

const ADMIN_SETTINGS_STORAGE_KEY = "hiresmart_admin_settings"

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminAccountState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Fallback to default
        }
      }
    }
    return defaultMockAdminAccount
  })

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

      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(updated))
      }
      
      // If appearance changed, apply theme
      if (section === 'appearance' && newValues.theme) {
        settingsService.applyTheme(newValues.theme)
      }
      
      return updated
    })
  }

  const signoutOtherSessions = () => {
    setSettings(prev => {
      const updated = {
        ...prev,
        sessions: {
          ...prev.sessions,
          activeList: prev.sessions.activeList.filter(s => s.isCurrent)
        }
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(updated))
      }
      return updated
    })
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
