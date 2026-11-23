import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import type { AdminUser } from "../../../data/mockAdminUsers"
import { ShieldCheck, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function ProfileInformationCard({ user }: { user: AdminUser }) {
  const p = user.profile || {}
  
  return (
    <PremiumCard>
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Profile Information</PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-4 text-sm">
          {p.headline && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Headline</div>
              <div className="font-medium text-brand-navy">{p.headline}</div>
            </div>
          )}
          {p.company && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Company</div>
              <div className="font-medium text-brand-navy">{p.company}</div>
            </div>
          )}
          {p.department && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Department</div>
              <div className="font-medium text-brand-navy">{p.department}</div>
            </div>
          )}
          {p.education && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Education</div>
              <div className="font-medium text-brand-navy">{p.education}</div>
            </div>
          )}
          {p.experience && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-1">Experience</div>
              <div className="font-medium text-brand-navy">{p.experience}</div>
            </div>
          )}
          {p.skills && (
            <div>
              <div className="text-brand-navy/50 text-xs uppercase tracking-wider font-semibold mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {p.skills.map(s => (
                  <span key={s} className="px-2 py-1 bg-brand-light text-brand-navy rounded text-xs font-medium border border-brand-gray/20">{s}</span>
                ))}
              </div>
            </div>
          )}
          {Object.keys(p).length === 0 && (
            <div className="text-brand-navy/50 italic">No specific profile information available.</div>
          )}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

export function AccountSecurityCard({ user }: { user: AdminUser }) {
  const navigate = useNavigate()
  const hasEvents = user.security && user.security.events > 0

  return (
    <PremiumCard className="h-full flex flex-col">
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4 flex flex-row items-center justify-between">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Account Security & Audit</PremiumCardTitle>
        {hasEvents ? <ShieldAlert className="w-5 h-5 text-semantic-warning" /> : <ShieldCheck className="w-5 h-5 text-semantic-success" />}
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-navy/70">Email Verification</span>
            <span className="font-medium text-semantic-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-navy/70">Recent Security Events</span>
            {hasEvents ? (
              <span className="font-bold text-semantic-warning">{user.security!.events}</span>
            ) : (
              <span className="text-brand-navy/50">None</span>
            )}
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-navy/70">Last Sign-in</span>
            <span className="font-medium text-brand-navy">{user.lastActive}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-brand-gray/10">
          <p className="text-xs text-brand-navy/60 mb-3">Administrative actions related to this account are recorded in the audit log.</p>
          <button 
            onClick={() => navigate(`/admin/audit-logs?userId=${user.id}`)}
            className="flex items-center gap-2 text-sm font-medium text-brand-indigo hover:text-brand-indigo/80 transition-colors"
          >
            View Audit Logs <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}
