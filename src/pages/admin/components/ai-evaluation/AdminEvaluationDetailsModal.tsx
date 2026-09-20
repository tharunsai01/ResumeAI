import { Modal } from "../../../../components/ui/Modal"
import type { EvaluationRecord } from "../../../../data/mockAdminAiEvaluation"
import { AdminStatusBadge } from "../../components/AdminStatusBadge"

interface AdminEvaluationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  evaluation: EvaluationRecord | null
}

export function AdminEvaluationDetailsModal({ isOpen, onClose, evaluation }: AdminEvaluationDetailsModalProps) {
  if (!evaluation) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluation Details"
      className="max-w-2xl"
    >
      <div className="py-4 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-navy mb-1">Evaluation: {evaluation.id}</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-brand-navy/60">{evaluation.date}</span>
              <span className="text-brand-gray/40">•</span>
              <span className="text-sm text-brand-navy/60">Model: {evaluation.modelVersion}</span>
            </div>
          </div>
          <AdminStatusBadge status={evaluation.status === "Completed" ? "Active" : "Pending"} className="shrink-0" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Configuration</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Dataset:</span>
                <span className="font-medium text-brand-navy">{evaluation.dataset}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-brand-navy/60">Components:</span>
                <span className="font-medium text-brand-navy text-right pl-4">{evaluation.components}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-light/30 p-4 rounded-xl border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Metrics Overview</div>
            <div className="space-y-1 text-sm">
              {evaluation.metrics.skillExtraction && (
                <div className="flex justify-between">
                  <span className="text-brand-navy/60">Skill Extraction:</span>
                  <span className="font-medium text-brand-navy">{evaluation.metrics.skillExtraction}</span>
                </div>
              )}
              {evaluation.metrics.scoreStability && (
                <div className="flex justify-between">
                  <span className="text-brand-navy/60">Score Stability:</span>
                  <span className="font-medium text-brand-navy">{evaluation.metrics.scoreStability}</span>
                </div>
              )}
              {evaluation.metrics.fairness && (
                <div className="flex justify-between">
                  <span className="text-brand-navy/60">Fairness:</span>
                  <span className="font-medium text-brand-navy text-right">{evaluation.metrics.fairness}</span>
                </div>
              )}
              {evaluation.metrics.security && (
                <div className="flex justify-between mt-2 pt-2 border-t border-brand-gray/20">
                  <span className="text-brand-navy/60">Security:</span>
                  <span className="font-medium text-semantic-warning">{evaluation.metrics.security}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Findings Detail - if applicable */}
        <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
          <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-3">Evaluation Findings</div>
          <div className="space-y-2 text-sm text-brand-navy/70">
            <p>This evaluation run verified the configured components against the designated dataset.</p>
            {evaluation.metrics.security && (
              <p className="text-semantic-warning font-medium">Attention: Security warnings were recorded during this run and should be reviewed in the main dashboard.</p>
            )}
            {evaluation.metrics.fairness && (
              <p>Fairness comparison results were generated and are available for detailed case-by-case review.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
