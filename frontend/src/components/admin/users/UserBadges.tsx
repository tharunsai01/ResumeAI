import type { AdminUserStatus, AdminUserRole, AdminUserVerification } from "../../../data/mockAdminUsers"
import { CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react"

export function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  switch (status) {
    case "Active":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-semantic-success/10 text-semantic-success border border-semantic-success/20 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    case "Pending":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 whitespace-nowrap shrink-0">
        <AlertTriangle className="w-3 h-3" /> Pending
      </span>
    case "Suspended":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-semantic-error/10 text-semantic-error border border-semantic-error/20 whitespace-nowrap shrink-0">
        <AlertOctagon className="w-3 h-3" /> Suspended
      </span>
    default:
      return null
  }
}

export function UserRoleBadge({ role }: { role: AdminUserRole }) {
  switch (role) {
    case "Administrator":
      return <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-indigo/10 text-brand-indigo whitespace-nowrap shrink-0">Admin</span>
    case "Recruiter":
      return <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-violet/10 text-brand-violet whitespace-nowrap shrink-0">Recruiter</span>
    case "Candidate":
      return <span className="inline-block px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-blue/10 text-brand-blue whitespace-nowrap shrink-0">Candidate</span>
    default:
      return null
  }
}

export function UserVerificationBadge({ verification }: { verification: AdminUserVerification }) {
  if (verification === "Verified") {
    return <span className="text-xs text-semantic-success font-medium flex items-center gap-1 whitespace-nowrap shrink-0"><CheckCircle2 className="w-3 h-3" /> Verified</span>
  }
  return <span className="text-xs text-brand-navy/40 font-medium whitespace-nowrap shrink-0">Unverified</span>
}
