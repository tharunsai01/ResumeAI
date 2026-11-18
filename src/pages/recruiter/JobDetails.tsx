import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Edit, Users, Search, CheckCircle2, Calendar, Award, Building, MapPin, Briefcase, Clock, DollarSign, Sparkles, XCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialRecruiterJobs } from "../../data/recruiterMockData"
import { cn } from "../../lib/utils"

const SummaryCard = ({ title, value, icon: Icon, color, route }: any) => {
  const navigate = useNavigate()
  return (
    <PremiumCard 
      onClick={() => navigate(route)}
      className="cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 group border-brand-gray/40 bg-white"
    >
      <PremiumCardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-3">
          <div className={cn("p-2 rounded-xl border", color.bg, color.text, color.border)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-brand-navy group-hover:text-brand-indigo transition-colors">{value}</h3>
          <p className="text-xs font-medium text-brand-navy/60">{title}</p>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

export default function RecruiterJobDetails() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  
  const [job, setJob] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  const handleCloseJob = () => {
    if (window.confirm("Are you sure you want to close this job? It will no longer accept applications.")) {
      setToastMsg("Job closed successfully ✓")
      setTimeout(() => setToastMsg(null), 3000)
    }
  }

  React.useEffect(() => {
    // Simulate loading data
    const foundJob = initialRecruiterJobs.find(j => j.id === jobId)
    setJob(foundJob)
    setLoading(false)
  }, [jobId])

  if (loading) {
    return (
      <DashboardShell type="recruiter" userName="Recruiter">
        <div className="max-w-5xl mx-auto flex justify-center py-20 text-brand-navy/40">
          <div className="w-8 h-8 border-2 border-brand-navy/20 border-t-brand-indigo rounded-full animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  if (!job) {
    return (
      <DashboardShell type="recruiter" userName="Recruiter">
        <div className="max-w-5xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">Job not found</h2>
          <Button onClick={() => navigate("/recruiter/jobs")}>Back to Jobs</Button>
        </div>
      </DashboardShell>
    )
  }

  // Mock application breakdown based on total applications
  const appSummary = {
    total: job.applications,
    screened: Math.floor(job.applications * 0.8),
    shortlisted: Math.floor(job.applications * 0.3),
    interviews: Math.floor(job.applications * 0.1),
    hired: job.applications > 0 ? 1 : 0
  }



  const getStatusStyle = (status: string) => {
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

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-16 space-y-6">
        
        {/* HEADER */}
        <motion.div variants={slideUp}>
          <button onClick={() => navigate("/recruiter/jobs")} className="flex items-center text-sm font-medium text-brand-navy/60 hover:text-brand-indigo transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold text-brand-navy">{job.title}</h1>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                  getStatusStyle(job.status)
                )}>
                  {job.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-brand-navy/70">
                <span className="flex items-center"><Building className="w-4 h-4 mr-1.5" /> {job.company}</span>
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {job.location} ({job.workMode})</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {job.postedDate}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" /> Edit Job
              </Button>
              <Button variant="outline" className="text-semantic-error hover:bg-semantic-error/5 hover:text-semantic-error border-brand-gray/40" onClick={handleCloseJob}>
                <XCircle className="w-4 h-4 mr-2" /> Close Job
              </Button>
              <Button onClick={() => navigate("/recruiter/candidates")} className="bg-gradient-to-r from-brand-indigo to-brand-blue">
                <Users className="w-4 h-4 mr-2" /> View Candidates
              </Button>
            </div>
          </div>
        </motion.div>

        {/* APPLICATION SUMMARY */}
        <motion.div variants={slideUp}>
          <h2 className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-3 px-1">Application Pipeline</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard title="Total Applications" value={appSummary.total} icon={Users} route="/recruiter/candidates" color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo", border: "border-brand-indigo/20" }} />
            <SummaryCard title="AI Screened" value={appSummary.screened} icon={Search} route="/recruiter/screening" color={{ bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" }} />
            <SummaryCard title="Shortlisted" value={appSummary.shortlisted} icon={CheckCircle2} route="/recruiter/shortlist" color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning", border: "border-semantic-warning/20" }} />
            <SummaryCard title="Interviews" value={appSummary.interviews} icon={Calendar} route="/recruiter/interviews" color={{ bg: "bg-semantic-success/10", text: "text-semantic-success", border: "border-semantic-success/20" }} />
            <SummaryCard title="Hired" value={appSummary.hired} icon={Award} route="/recruiter/candidates" color={{ bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* JOB DETAILS MAIN CONTENT */}
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            <PremiumCard>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Job Description</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-6">
                <div className="prose prose-sm prose-slate max-w-none">
                  <p className="text-brand-navy/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                  
                  <h4 className="text-brand-navy font-semibold mt-6 mb-2">Responsibilities</h4>
                  <ul className="list-disc pl-5 text-brand-navy/80 space-y-1">
                    <li>Design and implement scalable solutions.</li>
                    <li>Collaborate with cross-functional teams to define requirements.</li>
                    <li>Write clean, maintainable, and efficient code.</li>
                    <li>Participate in code reviews and architecture discussions.</li>
                  </ul>
                  
                  <h4 className="text-brand-navy font-semibold mt-6 mb-2">Requirements</h4>
                  <ul className="list-disc pl-5 text-brand-navy/80 space-y-1">
                    <li>Proven experience in the field.</li>
                    <li>Strong problem-solving skills and attention to detail.</li>
                    <li>Excellent communication and teamwork abilities.</li>
                  </ul>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>

          {/* SIDEBAR INFO */}
          <motion.div variants={slideUp} className="space-y-6">
            <PremiumCard>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Overview</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5 space-y-5">
                <div className="flex items-start gap-3 text-sm">
                  <Briefcase className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-brand-navy">Job Type</div>
                    <div className="text-brand-navy/70">{job.jobType}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-brand-navy">Work Mode</div>
                    <div className="text-brand-navy/70">{job.workMode}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Award className="w-5 h-5 text-semantic-warning mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-brand-navy">Experience</div>
                    <div className="text-brand-navy/70">{job.experience}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <DollarSign className="w-5 h-5 text-semantic-success mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-brand-navy">Salary Range</div>
                    <div className="text-brand-navy/70">{job.salary}</div>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>

            <PremiumCard>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-indigo" /> Required Skills
                </PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-brand-indigo/10 text-brand-indigo text-xs font-bold rounded-md border border-brand-indigo/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        </div>
        
      </motion.div>
    </DashboardShell>
  )
}
