import * as React from "react"
import { motion } from "framer-motion"
import { Search, Filter, SlidersHorizontal, Briefcase, Calendar, CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { MatchScore } from "../../components/shared/MatchScore"
import { useJobActions } from "../../hooks/useJobActions"
import { mockResumeAnalysis } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard";

export default function CandidateApplications() {
  const navigate = useNavigate()
  const { appliedJobs } = useJobActions()
  
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [dateFilter, setDateFilter] = React.useState("Any time")
  const [sortBy, setSortBy] = React.useState("Newest")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  // Summary Metrics
  const totalApplications = appliedJobs.length
  const underReview = appliedJobs.filter(a => a.status === "Under Review").length
  const interviews = appliedJobs.filter(a => a.status === "Interview").length
  const offers = appliedJobs.filter(a => a.status === "Offer").length

  const summaryStats = [
    { label: "Total Applications", value: totalApplications, icon: Briefcase, color: "text-brand-blue", bg: "bg-brand-blue/10" },
    { label: "Under Review", value: underReview, icon: Clock, color: "text-brand-violet", bg: "bg-brand-violet/10" },
    { label: "Interviews", value: interviews, icon: Calendar, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
    { label: "Offers", value: offers, icon: CheckCircle2, color: "text-semantic-success", bg: "bg-semantic-success/10" },
  ]

  // Filtering & Sorting
  const filteredApplications = React.useMemo(() => {
    let result = [...appliedJobs]

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.company.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      )
    }

    // Status Filter
    if (statusFilter !== "All") {
      result = result.filter(a => a.status === statusFilter)
    }

    // Date Filter
    if (dateFilter !== "Any time") {
      const now = new Date()
      const cutoff = new Date()
      if (dateFilter === "Last 7 days") cutoff.setDate(now.getDate() - 7)
      if (dateFilter === "Last 30 days") cutoff.setDate(now.getDate() - 30)
      if (dateFilter === "Last 3 months") cutoff.setMonth(now.getMonth() - 3)
      
      result = result.filter(a => new Date(a.appliedDate) >= cutoff)
    }

    // Sort
    if (sortBy === "Newest") {
      result.sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    } else if (sortBy === "Oldest") {
      result.sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime())
    } else if (sortBy === "Highest Match") {
      result.sort((a, b) => b.matchScore - a.matchScore)
    } else if (sortBy === "Lowest Match") {
      result.sort((a, b) => a.matchScore - b.matchScore)
    }

    return result
  }, [appliedJobs, searchTerm, statusFilter, dateFilter, sortBy])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("All")
    setDateFilter("Any time")
    setSortBy("Newest")
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Applied": return <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue">Applied</Badge>
      case "Under Review": return <Badge variant="secondary" className="bg-brand-violet/10 text-brand-violet">Under Review</Badge>
      case "Shortlisted": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success">Shortlisted</Badge>
      case "Interview": return <Badge variant="secondary" className="bg-brand-indigo/10 text-brand-indigo">Interview</Badge>
      case "Offer": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success">Offer</Badge>
      case "Rejected": return <Badge variant="secondary" className="bg-semantic-error/10 text-semantic-error">Rejected</Badge>
      case "Withdrawn": return <Badge variant="secondary" className="bg-brand-gray/50 text-brand-navy/60">Withdrawn</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Applications</h1>
            <p className="text-brand-navy/60">Track and manage your job applications in one place.</p>
          </div>
          
          <div className="w-full sm:w-auto relative group">
            <Search className="w-5 h-5 text-brand-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-card w-full sm:w-72 py-2 pl-10 pr-4 text-sm focus: outline-none transition-all group-hover:"
            />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={slideUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryStats.map((stat, i) => (
            <Card key={i} className="group hover:border-brand-indigo/30 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-brand-navy/60 font-medium">{stat.label}</p>
                  <p className="text-2xl font-display font-semibold text-brand-navy">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Area */}
        {appliedJobs.length === 0 ? (
          <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-6">
              <Briefcase className="w-8 h-8 text-brand-navy/30" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-brand-navy mb-2">No applications yet</h3>
            <p className="text-brand-navy/60 mb-8 max-w-md">Your submitted job applications will appear here. Start discovering jobs that match your skills.</p>
            <Button size="lg" onClick={() => navigate("/candidate/jobs")}>Find Jobs</Button>
          </motion.div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden w-full flex justify-between items-center bg-white p-4 rounded-xl border border-brand-gray/50">
              <span className="font-medium text-brand-navy flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</span>
              <Button variant="outline" size="sm" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                {isMobileFiltersOpen ? "Hide" : "Show"}
              </Button>
            </div>

            {/* Sidebar Filters */}
            <motion.div variants={slideUp} className={cn("w-full lg:w-64 shrink-0 space-y-6 lg:block", isMobileFiltersOpen ? "block" : "hidden")}>
              <Card>
                <CardContent className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-brand-navy flex items-center gap-2">
                      <Filter className="w-4 h-4" /> Filters
                    </h2>
                    <button onClick={clearFilters} className="text-xs font-medium text-brand-indigo hover:underline">Clear</button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-brand-navy uppercase tracking-wider">Status</h3>
                    <select 
                      value={statusFilter} 
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-brand-navy uppercase tracking-wider">Date Applied</h3>
                    <select 
                      value={dateFilter} 
                      onChange={e => setDateFilter(e.target.value)}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                    >
                      <option value="Any time">Any time</option>
                      <option value="Last 7 days">Last 7 days</option>
                      <option value="Last 30 days">Last 30 days</option>
                      <option value="Last 3 months">Last 3 months</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Status Overview visual */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-xs font-semibold text-brand-navy uppercase tracking-wider mb-4">Pipeline Overview</h3>
                  <div className="space-y-3">
                    {[
                      { s: "Applied", c: appliedJobs.filter(a => a.status === "Applied").length, col: "bg-brand-blue" },
                      { s: "Reviewing", c: underReview, col: "bg-brand-violet" },
                      { s: "Interview", c: interviews, col: "bg-brand-indigo" },
                      { s: "Offer", c: offers, col: "bg-semantic-success" },
                    ].map(st => (
                      <div key={st.s} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-brand-navy/70">{st.s}</span>
                            <span className="font-medium text-brand-navy">{st.c}</span>
                          </div>
                          <div className="w-full bg-brand-gray/30 h-1.5 rounded-full">
                            <div className={`${st.col} h-full rounded-full`} style={{ width: `${totalApplications ? (st.c/totalApplications)*100 : 0}%` }}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Application List */}
            <div className="flex-1 w-full space-y-4">
              
              {/* List Controls */}
              <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
                <p className="text-brand-navy/70 font-medium text-sm">
                  {filteredApplications.length} applications found
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-navy/60">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-white border border-brand-gray/50 rounded-lg py-1.5 px-3 text-sm font-medium text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="Newest">Newest</option>
                    <option value="Oldest">Oldest</option>
                    <option value="Highest Match">Highest Match</option>
                    <option value="Lowest Match">Lowest Match</option>
                  </select>
                </div>
              </motion.div>

              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-xl border border-brand-gray/50 p-12 text-center">
                  <AlertCircle className="w-10 h-10 text-brand-navy/20 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-brand-navy mb-1">No applications found</h3>
                  <p className="text-sm text-brand-navy/60 mb-4">Try changing your search or filters.</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <motion.div variants={staggerContainer} className="space-y-3">
                  {/* Desktop Table View */}
                  <SpotlightCard className="glass-card hidden md:block overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-brand-light/50 border-b border-brand-gray/50">
                          <th className="py-3 px-4 font-semibold text-xs text-brand-navy/60 uppercase tracking-wider">Job</th>
                          <th className="py-3 px-4 font-semibold text-xs text-brand-navy/60 uppercase tracking-wider">Applied Date</th>
                          <th className="py-3 px-4 font-semibold text-xs text-brand-navy/60 uppercase tracking-wider text-center">Match</th>
                          <th className="py-3 px-4 font-semibold text-xs text-brand-navy/60 uppercase tracking-wider">Status</th>
                          <th className="py-3 px-4 font-semibold text-xs text-brand-navy/60 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-gray/30">
                        {filteredApplications.map((app) => (
                          <motion.tr 
                            key={app.applicationId} 
                            variants={slideUp}
                            className="hover:bg-brand-light/30 transition-colors group"
                          >
                            <td className="py-4 px-4">
                              <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-indigo transition-colors">{app.title}</p>
                              <p className="text-xs text-brand-navy/60 mt-0.5">{app.company}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-brand-navy">{formatDate(app.appliedDate)}</p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center">
                                <MatchScore score={app.matchScore} size="sm" />
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(app.status)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate(`/candidate/applications/${app.applicationId}`)}
                              >
                                View Details
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </SpotlightCard>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {filteredApplications.map((app) => (
                      <Card key={app.applicationId} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-brand-navy text-sm">{app.title}</p>
                              <p className="text-xs text-brand-navy/60">{app.company}</p>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-brand-navy/60 mb-4">
                            <div className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1"/> {formatDate(app.appliedDate)}</div>
                            <div className="flex items-center font-medium text-brand-indigo"><TrendingUp className="w-3.5 h-3.5 mr-1"/> {app.matchScore}% Match</div>
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/candidate/applications/${app.applicationId}`)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardShell>
  )
}
