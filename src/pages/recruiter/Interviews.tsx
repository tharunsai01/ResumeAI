import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar as CalendarIcon, Clock, User, Video, Users, CheckCircle2, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialInterviews } from "../../data/pipelineMockData"
import type { MockInterview } from "../../data/pipelineMockData"
import { ScheduleInterviewModal } from "./components/ScheduleInterviewModal"
import SpotlightCard from "../../components/ui/SpotlightCard";

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <motion.div variants={slideUp} custom={delay}>
    <Card className="hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
          <h3 className="text-2xl font-display font-bold text-brand-navy">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export default function RecruiterInterviews() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [interviews, setInterviews] = React.useState<MockInterview[]>(initialInterviews)
  
  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false)
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")

  React.useEffect(() => {
    setLoading(false)
    
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSchedule = (data: any) => {
    const newInterview: MockInterview = {
      id: `int_${Date.now()}`,
      candidateId: data.candidateId,
      candidateName: data.candidateId === "cand_1" ? "Rahul Sharma" : data.candidateId === "cand_3" ? "Ananya Patel" : data.candidateId === "cand_5" ? "Priya Singh" : data.candidateId === "cand_7" ? "Neha Gupta" : "Candidate",
      jobId: "job_101",
      jobTitle: data.jobTitle,
      date: data.date,
      time: data.time,
      duration: data.duration,
      type: data.type,
      interviewer: data.interviewer,
      status: "Scheduled"
    }
    setInterviews([...interviews, newInterview])
    showToast("Interview scheduled successfully.")
  }

  const filteredInterviews = React.useMemo(() => {
    return interviews.filter(int => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        int.candidateName.toLowerCase().includes(searchLower) || 
        int.jobTitle.toLowerCase().includes(searchLower) ||
        int.interviewer.toLowerCase().includes(searchLower)
      
      const matchesStatus = statusFilter === "All" || int.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [interviews, searchTerm, statusFilter])

  const upcomingCount = interviews.filter(i => i.status === "Scheduled").length
  const todayCount = 0 // Mock
  const completedCount = interviews.filter(i => i.status === "Completed").length
  const needsDecisionCount = interviews.filter(i => i.status === "Needs Decision").length


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled": return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 rounded-md">Scheduled</span>
      case "Completed": return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-semantic-success/10 text-semantic-success border border-semantic-success/20 rounded-md">Completed</span>
      case "Cancelled": return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-gray/10 text-brand-navy/40 border border-brand-gray/20 rounded-md">Cancelled</span>
      case "No Show": return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-semantic-error/10 text-semantic-error border border-semantic-error/20 rounded-md">No Show</span>
      case "Needs Decision": return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 rounded-md">Needs Decision</span>
      default: return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-gray/10 text-brand-navy/60 rounded-md">{status}</span>
    }
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12 relative">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Interviews</h1>
            <p className="text-brand-navy/60 mt-1">Schedule, manage, and track candidate interviews.</p>
          </div>
          <Button onClick={() => setScheduleModalOpen(true)} className="bg-brand-indigo hover:bg-brand-blue shrink-0">
            <CalendarIcon className="w-4 h-4 mr-2" /> Schedule Interview
          </Button>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Upcoming" value={upcomingCount} icon={CalendarIcon} delay={0} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="Today" value={todayCount} icon={Clock} delay={1} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
          <StatCard title="Completed" value={completedCount} icon={CheckCircle2} delay={2} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <StatCard title="Needs Decision" value={needsDecisionCount} icon={Users} delay={3} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
        </div>

        {/* FILTERS */}
        <motion.div variants={slideUp} className="flex flex-col lg:flex-row gap-4">
          <SpotlightCard className="glass-card flex-1 flex items-center px-4 focus-within: focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search by candidate, job, interviewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11"
            />
          </SpotlightCard>
          <div className="flex flex-col sm:flex-row gap-3 lg:flex">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Needs Decision">Needs Decision</option>
            </select>
          </div>
        </motion.div>

        {/* INTERVIEW LIST */}
        <motion.div variants={slideUp}>
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                  <tr>
                    <th className="px-6 py-4">Candidate & Role</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Interview Type</th>
                    <th className="px-6 py-4">Interviewer</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/20">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-brand-navy/40">
                        <div className="w-6 h-6 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredInterviews.length > 0 ? (
                    filteredInterviews.map((int) => (
                      <tr key={int.id} className="hover:bg-brand-light/50 transition-colors group cursor-pointer" onClick={() => navigate(`/recruiter/interviews/${int.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-bold border border-brand-indigo/20">
                              {int.candidateName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{int.candidateName}</div>
                              <div className="text-xs text-brand-navy/60 mt-0.5">{int.jobTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 text-brand-navy">
                            <div className="flex items-center gap-1.5 font-medium"><CalendarIcon className="w-3.5 h-3.5 text-brand-navy/50" /> {int.date}</div>
                            <div className="flex items-center gap-1.5 text-xs text-brand-navy/70"><Clock className="w-3.5 h-3.5 text-brand-navy/50" /> {int.time} ({int.duration})</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-brand-navy font-medium">
                            <Video className="w-4 h-4 text-brand-indigo" />
                            {int.type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-brand-navy/80">
                            <User className="w-4 h-4 text-brand-navy/40" />
                            {int.interviewer.split(" ")[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(int.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-brand-indigo hover:bg-brand-indigo/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); navigate(`/recruiter/interviews/${int.id}`); }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <CalendarIcon className="w-10 h-10 text-brand-navy/20 mx-auto mb-3" />
                        <div className="text-lg font-medium text-brand-navy/60">No upcoming interviews</div>
                        <p className="text-sm text-brand-navy/40 mt-1">Scheduled interviews will appear here.</p>
                        <Button variant="outline" className="mt-4 border-brand-indigo/30 text-brand-indigo" onClick={() => setScheduleModalOpen(true)}>
                          Schedule Interview
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
      />
    </DashboardShell>
  )
}
