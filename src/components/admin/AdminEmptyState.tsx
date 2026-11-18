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
      className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-brand-gray/50 rounded-2xl bg-brand-light/50"
    >
      <div className="w-16 h-16 bg-brand-navy/5 text-brand-navy/40 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-display font-bold text-brand-navy mb-2">{title}</h3>
      <p className="text-brand-navy/60 max-w-md mb-8">{description}</p>
      {action}
    </motion.div>
  )
}
