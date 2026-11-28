import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { env } from "../../config/env"
import { httpClient } from "../../services/api/httpClient"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Users, AlertOctagon, Activity, Briefcase, FileText } from "lucide-react"

import { adminDashboardService } from "../../services/adminDashboardService"
import { PlatformActivityChart } from "../../components/admin/dashboard/PlatformActivityChart"
import { ComplaintOverview } from "../../components/admin/dashboard/ComplaintOverview"
import { AiOverview } from "../../components/admin/dashboard/AiOverview"
import { RecentAuditActivity } from "../../components/admin/dashboard/RecentAuditActivity"
import { SystemHealthOverview } from "../../components/admin/dashboard/SystemHealthOverview"
import { SkillTaxonomyOverview } from "../../components/admin/dashboard/SkillTaxonomyOverview"
import { QuickActions } from "../../components/admin/dashboard/QuickActions"

interface DashboardStats {
  users: { total: number }
  jobs: { active: number }
  complaints: { pending: number }
  resumes: { total: number }
  applications: { total: number; statusDistribution: Record<string, number> }
  recentActivity: {
    users: { _id: string; fullName: string; role: string }[]
    jobs: { _id: string; title: string; companyName: string; status: string }[]
    auditLogs: { _id: string; action: string; createdAt: string }[]
  }
  systemHealth: { database: string; uptimeSeconds: number }
}

function DashboardPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-brand-gray/30 bg-white px-5 py-4 shadow-sm dark:bg-slate-900">
      <h2 className="mb-3 border-b border-brand-gray/30 pb-3 text-base font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function LiveAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>()
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void httpClient.get<{ data: DashboardStats }>("/admin/stats")
      .then(({ data }) => { if (active) setStats(data) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <AdminShell>
      <AdminPageHeader title="Dashboard" description="Monitor hiring activity, account changes, and platform health." />
      {error && <p role="alert">Unable to load platform statistics.</p>}
      {!stats && !error && <p role="status">Loading platform statistics…</p>}
      {stats && <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <AdminStatCard title="Total Users" value={stats.users.total} icon={Users} />
          <AdminStatCard title="Active Jobs" value={stats.jobs.active} icon={Briefcase} />
          <AdminStatCard title="Applications" value={stats.applications.total} icon={Activity} />
          <AdminStatCard title="Open Complaints" value={stats.complaints.pending} icon={AlertOctagon} />
          <AdminStatCard title="Résumés Uploaded" value={stats.resumes.total} icon={FileText} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-4 mb-4">
          <DashboardPanel title="Application Pipeline">
            {Object.entries(stats.applications.statusDistribution).filter(([, count]) => count > 0).map(([status, count]) => (
              <div key={status} className="mb-3 last:mb-0">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize">{status}</span><span className="tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-indigo-500" style={{width: `${100 * count / Math.max(stats.applications.total, 1)}%`}} />
                </div>
              </div>
            ))}
            {stats.applications.total === 0 && <p className="text-sm text-slate-500">No applications yet.</p>}
          </DashboardPanel>
          <DashboardPanel title="Recent Users">
            {!stats.recentActivity.users.length && <p>No users yet.</p>}
            <ul className="divide-y divide-brand-gray/20">
              {stats.recentActivity.users.map(user => <li key={user._id} className="py-2">
                <Link className="font-medium hover:text-brand-indigo" to={`/admin/users/${user._id}`}>{user.fullName}</Link>
                <p className="text-sm capitalize text-brand-navy/60 dark:text-white/60">{user.role === "admin" ? "Administrator" : user.role}</p>
              </li>)}
            </ul>
            <Link className="text-brand-indigo text-sm font-medium" to="/admin/users">Manage users</Link>
          </DashboardPanel>
          <DashboardPanel title="Recent Jobs">
            {!stats.recentActivity.jobs.length && <p>No jobs yet.</p>}
            <ul className="divide-y divide-brand-gray/20">
              {stats.recentActivity.jobs.map(job => <li key={job._id} className="flex justify-between gap-3 py-2">
                <div className="min-w-0"><p className="font-medium break-words">{job.title}</p><p className="text-sm text-brand-navy/60 dark:text-white/60">{job.companyName}</p></div>
                <span className="h-fit rounded-full bg-indigo-50 px-2 py-0.5 text-xs capitalize text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{job.status}</span>
              </li>)}
            </ul>
          </DashboardPanel>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DashboardPanel title="Recent Audit Activity">
              {!stats.recentActivity.auditLogs.length && <p>No audit events yet.</p>}
              <ul className="divide-y divide-brand-gray/20">
                {stats.recentActivity.auditLogs.map(log => <li key={log._id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span className="capitalize">{log.action.toLowerCase().replaceAll("_", " ")}</span>
                  <time dateTime={log.createdAt} className="text-brand-navy/60 dark:text-white/60">{new Date(log.createdAt).toLocaleString()}</time>
                </li>)}
              </ul>
              <Link className="text-brand-indigo text-sm font-medium" to="/admin/audit-logs">View audit logs</Link>
            </DashboardPanel>
          </div>
          <DashboardPanel title="Backend Status">
            <p>Database {stats.systemHealth.database}</p>
            <p className="mt-2 text-sm text-brand-navy/60 dark:text-white/60">Backend uptime {Math.floor(stats.systemHealth.uptimeSeconds / 60)} min</p>
          </DashboardPanel>
        </div>
      </>}
    </AdminShell>
  )
}

export default function AdminDashboard() {
  if (!env.useMock) return <LiveAdminDashboard />
  const { totalUsers, activeUsers, activeJobs, openComplaints, resumesProcessed, aiEvaluationStatus } = adminDashboardService.getStats()

  return (
    <AdminShell>
      <AdminPageHeader 
        title="Dashboard" 
        description="Overview of platform activity, AI evaluation, security, and system health."
        statusIndicator={{ label: "All systems operational", isHealthy: true }}
      />
      
      {/* TOP STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <AdminStatCard 
          title="Total Users" 
          value={totalUsers.value.toLocaleString()} 
          icon={Users} 
          delay={1}
          trend={{ value: `${totalUsers.breakdown.candidates} candidates`, isPositive: true }}
          color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }}
        />
        <AdminStatCard 
          title="Active Users" 
          value={activeUsers.value.toLocaleString()} 
          icon={Users} 
          delay={2}
          trend={activeUsers.trend}
          color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }}
        />
        <AdminStatCard 
          title="Active Jobs" 
          value={activeJobs.value.toLocaleString()} 
          icon={Briefcase} 
          delay={3}
          trend={activeJobs.trend}
          color={{ bg: "bg-brand-violet/10", text: "text-brand-violet" }}
        />
        <AdminStatCard 
          title="Open Complaints" 
          value={openComplaints.value} 
          icon={AlertOctagon} 
          delay={4}
          color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }}
          trend={{ value: `${openComplaints.highPriority} high priority`, isPositive: false }}
        />
        <AdminStatCard 
          title="Resumes Processed" 
          value={resumesProcessed.value.toLocaleString()} 
          icon={FileText} 
          delay={5}
          color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }}
          trend={resumesProcessed.trend}
        />
        <AdminStatCard 
          title="AI Evaluation" 
          value={aiEvaluationStatus.value} 
          icon={Activity} 
          delay={6}
          color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }}
          trend={{ value: aiEvaluationStatus.lastEvaluation, isPositive: true }}
        />
      </div>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <PlatformActivityChart />
        <ComplaintOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <AiOverview />
        <SystemHealthOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <RecentAuditActivity />
        <div className="flex flex-col gap-4 sm:gap-6">
          <SkillTaxonomyOverview />
          <QuickActions />
        </div>
      </div>

    </AdminShell>
  )
}
