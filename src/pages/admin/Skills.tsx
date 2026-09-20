import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Search, Plus, Filter, Download, Activity, CheckCircle2, Layers, BookOpen, AlertCircle, Edit2, Eye, Power, X } from "lucide-react"
import { useAdminSkills } from "../../contexts/AdminSkillsContext"
import { AdminSkillModal } from "./components/AdminSkillModal"
import { AdminSkillDetailsModal } from "./components/AdminSkillDetailsModal"
import { AdminCategoryManager } from "./components/AdminCategoryManager"
import { Modal } from "../../components/ui/Modal"
import { AdminStatusBadge } from "./components/AdminStatusBadge"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import type { SkillTaxonomy } from "../../data/mockAdminSkills"


export default function AdminSkills() {
  const { skills, categories, activities, addSkill, updateSkill, toggleSkillStatus, addCategory, updateCategory, toggleCategoryStatus } = useAdminSkills()

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Modals
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillTaxonomy | null>(null)
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [viewingSkill, setViewingSkill] = useState<SkillTaxonomy | null>(null)
  
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false)
  const [skillToDeactivate, setSkillToDeactivate] = useState<SkillTaxonomy | null>(null)

  const [toastMsg, setToastMsg] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  // Filtered Data
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const q = searchTerm.toLowerCase()
      const matchesSearch = skill.name.toLowerCase().includes(q) || skill.aliases.some(a => a.toLowerCase().includes(q)) || skill.description.toLowerCase().includes(q)
      const matchesCategory = categoryFilter === "All" || skill.categoryId === categoryFilter
      const matchesStatus = statusFilter === "All" || skill.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [skills, searchTerm, categoryFilter, statusFilter])

  const paginatedSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredSkills.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredSkills, currentPage])

  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage)

  // Handlers
  const handleAddOrEditSkill = (skillData: Partial<SkillTaxonomy>) => {
    if (editingSkill) {
      updateSkill(editingSkill.id, skillData)
      showToast("Skill updated successfully.")
    } else {
      addSkill(skillData as any)
      showToast("Skill added successfully.")
    }
    setEditingSkill(null)
  }

  const handleOpenEdit = (skill: SkillTaxonomy) => {
    setEditingSkill(skill)
    setSkillModalOpen(true)
  }

  const handleOpenView = (skill: SkillTaxonomy) => {
    setViewingSkill(skill)
    setDetailsModalOpen(true)
  }

  const handleToggleStatus = (skill: SkillTaxonomy) => {
    if (skill.status === "Active") {
      setSkillToDeactivate(skill)
      setDeactivateModalOpen(true)
    } else {
      toggleSkillStatus(skill.id)
      showToast("Skill activated successfully.")
    }
  }

  const confirmDeactivate = () => {
    if (skillToDeactivate) {
      toggleSkillStatus(skillToDeactivate.id)
      showToast("Skill deactivated successfully.")
      setDeactivateModalOpen(false)
      setSkillToDeactivate(null)
    }
  }

  const handleExport = () => {
    const header = "Skill,Category,Aliases,Usage,Status,Created Date,Last Updated\n"
    const rows = filteredSkills.map(s => {
      const cat = categories.find(c => c.id === s.categoryId)?.name || "Unknown"
      return `"${s.name}","${cat}","${s.aliases.join(", ")}",${s.usageCount},${s.status},"${s.createdAt}","${s.updatedAt}"`
    })
    const csv = header + rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "hiresmart-skill-taxonomy.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Exported taxonomy successfully.")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("All")
    setStatusFilter("All")
    setCurrentPage(1)
  }

  return (
    <AdminShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <AdminPageHeader 
          title="Skill Taxonomy" 
          description="Manage the standardized skills used for resume analysis and job matching."
          action={
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
                <Layers className="w-4 h-4 mr-2" /> Manage Categories
              </Button>
              <Button onClick={() => setSkillModalOpen(true)} className="bg-brand-indigo hover:bg-brand-blue text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>
          }
        />

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminStatCard title="Total Skills" value={skills.length} icon={BookOpen} delay={0} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <AdminStatCard title="Categories" value={categories.length} icon={Layers} delay={1} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <AdminStatCard title="Active Skills" value={skills.filter(s => s.status === "Active").length} icon={CheckCircle2} delay={2} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <AdminStatCard title="Inactive Skills" value={skills.filter(s => s.status === "Inactive").length} icon={AlertCircle} delay={3} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/60" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3 space-y-6">
            {/* FILTERS */}
            <motion.div variants={slideUp} className="glass-card p-4 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex items-center px-4 bg-brand-light/50 border border-brand-gray/40 rounded-xl focus-within:border-brand-indigo/50 focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all">
                  <Search className="w-5 h-5 text-brand-navy/40 mr-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11"
                  />
                </div>
                <Button variant="outline" className="lg:hidden" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
                <div className={cn("flex flex-col sm:flex-row gap-3 lg:flex", isMobileFiltersOpen ? "flex" : "hidden")}>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                    className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                    className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <Button variant="outline" onClick={handleExport} className="shrink-0" title="Export Taxonomy">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {(searchTerm || categoryFilter !== "All" || statusFilter !== "All") && (
                <div className="flex justify-end pt-2 border-t border-brand-gray/20">
                  <button onClick={clearFilters} className="text-sm font-medium text-brand-indigo hover:text-brand-blue flex items-center transition-colors">
                    <X className="w-4 h-4 mr-1" /> Reset Filters
                  </button>
                </div>
              )}
            </motion.div>

            {/* TABLE */}
            <motion.div variants={slideUp}>
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                      <tr>
                        <th className="px-5 py-4">Skill</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4 hidden sm:table-cell">Aliases</th>
                        <th className="px-5 py-4 text-center">Usage</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray/20">
                      {paginatedSkills.length > 0 ? (
                        paginatedSkills.map(skill => (
                          <tr key={skill.id} className="hover:bg-brand-light/30 transition-colors group">
                            <td className="px-5 py-3">
                              <div className="font-semibold text-brand-navy">{skill.name}</div>
                              <div className="text-[10px] text-brand-navy/40 mt-0.5 sm:hidden">{skill.aliases.join(", ")}</div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-brand-navy/80">{categories.find(c => c.id === skill.categoryId)?.name || "-"}</span>
                            </td>
                            <td className="px-5 py-3 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {skill.aliases.map(alias => (
                                  <span key={alias} className="px-1.5 py-0.5 bg-white text-[10px] border border-brand-gray/40 rounded text-brand-navy/60 whitespace-nowrap">
                                    {alias}
                                  </span>
                                ))}
                                {skill.aliases.length === 0 && <span className="text-brand-navy/40 text-xs">-</span>}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <span className="text-brand-navy font-medium">{skill.usageCount} <span className="text-xs text-brand-navy/50 font-normal">profiles</span></span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <AdminStatusBadge status={skill.status} />
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => handleOpenView(skill)}
                                  className="p-1.5 text-brand-navy/60 hover:text-brand-indigo hover:bg-brand-indigo/10 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleOpenEdit(skill)}
                                  className="p-1.5 text-brand-navy/60 hover:text-brand-indigo hover:bg-brand-indigo/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleToggleStatus(skill)}
                                  className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    skill.status === "Active" 
                                      ? "text-semantic-error hover:bg-semantic-error/10" 
                                      : "text-semantic-success hover:bg-semantic-success/10"
                                  )}
                                  title={skill.status === "Active" ? "Deactivate" : "Activate"}
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center">
                            <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-3">
                              <Search className="w-6 h-6 text-brand-navy/30" />
                            </div>
                            <h3 className="text-lg font-medium text-brand-navy mb-1">No skills found</h3>
                            <p className="text-sm text-brand-navy/50">Try adjusting your search or filters.</p>
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                              Clear Filters
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-brand-gray/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-brand-navy/60">
                      Showing <span className="font-medium text-brand-navy">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brand-navy">{Math.min(currentPage * itemsPerPage, filteredSkills.length)}</span> of <span className="font-medium text-brand-navy">{filteredSkills.length}</span> skills
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3 h-8 text-xs">
                        Previous
                      </Button>
                      <div className="flex gap-1 px-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum = currentPage
                          if (currentPage < 3) pageNum = i + 1
                          else if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i
                          else pageNum = currentPage - 2 + i
                          
                          if (pageNum < 1 || pageNum > totalPages) return null

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={cn(
                                "w-8 h-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center",
                                currentPage === pageNum ? "bg-brand-indigo text-white" : "hover:bg-brand-gray/10 text-brand-navy/70"
                              )}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>
                      <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-3 h-8 text-xs">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
          
          <div className="lg:col-span-1">
            <motion.div variants={slideUp} className="sticky top-24">
              <Card>
                <CardHeader className="border-b border-brand-gray/20 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-indigo" /> Recent Taxonomy Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-brand-gray/10">
                    {activities.slice(0, 8).map(act => (
                      <div key={act.id} className="p-4 hover:bg-brand-light/30 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold text-brand-navy">{act.action}</span>
                          <span className="text-[10px] text-brand-navy/50 bg-brand-light px-2 py-0.5 rounded-full border border-brand-gray/20 whitespace-nowrap">{act.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-brand-navy/60">
                          <span className="font-medium text-brand-indigo">{act.skill}</span>
                          <span>•</span>
                          <span>{act.actor}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-brand-gray/20 bg-brand-light/30">
                    <p className="text-xs text-brand-navy/60 text-center mb-3">
                      Taxonomy changes are recorded in the administrative audit log.
                    </p>
                    <Button variant="outline" className="w-full text-xs" onClick={() => window.location.href = "/admin/audit-logs"}>
                      View Audit Logs →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

      </motion.div>

      {/* Modals */}
      <AdminSkillModal
        isOpen={skillModalOpen}
        onClose={() => { setSkillModalOpen(false); setEditingSkill(null); }}
        onSave={handleAddOrEditSkill}
        existingSkill={editingSkill}
        categories={categories}
        allSkills={skills}
      />
      
      <AdminSkillDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setViewingSkill(null); }}
        skill={viewingSkill}
        categories={categories}
      />

      <AdminCategoryManager
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        allSkills={skills}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onToggleStatus={toggleCategoryStatus}
      />

      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => { setDeactivateModalOpen(false); setSkillToDeactivate(null); }}
        title="Deactivate Skill?"
        className="max-w-md"
      >
        <div className="py-4 space-y-4">
          <div className="bg-semantic-warning/10 text-semantic-warning px-4 py-3 rounded-xl border border-semantic-warning/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              This skill (<span className="font-bold">{skillToDeactivate?.name}</span>) will no longer be treated as an active taxonomy entry.
            </p>
          </div>
          <p className="text-sm text-brand-navy/70 px-1">
            This preserves taxonomy history and is safer for future AI and audit integration. Candidate profiles already using this skill will retain it, but it won't be actively matched in new queries.
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-brand-gray/20">
          <Button variant="outline" onClick={() => { setDeactivateModalOpen(false); setSkillToDeactivate(null); }}>
            Cancel
          </Button>
          <Button onClick={confirmDeactivate} className="bg-semantic-error hover:bg-semantic-error/90 text-white">
            Deactivate Skill
          </Button>
        </div>
      </Modal>

    </AdminShell>
  )
}
