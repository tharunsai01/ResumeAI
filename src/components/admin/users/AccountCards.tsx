import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import type { AdminUser } from "../../../data/mockAdminUsers"
import { UserRoleBadge, UserStatusBadge, UserVerificationBadge } from "./UserBadges"

export function AccountInformation({ user }: { user: AdminUser }) {
  return (
    <PremiumCard>
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Account Information</PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">User ID</div>
            <div className="font-medium text-brand-navy">{user.id}</div>
          </div>
          <div>
            <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Full Name</div>
            <div className="font-medium text-brand-navy">{user.name}</div>
          </div>
          <div>
            <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Email</div>
            <div className="font-medium text-brand-navy">{user.email}</div>
          </div>
          <div>
            <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Registration Date</div>
            <div className="font-medium text-brand-navy">{user.joinedAt}</div>
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

export function RoleAccessCard({ user }: { user: AdminUser }) {
  const getAccessText = () => {
    switch(user.role) {
      case "Administrator": return "Administrative access"
      case "Recruiter": return "Recruiter platform access"
      case "Candidate": return "Candidate platform access"
    }
  }

  return (
    <PremiumCard>
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Role & Access</PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-brand-gray/10">
            <div>
              <div className="text-sm font-medium text-brand-navy">Current Role</div>
              <div className="text-xs text-brand-navy/60">{getAccessText()}</div>
            </div>
            <UserRoleBadge role={user.role} />
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-brand-gray/10">
            <div>
              <div className="text-sm font-medium text-brand-navy">Account Access</div>
              <div className="text-xs text-brand-navy/60">Platform permissions state</div>
            </div>
            <UserStatusBadge status={user.status} />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-brand-navy">Verification</div>
              <div className="text-xs text-brand-navy/60">Identity verification state</div>
            </div>
            <UserVerificationBadge verification={user.verification} />
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}
