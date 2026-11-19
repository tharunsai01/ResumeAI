import { env } from "../config/env"
import { defaultMockSettings } from "../data/mockSettings"
import type { CandidateSettings } from "../data/mockSettings"

const SETTINGS_STORAGE_KEY = "hiresmart_settings"

export const settingsService = {
  getSettings(): CandidateSettings {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
    
    // Initialize with default
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultMockSettings))
    return defaultMockSettings
  },

  saveSettings(settings: CandidateSettings): void {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for settingsService.")
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  },

  updateSettings(updates: Partial<CandidateSettings>): CandidateSettings {
    const current = this.getSettings()
    const updated = { ...current, ...updates }
    this.saveSettings(updated)
    this.applyTheme(updated.appearance.theme)
    return updated
  },

  applyTheme(theme: "Light" | "Dark" | "System"): void {
    const isDark = theme === "Dark" || (theme === "System" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  },

  clearAllLocalData(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem("hiresmart_notifications")
      localStorage.removeItem("hiresmart_notifications_candidate")
      localStorage.removeItem("hiresmart_candidate_profile")
      localStorage.removeItem("hiresmart_saved_jobs")
      localStorage.removeItem("hiresmart_reports")
      localStorage.removeItem("hiresmart_session")
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear()
      }
      window.dispatchEvent(new Event('hiresmart_auth_changed'))
    }
  }
}
