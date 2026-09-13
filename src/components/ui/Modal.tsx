import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"
import { scaleIn } from "../../lib/animations"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // Prevent scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm"
          />
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "relative z-50 w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl sm:rounded-2xl",
              className
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && (
                <h2 className="text-xl font-display font-semibold text-brand-navy">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-brand-navy/50 transition-colors hover:bg-brand-gray/50 hover:text-brand-navy"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
