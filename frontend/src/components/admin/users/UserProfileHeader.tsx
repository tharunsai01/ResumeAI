import type { AdminUser } from "../../../data/mockAdminUsers"
import { UserRoleBadge, UserStatusBadge, UserVerificationBadge } from "./UserBadges"
import SpotlightCard from "../../ui/SpotlightCard";

export function UserProfileHeader({ user }: { user: AdminUser }) {
  return (
    <SpotlightCard className="glass-card p-4 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0">
        {user.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0 w-full">
        <h2 className="text-xl sm:text-2xl font-display font-semibold text-brand-navy mb-1 break-words">{user.name}</h2>
        <p className="text-sm sm:text-base text-brand-navy/60 mb-4 break-words">{user.email}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
          <UserVerificationBadge verification={user.verification} />
        </div>
      </div>
      <div className="text-left md:text-right text-xs sm:text-sm text-brand-navy/60 space-y-1 w-full md:w-auto">
        <div><span className="font-medium text-brand-navy/80">Joined:</span> {user.joinedAt}</div>
        <div><span className="font-medium text-brand-navy/80">Last Active:</span> {user.lastActive}</div>
      </div>
    </SpotlightCard>
  )
}
