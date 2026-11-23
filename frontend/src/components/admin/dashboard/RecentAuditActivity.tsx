import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import { adminDashboardService } from "../../../services/adminDashboardService"
import { ScrollText, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function RecentAuditActivity() {
  const navigate = useNavigate()
  const auditActivities = adminDashboardService.getAuditActivities()

  return (
    <PremiumCard className="col-span-1 lg:col-span-2 flex flex-col">
      <PremiumCardHeader className="pb-2">
        <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-brand-indigo" />
          Recent Audit Activity
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col mt-4">
        
        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-navy/50 uppercase bg-brand-light/50 border-b border-brand-gray/30">
              <tr>
                <th className="px-3 sm:px-4 py-3 font-semibold rounded-tl-lg whitespace-nowrap">Activity</th>
                <th className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">Actor</th>
                <th className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">Role</th>
                <th className="px-3 sm:px-4 py-3 font-semibold rounded-tr-lg whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody>
              {auditActivities.map((log, index) => (
                <tr key={log.id} className={`border-b border-brand-gray/10 hover:bg-brand-light/30 transition-colors ${index === auditActivities.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-3 sm:px-4 py-3 font-medium text-brand-navy whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        log.status === 'success' ? 'bg-semantic-success' :
                        log.status === 'warning' ? 'bg-semantic-warning' :
                        log.status === 'error' ? 'bg-semantic-error' : 'bg-brand-indigo'
                      }`} />
                      <span className="truncate max-w-[200px] sm:max-w-none">{log.activity}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-brand-navy/70 whitespace-nowrap">{log.actor}</td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                      log.role === 'Administrator' ? 'bg-brand-indigo/10 text-brand-indigo' :
                      log.role === 'Recruiter' ? 'bg-brand-violet/10 text-brand-violet' :
                      log.role === 'System' ? 'bg-brand-navy/10 text-brand-navy' :
                      'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {log.role}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-brand-navy/50 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex sm:justify-end">
          <button 
            onClick={() => navigate('/admin/audit-logs')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium text-brand-indigo hover:text-brand-indigo/80 transition-colors py-2 px-4 hover:bg-brand-indigo/5 rounded-lg"
          >
            View Audit Logs <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </PremiumCardContent>
    </PremiumCard>
  )
}
