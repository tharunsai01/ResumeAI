import { Modal } from "../../../components/ui/Modal"
import type { AuditLog } from "../../../data/mockAdminAuditLogs"
import { AdminStatusBadge } from "./AdminStatusBadge"
import { cn } from "../../../lib/utils"

interface AdminAuditDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  log: AuditLog | null
}

export function AdminAuditDetailsModal({ isOpen, onClose, log }: AdminAuditDetailsModalProps) {
  if (!log) return null

  // Format severity map to align with AdminStatusBadge
  const severityMap: Record<string, string> = {
    Info: "Info",
    Warning: "Warning",
    Critical: "High" // Map critical to High so it uses the red badge
  }

  const badgeStatus = severityMap[log.severity] || "Info"

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Details"
      className="max-w-2xl"
    >
      <div className="py-4 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-navy mb-1">{log.description}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-navy/60">{log.id}</span>
              <span className="text-brand-gray/40">•</span>
              <span className="text-sm text-brand-navy/60">{log.eventType}</span>
            </div>
          </div>
          <AdminStatusBadge status={badgeStatus} className="shrink-0" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Actor Information</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Name:</span>
                <span className="font-medium text-brand-navy">{log.actorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Role:</span>
                <span className="font-medium text-brand-navy">{log.actorRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">ID:</span>
                <span className="font-medium text-brand-navy">{log.actorId}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Resource Information</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Type:</span>
                <span className="font-medium text-brand-navy">{log.resourceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">ID:</span>
                <span className="font-medium text-brand-indigo">{log.resourceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Timestamp:</span>
                <span className="font-medium text-brand-navy">{log.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div className={cn(
            "p-4 rounded-xl border",
            log.severity === "Critical" 
              ? "bg-semantic-error/5 border-semantic-error/20" 
              : "bg-brand-light/50 border-brand-gray/30"
          )}>
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-3">Event Metadata</div>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(log.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-1.5 border-b border-brand-gray/10 last:border-0 last:pb-0">
                  <span className="text-sm font-medium text-brand-navy/70">{key}</span>
                  <span className="text-sm font-medium text-brand-navy text-left sm:text-right break-words">{value as any}</span>
                </div>
              ))}
            </div>
            
            {log.severity === "Critical" && log.eventType === "Security" && (
              <div className="mt-4 p-3 bg-white/50 rounded-lg border border-semantic-error/10 text-xs text-brand-navy/60">
                Security event recorded. The raw payload has been hidden to prevent executing unsafe content.
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  )
}
