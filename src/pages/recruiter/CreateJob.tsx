import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobForm } from "./components/JobForm"
import type { JobFormData } from "./components/JobForm"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function CreateJob() {
  const navigate = useNavigate()

  const handleSubmit = (_data: JobFormData, _status: "Active" | "Draft") => {
    // Simulate API call
    // Displaying success toast "Job created successfully." would go here.
    navigate("/recruiter/jobs")
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
          isSubmitting={false}
        />
      </motion.div>
    </DashboardShell>
  )
}
