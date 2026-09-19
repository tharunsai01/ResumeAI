
import { cn } from "../../../lib/utils"

interface CandidateMatchScoreProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function CandidateMatchScore({ score, size = "md", showLabel = true, className }: CandidateMatchScoreProps) {
  const getColor = () => {
    if (score >= 90) return "text-semantic-success"
    if (score >= 70) return "text-semantic-warning"
    return "text-semantic-error"
  }

  const getBgColor = () => {
    if (score >= 90) return "bg-semantic-success/10"
    if (score >= 70) return "bg-semantic-warning/10"
    return "bg-semantic-error/10"
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-8 h-8 text-xs"
      case "lg": return "w-16 h-16 text-xl"
      default: return "w-12 h-12 text-base" // md
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className={cn("rounded-full flex items-center justify-center font-bold border-2 border-current", getColor(), getBgColor(), getSizeClasses())}>
        {score}%
      </div>
      {showLabel && (
        <span className="text-[10px] font-semibold text-brand-navy/60 uppercase tracking-wider">
          Match
        </span>
      )}
    </div>
  )
}
