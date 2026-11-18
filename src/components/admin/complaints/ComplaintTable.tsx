import { useNavigate } from "react-router-dom"
import type { AdminComplaint, ComplaintStatus, ComplaintPriority } from "../../../data/mockAdminComplaints"

export function ComplaintStatusBadge({ status }: { status: ComplaintStatus }) {
  const styles = {
    "Open": "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20",
    "In Review": "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20",
    "Resolved": "bg-semantic-success/10 text-semantic-success border-semantic-success/20",
    "Closed": "bg-brand-gray/10 text-brand-navy/70 border-brand-gray/20"
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status}
    </span>
  )
}

export function ComplaintPriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const styles = {
    "Low": "bg-brand-gray/10 text-brand-navy/70",
    "Medium": "bg-semantic-warning/10 text-semantic-warning",
    "High": "bg-orange-500/10 text-orange-600",
    "Critical": "bg-semantic-error/10 text-semantic-error font-bold"
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${styles[priority]}`}>
      {priority}
    </span>
  )
}

export function ComplaintTable({ complaints }: { complaints: AdminComplaint[] }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-brand-gray/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-light/50 border-b border-brand-gray/20">
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Complaint ID</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Subject</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Submitted By</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Category</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Priority</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider">Created</th>
              <th className="py-3 px-4 text-xs font-semibold text-brand-navy/70 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray/10">
            {complaints.map(comp => (
              <tr key={comp.id} className="hover:bg-brand-light/30 transition-colors group">
                <td className="py-3 px-4 text-sm font-medium text-brand-navy whitespace-nowrap">{comp.id}</td>
                <td className="py-3 px-4 text-sm text-brand-navy max-w-[200px] truncate" title={comp.subject}>{comp.subject}</td>
                <td className="py-3 px-4 text-sm text-brand-navy/80">
                  <div className="font-medium">{comp.submittedBy.name}</div>
                  <div className="text-xs text-brand-navy/50">{comp.role}</div>
                </td>
                <td className="py-3 px-4 text-sm text-brand-navy/80 whitespace-nowrap">{comp.category}</td>
                <td className="py-3 px-4 whitespace-nowrap"><ComplaintPriorityBadge priority={comp.priority} /></td>
                <td className="py-3 px-4 whitespace-nowrap"><ComplaintStatusBadge status={comp.status} /></td>
                <td className="py-3 px-4 text-sm text-brand-navy/70 whitespace-nowrap">{comp.createdAt}</td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button 
                    onClick={() => navigate(`/admin/complaints/${comp.id}`)}
                    className="text-brand-indigo hover:text-brand-indigo/80 text-sm font-medium px-3 py-1.5 rounded bg-brand-indigo/5 hover:bg-brand-indigo/10 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
