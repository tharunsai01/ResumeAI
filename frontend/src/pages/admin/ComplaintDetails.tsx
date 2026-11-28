import { useState } from "react"
import { env } from "../../config/env"
import { useParams, useNavigate } from "react-router-dom"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"
import { useAdminComplaints } from "../../contexts/AdminComplaintsContext"
import { ArrowLeft, MessageSquareX, ExternalLink, Activity, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { ComplaintStatus, ComplaintPriority } from "../../data/mockAdminComplaints"
import SpotlightCard from "../../components/ui/SpotlightCard";

export default function AdminComplaintDetails() {
  const { complaintId } = useParams()
  const navigate = useNavigate()
  const { loading, loadError, getComplaintById, updateComplaintStatus, updateComplaintPriority, addInternalNote } = useAdminComplaints()

  const complaint = complaintId ? getComplaintById(complaintId) : undefined

  const [notes, setNotes] = useState("")
  const [resolutionNoteError, setResolutionNoteError] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  if (!complaint) {
    return (
      <AdminShell>
        <AdminPageHeader title="Complaint Details" />
        <AdminEmptyState 
          icon={MessageSquareX}
          title={loading ? "Loading complaint…" : loadError ? "Could not load complaint" : "Complaint Not Found"}
          description={loadError || (loading ? "" : "The requested complaint could not be found.")}
          action={
            <button 
              onClick={() => navigate('/admin/complaints')}
              className="px-4 py-2 bg-brand-indigo text-white rounded-lg hover:bg-brand-indigo/90 font-medium"
            >
              Back to Complaints
            </button>
          }
        />
      </AdminShell>
    )
  }

  const saveStatus = async (newStatus: ComplaintStatus) => {
    if (saving) return
    
    if (newStatus === "Resolved") {
      if (!notes.trim()) {
        setResolutionNoteError(true)
        document.getElementById("resolution-notes")?.focus()
        return
      }
    }
    
    setResolutionNoteError(false)
    setSaveError("")
    setSaving(true)
    try {
      await updateComplaintStatus(complaint.id, newStatus, newStatus === "Resolved" ? notes.trim() : undefined)
    } catch {
      setSaveError("Unable to save the complaint status. Please try again.")
      return
    } finally {
      setSaving(false)
    }
    
    if (newStatus === "Resolved") {
      setNotes("") // Clear after successful resolution
      showToast("Complaint resolved successfully.")
    } else {
      showToast(`Complaint status updated to ${newStatus}.`)
    }
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as ComplaintPriority
    updateComplaintPriority(complaint.id, newPriority)
    showToast("Complaint priority updated.")
  }

  const handleAddNote = () => {
    if (notes.trim()) {
      addInternalNote(complaint.id, notes.trim())
      setNotes("")
      setResolutionNoteError(false)
      showToast("Internal note added.")
    }
  }

  const requiresAdditionalReview = complaint.category === "Privacy & Security" || complaint.category === "AI & Matching"

  return (
    <AdminShell>
      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100] bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-sm font-medium text-brand-navy/60 mb-2 flex items-center gap-2">
        <span className="hover:text-brand-indigo cursor-pointer" onClick={() => navigate('/admin')}>Administration</span>
        <span>/</span>
        <span className="hover:text-brand-indigo cursor-pointer" onClick={() => navigate('/admin/complaints')}>Complaints</span>
        <span>/</span>
        <span className="text-brand-navy">Complaint Details</span>
      </div>

      <AdminPageHeader 
        title="Complaint Details" 
        description="Review and resolve this complaint."
        action={
          <button 
            onClick={() => navigate('/admin/complaints')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/50 hover:bg-brand-gray/10 text-brand-navy rounded-lg font-medium transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Complaints
          </button>
        }
      />

      <SpotlightCard className="glass-card p-4 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-brand-navy break-words">{complaint.subject}</h2>
            {requiresAdditionalReview && (
              <span className="flex items-center gap-1 text-xs font-medium text-semantic-warning bg-semantic-warning/10 px-2 py-1 rounded whitespace-nowrap shrink-0">
                <ShieldAlert className="w-3 h-3" /> Requires additional review
              </span>
            )}
          </div>
          <p className="text-brand-navy/60 font-mono text-sm break-all">{complaint.id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
          <div className="flex flex-col flex-1 sm:flex-initial min-w-[120px]">
            <span className="text-xs text-brand-navy/50 font-semibold uppercase mb-1">Priority</span>
            <select 
              value={complaint.priority} 
              onChange={handlePriorityChange}
              disabled={!env.useMock}
              className="text-sm font-medium bg-brand-light border border-brand-gray/30 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-indigo w-full"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="flex flex-col flex-1 sm:flex-initial min-w-[120px]">
            <span className="text-xs text-brand-navy/50 font-semibold uppercase mb-1">Status</span>
            <select 
              value={complaint.status} 
              onChange={event => void saveStatus(event.target.value as ComplaintStatus)}
              disabled={saving}
              aria-label="Complaint status"
              className="text-sm font-medium bg-brand-light border border-brand-gray/30 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-indigo w-full"
            >
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </SpotlightCard>

      {saveError && <p role="alert" className="mb-4 text-semantic-error">{saveError}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-4 mb-6">
        <div className="min-w-0 lg:col-span-2 space-y-4">
          <section className="rounded-xl border border-brand-gray/30 bg-white shadow-sm dark:bg-slate-900">
            <PremiumCardHeader className="p-4 border-b border-brand-gray/20">
              <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Complaint Description</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent className="p-4">
              <p className="text-brand-navy/80 whitespace-pre-wrap break-words">{complaint.description}</p>
            </PremiumCardContent>
          </section>

          <section className="rounded-xl border border-brand-gray/30 bg-white shadow-sm dark:bg-slate-900">
            <PremiumCardHeader className="p-4 border-b border-brand-gray/20">
              <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Resolution</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent className="p-4">
              {complaint.status === "Resolved" || complaint.status === "Closed" ? (
                <div className="bg-semantic-success/5 border border-semantic-success/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-semantic-success font-semibold mb-2">
                    <CheckCircle2 className="w-5 h-5" /> Complaint Resolved
                  </div>
                  <p className="text-brand-navy/80 mb-3">{complaint.resolutionNotes}</p>
                  <div className="text-xs text-brand-navy/60">
                    {complaint.resolvedBy && <>Resolved by {complaint.resolvedBy} </>}{complaint.resolvedAt}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="resolution-notes" className="block text-sm font-medium text-brand-navy mb-2">{env.useMock ? "Internal Admin Notes" : "Resolution notes"}</label>
                  <textarea
                    id="resolution-notes"
                    maxLength={2000}
                    aria-invalid={resolutionNoteError}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value)
                      if (e.target.value.trim()) setResolutionNoteError(false)
                    }}
                    placeholder={env.useMock ? "Add resolution notes or internal updates..." : "Add a response before marking this complaint as resolved"}
                    className={`w-full h-24 px-4 py-3 bg-white border ${resolutionNoteError ? 'border-semantic-error ring-1 ring-semantic-error' : 'border-brand-gray/30'} rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 resize-none mb-2`}
                  />
                  {resolutionNoteError && (
                    <p className="text-sm text-semantic-error mb-3">Please add a resolution note before marking this complaint as resolved.</p>
                  )}
                  <div className="flex flex-wrap justify-end gap-2">
                    {env.useMock && <button type="button" onClick={handleAddNote} disabled={!notes.trim()} className="rounded-lg px-3 py-2 text-sm">Save Notes</button>}
                    <button
                      type="button"
                      onClick={() => void saveStatus("Resolved")}
                      disabled={saving}
                      className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-white hover:bg-brand-indigo/90 disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Resolve Complaint"}
                    </button>
                  </div>
                </div>
              )}
            </PremiumCardContent>
          </section>
        </div>

        <div className="min-w-0 space-y-4">
          <section className="rounded-xl border border-brand-gray/30 bg-white shadow-sm dark:bg-slate-900">
            <PremiumCardHeader className="p-4 border-b border-brand-gray/20">
              <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Information</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-3 p-4">
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Category</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.category}</span>
              </div>
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Created At</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.createdAt}</span>
              </div>
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Last Updated</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.updatedAt}</span>
              </div>
            </PremiumCardContent>
          </section>

          <section className="rounded-xl border border-brand-gray/30 bg-white shadow-sm dark:bg-slate-900">
            <PremiumCardHeader className="p-4 border-b border-brand-gray/20">
              <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Submitted By</PremiumCardTitle>
            </PremiumCardHeader>
            <PremiumCardContent className="space-y-3 p-4">
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Name</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.submittedBy.name}</span>
              </div>
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Email</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.submittedBy.email}</span>
              </div>
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">Role</span>
                <span className="text-sm font-medium text-brand-navy">{complaint.role}</span>
              </div>
              <div>
                <span className="text-xs text-brand-navy/50 font-semibold uppercase block mb-1">User ID</span>
                <span className="text-sm font-medium text-brand-navy font-mono">{complaint.submittedBy.id}</span>
              </div>
              <button 
                onClick={() => navigate(`/admin/users/${complaint.submittedBy.id}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/30 text-brand-indigo rounded-lg font-medium hover:bg-brand-gray/10 transition-colors text-sm mt-2"
              >
                View User <ExternalLink className="w-4 h-4" />
              </button>
            </PremiumCardContent>
          </section>

          <section className="rounded-xl border border-brand-gray/30 bg-white shadow-sm dark:bg-slate-900">
            <PremiumCardHeader className="p-4 border-b border-brand-gray/20 flex flex-row items-center justify-between">
              <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">Complaint Activity</PremiumCardTitle>
              <Activity className="w-4 h-4 text-brand-navy/40" />
            </PremiumCardHeader>
            <PremiumCardContent className="p-4">
              <div className="space-y-4">
                {complaint.activity.map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== complaint.activity.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-brand-gray/30" />
                    )}
                    <div className="w-4 h-4 rounded-full bg-brand-indigo/10 border-2 border-white flex-shrink-0 mt-1 z-10" />
                    <div>
                      <p className="text-sm font-medium text-brand-navy">{act.action}</p>
                      <p className="text-xs text-brand-navy/50">
                        {act.time} {act.admin && `· ${act.admin}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCardContent>
          </section>

          <div className="bg-brand-light/50 border border-brand-gray/20 rounded-xl p-4">
            <h3 className="font-semibold text-brand-navy mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-indigo" />
              Audit Activity
            </h3>
            <p className="text-xs text-brand-navy/60 mb-3">Administrative actions on this complaint are recorded for auditability.</p>
            <button 
              onClick={() => navigate(`/admin/audit-logs?complaintId=${complaint.id}`)}
              className="flex items-center gap-2 text-sm font-medium text-brand-indigo hover:text-brand-indigo/80 transition-colors"
            >
              View Audit Logs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
