
import { cn } from "../../../lib/utils"
import type { AppStatus, AIScreeningStatus } from "../../../data/recruiterMockData"

interface CandidateStatusBadgeProps {
  status: AppStatus | AIScreeningStatus
  className?: string
}

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case "Applied": return "bg-brand-gray/20 text-brand-navy/70 border-brand-gray/30"
      case "Screening":
      case "Screened": return "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
      case "Shortlisted":
      case "Potential Match": return "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20"
      case "Interview": return "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20"
      case "Hired":
      case "Strong Match": return "bg-semantic-success/10 text-semantic-success border-semantic-success/20"
      case "Rejected":
      case "Low Match": return "bg-semantic-error/10 text-semantic-error border-semantic-error/20"
      case "Not Screened": return "bg-brand-gray/10 text-brand-navy/50 border-brand-gray/20"
      default: return "bg-brand-gray/20 text-brand-navy/70 border-brand-gray/30"
    }
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap", getStyles(), className)}>
      {status}
    </span>
  )
}
