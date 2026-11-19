import { useEffect, useState } from "react"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import { adminDashboardService } from "../../../services/adminDashboardService"
import { Activity, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { env } from "../../../config/env"
import type { LiveHealthStatus } from "../../../types/admin"

export function SystemHealthOverview() {
  const navigate = useNavigate()
  const mockSystemHealth = adminDashboardService.getSystemHealth()

  const [liveHealth, setLiveHealth] = useState<LiveHealthStatus | null>(null)
  const [loading, setLoading] = useState(!env.useMock)

  const fetchHealth = () => {
    if (!env.useMock) {
      adminDashboardService
        .checkBackendHealth()
        .then((res) => setLiveHealth(res))
        .finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  // In offline mock mode, render the standard mock dashboard services
  if (env.useMock) {
    return (
      <PremiumCard className="flex flex-col">
        <PremiumCardHeader className="pb-2">
          <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
            <Activity className="w-5 h-5 text-semantic-success" />
            System Health
          </PremiumCardTitle>
        </PremiumCardHeader>
        <PremiumCardContent className="flex-1 flex flex-col justify-between mt-4">
          <div className="flex items-center justify-between p-4 bg-brand-light rounded-xl border border-brand-gray/30 mb-4">
            <span className="font-semibold text-brand-navy">System Uptime</span>
            <span className="text-xl font-bold text-semantic-success">{mockSystemHealth.uptime}</span>
          </div>

          <div className="space-y-3">
            {mockSystemHealth.services.map((service, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm font-medium text-brand-navy/70">{service.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 font-medium ${
                    service.healthy
                      ? "text-semantic-success bg-semantic-success/10"
                      : "text-semantic-error bg-semantic-error/10"
                  }`}
                >
                  {service.healthy ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-semantic-error animate-pulse" />
                  )}
                  {service.status}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/admin/system-health")}
            className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-navy/80 transition-colors py-2 bg-brand-gray/10 rounded-lg hover:bg-brand-gray/20"
          >
            View System Health <ArrowRight className="w-4 h-4" />
          </button>
        </PremiumCardContent>
      </PremiumCard>
    )
  }

  // Live Backend Mode: render real-time health connectivity and status
  const isHealthy = liveHealth?.healthy && liveHealth?.state === "connected"
  const isTimeout = liveHealth?.state === "timeout"
  const isDegraded = liveHealth?.state === "degraded"
  const isUnavailable = liveHealth?.state === "unavailable"

  const uptimeDisplay = loading
    ? "Checking..."
    : isTimeout
    ? "Timed Out"
    : isUnavailable
    ? "Offline"
    : isDegraded
    ? "Degraded"
    : liveHealth?.uptime || "Operational"

  const uptimeColor = loading
    ? "text-brand-navy/60"
    : isHealthy
    ? "text-semantic-success"
    : isDegraded || isTimeout
    ? "text-semantic-warning"
    : "text-semantic-error"

  return (
    <PremiumCard className="flex flex-col">
      <PremiumCardHeader className="pb-2 flex flex-row items-center justify-between">
        <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isHealthy ? "text-semantic-success" : "text-semantic-warning"}`} />
          System Health
        </PremiumCardTitle>
        <button
          onClick={fetchHealth}
          disabled={loading}
          title="Refresh Health"
          className="p-1.5 text-brand-navy/50 hover:text-brand-navy hover:bg-brand-gray/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col justify-between mt-4">
        <div className="flex items-center justify-between p-4 bg-brand-light rounded-xl border border-brand-gray/30 mb-4">
          <div>
            <span className="font-semibold text-brand-navy block">System Uptime</span>
            <span className="text-[10px] text-brand-navy/50">
              {loading ? "Probing backend..." : `Checked: ${liveHealth?.lastChecked || "Just now"}`}
            </span>
          </div>
          <span className={`text-xl font-bold ${uptimeColor}`}>{uptimeDisplay}</span>
        </div>

        <div className="space-y-3">
          {/* Express Backend Service */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-brand-navy/70">Express Backend (API)</span>
            <span
              className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 font-medium ${
                loading
                  ? "text-brand-navy/60 bg-brand-gray/20"
                  : isHealthy
                  ? "text-semantic-success bg-semantic-success/10"
                  : isTimeout
                  ? "text-semantic-warning bg-semantic-warning/10"
                  : "text-semantic-error bg-semantic-error/10"
              }`}
            >
              {loading ? (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy/40 animate-pulse" />
              ) : isHealthy ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : isTimeout ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-semantic-error animate-pulse" />
              )}
              {loading ? "Probing..." : isHealthy ? "Operational" : isTimeout ? "Timeout" : "Unavailable"}
            </span>
          </div>

          {/* Database (MongoDB) Service */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-brand-navy/70">Database (MongoDB)</span>
            <span
              className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 font-medium ${
                loading
                  ? "text-brand-navy/60 bg-brand-gray/20"
                  : liveHealth?.databaseStatus === "connected"
                  ? "text-semantic-success bg-semantic-success/10"
                  : liveHealth?.databaseStatus === "connecting"
                  ? "text-semantic-warning bg-semantic-warning/10"
                  : "text-semantic-error bg-semantic-error/10"
              }`}
            >
              {loading ? (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-navy/40 animate-pulse" />
              ) : liveHealth?.databaseStatus === "connected" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {loading
                ? "Checking..."
                : liveHealth?.databaseStatus === "connected"
                ? "Connected"
                : liveHealth?.databaseStatus || "Offline"}
            </span>
          </div>

          {/* AI Microservice Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-brand-navy/70">AI Microservice</span>
            <span className="text-xs px-2 py-1 rounded flex items-center gap-1.5 font-medium text-brand-indigo bg-brand-indigo/10">
              <CheckCircle2 className="w-3 h-3" />
              Gateway Mediated
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/system-health")}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-navy/80 transition-colors py-2 bg-brand-gray/10 rounded-lg hover:bg-brand-gray/20"
        >
          View System Health <ArrowRight className="w-4 h-4" />
        </button>
      </PremiumCardContent>
    </PremiumCard>
  )
}
