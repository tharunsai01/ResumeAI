import * as React from "react"
import { motion } from "framer-motion"
import { Search, Brain, CheckCircle2, ChevronRight, FileText, Briefcase, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { screeningJobs } from "../../data/screeningMockData"

export default function RecruiterScreening() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const totalApplications = screeningJobs.reduce((acc, job) => acc + job.applications, 0)
  const totalScreened = screeningJobs.reduce((acc, job) => acc + job.screened, 0)
  const totalStrongMatches = screeningJobs.reduce((acc, job) => acc + job.strongMatches, 0)
  const totalPending = screeningJobs.reduce((acc, job) => acc + job.pending, 0)

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div variants={slideUp} custom={delay}>
      <Card className="hover:-translate-y-0.5 transition-all duration-200">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
            <h3 className="text-2xl font-display font-bold text-brand-navy">
              {loading ? <div className="h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">AI Resume Screening</h1>
          <p className="text-brand-navy/60 mt-1">Use AI-powered analysis to identify candidates who best match your job requirements.</p>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Applications" value={totalApplications} icon={FileText} delay={0} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/70" }} />
          <StatCard title="AI Screened" value={totalScreened} icon={Search} delay={1} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <StatCard title="Strong Matches" value={totalStrongMatches} icon={CheckCircle2} delay={2} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <StatCard title="Pending" value={totalPending} icon={Brain} delay={3} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
        </div>

        {/* JOB SELECTOR */}
        <motion.div variants={slideUp} className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Select Job for Screening</h2>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" /> Filter Jobs
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-5 w-48 bg-brand-gray/20 rounded mb-2" />
                    <div className="h-4 w-32 bg-brand-gray/20 rounded mb-4" />
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-brand-gray/20 rounded" />
                      <div className="h-4 w-24 bg-brand-gray/20 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              screeningJobs.map(job => (
                <Card key={job.id} className="group hover:border-brand-indigo/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/recruiter/screening/${job.id}`)}>
                  <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{job.title}</h3>
                        {job.pending > 0 && (
                          <span className="px-2.5 py-0.5 bg-semantic-warning/10 text-semantic-warning text-[10px] font-bold uppercase tracking-wider rounded-md border border-semantic-warning/20">
                            {job.pending} Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-navy/60">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Applications</div>
                          <div className="font-semibold text-brand-navy">{job.applications}</div>
                        </div>
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Screened</div>
                          <div className="font-semibold text-brand-navy">{job.screened}</div>
                        </div>
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Strong Matches</div>
                          <div className="font-semibold text-semantic-success">{job.strongMatches}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" className="shrink-0 group-hover:bg-brand-indigo group-hover:text-white transition-colors self-start sm:self-center">
                      View Screening <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
