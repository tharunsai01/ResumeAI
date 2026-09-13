import { motion, AnimatePresence } from "framer-motion"
import { User, Briefcase, X, ArrowRight } from "lucide-react"
import type { UserRole } from "../../services/authService"

interface RoleSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ isOpen, onClose, onSelectRole }: RoleSelectorProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-brand-gray/30">
            <h2 className="text-2xl font-display font-semibold text-brand-navy">How will you use HireSmart AI?</h2>
            <button onClick={onClose} className="p-2 text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Option */}
            <div 
              onClick={() => onSelectRole("candidate")}
              className="group cursor-pointer border-2 border-brand-gray/50 hover:border-brand-indigo rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-brand-indigo/10 flex flex-col h-full bg-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-12 h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">I am a Candidate</h3>
              <p className="text-brand-navy/60 flex-1 mb-6">
                Find jobs, analyze your resume, and discover career opportunities with AI matching.
              </p>
              <div className="flex items-center text-brand-indigo font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Continue as Candidate <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Recruiter Option */}
            <div 
              onClick={() => onSelectRole("recruiter")}
              className="group cursor-pointer border-2 border-brand-gray/50 hover:border-brand-violet rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-brand-violet/10 flex flex-col h-full bg-white relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-12 h-12 bg-brand-violet/10 text-brand-violet rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">I am a Recruiter</h3>
              <p className="text-brand-navy/60 flex-1 mb-6">
                Post jobs, automatically screen candidates, and hire smarter using AI algorithms.
              </p>
              <div className="flex items-center text-brand-violet font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Continue as Recruiter <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
