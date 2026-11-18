import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import type { AdminUser } from "../../../data/mockAdminUsers"
import { Activity } from "lucide-react"

export function UserActivityTimeline({ user }: { user: AdminUser }) {
  const activities = user.recentActivity || [
    { action: "Signed in", time: user.lastActive }
  ]

  return (
    <PremiumCard className="h-full">
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4 flex flex-row items-center justify-between">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Recent Activity</PremiumCardTitle>
        <Activity className="w-4 h-4 text-brand-navy/40" />
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-4">
          {activities.map((act, i) => (
            <div key={i} className="flex gap-4 relative">
              {i !== activities.length - 1 && (
                <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-brand-gray/30" />
              )}
              <div className="w-4 h-4 rounded-full bg-brand-indigo/10 border-2 border-white flex-shrink-0 mt-1 z-10" />
              <div>
                <p className="text-sm font-medium text-brand-navy">{act.action}</p>
                <p className="text-xs text-brand-navy/50">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

export function ActivitySummary({ user }: { user: AdminUser }) {
  const summary = user.activitySummary || {
    label1: "Actions", value1: 0,
    label2: "Updates", value2: 0,
    label3: "Events", value3: 0
  }

  return (
    <PremiumCard className="h-full">
      <PremiumCardHeader className="pb-2 border-b border-brand-gray/20 mb-4">
        <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Activity Summary</PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent>
        <div className="flex flex-col h-full justify-between gap-4">
          <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-gray/20">
            <span className="text-sm font-medium text-brand-navy/70">{summary.label1}</span>
            <span className="text-lg font-bold text-brand-indigo">{summary.value1}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-gray/20">
            <span className="text-sm font-medium text-brand-navy/70">{summary.label2}</span>
            <span className="text-lg font-bold text-brand-navy">{summary.value2}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-brand-light rounded-lg border border-brand-gray/20">
            <span className="text-sm font-medium text-brand-navy/70">{summary.label3}</span>
            <span className="text-lg font-bold text-brand-violet">{summary.value3}</span>
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}
