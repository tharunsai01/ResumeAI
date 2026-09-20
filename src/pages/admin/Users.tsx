import { useState, useMemo } from "react"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Users, User, Briefcase, ShieldAlert, AlertOctagon, Download, SearchX, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import type { AdminUser, AdminUserRole, AdminUserStatus, AdminUserVerification } from "../../data/mockAdminUsers"
import { UserFilters } from "../../components/admin/users/UserFilters"
import { UserTable, BulkActionBar } from "../../components/admin/users/UserTable"
import { AdminConfirmDialog } from "../../components/admin/AdminConfirmDialog"
import { authService } from "../../services/authService"

import { useAdminUsers } from "../../contexts/AdminUsersContext"

export default function AdminUsers() {
  const { users, setUsers } = useAdminUsers()

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<AdminUserRole | "All Roles">("All Roles")
  const [selectedStatus, setSelectedStatus] = useState<AdminUserStatus | "All Status">("All Status")
  const [selectedVerification, setSelectedVerification] = useState<AdminUserVerification | "All">("All")
  
  // Selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  
  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Modals
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)
  const [bulkSuspendModalOpen, setBulkSuspendModalOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null)
  
  // Derived state
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = selectedRole === "All Roles" || user.role === selectedRole
      const matchesStatus = selectedStatus === "All Status" || user.status === selectedStatus
      const matchesVerification = selectedVerification === "All" || user.verification === selectedVerification
      return matchesSearch && matchesRole && matchesStatus && matchesVerification
    })
  }, [users, searchQuery, selectedRole, selectedStatus, selectedVerification])

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const stats = useMemo(() => {
    return {
      total: users.length,
      candidates: users.filter(u => u.role === "Candidate").length,
      recruiters: users.filter(u => u.role === "Recruiter").length,
      admins: users.filter(u => u.role === "Administrator").length,
      active: users.filter(u => u.status === "Active").length,
      suspended: users.filter(u => u.status === "Suspended").length,
    }
  }, [users])

  // Handlers
  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedRole("All Roles")
    setSelectedStatus("All Status")
    setSelectedVerification("All")
    setCurrentPage(1)
    setSelectedUserIds([])
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(paginatedUsers.map(u => u.id))
    } else {
      setSelectedUserIds([])
    }
  }

  const handleSelectUser = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id])
    } else {
      setSelectedUserIds(prev => prev.filter(userId => userId !== id))
    }
  }

  const handleExport = () => {
    const headers = ["Name,Email,Role,Status,Verification,Joined,LastActive"]
    const rows = filteredUsers.map(u => 
      `"${u.name}","${u.email}","${u.role}","${u.status}","${u.verification}","${u.joinedAt}","${u.lastActive}"`
    )
    const csvContent = headers.concat(rows).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "hiresmart-users.csv")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSuspendConfirm = () => {
    if (targetUser) {
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: "Suspended" } : u))
      showToast("User suspended successfully.")
    }
    setSuspendModalOpen(false)
    setTargetUser(null)
  }

  const handleReactivateConfirm = () => {
    if (targetUser) {
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: "Active" } : u))
      showToast("User reactivated successfully.")
    }
    setReactivateModalOpen(false)
    setTargetUser(null)
  }

  const handleBulkSuspendConfirm = () => {
    const currentUser = authService.getCurrentUser()
    const idsToSuspend = selectedUserIds.filter(id => {
      const user = users.find(u => u.id === id)
      return user && user.email !== currentUser?.email
    })

    setUsers(prev => prev.map(u => idsToSuspend.includes(u.id) ? { ...u, status: "Suspended" } : u))
    setBulkSuspendModalOpen(false)
    setSelectedUserIds([])
    showToast(`${idsToSuspend.length} users suspended successfully.`)
  }

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

      <AdminPageHeader 
        title="User Management" 
        description="Manage platform users, roles, account status, and access."
        action={
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/50 hover:bg-brand-gray/10 text-brand-navy rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" /> Export Users
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <AdminStatCard title="Total Users" value={stats.total.toLocaleString()} icon={Users} delay={1} />
        <AdminStatCard title="Candidates" value={stats.candidates.toLocaleString()} icon={User} delay={2} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
        <AdminStatCard title="Recruiters" value={stats.recruiters.toLocaleString()} icon={Briefcase} delay={3} color={{ bg: "bg-brand-violet/10", text: "text-brand-violet" }} />
        <AdminStatCard title="Administrators" value={stats.admins.toLocaleString()} icon={ShieldAlert} delay={4} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
        <AdminStatCard title="Active Users" value={stats.active.toLocaleString()} icon={Users} delay={5} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
        <AdminStatCard title="Suspended" value={stats.suspended.toLocaleString()} icon={AlertOctagon} delay={6} color={{ bg: "bg-semantic-error/10", text: "text-semantic-error" }} />
      </div>

      <UserFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        selectedRole={selectedRole} setSelectedRole={setSelectedRole}
        selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus}
        selectedVerification={selectedVerification} setSelectedVerification={setSelectedVerification}
        onReset={handleResetFilters}
      />

      {filteredUsers.length === 0 ? (
        <AdminEmptyState 
          icon={SearchX}
          title="No users found"
          description="Try adjusting your search or filters."
          action={
            <button onClick={handleResetFilters} className="px-4 py-2 bg-brand-indigo text-white rounded-lg hover:bg-brand-indigo/90 font-medium">
              Clear Filters
            </button>
          }
        />
      ) : (
        <>
          <UserTable 
            users={paginatedUsers} 
            selectedUserIds={selectedUserIds}
            onSelectAll={handleSelectAll}
            onSelectUser={handleSelectUser}
            onSuspend={(user) => { setTargetUser(user); setSuspendModalOpen(true) }}
            onReactivate={(user) => { setTargetUser(user); setReactivateModalOpen(true) }}
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <span className="text-sm text-brand-navy/60">
              Showing <span className="font-medium text-brand-navy">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-brand-navy">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium text-brand-navy">{filteredUsers.length}</span> users
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

      <BulkActionBar 
        selectedCount={selectedUserIds.length} 
        onClear={() => setSelectedUserIds([])}
        onSuspend={() => setBulkSuspendModalOpen(true)}
      />

      <AdminConfirmDialog 
        isOpen={suspendModalOpen}
        title="Suspend User?"
        message={
          <div className="text-left bg-brand-light p-3 rounded-lg border border-brand-gray/30 mt-2">
            <p className="font-medium text-brand-navy">{targetUser?.name}</p>
            <p className="text-xs text-brand-navy/50">{targetUser?.email}</p>
          </div>
        }
        confirmLabel="Suspend User"
        onConfirm={handleSuspendConfirm}
        onCancel={() => { setSuspendModalOpen(false); setTargetUser(null); }}
        variant="danger"
      />

      <AdminConfirmDialog 
        isOpen={reactivateModalOpen}
        title="Reactivate User?"
        message="This will restore platform access for this account."
        confirmLabel="Reactivate User"
        onConfirm={handleReactivateConfirm}
        onCancel={() => { setReactivateModalOpen(false); setTargetUser(null); }}
        variant="info"
      />

      <AdminConfirmDialog 
        isOpen={bulkSuspendModalOpen}
        title={`Suspend ${selectedUserIds.length} Users?`}
        message="Are you sure you want to suspend these accounts? They will immediately lose platform access."
        confirmLabel="Suspend Selected"
        onConfirm={handleBulkSuspendConfirm}
        onCancel={() => setBulkSuspendModalOpen(false)}
        variant="danger"
      />

    </AdminShell>
  )
}
