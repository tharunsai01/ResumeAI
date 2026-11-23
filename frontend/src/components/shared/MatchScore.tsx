import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface MatchScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MatchScore({ score, size = "md", className }: MatchScoreProps) {
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 85) return "text-semantic-success"
    if (s >= 65) return "text-semantic-warning"
    return "text-semantic-error"
  }

  const colorClass = getColor(score)
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const sizeClasses = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-24 h-24 text-lg",
  }

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle
          className="text-brand-gray/50 stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <motion.circle
          className={cn("stroke-current", colorClass)}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute font-semibold text-brand-navy">
        {score}%
      </div>
    </div>
  )
}
