import { useState, useEffect } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import type { SkillTaxonomy, SkillCategory } from "../../../data/mockAdminSkills"

interface AdminSkillModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (skill: Partial<SkillTaxonomy>) => void
  existingSkill?: SkillTaxonomy | null
  categories: SkillCategory[]
  allSkills: SkillTaxonomy[]
}

export function AdminSkillModal({ isOpen, onClose, onSave, existingSkill, categories, allSkills }: AdminSkillModalProps) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [aliases, setAliases] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"Active" | "Inactive">("Active")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      if (existingSkill) {
        setName(existingSkill.name)
        setCategoryId(existingSkill.categoryId)
        setAliases(existingSkill.aliases.join(", "))
        setDescription(existingSkill.description)
        setStatus(existingSkill.status)
      } else {
        setName("")
        setCategoryId("")
        setAliases("")
        setDescription("")
        setStatus("Active")
      }
      setError("")
    }
  }, [isOpen, existingSkill])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Skill Name is required.")
      return
    }
    if (!categoryId) {
      setError("Category is required.")
      return
    }

    // Duplicate check
    const isDuplicate = allSkills.some(
      s => s.name.toLowerCase() === trimmedName.toLowerCase() && s.id !== existingSkill?.id
    )
    if (isDuplicate) {
      setError("Skill already exists.")
      return
    }

    onSave({
      name: trimmedName,
      categoryId,
      aliases: aliases.split(",").map(a => a.trim()).filter(a => a),
      description: description.trim(),
      status
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingSkill ? "Edit Skill" : "Add Skill"}
      className="max-w-md"
    >
      <div className="space-y-4 py-4">
        {error && (
          <div className="bg-semantic-error/10 text-semantic-error px-3 py-2 rounded-lg text-sm font-medium border border-semantic-error/20">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Skill Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all"
            placeholder="e.g. Python"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Category *</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Aliases (comma-separated)</label>
          <input
            type="text"
            value={aliases}
            onChange={e => setAliases(e.target.value)}
            className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all"
            placeholder="e.g. Python 3, Python Language"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all resize-none h-20"
            placeholder="Brief description of the skill..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 border-t border-brand-gray/20 pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="bg-brand-indigo hover:bg-brand-blue text-white">
          {existingSkill ? "Save Changes" : "Add Skill"}
        </Button>
      </div>
    </Modal>
  )
}
