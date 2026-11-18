import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/PremiumCard"
import { 
  AlertOctagon, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  RotateCcw, 
  ShieldAlert,
  ListOrdered
} from "lucide-react"
import { useAdminComplaints } from "../../contexts/AdminComplaintsContext"
import { ComplaintStatusBadge, ComplaintPriorityBadge } from "../../components/admin/complaints/ComplaintTable"
import type { ComplaintCategory, ComplaintPriority, AdminComplaint } from "../../data/mockAdminComplaints"
import { authService } from "../../services/authService"

const CATEGORIES: ComplaintCategory[] = [
  "Technical",
  "AI & Matching",
  "Privacy & Security",
  "Account",
  "Resume",
  "Job/Recruiter",
  "Other"
]

const PRIORITIES: ComplaintPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical"
]

export default function AdminComplaintForm() {
  const navigate = useNavigate()
  const { complaints, setComplaints } = useAdminComplaints()

  const currentUser = authService.getCurrentUser()

  // Form State
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState<ComplaintCategory>("Technical")
  const [priority, setPriority] = useState<ComplaintPriority>("Medium")
  const [role, setRole] = useState<"Candidate" | "Recruiter">("Candidate")
  const [reporterName, setReporterName] = useState(currentUser?.name || "System Administrator")
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || "admin@hiresmart.ai")
  const [description, setDescription] = useState("")

  // Feedback State
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleReset = () => {
    setSubject("")
    setCategory("Technical")
    setPriority("Medium")
    setRole("Candidate")
    setDescription("")
    setErrorMsg(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim()) {
      setErrorMsg("Please enter a subject or title for the ticket.")
      return
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg("Please provide a detailed description (minimum 10 characters).")
      return
    }

    if (!reporterName.trim() || !reporterEmail.trim()) {
      setErrorMsg("Please provide a reporter name and email.")
      return
    }

    const now = new Date()
    const shortDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const longTime = now.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    })

    const newId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`

    const newComplaint: AdminComplaint = {
      id: newId,
      subject: subject.trim(),
      description: description.trim(),
      submittedBy: {
        name: reporterName.trim(),
        email: reporterEmail.trim(),
        id: currentUser?.id || "adm_001"
      },
      role,
      category,
      priority,
      status: "Open",
      createdAt: shortDate,
      updatedAt: shortDate,
      activity: [
        {
          action: `Incident logged by ${reporterName.trim()}`,
          time: longTime,
          admin: reporterName.trim()
        }
      ]
    }

    setComplaints(prev => [newComplaint, ...prev])
    setLastSubmittedId(newId)
    showToast(`Ticket ${newId} created successfully.`)
    handleReset()
  }

  // Summary Metrics
  const openCount = complaints.filter(c => c.status === "Open").length
  const inReviewCount = complaints.filter(c => c.status === "In Review").length
  const highPriorityCount = complaints.filter(c => c.priority === "High" || c.priority === "Critical").length
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length

  const recentComplaints = complaints.slice(0, 5)

  return (
    <AdminShell>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-navy text-white px-4 py-3 rounded-xl shadow-lg border border-brand-gray/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <AdminPageHeader 
        title="Report an Issue" 
        description="Log internal technical problems, platform incidents, or user disputes into the admin complaints queue."
        action={
          <button 
            onClick={() => navigate('/admin/complaints')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/50 hover:bg-brand-gray/10 text-brand-navy rounded-lg font-medium transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> View All Complaints ({complaints.length})
          </button>
        }
      />

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-brand-gray/20 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider truncate">Open Tickets</p>
            <p className="text-2xl font-display font-bold text-brand-navy mt-1 truncate">{openCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-brand-gray/20 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider truncate">In Review</p>
            <p className="text-2xl font-display font-bold text-amber-600 mt-1 truncate">{inReviewCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-brand-gray/20 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider truncate">High / Critical</p>
            <p className="text-2xl font-display font-bold text-semantic-error mt-1 truncate">{highPriorityCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-semantic-error/10 flex items-center justify-center text-semantic-error shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-brand-gray/20 shadow-sm flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider truncate">Resolved</p>
            <p className="text-2xl font-display font-bold text-semantic-success mt-1 truncate">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-semantic-success/10 flex items-center justify-center text-semantic-success shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {lastSubmittedId && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 text-sm">
                Ticket {lastSubmittedId} submitted successfully
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                The issue has been added to the administrative complaints queue with status "Open".
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/admin/complaints/${lastSubmittedId}`)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>View Ticket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLastSubmittedId(null)}
              className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-medium rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form + Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Submission Form */}
        <div className="lg:col-span-2">
          <PremiumCard className="border-brand-gray/20 shadow-sm">
            <PremiumCardHeader className="border-b border-brand-gray/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-semantic-error/10 text-semantic-error flex items-center justify-center">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <PremiumCardTitle className="text-lg font-display font-semibold text-brand-navy">
                    Submit Platform Ticket / Incident
                  </PremiumCardTitle>
                  <PremiumCardDescription className="text-sm text-brand-navy/60">
                    Create an official dispute or technical ticket in the platform resolution pipeline.
                  </PremiumCardDescription>
                </div>
              </div>
            </PremiumCardHeader>

            <PremiumCardContent className="pt-6">
              {errorMsg && (
                <div className="mb-6 p-3 rounded-lg bg-semantic-error/10 border border-semantic-error/20 flex items-center gap-2 text-semantic-error text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div>
                  <label htmlFor="complaint-subject" className="block text-sm font-medium text-brand-navy mb-1.5">
                    Ticket Subject / Title <span className="text-semantic-error">*</span>
                  </label>
                  <input
                    id="complaint-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    placeholder="e.g. AI Resume analysis score discrepancy for candidate"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                  />
                </div>

                {/* Category & Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="complaint-category" className="block text-sm font-medium text-brand-navy mb-1.5">
                      Category <span className="text-semantic-error">*</span>
                    </label>
                    <select
                      id="complaint-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="complaint-priority" className="block text-sm font-medium text-brand-navy mb-1.5">
                      Priority Level <span className="text-semantic-error">*</span>
                    </label>
                    <select
                      id="complaint-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Role & Reporter Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="complaint-role" className="block text-sm font-medium text-brand-navy mb-1.5">
                      Impacted Role
                    </label>
                    <select
                      id="complaint-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as "Candidate" | "Recruiter")}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                    >
                      <option value="Candidate">Candidate</option>
                      <option value="Recruiter">Recruiter</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="complaint-reporter-name" className="block text-sm font-medium text-brand-navy mb-1.5">
                      Reporter Name
                    </label>
                    <input
                      id="complaint-reporter-name"
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="Reporter name"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="complaint-reporter-email" className="block text-sm font-medium text-brand-navy mb-1.5">
                      Reporter Email
                    </label>
                    <input
                      id="complaint-reporter-email"
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="Reporter email"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="complaint-description" className="block text-sm font-medium text-brand-navy mb-1.5">
                    Description & Reproduction Details <span className="text-semantic-error">*</span>
                  </label>
                  <textarea
                    id="complaint-description"
                    rows={5}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      if (errorMsg) setErrorMsg(null)
                    }}
                    placeholder="Provide detailed information regarding the issue, error codes, steps to reproduce, or candidate/recruiter concerns..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-brand-gray/30 bg-white text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo text-sm resize-y"
                  />
                  <p className="text-xs text-brand-navy/50 mt-1">
                    Minimum 10 characters. Include any relevant resource IDs or URLs.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-brand-gray/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-brand-navy/70 hover:text-brand-navy hover:bg-brand-gray/10 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset Form
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-sm font-medium rounded-lg shadow-sm transition-colors w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4" /> Submit Ticket
                    </button>
                  </div>
                </div>
              </form>
            </PremiumCardContent>
          </PremiumCard>
        </div>

        {/* Sidebar: Recent Complaints & SLA Guide */}
        <div className="space-y-6">
          {/* Recent Queue Preview */}
          <PremiumCard className="border-brand-gray/20 shadow-sm">
            <PremiumCardHeader className="border-b border-brand-gray/10 pb-3 flex flex-row items-center justify-between">
              <div>
                <PremiumCardTitle className="text-base font-display font-semibold text-brand-navy flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-brand-indigo" />
                  Recent Active Queue
                </PremiumCardTitle>
                <PremiumCardDescription className="text-xs text-brand-navy/60">
                  Latest platform complaints
                </PremiumCardDescription>
              </div>
              <button 
                onClick={() => navigate('/admin/complaints')}
                className="text-xs text-brand-indigo hover:underline font-medium flex items-center gap-1"
              >
                <span>All</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </PremiumCardHeader>

            <PremiumCardContent className="pt-3 divide-y divide-brand-gray/10">
              {recentComplaints.length === 0 ? (
                <p className="text-xs text-brand-navy/50 py-4 text-center">No active complaints found.</p>
              ) : (
                recentComplaints.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/admin/complaints/${item.id}`)}
                    className="py-3 cursor-pointer group hover:bg-brand-light/40 -mx-4 px-4 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">
                        {item.id}
                      </span>
                      <ComplaintStatusBadge status={item.status} />
                    </div>
                    <p className="text-xs font-medium text-brand-navy line-clamp-1 mb-1">
                      {item.subject}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-brand-navy/50">
                      <span>{item.category}</span>
                      <ComplaintPriorityBadge priority={item.priority} />
                    </div>
                  </div>
                ))
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/complaints')}
                  className="w-full py-2 bg-brand-light hover:bg-brand-gray/10 text-brand-navy text-xs font-medium rounded-lg border border-brand-gray/30 transition-colors text-center"
                >
                  View Full Complaints Queue ({complaints.length})
                </button>
              </div>
            </PremiumCardContent>
          </PremiumCard>

          {/* SLA / Priority Reference Card */}
          <div className="p-4 rounded-xl bg-brand-light/60 border border-brand-gray/20">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-indigo" />
              Resolution Priority SLA
            </h4>
            <div className="space-y-2 text-xs text-brand-navy/70">
              <div className="flex justify-between items-center py-1 border-b border-brand-gray/10">
                <span className="font-semibold text-semantic-error">Critical</span>
                <span>Response within 2 hours</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-brand-gray/10">
                <span className="font-semibold text-orange-600">High</span>
                <span>Response within 24 hours</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-brand-gray/10">
                <span className="font-semibold text-amber-600">Medium</span>
                <span>Resolution within 48 hours</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-brand-navy/60">Low</span>
                <span>Resolution within 5 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
