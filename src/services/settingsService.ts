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
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
    localStorage.removeItem("hiresmart_notifications")
    localStorage.removeItem("hiresmart_candidate_profile")
    // Note: there might be other local storage keys, we clear these for now
  }
}
