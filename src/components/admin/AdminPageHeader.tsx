import { motion } from "framer-motion"

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  statusIndicator?: { label: string, isHealthy: boolean }
}

export function AdminPageHeader({ title, description, action, statusIndicator }: AdminPageHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-display font-semibold text-brand-navy">{title}</h1>
          {statusIndicator && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              statusIndicator.isHealthy 
                ? 'bg-semantic-success/10 text-semantic-success border-semantic-success/20' 
                : 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusIndicator.isHealthy ? 'bg-semantic-success animate-pulse' : 'bg-semantic-warning'}`} />
              {statusIndicator.label}
            </div>
          )}
        </div>
        {description && (
          <p className="text-brand-navy/60 mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </motion.div>
  )
}
