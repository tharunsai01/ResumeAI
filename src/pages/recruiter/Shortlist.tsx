import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, MessageSquare, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { applicationService, type Application } from "../../services/applicationService"
import { mockCandidates } from "../../data/mockCandidates"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function RecruiterShortlist() {
  const navigate = useNavigate()
  
  type CandidateData = { app: Application; candidate: typeof mockCandidates[0] }
  const [shortlisted, setShortlisted] = React.useState<CandidateData[]>([])
  const [interviewing, setInterviewing] = React.useState<CandidateData[]>([])
  const [offered, setOffered] = React.useState<CandidateData[]>([])

  React.useEffect(() => {
    const apps = applicationService.getApplications()
    const loadColumn = (statuses: string[]) => 
      apps.filter(a => statuses.includes(a.status))
        .map(app => ({
          app,
          candidate: mockCandidates.find(c => c.id === app.candidateId)!
        }))
        .filter(c => c.candidate)
        .sort((a, b) => new Date(b.app.appliedDate).getTime() - new Date(a.app.appliedDate).getTime())

    setShortlisted(loadColumn(["Shortlisted"]))
    setInterviewing(loadColumn(["Interview"]))
    setOffered(loadColumn(["Offer", "Hired"]))
  }, [])

  const ColumnCard = ({ data }: { data: CandidateData }) => (
    <Card className="mb-3 hover:border-brand-indigo/30 transition-colors cursor-pointer group" onClick={() => navigate(`/recruiter/candidates/${data.app.id}`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-brand-navy">{data.candidate.personalInfo.name}</h3>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-md",
            data.app.matchScore >= 85 ? "bg-semantic-success/10 text-semantic-success" :
            "bg-semantic-warning/10 text-semantic-warning"
          )}>
            {data.app.matchScore}%
          </span>
        </div>
        <p className="text-xs text-brand-navy/60 truncate mb-3">
          {data.candidate.experience[0]?.role} at {data.candidate.experience[0]?.company}
        </p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-gray/30">
          <div className="flex gap-2">
            <button className="p-1.5 text-brand-navy/40 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-md transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-brand-navy/40 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-md transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <ChevronRight className="w-4 h-4 text-brand-navy/30 group-hover:text-brand-indigo transition-colors" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-semantic-warning" /> Shortlisted Candidates
          </h1>
          <p className="text-brand-navy/60 mt-1">Manage candidates moving through the active interview pipeline.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <motion.div variants={slideUp} className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-brand-light rounded-xl border border-brand-gray/50">
              <h2 className="font-semibold text-brand-navy">Shortlisted</h2>
              <span className="px-2 py-0.5 bg-white rounded-md text-xs font-bold text-brand-navy shadow-sm">{shortlisted.length}</span>
            </div>
            <div className="flex-1">
              {shortlisted.map(c => <ColumnCard key={c.app.id} data={c} />)}
              {shortlisted.length === 0 && <div className="p-4 text-center text-sm text-brand-navy/40 border-2 border-dashed border-brand-gray/50 rounded-xl">No candidates</div>}
            </div>
          </motion.div>

          {/* Column 2 */}
          <motion.div variants={slideUp} className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-brand-indigo/5 rounded-xl border border-brand-indigo/10">
              <h2 className="font-semibold text-brand-indigo">Interviewing</h2>
              <span className="px-2 py-0.5 bg-white rounded-md text-xs font-bold text-brand-indigo shadow-sm">{interviewing.length}</span>
            </div>
            <div className="flex-1">
              {interviewing.map(c => <ColumnCard key={c.app.id} data={c} />)}
              {interviewing.length === 0 && <div className="p-4 text-center text-sm text-brand-navy/40 border-2 border-dashed border-brand-gray/50 rounded-xl">No candidates</div>}
            </div>
          </motion.div>

          {/* Column 3 */}
          <motion.div variants={slideUp} className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-semantic-success/5 rounded-xl border border-semantic-success/10">
              <h2 className="font-semibold text-semantic-success">Offered / Hired</h2>
              <span className="px-2 py-0.5 bg-white rounded-md text-xs font-bold text-semantic-success shadow-sm">{offered.length}</span>
            </div>
            <div className="flex-1">
              {offered.map(c => <ColumnCard key={c.app.id} data={c} />)}
              {offered.length === 0 && <div className="p-4 text-center text-sm text-brand-navy/40 border-2 border-dashed border-brand-gray/50 rounded-xl">No candidates</div>}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
