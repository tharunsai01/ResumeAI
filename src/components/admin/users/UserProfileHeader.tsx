import type { AdminUser } from "../../../data/mockAdminUsers"
import { UserRoleBadge, UserStatusBadge, UserVerificationBadge } from "./UserBadges"
import SpotlightCard from "../../ui/SpotlightCard";

export function UserProfileHeader({ user }: { user: AdminUser }) {
  return (
    <SpotlightCard className="glass-card p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center text-3xl font-bold shrink-0">
        {user.name.charAt(0)}
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-display font-semibold text-brand-navy mb-1">{user.name}</h2>
        <p className="text-brand-navy/60 mb-4">{user.email}</p>
        <div className="flex flex-wrap items-center gap-3">
          <UserRoleBadge role={user.role} />
          <UserStatusBadge status={user.status} />
          <UserVerificationBadge verification={user.verification} />
        </div>
      </div>
      <div className="text-left md:text-right text-sm text-brand-navy/60 space-y-1">
        <div><span className="font-medium text-brand-navy/80">Joined:</span> {user.joinedAt}</div>
        <div><span className="font-medium text-brand-navy/80">Last Active:</span> {user.lastActive}</div>
      </div>
    </SpotlightCard>
  )
}
