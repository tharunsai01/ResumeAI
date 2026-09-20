import { Search, Filter, X } from "lucide-react"
import type { AdminUserRole, AdminUserStatus, AdminUserVerification } from "../../../data/mockAdminUsers"

interface UserFiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedRole: AdminUserRole | "All Roles"
  setSelectedRole: (val: AdminUserRole | "All Roles") => void
  selectedStatus: AdminUserStatus | "All Status"
  setSelectedStatus: (val: AdminUserStatus | "All Status") => void
  selectedVerification: AdminUserVerification | "All"
  setSelectedVerification: (val: AdminUserVerification | "All") => void
  onReset: () => void
}

export function UserFilters({
  searchQuery, setSearchQuery,
  selectedRole, setSelectedRole,
  selectedStatus, setSelectedStatus,
  selectedVerification, setSelectedVerification,
  onReset
}: UserFiltersProps) {
  
  const hasActiveFilters = searchQuery !== "" || selectedRole !== "All Roles" || selectedStatus !== "All Status" || selectedVerification !== "All"

  return (
    <div className="glass-card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/40" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or email..." 
          className="w-full pl-10 pr-4 py-2.5 bg-brand-light border border-brand-gray/50 rounded-lg text-sm text-brand-navy focus:outline-none focus:border-brand-indigo focus:ring-1 focus:ring-brand-indigo transition-shadow"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-3 py-2 bg-brand-light border border-brand-gray/50 rounded-lg text-sm">
          <Filter className="w-4 h-4 text-brand-navy/40" />
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="bg-transparent border-none outline-none text-brand-navy font-medium cursor-pointer"
          >
            <option value="All Roles">All Roles</option>
            <option value="Candidate">Candidate</option>
            <option value="Recruiter">Recruiter</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>

        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-2 bg-brand-light border border-brand-gray/50 rounded-lg text-sm text-brand-navy font-medium outline-none focus:border-brand-indigo cursor-pointer"
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>

        <select 
          value={selectedVerification}
          onChange={(e) => setSelectedVerification(e.target.value as any)}
          className="px-3 py-2 bg-brand-light border border-brand-gray/50 rounded-lg text-sm text-brand-navy font-medium outline-none focus:border-brand-indigo cursor-pointer"
        >
          <option value="All">All Verification</option>
          <option value="Verified">Verified</option>
          <option value="Unverified">Unverified</option>
        </select>

        {hasActiveFilters && (
          <button 
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-sm text-semantic-error hover:bg-semantic-error/10 rounded-lg transition-colors font-medium"
          >
            <X className="w-4 h-4" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}
