import * as React from "react"
import { motion } from "framer-motion"
import { Briefcase, MapPin, ChevronLeft, Edit, Users, Sparkles, CheckCircle2, PlayCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { jobService } from "../../services/jobService"
import { applicationService, type Application } from "../../services/applicationService"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function RecruiterJobDetails() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = React.useState<Job | null>(null)
  const [applications, setApplications] = React.useState<Application[]>([])
  
  React.useEffect(() => {
    if (!jobId) return
    const fetchJob = async () => {
      const found = await jobService.getJobById(jobId)
      if (found) {
        setJob(found)
        setApplications(applicationService.getApplicationsByJob(jobId))
      }
    }
    fetchJob()
  }, [jobId])

  if (!job) return null

  const screened = applications.filter(a => a.aiScreening || a.status !== "Applied").length
  const shortlisted = applications.filter(a => ["Shortlisted", "Interview", "Offer", "Hired"].includes(a.status)).length
  const hired = applications.filter(a => a.status === "Hired").length

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto pb-12">
        <motion.div variants={slideUp} className="mb-6 flex items-start gap-4">
          <button 
            onClick={() => navigate("/recruiter/jobs")}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60 mt-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-semibold text-brand-navy">{job.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-brand-navy/60 text-sm">
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-semantic-success/10 text-semantic-success">
                    Active
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="hidden sm:flex">
                  <Edit className="w-4 h-4 mr-2" /> Edit Job
                </Button>
                <Button onClick={() => navigate(`/recruiter/screening?jobId=${job.id}`)}>
                  <Sparkles className="w-4 h-4 mr-2" /> Screen Candidates
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-brand-navy/70 whitespace-pre-wrap leading-relaxed text-sm">
                  {job.description}
                </p>
                <h4 className="font-semibold text-brand-navy mt-6 mb-3">Requirements</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm text-brand-navy/70">
                  {job.requirements?.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-brand-light border border-brand-gray/50 rounded-lg text-sm text-brand-navy font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-brand-light">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-brand-navy">Total Applicants</span>
                  </div>
                  <span className="text-xl font-bold">{applications.length}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-semantic-info/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/50 rounded-lg text-semantic-info">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-brand-navy">AI Screened</span>
                  </div>
                  <span className="text-xl font-bold text-semantic-info">{screened}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-semantic-warning/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/50 rounded-lg text-semantic-warning">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-brand-navy">Shortlisted</span>
                  </div>
                  <span className="text-xl font-bold text-semantic-warning">{shortlisted}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-xl bg-semantic-success/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/50 rounded-lg text-semantic-success">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-brand-navy">Hired</span>
                  </div>
                  <span className="text-xl font-bold text-semantic-success">{hired}</span>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/recruiter/candidates")}>
                  View All Candidates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-brand-navy/60">Experience</span>
                  <span className="text-sm font-medium">{job.experience}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-brand-navy/60">Salary</span>
                  <span className="text-sm font-medium">{job.salary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-brand-navy/60">Posted On</span>
                  <span className="text-sm font-medium">{job.postedDate}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
