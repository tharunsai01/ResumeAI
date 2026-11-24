import { motion, AnimatePresence } from "framer-motion"
import { User, Briefcase, X, ArrowRight } from "lucide-react"
import type { UserRole } from "../../services/authService"
import SpotlightCard from "../ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

interface RoleSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectRole: (role: UserRole) => void
}

export function RoleSelector({ isOpen, onClose, onSelectRole }: RoleSelectorProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        
        <MotionSpotlightCard
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-card relative w-full max-w-4xl overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] my-auto"
        >
          <div className="flex items-center justify-between p-3.5 sm:p-6 border-b border-brand-gray/30 shrink-0">
            <h2 className="text-lg sm:text-2xl font-display font-semibold text-brand-navy break-words pr-2">How will you use HireSmart AI?</h2>
            <button onClick={onClose} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors shrink-0" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-3.5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 overflow-y-auto flex-1 overscroll-contain">
            {/* Candidate Option */}
            <div 
              onClick={() => onSelectRole("candidate")}
              className="group cursor-pointer border-2 border-brand-gray/50 hover:border-brand-blue rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg hover:shadow-brand-blue/10 flex flex-col h-full bg-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-1.5 sm:mb-2 break-words">I am a Candidate</h3>
              <p className="text-brand-navy/60 flex-1 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed break-words">
                Find jobs, analyze your resume, and discover career opportunities with AI matching.
              </p>
              <div className="flex items-center text-brand-blue font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                Continue as Candidate <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Recruiter Option */}
            <div 
              onClick={() => onSelectRole("recruiter")}
              className="group cursor-pointer border-2 border-brand-gray/50 hover:border-brand-violet rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg hover:shadow-brand-violet/10 flex flex-col h-full bg-white relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-violet/10 text-brand-violet rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-1.5 sm:mb-2 break-words">I am a Recruiter</h3>
              <p className="text-brand-navy/60 flex-1 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed break-words">
                Post jobs, automatically screen candidates, and hire smarter using AI algorithms.
              </p>
              <div className="flex items-center text-brand-violet font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                Continue as Recruiter <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Admin Option */}
            <div 
              onClick={() => onSelectRole("admin")}
              className="group cursor-pointer border-2 border-brand-gray/50 hover:border-brand-indigo rounded-xl p-4 sm:p-6 transition-all hover:shadow-lg hover:shadow-brand-indigo/10 flex flex-col h-full bg-white relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-indigo/10 text-brand-indigo rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-1.5 sm:mb-2 break-words">I am an Admin</h3>
              <p className="text-brand-navy/60 flex-1 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed break-words">
                Manage the platform, monitor AI fairness, and oversee the ecosystem.
              </p>
              <div className="flex items-center text-brand-indigo font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                Continue as Admin <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </MotionSpotlightCard>
      </div>
    </AnimatePresence>
  )
}
