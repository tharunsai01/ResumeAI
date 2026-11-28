import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobForm } from "./components/JobForm"
import type { JobFormData } from "./components/JobForm"
import { jobService } from "../../services/jobService"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function EditJob() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [initialData, setInitialData] = React.useState<Partial<JobFormData> | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setLoading(false)
        return
      }
      const job = await jobService.getRecruiterJobById(jobId)
      if (job) {
        setInitialData({
          title: job.title,
          company: job.company,
          category: job.category || "Software Development",
          location: job.location,
          type: job.jobType,
          workMode: job.workMode,
          experience: job.experience,
          salary: ["Salary not disclosed", "Salary not listed"].includes(job.salary) ? "" : job.salary,
          salaryNotDisclosed: ["Salary not disclosed", "Salary not listed"].includes(job.salary),
          description: job.description,
          requiredSkills: job.skills,
          preferredSkills: job.preferredSkills || []
        })
      }
      setLoading(false)
    }
    fetchJob()
  }, [jobId])

  const handleSubmit = async (data: JobFormData, status: "Active" | "Draft") => {
    if (!jobId || isSubmitting) return

    // Validation
    if (!data.title?.trim() || !data.company?.trim() || !data.location?.trim() || !data.description?.trim()) {
      setErrorMsg("Please fill in all required fields.")
      setTimeout(() => setErrorMsg(null), 3500)
      return
    }

    if (data.requiredSkills.length === 0) {
      setErrorMsg("Please add at least one required skill.")
      setTimeout(() => setErrorMsg(null), 3500)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await jobService.updateJob(jobId, {
        title: data.title.trim(),
        company: data.company.trim(),
        category: data.category || "Software Development",
        location: data.location.trim(),
        jobType: data.type as any,
        type: data.type as any,
        workMode: data.workMode as any,
        experience: data.experience,
        ...(data.salary !== initialData?.salary || data.salaryNotDisclosed !== initialData?.salaryNotDisclosed
          ? { salary: data.salary.trim(), salaryNotDisclosed: data.salaryNotDisclosed }
          : {}),
        description: data.description.trim(),
        skills: Array.from(new Set([...data.requiredSkills, ...data.preferredSkills])),
        requiredSkills: data.requiredSkills,
        preferredSkills: data.preferredSkills,
        status: status
      })

      navigate(`/recruiter/jobs/${jobId}`, {
        state: { toast: "Job updated successfully ✓" }
      })
    } catch (err) {
      console.error("Failed to update job:", err)
      setErrorMsg(err instanceof Error ? err.message : "Unable to update the job. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/recruiter/jobs/${jobId}`)
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-semantic-error text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-xl"
          >
            <span className="text-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-16">
        <motion.div variants={slideUp} className="mb-6 flex items-start sm:items-center gap-3 sm:gap-4">
          <button 
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60 shrink-0 mt-0.5 sm:mt-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-brand-navy break-words">Edit Job</h1>
            <p className="text-brand-navy/60 text-xs sm:text-sm mt-0.5">Update job posting details and requirements.</p>
          </div>
        </motion.div>

        {loading ? (
          <div role="status" aria-label="Loading job" className="flex justify-center py-24 text-brand-navy/40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : !initialData ? (
          <p className="text-center py-12 text-semantic-error">Job not found.</p>
        ) : (
          <JobForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </motion.div>
    </DashboardShell>
  )
}
