import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobForm } from "./components/JobForm"
import type { JobFormData } from "./components/JobForm"
import { staggerContainer, slideUp } from "../../lib/animations"
import { jobService } from "../../services/jobService"

export default function CreateJob() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleSubmit = async (data: JobFormData, status: "Active" | "Draft") => {
    if (isSubmitting) return

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
      const newJob = await jobService.createJob({
        title: data.title.trim(),
        company: data.company.trim(),
        category: data.category || "Software Development",
        location: data.location.trim(),
        type: data.type,
        workMode: data.workMode,
        experience: data.experience,
        salary: data.salaryNotDisclosed ? "Salary not disclosed" : (data.salary.trim() || "Salary not disclosed"),
        salaryNotDisclosed: data.salaryNotDisclosed,
        description: data.description.trim(),
        requiredSkills: data.requiredSkills,
        preferredSkills: data.preferredSkills,
        status: status
      })

      navigate("/recruiter/jobs", {
        state: {
          toast: status === "Active" ? "Job created successfully ✓" : "Job saved as draft ✓",
          newJobId: newJob.id
        }
      })
    } catch (err) {
      console.error("Failed to create job:", err)
      setErrorMsg("An error occurred while creating the job. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/recruiter/jobs")
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
        <motion.div variants={slideUp} className="mb-6 flex items-center gap-4">
          <button 
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Create New Job</h1>
            <p className="text-brand-navy/60 text-sm mt-0.5">Create a job posting and define the requirements for AI-powered candidate matching.</p>
          </div>
        </motion.div>

        <JobForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </motion.div>
    </DashboardShell>
  )
}
