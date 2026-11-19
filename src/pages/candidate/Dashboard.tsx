import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobCard } from "../../components/shared/JobCard"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Briefcase, Calendar, CheckCircle2, Star, TrendingUp, Clock, ChevronRight } from "lucide-react"
import { staggerContainer, slideUp } from "../../lib/animations"
import { ResumeUploader } from "../../components/shared/ResumeUploader"
import { jobService } from "../../services/jobService"
import type { JobMatchResult } from "../../services/jobService"
import { useJobActions } from "../../hooks/useJobActions"
import { resumeService } from "../../services/resumeService"
import { skillService } from "../../services/skillService"
import { profileService } from "../../services/profileService"
import { Badge } from "../../components/ui/Badge"
import { SkillBadge } from "../../components/shared/SkillBadge"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const { savedJobs, toggleSaveJob, appliedJobs, hasApplied } = useJobActions()
  
  const [recommendedJobs, setRecommendedJobs] = React.useState<JobMatchResult[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const jobs = await jobService.getRecommendedJobs()
        setRecommendedJobs(jobs)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  // Calculate dynamic stats
  const totalApplied = appliedJobs.length
  const totalInterviews = appliedJobs.filter(a => a.status === "Interview").length
  const totalOffers = appliedJobs.filter(a => a.status === "Offer").length
  
  const activeResume = resumeService.getActiveResumeAnalysis()
  const profileCompletion = profileService.getCandidateProfile().profileCompletion

  const stats = [
    { label: "Jobs Applied", value: totalApplied.toString(), icon: Briefcase, color: "text-brand-blue", bg: "bg-brand-blue/10" },
    { label: "Interviews", value: totalInterviews.toString(), icon: Calendar, color: "text-brand-violet", bg: "bg-brand-violet/10" },
    { label: "Offers", value: totalOffers.toString(), icon: Star, color: "text-semantic-warning", bg: "bg-semantic-warning/10" },
    { label: "Profile Score", value: profileCompletion + "%", icon: CheckCircle2, color: "text-semantic-success", bg: "bg-semantic-success/10" },
  ]

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Applied": return <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue text-[10px] px-1.5 py-0">Applied</Badge>
      case "Under Review": return <Badge variant="secondary" className="bg-brand-violet/10 text-brand-violet text-[10px] px-1.5 py-0">Review</Badge>
      case "Shortlisted": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success text-[10px] px-1.5 py-0">Shortlisted</Badge>
      case "Interview": return <Badge variant="secondary" className="bg-brand-indigo/10 text-brand-indigo text-[10px] px-1.5 py-0">Interview</Badge>
      case "Offer": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success text-[10px] px-1.5 py-0">Offer</Badge>
      case "Rejected": return <Badge variant="secondary" className="bg-semantic-error/10 text-semantic-error text-[10px] px-1.5 py-0">Rejected</Badge>
      case "Withdrawn": return <Badge variant="secondary" className="bg-brand-gray/50 text-brand-navy/60 text-[10px] px-1.5 py-0">Withdrawn</Badge>
      default: return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>
    }
  }

  return (
    <DashboardShell type="candidate" userName={activeResume.personalInfo.name}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6 pb-12"
      >
        {/* Welcome Section */}
        <MotionSpotlightCard variants={slideUp} className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 sm:p-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-brand-navy break-words">
              Welcome back, {activeResume.personalInfo.name.split(' ')[0]} <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-brand-navy/60 mt-1">
              Discover opportunities that match your skills and career goals.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-indigo bg-brand-indigo/10 px-3 sm:px-4 py-2 rounded-lg shrink-0 self-start md:self-auto">
            <TrendingUp className="w-4 h-4 shrink-0" />
            Profile Strength: {profileCompletion}%
          </div>
        </MotionSpotlightCard>

        {/* Stats Grid */}
        <motion.div variants={slideUp} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-4 min-w-0">
                <div className={`p-2 sm:p-3 rounded-xl ${stat.bg} shrink-0`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-brand-navy/60 font-medium truncate">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-display font-semibold text-brand-navy truncate">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-brand-navy">Recent Applications</h2>
                <button onClick={() => navigate("/candidate/applications")} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <Card>
                <CardContent className="p-0 flex flex-col divide-y divide-brand-gray/30">
                  {appliedJobs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Clock className="w-8 h-8 text-brand-navy/20 mx-auto mb-2" />
                      <p className="text-sm text-brand-navy/60">No recent applications.</p>
                    </div>
                  ) : (
                    appliedJobs.slice(0, 3).map((app) => (
                      <div 
                        key={app.applicationId}
                        onClick={() => navigate(`/candidate/applications/${app.applicationId}`)}
                        className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-brand-light/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-gray/30 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy/40" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-brand-navy group-hover:text-brand-indigo transition-colors truncate">{app.title}</p>
                            <p className="text-xs text-brand-navy/60 mt-0.5 truncate">{app.company} • {new Date(app.appliedDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {getStatusBadge(app.status)}
                          <span className="text-xs font-medium text-brand-indigo">{app.matchScore}% Match</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideUp}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold text-brand-navy">AI Recommended Jobs</h2>
                <button onClick={() => navigate("/candidate/recommended")} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                  [1, 2].map(i => <SpotlightCard key={i} className="glass-card shadow-sm overflow-hidden" />)
                ) : (
                  recommendedJobs.slice(0, 2).map(({ job, overallMatch }) => (
                    <JobCard 
                      key={job.id} 
                      {...job} 
                      matchScore={overallMatch} 
                      isSaved={savedJobs.includes(job.id)}
                      isApplied={hasApplied(job.id)}
                      onSave={() => toggleSaveJob(job.id)}
                      onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                      onApply={() => navigate(`/candidate/jobs/${job.id}?apply=true`)}
                    />
                  ))
                )}
              </div>
            </motion.div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Resume Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeUploader onUpload={() => navigate("/candidate/resume")} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideUp}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Skills Detected</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skillService.getDetectedSkills().slice(0, 5).map(skill => (
                      <SkillBadge key={skill.id} name={skill.name} level={skill.level} variant="default" />
                    ))}
                  </div>
                  <button onClick={() => navigate("/candidate/skills")} className="text-sm font-medium text-brand-indigo flex items-center hover:underline w-full justify-center border-t border-brand-gray/30 pt-3">
                    View Skill Analysis <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Top Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-12 bg-brand-light rounded-lg animate-pulse" />)
                  ) : (
                    recommendedJobs.slice(0, 4).map(({ job, overallMatch }) => (
                      <div 
                        key={job.id} 
                        onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                        className="flex items-center justify-between gap-2 p-3 rounded-lg hover:bg-brand-light transition-colors border border-transparent hover:border-brand-gray/50 cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-brand-navy text-sm truncate">{job.title}</p>
                          <p className="text-xs text-brand-navy/60 truncate">{job.company}</p>
                        </div>
                        <div className="text-sm font-semibold text-semantic-success bg-semantic-success/10 px-2 py-1 rounded shrink-0">
                          {overallMatch}%
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
