import * as React from "react"
import { motion } from "framer-motion"
import { Calendar as CalendarIcon, Video, Clock, MapPin, Search } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { interviewService, type Interview } from "../../services/interviewService"
import { mockCandidates } from "../../data/mockCandidates"
import { jobService } from "../../services/jobService"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function RecruiterInterviews() {
  const [_loading, setLoading] = React.useState(true)
  
  type InterviewData = { interview: Interview; candidate: typeof mockCandidates[0]; job: Job }
  const [interviews, setInterviews] = React.useState<InterviewData[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const fetchData = async () => {
      const allInterviews = interviewService.getInterviews()
      const allJobs = await jobService.getJobs()
      
      const mapped = allInterviews.map(inv => {
        const candidate = mockCandidates.find(c => c.id === inv.candidateId)
        const job = allJobs.find(j => j.id === inv.jobId)
        if (!candidate || !job) return null
        return { interview: inv, candidate, job }
      }).filter((c): c is InterviewData => c !== null)
      
      // Sort by closest date
      mapped.sort((a, b) => new Date(a.interview.date).getTime() - new Date(b.interview.date).getTime())
      
      setInterviews(mapped)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredInterviews = interviews.filter(({ candidate, job }) => 
    candidate.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const upcoming = filteredInterviews.filter(i => new Date(i.interview.date).getTime() >= new Date().setHours(0,0,0,0))
  const past = filteredInterviews.filter(i => new Date(i.interview.date).getTime() < new Date().setHours(0,0,0,0))

  const InterviewCard = ({ data }: { data: InterviewData }) => (
    <Card className="hover:border-brand-indigo/30 transition-colors">
      <CardContent className="p-0 flex flex-col sm:flex-row">
        {/* Date/Time Block */}
        <div className="w-full sm:w-48 bg-brand-light p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-brand-gray/30 rounded-t-2xl sm:rounded-tr-none sm:rounded-l-2xl">
          <span className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-1">
            {new Date(data.interview.date).toLocaleDateString(undefined, { weekday: 'short' })}
          </span>
          <span className="text-3xl font-display font-bold text-brand-navy">
            {new Date(data.interview.date).getDate()}
          </span>
          <span className="text-sm font-medium text-brand-navy/60 mb-3">
            {new Date(data.interview.date).toLocaleDateString(undefined, { month: 'short' })}
          </span>
          <div className="flex items-center gap-1.5 text-sm font-medium text-brand-indigo bg-brand-indigo/10 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {data.interview.time}
          </div>
        </div>

        {/* Details Block */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold text-brand-navy">{data.candidate.personalInfo.name}</h3>
              <p className="text-brand-navy/60">{data.job.title}</p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
              data.interview.type === "Technical" ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20" :
              data.interview.type === "HR" ? "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20" :
              data.interview.type === "Final" ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20" :
              "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20"
            )}>
              {data.interview.type} Interview
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {data.interview.meetingLink ? (
              <a 
                href={data.interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-white bg-brand-indigo hover:bg-brand-indigo/90 px-4 py-2 rounded-xl transition-colors"
              >
                <Video className="w-4 h-4" /> Join Meeting
              </a>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-brand-navy/60 bg-brand-light px-4 py-2 rounded-xl border border-brand-gray/50">
                <MapPin className="w-4 h-4" /> In-person or TBD
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-8 pb-12">
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-brand-indigo" /> Interviews
            </h1>
            <p className="text-brand-navy/60 mt-1">Manage your upcoming candidate meetings.</p>
          </div>
        </motion.div>

        <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm p-2 flex items-center">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search by candidate or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-10"
            />
          </div>
        </motion.div>

        <motion.div variants={slideUp} className="space-y-6">
          <h2 className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
            Upcoming <span className="px-2 py-0.5 bg-brand-light text-sm rounded-full text-brand-navy/60">{upcoming.length}</span>
          </h2>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(i => <InterviewCard key={i.interview.id} data={i} />)}
            </div>
          ) : (
            <div className="p-8 text-center bg-brand-light/50 border-2 border-dashed border-brand-gray/50 rounded-2xl">
              <CalendarIcon className="w-8 h-8 text-brand-navy/30 mx-auto mb-3" />
              <p className="text-brand-navy/60">No upcoming interviews scheduled.</p>
            </div>
          )}
        </motion.div>

        {past.length > 0 && (
          <motion.div variants={slideUp} className="space-y-6 pt-8 border-t border-brand-gray/30">
            <h2 className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2 opacity-60">
              Past Interviews <span className="px-2 py-0.5 bg-brand-light text-sm rounded-full text-brand-navy/60">{past.length}</span>
            </h2>
            <div className="space-y-4 opacity-60">
              {past.map(i => <InterviewCard key={i.interview.id} data={i} />)}
            </div>
          </motion.div>
        )}

      </motion.div>
    </DashboardShell>
  )
}
