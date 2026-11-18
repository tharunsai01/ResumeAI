import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { useAdminUsers } from "../../contexts/AdminUsersContext"
import { ArrowLeft, UserX, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "../../services/authService"

import { UserProfileHeader } from "../../components/admin/users/UserProfileHeader"
import { AccountInformation, RoleAccessCard } from "../../components/admin/users/AccountCards"
import { AccountStatusCard } from "../../components/admin/users/AccountStatusCard"
import { UserActivityTimeline, ActivitySummary } from "../../components/admin/users/UserActivity"
import { ProfileInformationCard, AccountSecurityCard } from "../../components/admin/users/ProfileSecurityCards"
import { AdminConfirmDialog } from "../../components/admin/AdminConfirmDialog"
import { AdminEmptyState } from "../../components/admin/AdminEmptyState"

export default function UserDetails() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { getUserById, updateUserStatus } = useAdminUsers()
  
  const user = userId ? getUserById(userId) : undefined
  const currentUser = authService.getCurrentUser()
  const isCurrentUser = Boolean(user && currentUser && user.email === currentUser.email)

  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false)

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  if (!user) {
    return (
      <AdminShell>
        <AdminPageHeader title="User Details" />
        <AdminEmptyState 
          icon={UserX}
          title="User Not Found"
          description="The requested user could not be found. They may have been removed or the ID is incorrect."
          action={
            <button 
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-brand-indigo text-white rounded-lg hover:bg-brand-indigo/90 font-medium"
            >
              Back to Users
            </button>
          }
        />
      </AdminShell>
    )
  }

  const handleSuspendConfirm = () => {
    updateUserStatus(user.id, "Suspended")
    setSuspendModalOpen(false)
    showToast("User suspended successfully.")
  }

  const handleReactivateConfirm = () => {
    updateUserStatus(user.id, "Active")
    setReactivateModalOpen(false)
    showToast("User reactivated successfully.")
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

      <div className="text-sm font-medium text-brand-navy/60 mb-2 flex items-center gap-2">
        <span className="hover:text-brand-indigo cursor-pointer" onClick={() => navigate('/admin')}>Administration</span>
        <span>/</span>
        <span className="hover:text-brand-indigo cursor-pointer" onClick={() => navigate('/admin/users')}>Users</span>
        <span>/</span>
        <span className="text-brand-navy">User Details</span>
      </div>

      <AdminPageHeader 
        title="User Details" 
        description="View account information, status, verification, and platform activity."
        action={
          <button 
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-light border border-brand-gray/50 hover:bg-brand-gray/10 text-brand-navy rounded-lg font-medium transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </button>
        }
      />

      <UserProfileHeader user={user} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AccountInformation user={user} />
        <RoleAccessCard user={user} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <AccountStatusCard 
            user={user} 
            isCurrentUser={isCurrentUser}
            onSuspend={() => setSuspendModalOpen(true)}
            onReactivate={() => setReactivateModalOpen(true)}
          />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActivitySummary user={user} />
          <UserActivityTimeline user={user} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ProfileInformationCard user={user} />
        <AccountSecurityCard user={user} />
      </div>

      {/* Modals */}
      <AdminConfirmDialog 
        isOpen={suspendModalOpen}
        title="Suspend User?"
        message={
          <>
            <p className="mb-4">Are you sure you want to suspend this account? The user will no longer have normal platform access.</p>
            <div className="text-left bg-brand-light p-3 rounded-lg border border-brand-gray/30 mt-2">
              <p className="font-medium text-brand-navy">{user.name}</p>
              <p className="text-xs text-brand-navy/50">{user.email}</p>
              <p className="text-xs text-semantic-warning font-semibold mt-1">Status: {user.status}</p>
            </div>
          </>
        }
        confirmLabel="Suspend User"
        onConfirm={handleSuspendConfirm}
        onCancel={() => setSuspendModalOpen(false)}
        variant="danger"
      />

      <AdminConfirmDialog 
        isOpen={reactivateModalOpen}
        title="Reactivate User?"
        message="Reactivating this account will restore normal platform access."
        confirmLabel="Reactivate User"
        onConfirm={handleReactivateConfirm}
        onCancel={() => setReactivateModalOpen(false)}
        variant="info"
      />
    </AdminShell>
  )
}
