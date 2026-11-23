import * as React from "react"
import { cn } from "../../lib/utils"
import type { SkillLevel } from "../../data/mockSkills"

interface SkillBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  level?: SkillLevel
  score?: number
  variant?: "default" | "outline" | "ghost"
}

export function SkillBadge({ name, level, score, variant = "default", className, ...props }: SkillBadgeProps) {
  const getLevelColor = (l?: SkillLevel) => {
    switch (l) {
      case "Expert": return "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20"
      case "Advanced": return "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
      case "Intermediate": return "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20"
      case "Beginner": return "bg-brand-gray/50 text-brand-navy/70 border-brand-gray/80"
      default: return "bg-brand-light text-brand-navy border-brand-gray/50"
    }
  }

  const baseStyles = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors"
  
  return (
    <div 
      className={cn(
        baseStyles,
        variant === "default" && getLevelColor(level),
        variant === "outline" && "bg-transparent text-brand-navy border-brand-gray/50",
        variant === "ghost" && "bg-brand-gray/20 text-brand-navy border-transparent hover:bg-brand-gray/40",
        className
      )}
      {...props}
    >
      {name}
      {level && <span className="opacity-70 text-[10px] ml-1 uppercase tracking-wider">{level}</span>}
      {score !== undefined && <span className="opacity-70 text-[10px] ml-1">{score}%</span>}
    </div>
  )
}
