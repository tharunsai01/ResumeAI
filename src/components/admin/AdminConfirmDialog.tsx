import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"

interface AdminConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: "danger" | "warning" | "info"
}

export function AdminConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel", 
  onConfirm, 
  onCancel,
  variant = "danger"
}: AdminConfirmDialogProps) {
  if (!isOpen) return null

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-semantic-error text-white hover:bg-semantic-error/90"
      case "warning":
        return "bg-semantic-warning text-white hover:bg-semantic-warning/90"
      case "info":
      default:
        return "bg-brand-indigo text-white hover:bg-brand-indigo/90"
    }
  }

  const getIconColor = () => {
    switch (variant) {
      case "danger": return "text-semantic-error bg-semantic-error/10"
      case "warning": return "text-semantic-warning bg-semantic-warning/10"
      case "info": return "text-brand-indigo bg-brand-indigo/10"
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-card relative w-full max-w-md overflow-hidden flex flex-col p-6 z-10"
        >
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getIconColor()}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">{title}</h3>
            <div className="text-brand-navy/70 text-sm mb-8">{message}</div>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium text-brand-navy/70 hover:bg-brand-gray/30 transition-colors border border-brand-gray/50"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm ${getVariantStyles()}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
