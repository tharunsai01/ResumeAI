import * as React from "react"
import { motion } from "framer-motion"
import { Briefcase, Search, Plus, Filter, Users, MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { applicationService } from "../../services/applicationService"
import { jobService } from "../../services/jobService"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function RecruiterJobs() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [jobs, setJobs] = React.useState<{job: Job, applicants: number}[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  
  React.useEffect(() => {
    const fetchJobs = async () => {
      const allJobs = await jobService.getJobs()
      const allApps = applicationService.getApplications()
      
      const mapped = allJobs.map(job => ({
        job,
        applicants: allApps.filter(a => a.jobId === job.id).length
      }))
      
      setJobs(mapped)
      setLoading(false)
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(({ job }) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-brand-indigo" /> Jobs Posted
            </h1>
            <p className="text-brand-navy/60 mt-1">Manage your active job listings and track applicants.</p>
          </div>
          <Button onClick={() => navigate("/recruiter/jobs/create")} className="shrink-0 px-6">
            <Plus className="w-4 h-4 mr-2" /> Create Job
          </Button>
        </motion.div>

        <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm p-2 flex items-center relative z-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-10"
            />
          </div>
          <Button variant="outline" className="hidden sm:flex px-4 shrink-0 rounded-xl">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </motion.div>

        <motion.div variants={slideUp}>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light text-brand-navy/60 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Job Title</th>
                    <th className="px-6 py-4 font-semibold">Location / Type</th>
                    <th className="px-6 py-4 font-semibold">Applicants</th>
                    <th className="px-6 py-4 font-semibold">Posted Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/30">
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-3/4"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/2"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/4"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-brand-gray/30 rounded w-1/3"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-brand-gray/30 rounded-full w-16"></div></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  ) : filteredJobs.length > 0 ? (
                    filteredJobs.map(({ job, applicants }) => (
                      <tr key={job.id} className="hover:bg-brand-light/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-brand-navy">{job.title}</div>
                          <div className="text-xs text-brand-navy/50">{job.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-brand-navy/70">{job.location}</div>
                          <div className="text-xs text-brand-navy/50">{job.type}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-brand-indigo" />
                            <span className="font-medium">{applicants}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-brand-navy/70">
                          {job.postedDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-semantic-success/10 text-semantic-success">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate(`/recruiter/screening?jobId=${job.id}`)}>
                              Screen AI
                            </Button>
                            <Button variant="ghost" size="sm" className="px-2" onClick={() => navigate(`/recruiter/jobs/${job.id}`)}>
                              <MoreHorizontal className="w-4 h-4 text-brand-navy/60" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-brand-navy/50">
                        No jobs found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
