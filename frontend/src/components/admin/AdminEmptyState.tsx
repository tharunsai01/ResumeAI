import { motion } from "framer-motion"

interface AdminEmptyStateProps {
  icon: any
  title: string
  description: string
  action?: React.ReactNode
}

export function AdminEmptyState({ icon: Icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center p-6 sm:p-12 text-center border border-dashed border-brand-gray/50 rounded-2xl bg-brand-light/50"
    >
      <div className="w-16 h-16 bg-brand-navy/5 text-brand-navy/40 rounded-2xl flex items-center justify-center mb-6 shrink-0">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-display font-bold text-brand-navy mb-2 break-words">{title}</h3>
      <p className="text-brand-navy/60 max-w-md mb-8 break-words text-sm sm:text-base">{description}</p>
      {action && (
        <div className="w-full sm:w-auto flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  )
}
