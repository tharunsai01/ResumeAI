/**
 * HireSmart AI - Admin Dashboard Service
 * Provides platform statistics, audit logs overview, AI evaluation metrics,
 * system health diagnostics, live backend connectivity probing, and taxonomy status.
 */

import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { ApiError } from "./api/apiError"
import {
  adminDashboardStats,
  platformActivityData,
  complaintOverview,
  aiEvaluationOverview,
  auditActivities,
  systemHealth,
  skillTaxonomyOverview,
} from "../data/mockAdminDashboard"
import type {
  BackendHealthData,
  BackendHealthResponse,
  HealthConnectionState,
  LiveHealthStatus,
} from "../types/admin"

export type {
  BackendHealthData,
  BackendHealthResponse,
  HealthConnectionState,
  LiveHealthStatus,
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const remainingSecs = seconds % 60
  if (mins < 60) return `${mins}m ${remainingSecs}s`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  if (hours < 24) return `${hours}h ${remainingMins}m`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
}

export const adminDashboardService = {
  getStats() {
    return adminDashboardStats
  },

  async fetchLiveStats() {
    if (env.useMock) {
      return adminDashboardStats
    }
    try {
      const res = await httpClient.get<{ success: boolean; data: any }>("/admin/stats")
      if (res?.data) {
        const d = res.data
        return {
          ...adminDashboardStats,
          totalUsers: {
            value: d.users?.total ?? adminDashboardStats.totalUsers.value,
            breakdown: {
              candidates: d.users?.candidates ?? 0,
              recruiters: d.users?.recruiters ?? 0,
              administrators: d.users?.admins ?? 0,
            },
          },
          activeJobs: {
            ...adminDashboardStats.activeJobs,
            value: d.jobs?.active ?? adminDashboardStats.activeJobs.value,
          },
          resumesProcessed: {
            ...adminDashboardStats.resumesProcessed,
            value: d.resumes?.total ?? adminDashboardStats.resumesProcessed.value,
          },
          overview: {
            totalUsers: d.users?.total ?? 0,
            totalJobs: d.jobs?.total ?? 0,
            totalApplications: d.applications?.total ?? 0,
            totalResumes: d.resumes?.total ?? 0,
          },
          liveRaw: d,
        }
      }
    } catch (err) {
      console.warn("[AdminDashboardService] Live stats fetch failed, fallback to mock:", err)
    }
    return adminDashboardStats
  },

  getPlatformActivity() {
    return platformActivityData
  },

  getComplaintOverview() {
    return complaintOverview
  },

  getAiEvaluationOverview() {
    return aiEvaluationOverview
  },

  getAuditActivities() {
    return auditActivities
  },

  /**
   * Synchronous mock accessor preserving fast initial rendering and mock mode data.
   */
  getSystemHealth() {
    return systemHealth
  },

  getSkillTaxonomyOverview() {
    return skillTaxonomyOverview
  },

  /**
   * Performs a health check against the live backend API gateway (GET /api/v1/health)
   * or returns a simulated health state when running in offline mock mode.
   */
  async checkBackendHealth(): Promise<LiveHealthStatus> {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })

    // When mock mode is enabled, return simulated healthy connection without network calls
    if (env.useMock) {
      return {
        healthy: true,
        state: "connected",
        uptime: "99.9%",
        databaseStatus: "connected",
        lastChecked: timestamp,
        details: {
          status: "ok",
          uptime: 86400,
          timestamp: new Date().toISOString(),
          database: "connected",
        },
      }
    }

    const endpoint = httpClient.baseUrl.endsWith("/v1") ? "/health" : "/v1/health"

    try {
      const response = await httpClient.get<BackendHealthResponse>(endpoint, { timeoutMs: 5000 })
      const healthData = response?.data || (response as unknown as BackendHealthData)

      const isDbConnected = healthData?.database === "connected"
      const isOk = healthData?.status === "ok"
      const isHealthy = Boolean(isOk && isDbConnected)

      return {
        healthy: isHealthy,
        state: isHealthy ? "connected" : "degraded",
        uptime: typeof healthData?.uptime === "number" ? formatUptime(healthData.uptime) : "Operational",
        databaseStatus: String(healthData?.database || "unknown"),
        details: healthData,
        lastChecked: timestamp,
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.isTimeout) {
          return {
            healthy: false,
            state: "timeout",
            uptime: "Timed out",
            databaseStatus: "unknown",
            error: "Request timed out after 5,000ms",
            lastChecked: timestamp,
          }
        }
        return {
          healthy: false,
          state: "unavailable",
          uptime: "Unavailable",
          databaseStatus: "offline",
          error: err.message,
          lastChecked: timestamp,
        }
      }

      const message = err instanceof Error ? err.message : "Failed to connect to backend service"
      return {
        healthy: false,
        state: "unavailable",
        uptime: "Unavailable",
        databaseStatus: "offline",
        error: message,
        lastChecked: timestamp,
      }
    }
  },
}
