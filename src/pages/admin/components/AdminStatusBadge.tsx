import { cn } from "../../../lib/utils"

interface AdminStatusBadgeProps {
  status: string
  className?: string
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  return (
    <span className={cn(
      "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-flex items-center justify-center",
      status === "Active" || status === "Resolved"
        ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20"
        : status === "High" || status === "Open"
        ? "bg-semantic-error/10 text-semantic-error border-semantic-error/20"
        : status === "In Review" || status === "Medium" || status === "Pending"
        ? "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20"
        : "bg-brand-gray/10 text-brand-navy/50 border-brand-gray/20",
      className
    )}>
      {status}
    </span>
  )
}
