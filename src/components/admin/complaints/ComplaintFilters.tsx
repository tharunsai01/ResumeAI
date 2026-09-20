import { Search } from "lucide-react"

interface ComplaintFiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  priorityFilter: string
  setPriorityFilter: (val: string) => void
  categoryFilter: string
  setCategoryFilter: (val: string) => void
  roleFilter: string
  setRoleFilter: (val: string) => void
  onReset: () => void
}

export function ComplaintFilters({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  categoryFilter, setCategoryFilter,
  roleFilter, setRoleFilter,
  onReset
}: ComplaintFiltersProps) {
  return (
    <div className="bg-brand-light p-4 rounded-xl border border-brand-gray/20 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/40" />
          <input 
            type="text" 
            placeholder="Search complaints by ID, subject, or user..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-gray/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 transition-shadow"
          />
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 bg-brand-gray/10 text-brand-navy border border-brand-gray/30 rounded-lg text-sm font-medium hover:bg-brand-gray/20 transition-colors whitespace-nowrap"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-brand-gray/30 rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
        >
          <option value="All Status">All Status</option>
          <option value="Open">Open</option>
          <option value="In Review">In Review</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        
        <select 
          value={priorityFilter} 
          onChange={e => setPriorityFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-brand-gray/30 rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
        >
          <option value="All Priority">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
        
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-brand-gray/30 rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
        >
          <option value="All Categories">All Categories</option>
          <option value="Account">Account</option>
          <option value="Resume">Resume</option>
          <option value="AI & Matching">AI & Matching</option>
          <option value="Job/Recruiter">Job/Recruiter</option>
          <option value="Technical">Technical</option>
          <option value="Privacy & Security">Privacy & Security</option>
          <option value="Other">Other</option>
        </select>
        
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-brand-gray/30 rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
        >
          <option value="All Roles">All Roles</option>
          <option value="Candidate">Candidate</option>
          <option value="Recruiter">Recruiter</option>
        </select>
      </div>
    </div>
  )
}
