import { motion } from "framer-motion"
import { PremiumCard, PremiumCardContent } from "../ui/PremiumCard"

interface AdminStatCardProps {
  title: string
  value: string | number
  icon: any
  delay?: number
  color?: { bg: string, text: string }
  trend?: { value: string, isPositive: boolean }
}

export function AdminStatCard({ title, value, icon: Icon, delay = 0, color = { bg: "bg-brand-indigo/10", text: "text-brand-indigo" }, trend }: AdminStatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
    >
      <PremiumCard className="hover:-translate-y-0.5 transition-all duration-200">
        <PremiumCardContent className="p-5 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
            <h3 className="text-2xl font-display font-bold text-brand-navy">
              {value}
            </h3>
            {trend && (
              <p className={`text-xs mt-2 font-medium ${trend.isPositive ? "text-semantic-success" : "text-semantic-error"}`}>
                {trend.isPositive ? "+" : "-"}{trend.value} <span className="text-brand-navy/40 font-normal">vs last month</span>
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </PremiumCardContent>
      </PremiumCard>
    </motion.div>
  )
}
