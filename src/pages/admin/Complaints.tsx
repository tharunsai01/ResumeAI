import { useState, useMemo } from "react"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"
import { MessageSquare, AlertCircle, CheckCircle, Clock, AlertTriangle, Download, SearchX } from "lucide-react"

import { useAdminComplaints } from "../../contexts/AdminComplaintsContext"
import { ComplaintFilters } from "../../components/admin/complaints/ComplaintFilters"
import { ComplaintTable } from "../../components/admin/complaints/ComplaintTable"

export default function AdminComplaints() {
  const { complaints } = useAdminComplaints()

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [priorityFilter, setPriorityFilter] = useState("All Priority")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Derived Data
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = c.id.toLowerCase().includes(q) || 
                            c.subject.toLowerCase().includes(q) || 
                            c.submittedBy.name.toLowerCase().includes(q) ||
                            c.submittedBy.email.toLowerCase().includes(q)
      
      const matchesStatus = statusFilter === "All Status" || c.status === statusFilter
      const matchesPriority = priorityFilter === "All Priority" || c.priority === priorityFilter
      const matchesCategory = categoryFilter === "All Categories" || c.category === categoryFilter
      const matchesRole = roleFilter === "All Roles" || c.role === roleFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesRole
    })
  }, [complaints, searchQuery, statusFilter, priorityFilter, categoryFilter, roleFilter])

  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredComplaints.slice(start, start + itemsPerPage)
  }, [filteredComplaints, currentPage])

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)

  const stats = useMemo(() => {
    return {
      total: complaints.length,
      open: complaints.filter(c => c.status === "Open").length,
      inReview: complaints.filter(c => c.status === "In Review").length,
      resolved: complaints.filter(c => c.status === "Resolved").length,
      highPriority: complaints.filter(c => c.priority === "High" || c.priority === "Critical").length
    }
  }, [complaints])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("All Status")
    setPriorityFilter("All Priority")
    setCategoryFilter("All Categories")
    setRoleFilter("All Roles")
    setCurrentPage(1)
  }

  const handleExport = () => {
    const headers = ["Complaint ID,Subject,Submitted By,Role,Category,Priority,Status,Created,Updated"]
    const rows = filteredComplaints.map(c => 
      `"${c.id}","${c.subject.replace(/"/g, '""')}","${c.submittedBy.name}","${c.role}","${c.category}","${c.priority}","${c.status}","${c.createdAt}","${c.updatedAt}"`
    )
    const csvContent = headers.concat(rows).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "hiresmart-complaints.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AdminShell>
      <AdminPageHeader 
        title="Complaint Management" 
        description="Review, manage, and resolve platform complaints."
        action={
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/50 hover:bg-brand-gray/10 text-brand-navy rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Export Complaints
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <AdminStatCard title="Total Complaints" value={stats.total} icon={MessageSquare} delay={1} />
        <AdminStatCard title="Open" value={stats.open} icon={AlertCircle} delay={2} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
        <AdminStatCard title="In Review" value={stats.inReview} icon={Clock} delay={3} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
        <AdminStatCard title="Resolved" value={stats.resolved} icon={CheckCircle} delay={4} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
        <AdminStatCard title="High Priority" value={stats.highPriority} icon={AlertTriangle} delay={5} color={{ bg: "bg-semantic-error/10", text: "text-semantic-error" }} />
      </div>

      <ComplaintFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        onReset={handleResetFilters}
      />

      {filteredComplaints.length === 0 ? (
        <AdminEmptyState 
          icon={SearchX}
          title="No complaints found"
          description="Try adjusting your search or filters."
          action={
            <button onClick={handleResetFilters} className="px-4 py-2 bg-brand-indigo text-white rounded-lg hover:bg-brand-indigo/90 font-medium">
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <ComplaintTable complaints={paginatedComplaints} />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <span className="text-sm text-brand-navy/60">
              Showing <span className="font-medium text-brand-navy">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brand-navy">{Math.min(currentPage * itemsPerPage, filteredComplaints.length)}</span> of <span className="font-medium text-brand-navy">{filteredComplaints.length}</span> complaints
            </span>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-brand-gray/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-light"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                      currentPage === i + 1 ? 'bg-brand-indigo text-white' : 'hover:bg-brand-light text-brand-navy/70'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-brand-gray/50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-light"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  )
}
