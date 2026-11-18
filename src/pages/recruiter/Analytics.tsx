import * as React from "react"
import { motion } from "framer-motion"
import { BarChart, Users, CheckCircle2, User, Search, Download, Briefcase, Calendar, ChevronRight } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { AI_SCREENING_THRESHOLD } from "../../data/screeningMockData"

const MOCK_STATS = {
  totalApplications: 245,
  aiScreened: 186,
  aiQualified: 142,
  shortlisted: 42,
  interviews: 16,
  hired: 7,
  averageMatch: 78
}

const MOCK_JOBS = [
  { id: 1, title: "Software Engineer", apps: 85, qualified: 45, shortlisted: 15, interviews: 5, hired: 2 },
  { id: 2, title: "AI Engineer", apps: 60, qualified: 35, shortlisted: 12, interviews: 4, hired: 1 },
  { id: 3, title: "Frontend Developer", apps: 55, qualified: 40, shortlisted: 10, interviews: 4, hired: 2 },
  { id: 4, title: "Product Manager", apps: 45, qualified: 22, shortlisted: 5, interviews: 3, hired: 2 },
]

const StatCard = ({ title, value, icon: Icon, color, delay, loading }: any) => (
  <motion.div variants={slideUp} custom={delay}>
    <PremiumCard className="hover:-translate-y-0.5 transition-all duration-200 h-full">
      <PremiumCardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-lg ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold text-brand-navy">
            {loading ? <div className="h-8 w-16 bg-brand-gray/20 rounded animate-pulse" /> : value}
          </h3>
          <p className="text-sm font-medium text-brand-navy/60 mt-1">{title}</p>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  </motion.div>
)

const FunnelStep = ({ label, value, percent, colorClass, nextPercent }: any) => (
  <div className="flex flex-col items-center group relative">
    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-md z-10 transition-transform group-hover:scale-105 ${colorClass}`}>
      <span className="text-xl sm:text-2xl font-bold">{value}</span>
      {percent && <span className="text-[10px] sm:text-xs opacity-90">{percent}%</span>}
    </div>
    <span className="text-xs sm:text-sm font-semibold text-brand-navy text-center mt-3">{label}</span>
    
    {nextPercent && (
      <div className="hidden sm:flex absolute top-12 left-20 w-[calc(100%-2.5rem)] h-0.5 bg-brand-gray/30 -z-10 items-center justify-center">
        <span className="bg-white px-2 text-[10px] font-bold text-brand-navy/40 rounded-full border border-brand-gray/20 absolute -top-2.5">
          {nextPercent}%
        </span>
      </div>
    )}
  </div>
)

export default function RecruiterAnalytics() {
  const [loading, setLoading] = React.useState(true)
  const [dateFilter, setDateFilter] = React.useState("30 Days")
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    setLoading(false)
    
  }, [])

  const handleExport = () => {
    setToastMsg("Report export will be available after backend integration.")
    setTimeout(() => setToastMsg(null), 3000)
  }


  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12 relative">
        
        {/* TOAST */}
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-brand-navy text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-xl"
          >
            <span className="text-sm font-medium">{toastMsg}</span>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Recruitment Analytics</h1>
            <p className="text-brand-navy/60 mt-1">Track hiring activity, candidate progress, and AI screening insights.</p>
          </div>
          <Button onClick={handleExport} className="bg-white text-brand-navy border border-brand-gray/40 hover:bg-brand-gray/10 shrink-0">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <StatCard title="Total Applications" value={MOCK_STATS.totalApplications} icon={Users} delay={0} loading={loading} color={{ bg: "bg-brand-gray/10", text: "text-brand-navy" }} />
          <StatCard title="AI Screened" value={MOCK_STATS.aiScreened} icon={Search} delay={1} loading={loading} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <StatCard title="AI Qualified" value={MOCK_STATS.aiQualified} icon={CheckCircle2} delay={2} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="Shortlisted" value={MOCK_STATS.shortlisted} icon={User} delay={3} loading={loading} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
          <StatCard title="Interviews" value={MOCK_STATS.interviews} icon={Calendar} delay={4} loading={loading} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
          <StatCard title="Hired" value={MOCK_STATS.hired} icon={Briefcase} delay={5} loading={loading} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <StatCard title="Avg Match" value={`${MOCK_STATS.averageMatch}%`} icon={BarChart} delay={6} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* HIRING FUNNEL */}
          <motion.div variants={slideUp} className="lg:col-span-2">
            <PremiumCard className="h-full">
              <PremiumCardHeader className="border-b border-brand-gray/20">
                <PremiumCardTitle>Hiring Funnel</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-8">
                {loading ? (
                  <div className="h-40 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-0 mt-4">
                    <FunnelStep label="Applications" value={MOCK_STATS.totalApplications} percent="100" colorClass="bg-brand-navy text-white" nextPercent="76" />
                    <ChevronRight className="w-6 h-6 text-brand-gray/40 block sm:hidden" />
                    <FunnelStep label="AI Screened" value={MOCK_STATS.aiScreened} percent="76" colorClass="bg-brand-blue text-white" nextPercent="76" />
                    <ChevronRight className="w-6 h-6 text-brand-gray/40 block sm:hidden" />
                    <FunnelStep label="AI Qualified" value={MOCK_STATS.aiQualified} percent="58" colorClass="bg-brand-indigo text-white" nextPercent="30" />
                    <ChevronRight className="w-6 h-6 text-brand-gray/40 block sm:hidden" />
                    <FunnelStep label="Shortlisted" value={MOCK_STATS.shortlisted} percent="17" colorClass="bg-semantic-warning text-white" nextPercent="38" />
                    <ChevronRight className="w-6 h-6 text-brand-gray/40 block sm:hidden" />
                    <FunnelStep label="Interviews" value={MOCK_STATS.interviews} percent="6.5" colorClass="bg-emerald-500 text-white" nextPercent="44" />
                    <ChevronRight className="w-6 h-6 text-brand-gray/40 block sm:hidden" />
                    <FunnelStep label="Hired" value={MOCK_STATS.hired} percent="2.8" colorClass="bg-semantic-success text-white" />
                  </div>
                )}
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>

          {/* AI SCREENING INSIGHTS */}
          <motion.div variants={slideUp}>
            <PremiumCard className="h-full">
              <PremiumCardHeader className="border-b border-brand-gray/20">
                <PremiumCardTitle>AI Screening Insights</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-6">
                <p className="text-xs text-brand-navy/60 mb-6 leading-relaxed bg-brand-blue/5 p-3 rounded-lg border border-brand-blue/10">
                  Candidates scoring <span className="font-bold text-brand-indigo">{AI_SCREENING_THRESHOLD}%</span> or above are considered AI-qualified for recruiter review.
                </p>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-brand-navy">Strong Matches (90%+)</span>
                      <span className="text-semantic-success">32</span>
                    </div>
                    <div className="w-full bg-brand-gray/20 rounded-full h-2">
                      <div className="bg-semantic-success h-2 rounded-full" style={{ width: "22%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-brand-navy">Potential Matches (80-89%)</span>
                      <span className="text-brand-indigo">110</span>
                    </div>
                    <div className="w-full bg-brand-gray/20 rounded-full h-2">
                      <div className="bg-brand-indigo h-2 rounded-full" style={{ width: "77%" }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-brand-navy">Below Threshold (&lt;80%)</span>
                      <span className="text-semantic-error">44</span>
                    </div>
                    <div className="w-full bg-brand-gray/20 rounded-full h-2">
                      <div className="bg-semantic-error h-2 rounded-full" style={{ width: "31%" }} />
                    </div>
                  </div>
                </div>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>

        </div>

        {/* JOB PERFORMANCE */}
        <motion.div variants={slideUp}>
          <PremiumCard>
            <PremiumCardHeader className="border-b border-brand-gray/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <PremiumCardTitle>Job Performance</PremiumCardTitle>
              <select 
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-white border border-brand-gray/40 rounded-lg px-3 py-1.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
              >
                <option>7 Days</option>
                <option>30 Days</option>
                <option>90 Days</option>
                <option>This Year</option>
              </select>
            </PremiumCardHeader>
            <PremiumCardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                    <tr>
                      <th className="px-6 py-4">Job Title</th>
                      <th className="px-6 py-4 text-center">Applications</th>
                      <th className="px-6 py-4 text-center">AI Qualified</th>
                      <th className="px-6 py-4 text-center">Shortlisted</th>
                      <th className="px-6 py-4 text-center">Interviews</th>
                      <th className="px-6 py-4 text-center">Hired</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray/20">
                    {MOCK_JOBS.map((job) => (
                      <tr key={job.id} className="hover:bg-brand-light/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-brand-navy">{job.title}</td>
                        <td className="px-6 py-4 text-center text-brand-navy/70">{job.apps}</td>
                        <td className="px-6 py-4 text-center text-brand-indigo font-medium">{job.qualified}</td>
                        <td className="px-6 py-4 text-center text-brand-navy/70">{job.shortlisted}</td>
                        <td className="px-6 py-4 text-center text-brand-navy/70">{job.interviews}</td>
                        <td className="px-6 py-4 text-center text-semantic-success font-bold">{job.hired}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

      </motion.div>
    </DashboardShell>
  )
}
