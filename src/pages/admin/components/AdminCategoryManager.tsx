import { useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import type { SkillCategory, SkillTaxonomy } from "../../../data/mockAdminSkills"
import { Edit2, Plus, Power, ShieldAlert, CheckCircle2 } from "lucide-react"
import { cn } from "../../../lib/utils"

interface AdminCategoryManagerProps {
  isOpen: boolean
  onClose: () => void
  categories: SkillCategory[]
  allSkills: SkillTaxonomy[]
  onAdd: (category: Omit<SkillCategory, "id">) => void
  onUpdate: (id: string, updates: Partial<SkillCategory>) => void
  onToggleStatus: (id: string) => void
}

export function AdminCategoryManager({ isOpen, onClose, categories, allSkills, onAdd, onUpdate, onToggleStatus }: AdminCategoryManagerProps) {
  const [view, setView] = useState<"list" | "form">("list")
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"Active" | "Inactive">("Active")
  const [error, setError] = useState("")
  const [toastMsg, setToastMsg] = useState("")

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  const handleOpenForm = (category?: SkillCategory) => {
    setError("")
    if (category) {
      setEditingCategory(category)
      setName(category.name)
      setDescription(category.description)
      setStatus(category.status)
    } else {
      setEditingCategory(null)
      setName("")
      setDescription("")
      setStatus("Active")
    }
    setView("form")
  }

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Category Name is required.")
      return
    }

    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategory?.id
    )
    if (isDuplicate) {
      setError("Category already exists.")
      return
    }

    if (editingCategory) {
      onUpdate(editingCategory.id, { name: trimmedName, description: description.trim(), status })
      showToast("Category updated successfully.")
    } else {
      onAdd({ name: trimmedName, description: description.trim(), status })
      showToast("Category added successfully.")
    }

    setView("list")
  }

  const handleToggleStatus = (category: SkillCategory) => {
    if (category.status === "Active") {
      // Check if it contains active skills
      const hasActiveSkills = allSkills.some(s => s.categoryId === category.id && s.status === "Active")
      if (hasActiveSkills) {
        setError(`Cannot deactivate: "${category.name}" contains active skills.`)
        setTimeout(() => setError(""), 3000)
        return
      }
    }
    onToggleStatus(category.id)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={view === "list" ? "Manage Categories" : editingCategory ? "Edit Category" : "Add Category"}
      className="max-w-2xl"
    >
      <div className="py-4 h-[60vh] flex flex-col relative">
        {toastMsg && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-200 flex items-center gap-2 text-sm font-medium shadow-md">
            <CheckCircle2 className="w-4 h-4" /> {toastMsg}
          </div>
        )}

        {error && view === "list" && (
          <div className="mb-4 bg-semantic-error/10 text-semantic-error px-4 py-3 rounded-xl border border-semantic-error/20 flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="w-4 h-4" /> {error}
          </div>
        )}

        {view === "list" ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-end mb-4 shrink-0">
              <Button onClick={() => handleOpenForm()} className="bg-brand-indigo hover:bg-brand-blue text-white h-9">
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto border border-brand-gray/20 rounded-xl bg-white shadow-sm scrollbar-thin">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold sticky top-0 z-10 border-b border-brand-gray/20">
                  <tr>
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3 text-center">Skills Count</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/10">
                  {categories.length > 0 ? (
                    categories.map(cat => {
                      const count = allSkills.filter(s => s.categoryId === cat.id).length
                      return (
                        <tr key={cat.id} className="hover:bg-brand-light/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-brand-navy">{cat.name}</div>
                            <div className="text-xs text-brand-navy/50 mt-0.5 truncate max-w-[200px]">{cat.description}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-brand-navy/70">
                            {count} skills
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn(
                              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border",
                              cat.status === "Active" 
                                ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20"
                                : "bg-brand-gray/10 text-brand-navy/50 border-brand-gray/20"
                            )}>
                              {cat.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleOpenForm(cat)}
                                className="p-1.5 text-brand-navy/60 hover:text-brand-indigo hover:bg-brand-indigo/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(cat)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-colors",
                                  cat.status === "Active" 
                                    ? "text-semantic-error hover:bg-semantic-error/10" 
                                    : "text-semantic-success hover:bg-semantic-success/10"
                                )}
                                title={cat.status === "Active" ? "Deactivate" : "Activate"}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-brand-navy/50">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full max-w-md mx-auto w-full pt-4">
            <div className="space-y-4 flex-1">
              {error && (
                <div className="bg-semantic-error/10 text-semantic-error px-3 py-2 rounded-lg text-sm font-medium border border-semantic-error/20">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all"
                  placeholder="e.g. Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-brand-light border border-brand-gray/30 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50 focus:ring-1 focus:ring-brand-indigo/20 transition-all resize-none h-24"
                  placeholder="Brief description of this category..."
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

            <div className="flex justify-end gap-3 shrink-0 pt-4 mt-auto border-t border-brand-gray/20">
              <Button variant="outline" onClick={() => setView("list")}>Cancel</Button>
              <Button onClick={handleSave} className="bg-brand-indigo hover:bg-brand-blue text-white">
                {editingCategory ? "Save Changes" : "Add Category"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
