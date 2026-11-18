import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Brain, CheckCircle2, ChevronRight, FileText, Briefcase, Filter, X, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { staggerContainer, slideUp } from "../../lib/animations"
import { screeningJobs } from "../../data/screeningMockData"

export default function RecruiterScreening() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | "Pending" | "Screened">("All")
  const [locationFilter, setLocationFilter] = React.useState("All")

  React.useEffect(() => {
    setLoading(false)
  }, [])

  const totalApplications = screeningJobs.reduce((acc, job) => acc + job.applications, 0)
  const totalScreened = screeningJobs.reduce((acc, job) => acc + job.screened, 0)
  const totalStrongMatches = screeningJobs.reduce((acc, job) => acc + job.strongMatches, 0)
  const totalPending = screeningJobs.reduce((acc, job) => acc + job.pending, 0)

  // Unique locations from jobs
  const availableLocations = React.useMemo(() => {
    const locs = new Set<string>()
    screeningJobs.forEach(j => {
      const city = j.location.split(" · ")[0].trim()
      if (city) locs.add(city)
    })
    return ["All", ...Array.from(locs)]
  }, [])

  // Filtered jobs list
  const filteredJobs = React.useMemo(() => {
    return screeningJobs.filter(job => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term || 
        job.title.toLowerCase().includes(term) || 
        job.location.toLowerCase().includes(term)

      const matchesStatus = 
        statusFilter === "All" ||
        (statusFilter === "Pending" && job.pending > 0) ||
        (statusFilter === "Screened" && job.pending === 0)

      const matchesLocation = 
        locationFilter === "All" || 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())

      return matchesSearch && matchesStatus && matchesLocation
    })
  }, [searchTerm, statusFilter, locationFilter])

  const activeFilterCount = (searchTerm ? 1 : 0) + (statusFilter !== "All" ? 1 : 0) + (locationFilter !== "All" ? 1 : 0)

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
    setLocationFilter("All")
  }

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div variants={slideUp} custom={delay}>
      <PremiumCard className="hover:-translate-y-0.5 transition-all duration-200">
        <PremiumCardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
            <h3 className="text-2xl font-display font-bold text-brand-navy">
              {loading ? <div className="h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </PremiumCardContent>
      </PremiumCard>
    </motion.div>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">AI Resume Screening</h1>
          <p className="text-brand-navy/60 mt-1">Use AI-powered analysis to identify candidates who best match your job requirements.</p>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Applications" value={totalApplications} icon={FileText} delay={0} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/70" }} />
          <StatCard title="AI Screened" value={totalScreened} icon={Search} delay={1} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <StatCard title="Strong Matches" value={totalStrongMatches} icon={CheckCircle2} delay={2} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <StatCard title="Pending" value={totalPending} icon={Brain} delay={3} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
        </div>

        {/* JOB SELECTOR */}
        <motion.div variants={slideUp} className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-semibold text-brand-navy">Select Job for Screening</h2>
              <p className="text-xs text-brand-navy/60 mt-0.5">Showing {filteredJobs.length} of {screeningJobs.length} roles</p>
            </div>
            
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="text-xs text-brand-navy/60 hover:text-brand-navy flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
              <Button 
                variant={isFilterOpen ? "default" : "outline"} 
                size="sm" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 ${isFilterOpen ? "bg-brand-indigo text-white" : "border-brand-gray/40 text-brand-navy"}`}
              >
                <Filter className="w-4 h-4" /> 
                <span>Filter Jobs</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-brand-indigo">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* COLLAPSIBLE FILTER CONTROLS PANEL */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-brand-light/80 rounded-xl border border-brand-gray/40 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-brand-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by title or location..."
                        className="pl-9 h-9 text-xs bg-white"
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm("")} 
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-navy/40 hover:text-brand-navy"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-brand-gray bg-white px-3 text-xs text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Has Pending Screening</option>
                        <option value="Screened">Fully Screened</option>
                      </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <select
                        value={locationFilter}
                        onChange={e => setLocationFilter(e.target.value)}
                        className="w-full h-9 rounded-md border border-brand-gray bg-white px-3 text-xs text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                      >
                        {availableLocations.map(loc => (
                          <option key={loc} value={loc}>
                            {loc === "All" ? "All Locations" : loc}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* JOBS LIST / EMPTY STATE */}
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <PremiumCard key={i} className="animate-pulse">
                  <PremiumCardContent className="p-6">
                    <div className="h-5 w-48 bg-brand-gray/20 rounded mb-2" />
                    <div className="h-4 w-32 bg-brand-gray/20 rounded mb-4" />
                    <div className="flex gap-4">
                      <div className="h-4 w-24 bg-brand-gray/20 rounded" />
                      <div className="h-4 w-24 bg-brand-gray/20 rounded" />
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              ))
            ) : filteredJobs.length === 0 ? (
              <div className="py-12 px-6 text-center bg-brand-light/60 rounded-2xl border border-brand-gray/30">
                <Search className="w-10 h-10 text-brand-navy/30 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-brand-navy">No jobs match your filter criteria</h3>
                <p className="text-xs text-brand-navy/60 mt-1 mb-4">Try clearing or adjusting your search term, screening status, or location.</p>
                <Button 
                  onClick={handleResetFilters} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-brand-gray/40 text-brand-navy"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Filters
                </Button>
              </div>
            ) : (
              filteredJobs.map(job => (
                <PremiumCard key={job.id} className="group hover:border-brand-indigo/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/recruiter/screening/${job.id}`)}>
                  <PremiumCardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{job.title}</h3>
                        {job.pending > 0 && (
                          <span className="px-2.5 py-0.5 bg-semantic-warning/10 text-semantic-warning text-[10px] font-bold uppercase tracking-wider rounded-md border border-semantic-warning/20">
                            {job.pending} Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-brand-navy/60">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4">
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Applications</div>
                          <div className="font-semibold text-brand-navy">{job.applications}</div>
                        </div>
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Screened</div>
                          <div className="font-semibold text-brand-navy">{job.screened}</div>
                        </div>
                        <div>
                          <div className="text-xs text-brand-navy/50 mb-0.5">Strong Matches</div>
                          <div className="font-semibold text-semantic-success">{job.strongMatches}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" className="shrink-0 group-hover:bg-brand-indigo group-hover:text-white transition-colors self-start sm:self-center">
                      View Screening <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </PremiumCardContent>
                </PremiumCard>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
