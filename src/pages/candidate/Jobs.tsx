import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { JobCard } from "../../components/shared/JobCard"
import { Button } from "../../components/ui/Button"
import { Card, CardContent } from "../../components/ui/Card"
import { jobService } from "../../services/jobService"
import type { JobMatchResult } from "../../services/jobService"
import { useJobActions } from "../../hooks/useJobActions"
import { mockResumeAnalysis } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function CandidateJobs() {
  const navigate = useNavigate()
  const { savedJobs, toggleSaveJob, hasApplied } = useJobActions()

  const [loading, setLoading] = React.useState(true)
  const [allJobs, setAllJobs] = React.useState<JobMatchResult[]>([])
  const [filteredJobs, setFilteredJobs] = React.useState<JobMatchResult[]>([])

  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 200)
    return () => clearTimeout(handler)
  }, [searchTerm])
  const [filters, setFilters] = React.useState({
    category: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
    skills: [] as string[]
  })
  const [sortBy, setSortBy] = React.useState("Best Match")
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  // Predefined filter options
  const filterOptions = {
    location: ["Bangalore", "Pune", "Hyderabad", "Chennai", "Gurgaon", "Mumbai", "Delhi", "Remote"],
    type: ["Full-time", "Part-time", "Internship", "Contract"],
    experience: ["Fresher", "0–2 Years", "2–5 Years", "5+ Years"],
    salary: ["₹3–6 LPA", "₹6–10 LPA", "₹8–12 LPA", "₹10–15 LPA", "₹15+ LPA"],
    skills: ["React", "Java", "Python", "Node.js", "MongoDB", "AWS", "Docker", "Kubernetes", "SQL", "TypeScript", "Tailwind CSS"]
  }

  // Explicit Categories from User Request
  const categories = [
    "Artificial Intelligence & Machine Learning",
    "Cybersecurity",
    "Software Development",
    "Data Science & Analytics",
    "Cloud Computing & DevOps",
    "Networking & IT Infrastructure",
    "Mobile App Development",
    "Software Testing & Quality Assurance",
    "Blockchain & Web3",
    "IoT & Embedded Systems",
    "Robotics & Automation",
    "UI/UX & Product Design",
    "Game Development",
    "Mechanical Engineering",
    "Electrical & Electronics Engineering",
    "Civil Engineering & Construction",
    "Automotive",
    "Biotechnology & Life Sciences",
    "Science & Research",
    "Business & Management",
    "Supply Chain & Procurement",
    "Marketing & Digital Marketing",
    "Sales & Business Development",
    "Media & Entertainment",
    "Content & Communications",
    "Creative Design",
    "Education & EdTech",
    "Customer Service & BPO"
  ];

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await jobService.getJobs()
        // Score all jobs against candidate
        const scored = jobs.map(j => jobService.calculateJobMatch(mockResumeAnalysis, j))
        setAllJobs(scored)
        setFilteredJobs(scored.sort((a, b) => b.overallMatch - a.overallMatch))
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Apply filters and sort whenever dependencies change
  React.useEffect(() => {
    let result = [...allJobs]

    // Search (Debounced)
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase()
      result = result.filter(r =>
        r.job.title.toLowerCase().includes(q) ||
        r.job.company.toLowerCase().includes(q) ||
        r.job.skills.some(s => s.toLowerCase().includes(q))
      )
    }

    // Filters
    if (filters.category) result = result.filter(r => r.job.category === filters.category)
    if (filters.location) result = result.filter(r => r.job.location.includes(filters.location))
    if (filters.type) result = result.filter(r => r.job.type === filters.type)
    if (filters.experience) result = result.filter(r => r.job.experience === filters.experience)
    if (filters.salary) result = result.filter(r => r.job.salary === filters.salary)
    if (filters.skills.length > 0) {
      result = result.filter(r => filters.skills.every(skill => r.job.skills.includes(skill)))
    }

    // Sort
    if (sortBy === "Best Match") {
      result.sort((a, b) => b.overallMatch - a.overallMatch)
    } else if (sortBy === "Newest") {
      // Mock newest by interpreting "days ago"
      result.sort((a, b) => {
        const getDays = (str: string) => {
          if (str.includes("hour")) return 0
          const match = str.match(/\d+/)
          return match ? parseInt(match[0], 10) * (str.includes("week") ? 7 : 1) : 0
        }
        return getDays(a.job.postedDate) - getDays(b.job.postedDate)
      })
    } else if (sortBy === "Salary: High to Low") {
      result.sort((a, b) => b.job.salary.localeCompare(a.job.salary)) // Mock string sort
    } else if (sortBy === "Salary: Low to High") {
      result.sort((a, b) => a.job.salary.localeCompare(b.job.salary))
    }

    setFilteredJobs(result)
  }, [allJobs, debouncedSearchTerm, filters, sortBy])

  const clearFilters = () => {
    setFilters({ category: "", location: "", type: "", experience: "", salary: "", skills: [] })
    setSearchTerm("")
    setSortBy("Best Match")
  }

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  return (
    <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <motion.div variants={slideUp}>
          <h1 className="text-2xl font-display font-semibold text-brand-navy">Find Your Next Opportunity</h1>
          <p className="text-brand-navy/60">Discover jobs that match your skills, experience, and career goals.</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm p-2 flex items-center relative z-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search job title, company, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-12"
            />
          </div>
          <Button className="shrink-0 rounded-xl hidden sm:flex px-8" onClick={(e) => e.preventDefault()}>Search</Button>
          <Button variant="outline" className="sm:hidden mr-2" onClick={(e) => { e.preventDefault(); setIsMobileFiltersOpen(!isMobileFiltersOpen); }}>
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filters Sidebar */}
          <motion.div variants={slideUp} className={cn("w-full lg:w-72 shrink-0 sticky top-24 h-[calc(100vh-8rem)] flex-col", isMobileFiltersOpen ? "flex" : "hidden lg:flex")}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="font-display font-semibold text-brand-navy flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h2>
              <button onClick={clearFilters} className="text-xs font-medium text-brand-indigo hover:underline">
                Clear Filters
              </button>
            </div>

            {/* Filter Sections */}
            <Card className="flex-1 overflow-hidden flex flex-col min-h-0 mb-4">
              <CardContent className="p-5 space-y-6 flex-1 overflow-y-auto scrollbar-thin">

                {/* Job Profile / Category */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Job Profile</h3>
                  <select
                    value={filters.category}
                    onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="">All Profiles</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Location</h3>
                  <select
                    value={filters.location}
                    onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="">Any Location</option>
                    {filterOptions.location.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                {/* Job Type */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Job Type</h3>
                  <div className="space-y-2">
                    {filterOptions.type.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="jobType"
                          checked={filters.type === type}
                          onChange={() => setFilters(prev => ({ ...prev, type }))}
                          className="w-4 h-4 text-brand-indigo focus:ring-brand-indigo"
                        />
                        <span className="text-sm text-brand-navy/70 group-hover:text-brand-navy transition-colors">{type}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="jobType"
                        checked={filters.type === ""}
                        onChange={() => setFilters(prev => ({ ...prev, type: "" }))}
                        className="w-4 h-4 text-brand-indigo focus:ring-brand-indigo"
                      />
                      <span className="text-sm text-brand-navy/70 group-hover:text-brand-navy transition-colors">Any Type</span>
                    </label>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Experience</h3>
                  <select
                    value={filters.experience}
                    onChange={e => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm text-brand-navy outline-none focus:border-brand-indigo/50"
                  >
                    <option value="">Any Experience</option>
                    {filterOptions.experience.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                  </select>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.skills.map(skill => {
                      const isActive = filters.skills.includes(skill)
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors border",
                            isActive
                              ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/30"
                              : "bg-white text-brand-navy/60 border-brand-gray/50 hover:border-brand-gray"
                          )}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main List */}
          <div className="flex-1 w-full space-y-6">
            <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
              <p className="text-brand-navy/70 font-medium">
                {loading ? "Searching..." : `${filteredJobs.length} jobs found`}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm text-brand-navy/60">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-white border border-brand-gray/50 rounded-lg py-1.5 px-3 text-sm font-medium text-brand-navy outline-none focus:border-brand-indigo/50"
                >
                  <option value="Best Match">Best Match</option>
                  <option value="Newest">Newest</option>
                  <option value="Salary: High to Low">Salary: High to Low</option>
                  <option value="Salary: Low to High">Salary: Low to High</option>
                </select>
              </div>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-white rounded-xl border border-brand-gray/30 animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredJobs.map(({ job, overallMatch }) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    >
                      <JobCard
                        {...job}
                        matchScore={overallMatch}
                        isSaved={savedJobs.includes(job.id)}
                        isApplied={hasApplied(job.id)}
                        onSave={() => toggleSaveJob(job.id)}
                        onClick={() => navigate(`/candidate/jobs/${job.id}`)}
                        onApply={() => navigate(`/candidate/jobs/${job.id}?apply=true`)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-brand-gray/50 p-12 text-center flex flex-col items-center justify-center">
                <Search className="w-12 h-12 text-brand-navy/20 mb-4" />
                <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">No jobs found</h3>
                <p className="text-brand-navy/60 mb-6">Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
