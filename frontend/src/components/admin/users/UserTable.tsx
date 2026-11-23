import type { AdminUser } from "../../../data/mockAdminUsers"
import { UserRoleBadge, UserStatusBadge, UserVerificationBadge } from "./UserBadges"
import { UserActionMenu } from "./UserActionMenu"
import { useNavigate } from "react-router-dom"
import { Ban } from "lucide-react"
import SpotlightCard from "../../ui/SpotlightCard";

interface UserTableProps {
  users: AdminUser[]
  selectedUserIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectUser: (id: string, checked: boolean) => void
  onSuspend: (user: AdminUser) => void
  onReactivate: (user: AdminUser) => void
}

export function UserTable({ users, selectedUserIds, onSelectAll, onSelectUser, onSuspend, onReactivate }: UserTableProps) {
  const navigate = useNavigate()
  
  const allSelected = users.length > 0 && selectedUserIds.length === users.length
  const someSelected = selectedUserIds.length > 0 && !allSelected

  return (
    <SpotlightCard className="glass-card overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-light/50 border-b border-brand-gray/30 text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">
              <th className="p-3 sm:p-4 w-12 whitespace-nowrap">
                <input 
                  type="checkbox" 
                  className="rounded border-brand-gray/50 text-brand-indigo focus:ring-brand-indigo cursor-pointer w-4 h-4"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-3 sm:p-4 whitespace-nowrap">User</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">Role</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">Status</th>
              <th className="p-3 sm:p-4 whitespace-nowrap">Verification</th>
              <th className="p-3 sm:p-4 hidden md:table-cell whitespace-nowrap">Joined</th>
              <th className="p-3 sm:p-4 hidden lg:table-cell whitespace-nowrap">Last Active</th>
              <th className="p-3 sm:p-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray/20">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-brand-light/40 transition-colors group">
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    className="rounded border-brand-gray/50 text-brand-indigo focus:ring-brand-indigo cursor-pointer w-4 h-4"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => onSelectUser(user.id, e.target.checked)}
                  />
                </td>
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-bold shrink-0 text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-brand-navy text-sm truncate max-w-[150px] sm:max-w-[200px]">{user.name}</div>
                      <div className="text-xs text-brand-navy/50 truncate max-w-[150px] sm:max-w-[200px]">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="p-3 sm:p-4 whitespace-nowrap">
                  <UserVerificationBadge verification={user.verification} />
                </td>
                <td className="p-3 sm:p-4 hidden md:table-cell text-sm text-brand-navy/70 whitespace-nowrap">
                  {user.joinedAt}
                </td>
                <td className="p-3 sm:p-4 hidden lg:table-cell text-sm text-brand-navy/50 whitespace-nowrap">
                  {user.lastActive}
                </td>
                <td className="p-3 sm:p-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 sm:gap-2">
                    <button 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-brand-indigo bg-brand-indigo/5 hover:bg-brand-indigo/10 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    >
                      View
                    </button>
                    <UserActionMenu 
                      user={user} 
                      onSuspend={onSuspend} 
                      onReactivate={onReactivate} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SpotlightCard>
  )
}

interface BulkActionBarProps {
  selectedCount: number
  onSuspend: () => void
  onClear: () => void
}

export function BulkActionBar({ selectedCount, onSuspend, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] sm:w-auto max-w-lg">
      <SpotlightCard className="glass-card shadow-xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 rounded-2xl sm:rounded-full border border-brand-indigo/20 bg-white/95 backdrop-blur-md w-full">
        <span className="font-medium text-brand-navy text-sm text-center sm:text-left">
          <span className="text-brand-indigo font-bold">{selectedCount}</span> users selected
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button 
            onClick={onSuspend}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-semantic-error/10 text-semantic-error hover:bg-semantic-error/20 rounded-full text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-initial"
          >
            <Ban className="w-4 h-4" /> Suspend Selected
          </button>
          <button 
            onClick={onClear}
            className="px-4 py-2 text-brand-navy/50 hover:text-brand-navy hover:bg-brand-light rounded-full text-xs sm:text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </SpotlightCard>
    </div>
  )
}
