import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Users, CheckCircle2, UserPlus, Filter, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialRecruiterCandidates } from "../../data/recruiterMockData"
import type { RecruiterCandidate, AppStatus, AIScreeningStatus } from "../../data/recruiterMockData"
import { CandidateStatusBadge } from "./components/CandidateStatusBadge"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { RejectCandidateModal } from "./components/RejectCandidateModal"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);
const StatCard = ({ title, value, icon: Icon, color, delay, loading }: any) => (
  <motion.div variants={slideUp} custom={delay}>
    <PremiumCard className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group cursor-default">
      <PremiumCardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
          <h3 className="text-2xl font-display font-bold text-brand-navy">
            {loading ? <div className="h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : value}
          </h3>
        </div>
        <div className={cn("p-3 rounded-xl", color.bg, color.text)}>
          <Icon className="w-5 h-5" />
        </div>
      </PremiumCardContent>
    </PremiumCard>
  </motion.div>
)

export default function RecruiterCandidates() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [candidates, setCandidates] = React.useState<RecruiterCandidate[]>([])
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"All" | AppStatus>("All")
  const [screeningFilter, setScreeningFilter] = React.useState<"All" | AIScreeningStatus>("All")
  const [scoreFilter, setScoreFilter] = React.useState<"All" | "90+" | "80+" | "70+" | "Below 70">("All")
  const [sortBy, setSortBy] = React.useState<"Newest" | "Oldest" | "Highest Match" | "Lowest Match" | "Name">("Newest")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  // Actions
  const [candidateToReject, setCandidateToReject] = React.useState<{id: string, name: string} | null>(null)
  const [shortlistMsg, setShortlistMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    setCandidates([...initialRecruiterCandidates])
    setLoading(false)
  }, [])

  const filteredAndSorted = React.useMemo(() => {
    let result = candidates.filter(cand => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        cand.name.toLowerCase().includes(searchLower) || 
        cand.appliedRole.toLowerCase().includes(searchLower) ||
        cand.skills.some(s => s.name.toLowerCase().includes(searchLower)) ||
        cand.location.toLowerCase().includes(searchLower)
      
      const matchesStatus = statusFilter === "All" || cand.status === statusFilter
      const matchesScreening = screeningFilter === "All" || cand.screeningStatus === screeningFilter
      
      let matchesScore = true
      if (scoreFilter === "90+") matchesScore = cand.matchScore >= 90
      else if (scoreFilter === "80+") matchesScore = cand.matchScore >= 80
      else if (scoreFilter === "70+") matchesScore = cand.matchScore >= 70
      else if (scoreFilter === "Below 70") matchesScore = cand.matchScore < 70

      return matchesSearch && matchesStatus && matchesScreening && matchesScore
    })

    result.sort((a, b) => {
      if (sortBy === "Highest Match") return b.matchScore - a.matchScore
      if (sortBy === "Lowest Match") return a.matchScore - b.matchScore
      if (sortBy === "Name") return a.name.localeCompare(b.name)
      // Newest/Oldest mock fallback using original array index for simplicity since mock dates are text
      return sortBy === "Newest" ? 0 : -1 
    })

    return sortBy === "Oldest" ? result.reverse() : result
  }, [candidates, searchTerm, statusFilter, screeningFilter, scoreFilter, sortBy])

  const stats = {
    total: candidates.length,
    new: candidates.filter(c => c.status === "Applied").length,
    screened: candidates.filter(c => c.screeningStatus !== "Not Screened").length,
    shortlisted: candidates.filter(c => c.status === "Shortlisted").length,
  }

  const handleShortlist = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: "Shortlisted" } : c))
    setShortlistMsg(`${name} shortlisted successfully.`)
    setTimeout(() => setShortlistMsg(null), 3000)
  }

  const handleReject = () => {
    if (candidateToReject) {
      setCandidates(candidates.map(c => c.id === candidateToReject.id ? { ...c, status: "Rejected" } : c))
      setCandidateToReject(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
    setScreeningFilter("All")
    setScoreFilter("All")
    setSortBy("Newest")
  }


  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Candidates</h1>
            <p className="text-brand-navy/60 mt-1">Discover, review, and manage candidates across your job openings.</p>
          </div>
          <Button onClick={() => navigate("/recruiter/screening")} className="shrink-0 px-6 bg-gradient-to-r from-brand-indigo to-brand-blue">
            <Search className="w-4 h-4 mr-2" /> AI Screen Candidates
          </Button>
        </motion.div>

        {/* NOTIFICATION */}
        <AnimatePresence>
          {shortlistMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" /> {shortlistMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Candidates" value={stats.total} icon={Users} delay={0} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="New Applications" value={stats.new} icon={UserPlus} delay={1} loading={loading} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <StatCard title="AI Screened" value={stats.screened} icon={Search} delay={2} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} delay={3} loading={loading} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
        </div>

        {/* FILTERS */}
        <MotionSpotlightCard variants={slideUp} className="glass-card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex items-center px-4 bg-brand-light/50 border border-brand-gray/40 rounded-xl focus-within:border-brand-indigo/50 focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all">
              <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
              <input
                type="text"
                placeholder="Search candidates by name, role, skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11"
              />
            </div>
            <Button variant="outline" className="lg:hidden" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <div className={cn("flex flex-col sm:flex-row gap-3 lg:flex", isMobileFiltersOpen ? "flex" : "hidden")}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select value={screeningFilter} onChange={(e) => setScreeningFilter(e.target.value as any)} className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Screening</option>
                <option value="Not Screened">Not Screened</option>
                <option value="Screened">Screened</option>
                <option value="Strong Match">Strong Match</option>
                <option value="Potential Match">Potential Match</option>
                <option value="Low Match">Low Match</option>
              </select>
              <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value as any)} className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="All">All Scores</option>
                <option value="90+">90%+</option>
                <option value="80+">80%+</option>
                <option value="70+">70%+</option>
                <option value="Below 70">Below 70%</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-white border border-brand-gray/50 rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
                <option value="Newest">Sort: Newest</option>
                <option value="Oldest">Sort: Oldest</option>
                <option value="Highest Match">Sort: Highest Match</option>
                <option value="Lowest Match">Sort: Lowest Match</option>
                <option value="Name">Sort: Name A-Z</option>
              </select>
            </div>
          </div>
          {(searchTerm || statusFilter !== "All" || screeningFilter !== "All" || scoreFilter !== "All") && (
            <div className="flex justify-end pt-2 border-t border-brand-gray/20">
              <button onClick={clearFilters} className="text-sm font-medium text-brand-indigo hover:text-brand-blue flex items-center transition-colors">
                <X className="w-4 h-4 mr-1" /> Clear Filters
              </button>
            </div>
          )}
        </MotionSpotlightCard>

        {/* CANDIDATE LIST */}
        <motion.div variants={slideUp}>
          <PremiumCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-light text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Applied Role & Skills</th>
                    <th className="px-6 py-4 text-center">AI Match</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/30">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4 flex gap-3"><div className="w-10 h-10 rounded-full bg-brand-gray/20"></div><div><div className="h-4 w-24 bg-brand-gray/20 rounded mb-2"></div><div className="h-3 w-32 bg-brand-gray/20 rounded"></div></div></td>
                        <td className="px-6 py-4"><div className="h-4 w-32 bg-brand-gray/20 rounded mb-2"></div><div className="flex gap-1"><div className="h-4 w-12 bg-brand-gray/20 rounded"></div><div className="h-4 w-12 bg-brand-gray/20 rounded"></div></div></td>
                        <td className="px-6 py-4"><div className="w-10 h-10 rounded-full bg-brand-gray/20 mx-auto"></div></td>
                        <td className="px-6 py-4"><div className="w-20 h-5 bg-brand-gray/20 rounded-md mx-auto"></div></td>
                        <td className="px-6 py-4"><div className="w-16 h-8 bg-brand-gray/20 rounded-lg ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredAndSorted.length > 0 ? (
                    filteredAndSorted.map((cand) => (
                      <tr key={cand.id} className="hover:bg-brand-light/50 transition-colors group cursor-pointer" onClick={() => navigate(`/recruiter/candidates/${cand.id}`)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-blue text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                              {cand.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div className="font-semibold text-brand-navy text-base group-hover:text-brand-indigo transition-colors">
                                {cand.name}
                              </div>
                              <div className="text-xs text-brand-navy/60 mt-0.5">{cand.title} • {cand.experience}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-brand-navy/80 font-medium mb-1.5">{cand.appliedRole}</div>
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.slice(0, 3).map(skill => (
                              <span key={skill.name} className="px-2 py-0.5 bg-brand-gray/10 text-brand-navy/70 text-[10px] font-medium rounded-md border border-brand-gray/30">
                                {skill.name}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-brand-gray/10 text-brand-navy/70 text-[10px] font-medium rounded-md border border-brand-gray/30">
                                +{cand.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <CandidateMatchScore score={cand.matchScore} size="sm" showLabel={false} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <CandidateStatusBadge status={cand.status} />
                            <span className="text-[10px] text-brand-navy/50">{cand.appliedDate}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {cand.status === "Shortlisted" ? (
                              <Button variant="outline" disabled size="sm" className="bg-brand-light text-brand-navy/40 border-brand-gray/30 text-xs">
                                Shortlisted
                              </Button>
                            ) : cand.status === "Rejected" ? (
                              <Button variant="outline" disabled size="sm" className="bg-brand-light text-brand-navy/40 border-brand-gray/30 text-xs">
                                Rejected
                              </Button>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-semantic-error hover:bg-semantic-error/10 hover:text-semantic-error text-xs hidden sm:flex"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCandidateToReject({id: cand.id, name: cand.name})
                                  }}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="text-xs bg-brand-navy hover:bg-brand-navy/90"
                                  onClick={(e) => handleShortlist(e, cand.id, cand.name)}
                                >
                                  Shortlist
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-12 h-12 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6 text-brand-navy/30" />
                        </div>
                        <h3 className="text-lg font-medium text-brand-navy mb-1">No candidates found</h3>
                        <p className="text-sm text-brand-navy/50">Try changing your search or filters.</p>
                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                          Clear Filters
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </motion.div>
      </motion.div>

      <RejectCandidateModal
        isOpen={!!candidateToReject}
        candidateName={candidateToReject?.name}
        onClose={() => setCandidateToReject(null)}
        onConfirm={handleReject}
      />
    </DashboardShell>
  )
}
