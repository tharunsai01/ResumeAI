import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, Search, Plus, Users, FileText, CheckCircle2, MoreHorizontal, Edit, Copy, XCircle, Trash2, Eye, Filter } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { jobService } from "../../services/jobService"
import type { RecruiterJob, JobStatus, JobType, WorkMode } from "../../data/recruiterMockData"
import { DeleteJobModal } from "./components/DeleteJobModal"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);
const StatCard = ({ title, value, icon: Icon, color, delay, loading }: any) => (
  <motion.div variants={slideUp} custom={delay}>
    <PremiumCard className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group cursor-default">
      <PremiumCardContent className="p-3.5 sm:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-brand-navy/60 mb-0.5 sm:mb-1 truncate">{title}</p>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-brand-navy truncate">
            {loading ? <div className="h-7 sm:h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : value}
          </h3>
        </div>
        <div className={cn("p-2.5 sm:p-3 rounded-xl shrink-0", color.bg, color.text)}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </PremiumCardContent>
    </PremiumCard>
  </motion.div>
)

export default function RecruiterJobs() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = React.useState(true)
  const [jobs, setJobs] = React.useState<RecruiterJob[]>([])
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | JobStatus>("All")
  const [typeFilter, setTypeFilter] = React.useState<"All" | JobType>("All")
  const [modeFilter, setModeFilter] = React.useState<"All" | WorkMode>("All")
  const [sortBy, setSortBy] = React.useState<"Newest" | "Oldest" | "Applications">("Newest")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  // Actions
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null)
  const [jobToDelete, setJobToDelete] = React.useState<{id: string, title: string} | null>(null)

  React.useEffect(() => {
    if (location.state && (location.state as any).toast) {
      setToastMsg((location.state as any).toast)
      setTimeout(() => setToastMsg(null), 3000)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const loadJobs = React.useCallback(async () => {
    const recruiterJobs = await jobService.getRecruiterJobs()
    setJobs(recruiterJobs)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadJobs()
    window.addEventListener("hiresmart_jobs_updated", loadJobs)
    return () => window.removeEventListener("hiresmart_jobs_updated", loadJobs)
  }, [loadJobs])

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClick = () => setOpenDropdownId(null)
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const filteredAndSortedJobs = React.useMemo(() => {
    let result = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || job.status === statusFilter
      const matchesType = typeFilter === "All" || job.jobType === typeFilter
      const matchesMode = modeFilter === "All" || job.workMode === modeFilter
      return matchesSearch && matchesStatus && matchesType && matchesMode
    })

    result.sort((a, b) => {
      if (sortBy === "Applications") return b.applications - a.applications
      // For mock dates "2 days ago", "1 week ago", we'll just keep the original array order for "Newest" and reverse for "Oldest"
      return sortBy === "Newest" ? 0 : -1 // Simplified sorting for mock strings
    })

    return sortBy === "Oldest" ? result.reverse() : result
  }, [jobs, searchTerm, statusFilter, typeFilter, modeFilter, sortBy])

  const stats = {
    active: jobs.filter(j => j.status === "Active").length,
    drafts: jobs.filter(j => j.status === "Draft").length,
    closed: jobs.filter(j => j.status === "Closed").length,
    totalApps: jobs.reduce((sum, j) => sum + j.applications, 0)
  }

  const handleDuplicate = async (job: RecruiterJob) => {
    try {
      const copy = await jobService.createJob({
        ...job,
        title: `${job.title} — Copy`,
        status: "Draft",
        applications: 0,
        postedDate: "Just now"
      })
      setJobs(previous => previous.some(job => job.id === copy.id) ? previous : [copy, ...previous])
      setToastMsg("Job duplicated as draft ✓")
    } catch {
      setToastMsg("Couldn’t duplicate the job. Please try again.")
    }
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleToggleStatus = async (jobId: string, currentStatus: JobStatus) => {
    const newStatus: JobStatus = currentStatus === "Closed" ? "Active" : "Closed"
    try {
      const updated = await jobService.updateJob(jobId, { status: newStatus })
      if (!updated) throw new Error("Job is unavailable")
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: updated.status } : job))
      setToastMsg(`Job status updated to ${newStatus} ✓`)
    } catch {
      setToastMsg("Couldn’t update the job status. Please try again.")
    }
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDelete = async () => {
    if (jobToDelete) {
      await jobService.deleteJob(jobToDelete.id)
      setJobs(prev => prev.filter(j => j.id !== jobToDelete.id))
      setJobToDelete(null)
      setToastMsg("Job deleted successfully ✓")
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  const getStatusStyle = (status: JobStatus) => {
    switch (status) {
      case "Active": return "bg-semantic-success/10 text-semantic-success border-semantic-success/20"
      case "Draft": return "bg-brand-gray/20 text-brand-navy/70 border-brand-gray/30"
      case "Closed": return "bg-semantic-error/10 text-semantic-error border-semantic-error/20"
    }
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-semantic-success text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-xl"
          >
            <span className="text-sm font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-brand-navy break-words">Jobs</h1>
            <p className="text-sm sm:text-base text-brand-navy/60 mt-1">Create, manage, and track your job openings.</p>
          </div>
          <Button onClick={() => navigate("/recruiter/jobs/create")} className="w-full sm:w-auto shrink-0 px-6 bg-gradient-to-r from-brand-indigo to-brand-blue">
            <Plus className="w-4 h-4 mr-2" /> Create New Job
          </Button>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard title="Active Jobs" value={stats.active} icon={Briefcase} delay={0} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="Drafts" value={stats.drafts} icon={FileText} delay={1} loading={loading} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/70" }} />
          <StatCard title="Closed Jobs" value={stats.closed} icon={CheckCircle2} delay={2} loading={loading} color={{ bg: "bg-semantic-error/10", text: "text-semantic-error" }} />
          <StatCard title="Total Applications" value={stats.totalApps} icon={Users} delay={3} loading={loading} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
        </div>

        {/* FILTERS */}
        <MotionSpotlightCard variants={slideUp} className="glass-card p-3 sm:p-4 space-y-3 sm:space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 flex items-center px-3 sm:px-4 bg-brand-light/50 border border-brand-gray/40 rounded-xl min-w-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy/40 mr-2.5 sm:mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-10 sm:h-11 text-sm min-w-0"
              />
            </div>
            <Button variant="outline" className="lg:hidden w-full sm:w-auto" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <div className={cn("flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 lg:flex", isMobileFiltersOpen ? "flex" : "hidden")}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full sm:w-auto bg-white border border-brand-gray/50 rounded-xl px-3 sm:px-4 h-10 sm:h-11 text-xs sm:text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full sm:w-auto bg-white border border-brand-gray/50 rounded-xl px-3 sm:px-4 h-10 sm:h-11 text-xs sm:text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value as any)} className="w-full sm:w-auto bg-white border border-brand-gray/50 rounded-xl px-3 sm:px-4 h-10 sm:h-11 text-xs sm:text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Work Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full sm:w-auto bg-white border border-brand-gray/50 rounded-xl px-3 sm:px-4 h-10 sm:h-11 text-xs sm:text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="Newest">Sort: Newest</option>
                <option value="Oldest">Sort: Oldest</option>
                <option value="Applications">Sort: Most Applications</option>
              </select>
            </div>
          </div>
        </MotionSpotlightCard>

        {/* JOB LIST */}
        <motion.div variants={slideUp}>
          <PremiumCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30 whitespace-nowrap">
                  <tr>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Job Info</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Details</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-center">Applications</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4">Posted Date</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-center">Status</th>
                    <th className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/30">
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-5 bg-brand-gray/20 rounded w-3/4 mb-2"></div><div className="h-4 bg-brand-gray/20 rounded w-1/2"></div></td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-4 bg-brand-gray/20 rounded w-full mb-1"></div><div className="h-4 bg-brand-gray/20 rounded w-2/3"></div></td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-6 bg-brand-gray/20 rounded w-12 mx-auto"></div></td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-4 bg-brand-gray/20 rounded w-20"></div></td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-6 bg-brand-gray/20 rounded-full w-16 mx-auto"></div></td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4"><div className="h-8 bg-brand-gray/20 rounded w-8 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredAndSortedJobs.length > 0 ? (
                    filteredAndSortedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-brand-light/50 transition-colors group">
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 min-w-[180px]">
                          <div className="font-semibold text-brand-navy text-base cursor-pointer group-hover:text-brand-indigo transition-colors" onClick={() => navigate(`/recruiter/jobs/${job.id}`)}>
                            {job.title}
                          </div>
                          <div className="text-xs text-brand-navy/60 mt-0.5">{job.company}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                          <div className="text-brand-navy/80 font-medium">{job.location} • {job.workMode}</div>
                          <div className="text-xs text-brand-navy/60 mt-0.5">{job.jobType} • {job.experience}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center whitespace-nowrap">
                          <span className="font-bold text-brand-navy text-lg">{job.applications}</span>
                          <div className="text-[10px] uppercase tracking-wider text-brand-navy/50">Apps</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-brand-navy/70 text-sm whitespace-nowrap">
                          {job.postedDate}
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            getStatusStyle(job.status)
                          )}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right whitespace-nowrap">
                          <div className="relative inline-block text-left">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="px-2" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdownId(openDropdownId === job.id ? null : job.id)
                              }}
                            >
                              <MoreHorizontal className="w-5 h-5 text-brand-navy/60" />
                            </Button>
                            
                            {/* Actions Dropdown */}
                            <AnimatePresence>
                              {openDropdownId === job.id && (
                                <MotionSpotlightCard
                                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                  transition={{ duration: 0.15 }}
                                  className="glass-card absolute right-0 mt-2 w-48 py-1 z-50 text-left"
                                >
                                  <button onClick={() => navigate(`/recruiter/jobs/${job.id}`)} className="w-full px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center">
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                  </button>
                                  <button onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)} className="w-full px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Job
                                  </button>
                                  <button onClick={() => handleDuplicate(job)} className="w-full px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center">
                                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                                  </button>
                                  <button onClick={() => handleToggleStatus(job.id, job.status)} className="w-full px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center">
                                    {job.status === "Closed" ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    {job.status === "Closed" ? "Reopen Job" : "Close Job"}
                                  </button>
                                  <div className="border-t border-brand-gray/20 my-1"></div>
                                  <button onClick={() => setJobToDelete({id: job.id, title: job.title})} className="w-full px-4 py-2 text-sm text-semantic-error hover:bg-semantic-error/5 flex items-center font-medium">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                                  </button>
                                </MotionSpotlightCard>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-brand-navy/30" />
                        </div>
                        <h3 className="text-lg font-medium text-brand-navy mb-1">No jobs found</h3>
                        <p className="text-sm text-brand-navy/50">Try adjusting your filters or create a new job.</p>
                        <Button onClick={() => navigate("/recruiter/jobs/create")} className="mt-4">
                          <Plus className="w-4 h-4 mr-2" /> Create Job
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>

      <DeleteJobModal
        isOpen={!!jobToDelete}
        jobTitle={jobToDelete?.title}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDelete}
      />
    </DashboardShell>
  )
}
