import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Card } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Search, Filter, Download, FileText, ShieldAlert, BrainCircuit, Users, X, Eye, Activity } from "lucide-react"
import { useAdminAuditLogs } from "../../contexts/AdminAuditLogsContext"
import { AdminAuditDetailsModal } from "./components/AdminAuditDetailsModal"
import { AdminStatusBadge } from "./components/AdminStatusBadge"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard"
import type { AuditLog } from "../../data/mockAdminAuditLogs"

const MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function AdminAuditLogs() {
  const { auditLogs } = useAdminAuditLogs()

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState("All Events")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [dateFilter, setDateFilter] = useState("All Time")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filtered Data
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchTerm.toLowerCase()
      const matchesSearch = 
        log.description.toLowerCase().includes(q) || 
        log.actorName.toLowerCase().includes(q) || 
        log.resourceId.toLowerCase().includes(q) || 
        log.id.toLowerCase().includes(q)
      
      const matchesType = eventTypeFilter === "All Events" || log.eventType === eventTypeFilter
      const matchesRole = roleFilter === "All Roles" || log.actorRole === roleFilter
      const matchesSeverity = severityFilter === "All" || log.severity === severityFilter
      
      let matchesDate = true
      if (dateFilter !== "All Time") {
        const logDate = new Date(log.timestamp)
        const now = new Date("21 Sep 2026") // Using mock current date
        const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24))
        
        if (dateFilter === "Today") matchesDate = diffDays === 0
        else if (dateFilter === "Last 7 Days") matchesDate = diffDays <= 7
        else if (dateFilter === "Last 30 Days") matchesDate = diffDays <= 30
      }

      return matchesSearch && matchesType && matchesRole && matchesSeverity && matchesDate
    })
  }, [auditLogs, searchTerm, eventTypeFilter, roleFilter, severityFilter, dateFilter])

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredLogs, currentPage])

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const handleOpenView = (log: AuditLog) => {
    setViewingLog(log)
    setDetailsModalOpen(true)
  }

  const handleExport = () => {
    const header = "Event ID,Event Type,Description,Actor,Role,Resource,Severity,Timestamp\n"
    const rows = filteredLogs.map(log => 
      `"${log.id}","${log.eventType}","${log.description}","${log.actorName}","${log.actorRole}","${log.resourceId}","${log.severity}","${log.timestamp}"`
    )
    const csv = header + rows.join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "hiresmart-audit-logs.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setEventTypeFilter("All Events")
    setRoleFilter("All Roles")
    setSeverityFilter("All")
    setDateFilter("All Time")
    setCurrentPage(1)
  }

  // Stats
  const todayCount = auditLogs.filter(log => {
    const logDate = new Date(log.timestamp)
    const now = new Date("21 Sep 2026")
    return Math.floor((now.getTime() - logDate.getTime()) / (1000 * 3600 * 24)) === 0
  }).length
  
  const adminActionsCount = auditLogs.filter(log => log.actorRole === "Administrator").length
  const aiEventsCount = auditLogs.filter(log => log.eventType === "AI Processing" || log.eventType === "AI Configuration").length
  const securityEventsCount = auditLogs.filter(log => log.eventType === "Security").length

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Info": return <AdminStatusBadge status="Info" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20" />
      case "Warning": return <AdminStatusBadge status="Pending" className="bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20" /> // Map to Pending for amber
      case "Critical": return <AdminStatusBadge status="High" /> // Map to High for red
      default: return <AdminStatusBadge status="Info" />
    }
  }

  const renderResourceLink = (resourceType: string, resourceId: string) => {
    let url = ""
    if (resourceType === "User") url = `/admin/users/${resourceId}`
    else if (resourceType === "Complaint") url = `/admin/complaints/${resourceId}`
    else if (resourceType === "Skill") url = `/admin/skills`
    
    if (url) {
      return (
        <a href={url} className="text-brand-indigo hover:text-brand-blue font-medium hover:underline flex items-center gap-1 transition-colors">
          {resourceId}
        </a>
      )
    }
    return <span className="font-medium text-brand-navy">{resourceId}</span>
  }

  return (
    <AdminShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <AdminPageHeader 
          title="Audit Logs" 
          description="Track administrative, platform, AI, and security-related activity."
          statusIndicator={{ label: "Audit Logging Active", isHealthy: true }}
          action={
            <Button onClick={handleExport} className="bg-brand-indigo hover:bg-brand-blue text-white">
              <Download className="w-4 h-4 mr-2" /> Export Logs
            </Button>
          }
        />

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Total Events" value={auditLogs.length} icon={FileText} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <AdminStatCard title="Today" value={todayCount} icon={Activity} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <AdminStatCard title="Admin Actions" value={adminActionsCount} icon={Users} color={{ bg: "bg-brand-purple/10", text: "text-brand-purple" }} />
          <AdminStatCard title="AI Events" value={aiEventsCount} icon={BrainCircuit} color={{ bg: "bg-emerald-500/10", text: "text-emerald-500" }} />
          <AdminStatCard title="Security Events" value={securityEventsCount} icon={ShieldAlert} color={{ bg: "bg-semantic-error/10", text: "text-semantic-error" }} />
        </div>

        {/* FILTERS */}
        <MotionSpotlightCard variants={slideUp} className="glass-card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center px-4 bg-brand-light/50 border border-brand-gray/40 rounded-xl focus-within:border-brand-indigo/50 focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all">
              <Search className="w-5 h-5 text-brand-navy/40 mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search audit logs by event ID, description, actor, or resource..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11 text-sm"
              />
            </div>
            <Button variant="outline" className="lg:hidden" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>
          
          <div className={cn("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", isMobileFiltersOpen ? "grid" : "hidden lg:grid")}>
            <select 
              value={eventTypeFilter} 
              onChange={(e) => { setEventTypeFilter(e.target.value); setCurrentPage(1); }} 
              className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
            >
              <option value="All Events">All Event Types</option>
              <option value="User Management">User Management</option>
              <option value="Complaint">Complaint</option>
              <option value="Skill Taxonomy">Skill Taxonomy</option>
              <option value="AI Processing">AI Processing</option>
              <option value="AI Configuration">AI Configuration</option>
              <option value="Security">Security</option>
              <option value="Authentication">Authentication</option>
              <option value="System">System</option>
              <option value="Recruitment Activity">Recruitment Activity</option>
            </select>

            <select 
              value={roleFilter} 
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }} 
              className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
            >
              <option value="All Roles">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Candidate">Candidate</option>
              <option value="System">System</option>
            </select>

            <select 
              value={severityFilter} 
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }} 
              className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
            >
              <option value="All">All Severities</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>

            <select 
              value={dateFilter} 
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }} 
              className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {(searchTerm || eventTypeFilter !== "All Events" || roleFilter !== "All Roles" || severityFilter !== "All" || dateFilter !== "All Time") && (
            <div className="flex justify-end pt-2 border-t border-brand-gray/20">
              <button onClick={clearFilters} className="text-sm font-medium text-brand-indigo hover:text-brand-blue flex items-center transition-colors">
                <X className="w-4 h-4 mr-1" /> Reset Filters
              </button>
            </div>
          )}
        </MotionSpotlightCard>

        {/* TABLE */}
        <motion.div variants={slideUp}>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                  <tr>
                    <th className="px-5 py-4">Event</th>
                    <th className="px-5 py-4">Actor</th>
                    <th className="px-5 py-4 hidden md:table-cell">Role</th>
                    <th className="px-5 py-4 hidden sm:table-cell">Resource</th>
                    <th className="px-5 py-4 text-center">Severity</th>
                    <th className="px-5 py-4">Timestamp</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/20">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map(log => (
                      <tr key={log.id} className="hover:bg-brand-light/30 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="font-semibold text-brand-navy max-w-[200px] sm:max-w-[300px] truncate" title={log.description}>{log.description}</div>
                          <div className="text-[10px] text-brand-navy/50 mt-0.5">{log.eventType}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="font-medium text-brand-navy">{log.actorName}</div>
                          <div className="text-[10px] text-brand-navy/40 mt-0.5 md:hidden">{log.actorRole}</div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-brand-navy/80 text-xs bg-brand-light px-2 py-1 rounded-md border border-brand-gray/20">{log.actorRole}</span>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          {renderResourceLink(log.resourceType, log.resourceId)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {getSeverityBadge(log.severity)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-brand-navy/80 whitespace-nowrap">{log.timestamp.split(' ')[0] + ' ' + log.timestamp.split(' ')[1] + ' ' + log.timestamp.split(' ')[2]}</div>
                          <div className="text-[10px] text-brand-navy/40">{log.timestamp.split(' ')[3] + ' ' + log.timestamp.split(' ')[4]}</div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button 
                            variant="outline" 
                            onClick={() => handleOpenView(log)}
                            className="h-8 px-2 text-xs text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/10"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-brand-navy/30" />
                        </div>
                        <h3 className="text-lg font-medium text-brand-navy mb-1">No audit events found</h3>
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
                  Showing <span className="font-medium text-brand-navy">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brand-navy">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-medium text-brand-navy">{filteredLogs.length}</span> events
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3 h-8 text-xs">
                    Previous
                  </Button>
                  <div className="flex gap-1 px-2 hidden sm:flex">
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
      </motion.div>

      <AdminAuditDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setViewingLog(null); }}
        log={viewingLog}
      />
    </AdminShell>
  )
}
