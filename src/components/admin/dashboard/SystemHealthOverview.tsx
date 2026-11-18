import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import { systemHealth } from "../../../data/mockAdminDashboard"
import { Activity, ArrowRight, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SystemHealthOverview() {
  const navigate = useNavigate()

  return (
    <PremiumCard className="flex flex-col">
      <PremiumCardHeader className="pb-2">
        <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <Activity className="w-5 h-5 text-semantic-success" />
          System Health
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col justify-between mt-4">
        
        <div className="flex items-center justify-between p-4 bg-brand-light rounded-xl border border-brand-gray/30 mb-4">
          <span className="font-semibold text-brand-navy">System Uptime</span>
          <span className="text-xl font-bold text-semantic-success">{systemHealth.uptime}</span>
        </div>

        <div className="space-y-3">
          {systemHealth.services.map((service, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-sm font-medium text-brand-navy/70">{service.name}</span>
              <span className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 font-medium ${
                service.healthy ? 'text-semantic-success bg-semantic-success/10' : 'text-semantic-error bg-semantic-error/10'
              }`}>
                {service.healthy ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-semantic-error animate-pulse" />}
                {service.status}
              </span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => navigate('/admin/system-health')}
          className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-navy/80 transition-colors py-2 bg-brand-gray/10 rounded-lg hover:bg-brand-gray/20"
        >
          View System Health <ArrowRight className="w-4 h-4" />
        </button>
      </PremiumCardContent>
    </PremiumCard>
  )
}
