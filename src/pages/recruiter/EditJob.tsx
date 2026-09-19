import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobForm } from "./components/JobForm"
import type { JobFormData } from "./components/JobForm"
import { initialRecruiterJobs } from "../../data/recruiterMockData"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function EditJob() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [initialData, setInitialData] = React.useState<Partial<JobFormData> | null>(null)

  React.useEffect(() => {
    // Simulate fetching job data
    const timer = setTimeout(() => {
      const job = initialRecruiterJobs.find(j => j.id === jobId)
      if (job) {
        setInitialData({
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.jobType,
          workMode: job.workMode,
          experience: job.experience,
          salary: job.salary === "Salary not disclosed" ? "" : job.salary,
          salaryNotDisclosed: job.salary === "Salary not disclosed",
          description: job.description,
          requiredSkills: job.skills,
          preferredSkills: [] // Mocking preferred as empty for edit since it's not in the simple interface
        })
      }
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [jobId])

  const handleSubmit = (_data: JobFormData, _status: "Active" | "Draft") => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Displaying success toast "Job updated successfully." would go here.
      navigate(`/recruiter/jobs/${jobId}`)
    }, 600)
  }

  const handleCancel = () => {
    navigate(`/recruiter/jobs/${jobId}`)
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-16">
        <motion.div variants={slideUp} className="mb-6 flex items-center gap-4">
          <button 
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Edit Job</h1>
            <p className="text-brand-navy/60 text-sm mt-0.5">Update job posting details and requirements.</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex justify-center items-center py-24 text-brand-navy/40"
            >
              <Loader2 className="w-8 h-8 animate-spin" />
            </motion.div>
          ) : !initialData ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-12 text-semantic-error"
            >
              Job not found.
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <JobForm 
                initialData={initialData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardShell>
  )
}
