export type HealthStatus = "Operational" | "Degraded" | "Unavailable"

export interface ServiceEvent {
  message: string
  severity: "Info" | "Warning" | "Critical"
  time: string
}

export interface ServiceHealth {
  id: string
  name: string
  status: HealthStatus
  responseTime: string
  lastChecked: string
  details?: Record<string, string | number>
  recentEvents: ServiceEvent[]
}

export interface SystemEvent {
  event: string
  severity: "Info" | "Warning" | "Critical"
  time: string
}

export interface HealthHistoryPoint {
  time: string
  value: number
}

export const mockSystemHealthData = {
  summary: {
    overallStatus: "Operational" as HealthStatus,
    uptime: "99.9%",
    lastChecked: "Just now"
  },
  services: [
    {
      id: "app",
      name: "Application",
      status: "Operational",
      responseTime: "124 ms",
      lastChecked: "Just now",
      details: {
        "Version": "demo-v1.0.0",
        "Environment": "Development",
        "Uptime": "99.9%",
        "Last Restart": "18 Sep 2026",
        "Active Sessions": 124
      },
      recentEvents: [
        { message: "Application restarted successfully", severity: "Info", time: "18 Sep 2026 · 02:00" },
        { message: "Health check passed", severity: "Info", time: "Just now" }
      ]
    },
    {
      id: "api",
      name: "API Services",
      status: "Operational",
      responseTime: "118 ms",
      lastChecked: "Just now",
      details: {
        "Authentication API": "Operational (98ms)",
        "User API": "Operational (110ms)",
        "Resume API": "Operational (145ms)",
        "Job API": "Operational (112ms)",
        "AI Screening API": "Operational (125ms)",
        "Admin API": "Operational (95ms)"
      },
      recentEvents: [
        { message: "API response time increased momentarily", severity: "Warning", time: "20 Sep 2026 · 14:22" }
      ]
    },
    {
      id: "db",
      name: "Database",
      status: "Operational",
      responseTime: "32 ms",
      lastChecked: "Just now",
      details: {
        "Connection": "Healthy",
        "Active Connections": 18,
        "Database Usage": "42%",
        "Queries/sec": 145
      },
      recentEvents: [
        { message: "Database health check completed", severity: "Info", time: "19 Sep 2026 · 16:12" },
        { message: "Connection pool normal", severity: "Info", time: "Just now" }
      ]
    },
    {
      id: "auth",
      name: "Authentication",
      status: "Operational",
      responseTime: "86 ms",
      lastChecked: "Just now",
      details: {
        "Verification Service": "Operational",
        "Session Service": "Operational",
        "Successful Sign-ins (24h)": 312,
        "Failed Sign-ins (24h)": 8
      },
      recentEvents: [
        { message: "Auth service health check passed", severity: "Info", time: "Just now" }
      ]
    },
    {
      id: "resume",
      name: "Resume Processing",
      status: "Operational",
      responseTime: "2.4 sec",
      lastChecked: "Just now",
      details: {
        "Documents Processed Today": 186,
        "Successful": 181,
        "Warnings": 5,
        "Failed": 0,
        "Supported Formats": "PDF, DOCX"
      },
      recentEvents: [
        { message: "Resume processing recovered", severity: "Info", time: "20 Sep 2026 · 11:04" }
      ]
    },
    {
      id: "ai",
      name: "AI Processing",
      status: "Operational",
      responseTime: "1.8 sec",
      lastChecked: "Just now",
      details: {
        "Model Version": "demo-model-v1",
        "Requests Today": 428,
        "Successful": 421,
        "Warnings": 7,
        "Failed": 0
      },
      recentEvents: [
        { message: "AI processing warning detected", severity: "Warning", time: "19 Sep 2026 · 18:42" }
      ]
    },
    {
      id: "storage",
      name: "File Storage",
      status: "Operational",
      responseTime: "45 ms",
      lastChecked: "Just now",
      details: {
        "Bucket Status": "Healthy",
        "Storage Used": "142 GB",
        "Bandwidth (24h)": "4.2 GB"
      },
      recentEvents: [
        { message: "Storage health check passed", severity: "Info", time: "Just now" }
      ]
    },
    {
      id: "sys",
      name: "System Resources",
      status: "Operational",
      responseTime: "N/A",
      lastChecked: "Just now",
      details: {
        "CPU Usage": "42%",
        "Memory Usage": "58%",
        "Storage Usage": "37%",
        "Network": "Healthy"
      },
      recentEvents: [
        { message: "Resource utilization stable", severity: "Info", time: "Just now" }
      ]
    }
  ] as ServiceHealth[],
  history: [
    { time: "00:00", value: 99.8 },
    { time: "04:00", value: 99.9 },
    { time: "08:00", value: 99.9 },
    { time: "12:00", value: 99.7 },
    { time: "16:00", value: 99.9 },
    { time: "20:00", value: 99.9 }
  ] as HealthHistoryPoint[],
  events: [
    { event: "API response time increased", severity: "Warning", time: "20 Sep 2026 · 14:22" },
    { event: "Resume processing recovered", severity: "Info", time: "20 Sep 2026 · 11:04" },
    { event: "AI processing warning detected", severity: "Warning", time: "19 Sep 2026 · 18:42" },
    { event: "Database health check completed", severity: "Info", time: "19 Sep 2026 · 16:12" }
  ] as SystemEvent[]
}
