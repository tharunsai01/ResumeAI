import { Modal } from "../../../components/ui/Modal"
import type { SkillTaxonomy, SkillCategory } from "../../../data/mockAdminSkills"
import { AdminStatusBadge } from "./AdminStatusBadge"

interface AdminSkillDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  skill: SkillTaxonomy | null
  categories: SkillCategory[]
}

export function AdminSkillDetailsModal({ isOpen, onClose, skill, categories }: AdminSkillDetailsModalProps) {
  if (!skill) return null

  const category = categories.find(c => c.id === skill.categoryId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Skill Details"
      className="max-w-md"
    >
      <div className="space-y-6 py-4">
        
        <div>
          <h2 className="text-2xl font-display font-bold text-brand-navy mb-1">{skill.name}</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-brand-navy/60">{category?.name || "Unknown Category"}</span>
            <span className="text-brand-gray/40">•</span>
            <AdminStatusBadge status={skill.status} />
          </div>
        </div>

        <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30 space-y-4">
          
          <div>
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Description</div>
            <p className="text-sm text-brand-navy/80 leading-relaxed">
              {skill.description || "No description provided."}
            </p>
          </div>

          {skill.aliases && skill.aliases.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1.5">Aliases</div>
              <div className="flex flex-wrap gap-1.5">
                {skill.aliases.map(alias => (
                  <span key={alias} className="px-2 py-1 bg-white border border-brand-gray/40 rounded-md text-xs font-medium text-brand-navy/70 shadow-sm">
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Usage</div>
            <div className="text-lg font-bold text-brand-navy">{skill.usageCount} <span className="text-sm font-medium text-brand-navy/50">profiles</span></div>
          </div>
          <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Last Updated</div>
            <div className="text-sm font-bold text-brand-navy">{skill.updatedAt}</div>
          </div>
        </div>
        
        <div className="text-xs text-brand-navy/40 text-center">
          Created on {skill.createdAt}
        </div>

      </div>
    </Modal>
  )
}
