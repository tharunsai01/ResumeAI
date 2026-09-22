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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-light/50 border-b border-brand-gray/30 text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">
              <th className="p-4 w-12">
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
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Verification</th>
              <th className="p-4 hidden md:table-cell">Joined</th>
              <th className="p-4 hidden lg:table-cell">Last Active</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray/20">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-brand-light/40 transition-colors group">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-brand-gray/50 text-brand-indigo focus:ring-brand-indigo cursor-pointer w-4 h-4"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => onSelectUser(user.id, e.target.checked)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-brand-navy text-sm">{user.name}</div>
                      <div className="text-xs text-brand-navy/50">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="p-4">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="p-4">
                  <UserVerificationBadge verification={user.verification} />
                </td>
                <td className="p-4 hidden md:table-cell text-sm text-brand-navy/70 whitespace-nowrap">
                  {user.joinedAt}
                </td>
                <td className="p-4 hidden lg:table-cell text-sm text-brand-navy/50 whitespace-nowrap">
                  {user.lastActive}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-brand-indigo bg-brand-indigo/5 hover:bg-brand-indigo/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <SpotlightCard className="glass-card shadow-xl px-6 py-4 flex items-center gap-6 rounded-full border border-brand-indigo/20 bg-white/95 backdrop-blur-md">
        <span className="font-medium text-brand-navy">
          <span className="text-brand-indigo font-bold">{selectedCount}</span> users selected
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={onSuspend}
            className="flex items-center gap-2 px-4 py-2 bg-semantic-error/10 text-semantic-error hover:bg-semantic-error/20 rounded-full text-sm font-medium transition-colors"
          >
            <Ban className="w-4 h-4" /> Suspend Selected
          </button>
          <button 
            onClick={onClear}
            className="px-4 py-2 text-brand-navy/50 hover:text-brand-navy hover:bg-brand-light rounded-full text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </SpotlightCard>
    </div>
  )
}
