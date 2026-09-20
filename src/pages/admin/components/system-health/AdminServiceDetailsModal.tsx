import { Modal } from "../../../../components/ui/Modal"
import type { ServiceHealth } from "../../../../data/mockAdminSystemHealth"
import { AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react"

interface AdminServiceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  service: ServiceHealth | null
}

export function AdminServiceDetailsModal({ isOpen, onClose, service }: AdminServiceDetailsModalProps) {
  if (!service) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Operational": return <CheckCircle2 className="w-5 h-5 text-semantic-success" />
      case "Degraded": return <AlertTriangle className="w-5 h-5 text-semantic-warning" />
      case "Unavailable": return <XCircle className="w-5 h-5 text-semantic-error" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Operational": return "bg-semantic-success/10 text-semantic-success border-semantic-success/20"
      case "Degraded": return "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20"
      case "Unavailable": return "bg-semantic-error/10 text-semantic-error border-semantic-error/20"
      default: return "bg-brand-gray/10 text-brand-navy border-brand-gray/20"
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Service Details"
      className="max-w-xl"
    >
      <div className="py-2 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-brand-light/20 border-brand-gray/20">
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-navy mb-1">{service.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border flex items-center gap-1 ${getStatusColor(service.status)}`}>
                {getStatusIcon(service.status)}
                {service.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-brand-navy/50 font-medium uppercase tracking-wider mb-1">Response Time</div>
            <div className="text-lg font-semibold text-brand-navy">{service.responseTime}</div>
          </div>
        </div>

        {/* Metrics/Details */}
        {service.details && Object.keys(service.details).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-3">Service Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(service.details).map(([key, value], idx) => (
                <div key={idx} className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/10 flex justify-between items-center">
                  <span className="text-sm text-brand-navy/60">{key}</span>
                  <span className="text-sm font-semibold text-brand-navy">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div>
          <h4 className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-3">Recent Events</h4>
          <div className="space-y-2">
            {service.recentEvents.length > 0 ? (
              service.recentEvents.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-brand-gray/10 bg-brand-light/20 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {event.severity === 'Info' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {event.severity === 'Warning' && <AlertTriangle className="w-4 h-4 text-semantic-warning" />}
                    {event.severity === 'Critical' && <XCircle className="w-4 h-4 text-semantic-error" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-brand-navy/90">{event.message}</div>
                    <div className="text-xs text-brand-navy/50 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {event.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-brand-navy/50 border border-brand-gray/10 rounded-lg">
                No recent events recorded.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-brand-gray/10">
          <span className="text-xs text-brand-navy/40">Last checked: {service.lastChecked}</span>
        </div>
      </div>
    </Modal>
  )
}
