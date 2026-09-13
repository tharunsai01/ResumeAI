import * as React from "react"
import { motion } from "framer-motion"
import { Briefcase, Users, Search, CheckCircle2, Calendar, Award, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { applicationService } from "../../services/applicationService"
import { jobService } from "../../services/jobService"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    activeJobs: 0,
    totalCandidates: 0,
    aiScreened: 0,
    shortlisted: 0,
    interviews: 0,
    hired: 0
  })
  const [recentJobs, setRecentJobs] = React.useState<{job: Job, applicants: number}[]>([])
  
  React.useEffect(() => {
    const fetchData = async () => {
      const allApps = applicationService.getApplications()
      const allJobs = await jobService.getJobs()
      
      const activeJobs = allJobs.length
      const totalCandidates = allApps.length
      const aiScreened = allApps.filter(a => a.aiScreening || a.status !== "Applied").length
      const shortlisted = allApps.filter(a => ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.status)).length
      const interviews = allApps.filter(a => ["Interview", "Offer", "Hired"].includes(a.status)).length
      const hired = allApps.filter(a => a.status === "Hired").length

      setStats({ activeJobs, totalCandidates, aiScreened, shortlisted, interviews, hired })
      
      const recent = allJobs.slice(0, 4).map(job => ({
        job,
        applicants: allApps.filter(a => a.jobId === job.id).length
      }))
      setRecentJobs(recent)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div variants={slideUp}>
      <Card className="hover:border-brand-indigo/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-brand-navy/60">{title}</p>
            <h3 className="text-3xl font-display font-bold text-brand-navy mt-1">
              {loading ? "-" : value}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const pipelineStages = [
    { label: "Applied", value: stats.totalCandidates },
    { label: "Screened", value: stats.aiScreened },
    { label: "Shortlisted", value: stats.shortlisted },
    { label: "Interview", value: stats.interviews },
    { label: "Hired", value: stats.hired }
  ]

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Good morning, Recruiter</h1>
            <p className="text-brand-navy/60 mt-1">Here's an overview of your recruitment activity.</p>
          </div>
          <Button onClick={() => navigate("/recruiter/jobs/create")} className="shrink-0 px-6">
            Create New Job
          </Button>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="bg-brand-indigo/10 text-brand-indigo" />
          <StatCard title="Total Candidates" value={stats.totalCandidates} icon={Users} color="bg-brand-blue/10 text-brand-blue" />
          <StatCard title="AI Screened" value={stats.aiScreened} icon={Search} color="bg-semantic-info/10 text-semantic-info" />
          <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} color="bg-semantic-warning/10 text-semantic-warning" />
          <StatCard title="Interviews" value={stats.interviews} icon={Calendar} color="bg-semantic-success/10 text-semantic-success" />
          <StatCard title="Hired" value={stats.hired} icon={Award} color="bg-emerald-500/10 text-emerald-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidate Pipeline */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Candidate Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4">
                  {pipelineStages.map((stage, i) => (
                    <React.Fragment key={stage.label}>
                      <div className="flex flex-col items-center flex-1">
                        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center border-2 border-brand-indigo/20 mb-3 relative z-10">
                          <span className="text-xl font-bold text-brand-indigo">{loading ? "-" : stage.value}</span>
                        </div>
                        <span className="text-sm font-medium text-brand-navy/70">{stage.label}</span>
                      </div>
                      {i < pipelineStages.length - 1 && (
                        <div className="hidden sm:block h-0.5 bg-brand-gray/50 flex-1 mx-2 relative top-[-15px] max-w-[40px]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Screening Summary */}
          <motion.div variants={slideUp}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>AI Screening Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end border-b border-brand-gray/30 pb-3">
                  <span className="text-brand-navy/60">Average Match</span>
                  <span className="text-2xl font-bold text-brand-navy">78%</span>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-semantic-success" /> Strong Matches
                    </span>
                    <span className="font-semibold">{loading ? "-" : Math.round(stats.aiScreened * 0.22)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-semantic-warning" /> Potential Matches
                    </span>
                    <span className="font-semibold">{loading ? "-" : Math.round(stats.aiScreened * 0.38)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-semantic-error" /> Low Matches
                    </span>
                    <span className="font-semibold">{loading ? "-" : Math.round(stats.aiScreened * 0.40)}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/recruiter/screening")}>
                  Run Screening
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Jobs */}
        <motion.div variants={slideUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Recent Jobs</h2>
            <Button variant="ghost" onClick={() => navigate("/recruiter/jobs")} className="text-brand-indigo text-sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light text-brand-navy/60 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job Title</th>
                    <th className="px-6 py-4 font-semibold">Department</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Applicants</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/30">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-3/4"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/2"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/2"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/4"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-brand-gray/30 rounded-full w-16"></div></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  ) : recentJobs.map(({ job, applicants }) => (
                    <tr key={job.id} className="hover:bg-brand-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-brand-navy">{job.title}</div>
                        <div className="text-xs text-brand-navy/50">{job.type}</div>
                      </td>
                      <td className="px-6 py-4 text-brand-navy/70">{job.category}</td>
                      <td className="px-6 py-4 text-brand-navy/70">{job.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-indigo" />
                          <span className="font-medium">{applicants}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-semantic-success/10 text-semantic-success">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/recruiter/jobs/${job.id}`)}>
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
