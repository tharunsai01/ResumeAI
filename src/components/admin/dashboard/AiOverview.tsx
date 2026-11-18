import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../ui/PremiumCard"
import { aiEvaluationOverview } from "../../../data/mockAdminDashboard"
import { BrainCircuit, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function AiOverview() {
  const navigate = useNavigate()
  const { processing, security, evaluation } = aiEvaluationOverview

  return (
    <PremiumCard className="col-span-1 lg:col-span-2 flex flex-col">
      <PremiumCardHeader className="pb-2">
        <PremiumCardTitle className="text-xl font-display font-semibold text-brand-navy flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-brand-violet" />
          AI & Responsible AI
        </PremiumCardTitle>
        <p className="text-sm text-brand-navy/60">Monitoring AI fairness, processing health, and resume security.</p>
      </PremiumCardHeader>
      <PremiumCardContent className="flex-1 flex flex-col mt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {/* Processing */}
          <div className="bg-brand-light rounded-xl p-4 border border-brand-gray/30">
            <h4 className="text-sm font-semibold text-brand-navy/70 uppercase tracking-wider mb-3">AI Processing</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Resumes Processed</span>
                <span className="font-semibold text-brand-navy">{processing.processed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Successful</span>
                <span className="font-semibold text-semantic-success">{processing.successful.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Warnings</span>
                <span className="font-semibold text-semantic-warning">{processing.warnings}</span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-brand-light rounded-xl p-4 border border-brand-gray/30">
            <h4 className="text-sm font-semibold text-brand-navy/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-indigo" />
              Resume Security
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Checks Completed</span>
                <span className="font-semibold text-brand-navy">{security.checksCompleted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Suspicious Content</span>
                <span className="font-semibold text-semantic-warning">{security.suspiciousContent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Prompt Injection</span>
                <span className="font-semibold text-semantic-error">{security.promptInjection}</span>
              </div>
            </div>
          </div>

          {/* Evaluation */}
          <div className="bg-brand-light rounded-xl p-4 border border-brand-gray/30">
            <h4 className="text-sm font-semibold text-brand-navy/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-semantic-success" />
              AI Evaluation
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-brand-navy/60">Skill Extraction</span>
                <span className="text-xs px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo font-medium">{evaluation.skillExtraction}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-navy/60">Score Stability</span>
                <span className="text-xs px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo font-medium">{evaluation.scoreStability}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-navy/60">Fairness Test</span>
                <span className="text-xs px-2 py-0.5 rounded bg-semantic-success/10 text-semantic-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {evaluation.fairnessTest}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => navigate('/admin/ai-evaluation')}
            className="flex items-center gap-2 text-sm font-medium text-brand-violet hover:text-brand-violet/80 transition-colors py-2 px-4 bg-brand-violet/5 rounded-lg hover:bg-brand-violet/10"
          >
            View AI Evaluation <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </PremiumCardContent>
    </PremiumCard>
  )
}
