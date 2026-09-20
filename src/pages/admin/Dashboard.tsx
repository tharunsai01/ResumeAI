import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Users, AlertOctagon, Activity, Briefcase, FileText } from "lucide-react"

import { adminDashboardStats } from "../../data/mockAdminDashboard"
import { PlatformActivityChart } from "../../components/admin/dashboard/PlatformActivityChart"
import { ComplaintOverview } from "../../components/admin/dashboard/ComplaintOverview"
import { AiOverview } from "../../components/admin/dashboard/AiOverview"
import { RecentAuditActivity } from "../../components/admin/dashboard/RecentAuditActivity"
import { SystemHealthOverview } from "../../components/admin/dashboard/SystemHealthOverview"
import { SkillTaxonomyOverview } from "../../components/admin/dashboard/SkillTaxonomyOverview"
import { QuickActions } from "../../components/admin/dashboard/QuickActions"

export default function AdminDashboard() {
  const { totalUsers, activeUsers, activeJobs, openComplaints, resumesProcessed, aiEvaluationStatus } = adminDashboardStats

  return (
    <AdminShell>
      <AdminPageHeader 
        title="Dashboard" 
        description="Overview of platform activity, AI evaluation, security, and system health."
        statusIndicator={{ label: "All systems operational", isHealthy: true }}
      />
      
      {/* TOP STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PlatformActivityChart />
        <ComplaintOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AiOverview />
        <SystemHealthOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <RecentAuditActivity />
        <div className="flex flex-col gap-6">
          <SkillTaxonomyOverview />
          <QuickActions />
        </div>
      </div>

    </AdminShell>
  )
}
