
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "../../../components/ui/Button"
import SpotlightCard from "../../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

interface DeleteJobModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  jobTitle?: string
}

export function DeleteJobModal({ isOpen, onClose, onConfirm, jobTitle }: DeleteJobModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <MotionSpotlightCard
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="glass-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 sm:p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-semantic-error/10 flex items-center justify-center text-semantic-error shrink-0">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <button onClick={onClose} className="p-2 text-brand-navy/40 hover:text-brand-navy rounded-lg hover:bg-brand-gray/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-lg sm:text-xl font-display font-semibold text-brand-navy mb-2 break-words">
                Delete this job?
              </h3>
              <p className="text-brand-navy/70 text-xs sm:text-sm leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-brand-navy break-words">{jobTitle || "this job"}</span>? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            
            <div className="p-4 bg-brand-gray/10 border-t border-brand-gray/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 shrink-0">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-brand-gray/40">
                Cancel
              </Button>
              <Button onClick={() => {
                onConfirm()
                onClose()
              }} className="w-full sm:w-auto bg-semantic-error hover:bg-semantic-error/90 text-white border-transparent">
                Delete Job
              </Button>
            </div>
          </MotionSpotlightCard>
        </>
      )}
    </AnimatePresence>
  )
}
