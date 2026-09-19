import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobForm } from "./components/JobForm"
import type { JobFormData } from "./components/JobForm"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function CreateJob() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = (_data: JobFormData, _status: "Active" | "Draft") => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Displaying success toast would go here.
      // We route back to the jobs list to mimic completion.
      navigate("/recruiter/jobs")
    }, 600)
  }

  const handleCancel = () => {
    navigate("/recruiter/jobs")
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
