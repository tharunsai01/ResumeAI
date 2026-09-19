
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "../../../components/ui/Button"

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="glass-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-semantic-error/10 flex items-center justify-center text-semantic-error">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button onClick={onClose} className="p-2 text-brand-navy/40 hover:text-brand-navy rounded-lg hover:bg-brand-gray/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">
                Delete this job?
              </h3>
              <p className="text-brand-navy/70 text-sm">
                Are you sure you want to delete <span className="font-semibold text-brand-navy">{jobTitle || "this job"}</span>? This action cannot be undone and will permanently remove all associated data.
              </p>
            </div>
            
            <div className="p-4 bg-brand-gray/10 border-t border-brand-gray/30 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} className="border-brand-gray/40">
                Cancel
              </Button>
              <Button onClick={() => {
                onConfirm()
                onClose()
              }} className="bg-semantic-error hover:bg-semantic-error/90 text-white border-transparent">
                Delete Job
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
