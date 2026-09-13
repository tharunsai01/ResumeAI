import * as React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Sparkles, ArrowRight } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobCard } from "../../components/shared/JobCard"
import { jobService } from "../../services/jobService"
import type { JobMatchResult } from "../../services/jobService"
import { useJobActions } from "../../hooks/useJobActions"
import { mockResumeAnalysis } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function CandidateRecommended() {
  const navigate = useNavigate()
  const { savedJobs, toggleSaveJob, hasApplied } = useJobActions()
  
  const [loading, setLoading] = React.useState(true)
  const [recommendedJobs, setRecommendedJobs] = React.useState<JobMatchResult[]>([])

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

  return (
    <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-8 pb-12">
        <motion.div variants={slideUp} className="flex items-center gap-3">
          <div className="p-3 bg-brand-indigo/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-brand-indigo" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">AI Recommended Jobs</h1>
            <p className="text-brand-navy/60">Jobs selected based on your resume, skills, and experience.</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white rounded-xl border border-brand-gray/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <motion.div variants={slideUp}>
              <h2 className="text-lg font-display font-semibold text-brand-navy mb-4 flex items-center gap-2">
                Top Matches For You
              </h2>
              {recommendedJobs.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {recommendedJobs.map(({ job, overallMatch }, index) => (
                    <motion.div 
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 -right-3 z-10 bg-semantic-success text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-semantic-success/20">
                          #1 Match
                        </div>
                      )}
                      <JobCard 
                        {...job} 
                        matchScore={overallMatch} 
                        isSaved={savedJobs.includes(job.id)}
                        isApplied={hasApplied(job.id)}
                        onSave={() => toggleSaveJob(job.id)}
                        onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                        onApply={() => navigate(`/candidate/jobs/${job.id}?apply=true`)}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-brand-gray/50 p-12 text-center flex flex-col items-center justify-center">
                  <Sparkles className="w-12 h-12 text-brand-navy/20 mb-4" />
                  <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">We need more profile information</h3>
                  <p className="text-brand-navy/60 mb-6">Upload a resume to get AI-powered job recommendations.</p>
                  <button onClick={() => navigate("/candidate/resume")} className="text-brand-indigo font-medium flex items-center hover:underline">
                    Go to My Resume <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </motion.div>
    </DashboardShell>
  )
}
