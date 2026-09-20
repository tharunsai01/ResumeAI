import * as React from "react"
import { motion } from "framer-motion"
import { Briefcase, Users, Search, CheckCircle2, Calendar, Award, ChevronRight, Sparkles, ArrowRight, Play } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

const StatCard = ({ title, data, icon: Icon, color, delay, loading }: any) => (
  <motion.div variants={slideUp} custom={delay}>
    <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group cursor-default h-full border-brand-gray/40">
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl border", color.bg, color.text, color.border)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-display font-bold text-brand-navy">
              {loading ? <div className="h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : data.value}
            </h3>
          </div>
          {!loading && (
            <p className="text-xs font-medium text-brand-indigo mt-2 bg-brand-indigo/5 inline-block px-2 py-0.5 rounded-md">
              {data.indicator}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)

  // MOCK DATA
  // Structured to be easily replaced by API responses later
  const stats = {
    activeJobs: { value: 8, indicator: "+2 this month" },
    totalCandidates: { value: 245, indicator: "+18 this week" },
    aiScreened: { value: 186, indicator: "76% of applications" },
    shortlisted: { value: 42, indicator: "+8 this week" },
    interviews: { value: 16, indicator: "5 upcoming" },
    hired: { value: 7, indicator: "+2 this month" }
  }

  const pipelineStages = [
    { label: "Applied", value: 245, route: "/recruiter/candidates", icon: Users },
    { label: "Screened", value: 186, route: "/recruiter/screening", icon: Search },
    { label: "Shortlisted", value: 42, route: "/recruiter/shortlist", icon: CheckCircle2 },
    { label: "Interview", value: 16, route: "/recruiter/interviews", icon: Calendar },
    { label: "Hired", value: 7, route: "/recruiter/candidates", icon: Award }
  ]

  const screeningStats = {
    averageMatch: 78,
    strong: 12,
    potential: 26,
    low: 18
  }

  const recentJobs = [
    { id: "job1", title: "Software Engineer", location: "Bangalore", applicants: 24, status: "Active", posted: "2 days ago" },
    { id: "job2", title: "AI Engineer", location: "Hyderabad", applicants: 18, status: "Active", posted: "3 days ago" },
    { id: "job3", title: "Frontend Developer", location: "Remote", applicants: 31, status: "Active", posted: "1 week ago" },
    { id: "job4", title: "Backend Developer", location: "Pune", applicants: 12, status: "Draft", posted: "Just now" }
  ]

  const topMatches = [
    { id: "c1", name: "Rahul Sharma", role: "Software Engineer", match: 96, skills: ["React", "Node.js", "TypeScript"] },
    { id: "c2", name: "Priya Singh", role: "AI Engineer", match: 93, skills: ["Python", "TensorFlow", "NLP"] },
    { id: "c3", name: "Arjun Kumar", role: "Backend Developer", match: 89, skills: ["Go", "PostgreSQL", "Docker"] }
  ]

  const recentApplications = [
    { id: "a1", candidateName: "Rahul Sharma", role: "Software Engineer", match: 92, date: "Today", status: "Shortlisted" },
    { id: "a2", candidateName: "Ananya Patel", role: "AI Engineer", match: 88, date: "Yesterday", status: "Screening" },
    { id: "a3", candidateName: "Arjun Kumar", role: "Backend Developer", match: 81, date: "2 days ago", status: "Applied" },
    { id: "a4", candidateName: "Vikram Reddy", role: "Frontend Developer", match: 74, date: "3 days ago", status: "Applied" }
  ]

  React.useEffect(() => {
    // Simulate initial data loading for micro-interactions
    setLoading(false)
    
  }, [])


  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-8 pb-16">
        
        {/* 1. PAGE HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Good morning, Recruiter</h1>
            <p className="text-brand-navy/60 mt-1">Here's an overview of your recruitment activity.</p>
          </div>
          <Button 
            onClick={() => navigate("/recruiter/jobs/create")} 
            className="shrink-0 px-6 bg-gradient-to-r from-brand-indigo to-brand-blue hover:shadow-lg hover:shadow-brand-indigo/20 transition-all duration-200 group"
          >
            Create New Job <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* 2. STATISTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Active Jobs" data={stats.activeJobs} icon={Briefcase} delay={0} loading={loading} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo", border: "border-brand-indigo/20" }} />
          <StatCard title="Total Candidates" data={stats.totalCandidates} icon={Users} delay={1} loading={loading} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue", border: "border-brand-blue/20" }} />
          <StatCard title="AI Screened" data={stats.aiScreened} icon={Sparkles} delay={2} loading={loading} color={{ bg: "bg-semantic-info/10", text: "text-semantic-info", border: "border-semantic-info/20" }} />
          <StatCard title="Shortlisted" data={stats.shortlisted} icon={CheckCircle2} delay={3} loading={loading} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning", border: "border-semantic-warning/20" }} />
          <StatCard title="Interviews" data={stats.interviews} icon={Calendar} delay={4} loading={loading} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success", border: "border-semantic-success/20" }} />
          <StatCard title="Hired" data={stats.hired} icon={Award} delay={5} loading={loading} color={{ bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3. CANDIDATE PIPELINE */}
          <motion.div variants={slideUp} className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 border-brand-gray/40 overflow-hidden flex flex-col">
              <CardHeader className="bg-brand-light/30 border-b border-brand-gray/30 pb-4">
                <CardTitle className="text-lg">Candidate Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row items-center justify-between w-full relative">
                  {/* Connectors (Desktop only) */}
                  <div className="hidden sm:block absolute top-6 left-0 right-0 h-0.5 bg-brand-gray/30 z-0" />
                  
                  {pipelineStages.map((stage, i) => (
                    <React.Fragment key={stage.label}>
                      <div 
                        onClick={() => navigate(stage.route)}
                        className="group relative z-10 flex flex-col items-center flex-1 cursor-pointer w-full sm:w-auto py-3 sm:py-0 mb-2 sm:mb-0 hover:bg-brand-light/50 sm:hover:bg-transparent rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center shadow-sm mb-3 group-hover:border-brand-indigo group-hover:text-brand-indigo group-hover:shadow-md transition-all duration-200 group-active:scale-95">
                          {loading ? (
                            <div className="w-5 h-5 bg-brand-gray/20 rounded-full animate-pulse" />
                          ) : (
                            <span className="text-lg font-bold text-brand-navy group-hover:text-brand-indigo transition-colors">{stage.value}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-brand-navy/70 group-hover:text-brand-indigo transition-colors flex items-center gap-1.5">
                          <stage.icon className="w-3.5 h-3.5" />
                          {stage.label}
                        </span>
                      </div>
                      
                      {/* Connectors (Mobile only) */}
                      {i < pipelineStages.length - 1 && (
                        <div className="sm:hidden w-0.5 h-6 bg-brand-gray/30 mb-2" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. AI SCREENING OVERVIEW */}
          <motion.div variants={slideUp} className="flex flex-col">
            <Card className="h-full border-brand-indigo/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.1)] flex flex-col">
              <div className="h-1 w-full bg-gradient-to-r from-brand-indigo to-brand-blue" />
              <CardHeader className="pb-3 bg-brand-indigo/[0.02]">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-indigo" /> AI Screening Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-medium text-brand-navy/60">Average Match</span>
                  <span className="text-3xl font-display font-bold text-brand-indigo">{loading ? "-" : `${screeningStats.averageMatch}%`}</span>
                </div>
                
                {/* 5. AI MATCH DISTRIBUTION */}
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5 text-brand-navy">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-semantic-success" /> Strong Match (80-100%)</span>
                      <span>{loading ? "-" : screeningStats.strong}</span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: loading ? 0 : "30%" }} transition={{ duration: 0.5 }}
                        className="h-full bg-semantic-success rounded-full" 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5 text-brand-navy">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-semantic-warning" /> Potential Match (60-79%)</span>
                      <span>{loading ? "-" : screeningStats.potential}</span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: loading ? 0 : "45%" }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="h-full bg-semantic-warning rounded-full" 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5 text-brand-navy">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-semantic-error" /> Low Match (&lt;60%)</span>
                      <span>{loading ? "-" : screeningStats.low}</span>
                    </div>
                    <div className="w-full h-2 bg-brand-gray/30 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: loading ? 0 : "25%" }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full bg-semantic-error rounded-full" 
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/recruiter/screening")} 
                  className="w-full mt-6 bg-brand-indigo hover:bg-brand-indigo/90 text-white"
                >
                  <Play className="w-4 h-4 mr-2" /> Run AI Screening
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 6. RECENT JOBS */}
          <motion.div variants={slideUp}>
            <Card className="h-full border-brand-gray/40">
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-brand-light/30 border-b border-brand-gray/30">
                <CardTitle className="text-lg">Recent Jobs</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/jobs")} className="text-brand-indigo text-xs h-8">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3">Job Title & Location</th>
                        <th className="px-5 py-3 text-center">Applicants</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-gray/30">
                      {loading ? (
                        [1, 2, 3, 4].map(i => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-5 py-4"><div className="h-4 bg-brand-gray/20 rounded w-3/4 mb-1" /><div className="h-3 bg-brand-gray/20 rounded w-1/2" /></td>
                            <td className="px-5 py-4"><div className="h-4 bg-brand-gray/20 rounded w-8 mx-auto" /></td>
                            <td className="px-5 py-4"><div className="h-5 bg-brand-gray/20 rounded-full w-16 mx-auto" /></td>
                            <td className="px-5 py-4"><div className="h-6 bg-brand-gray/20 rounded w-12 ml-auto" /></td>
                          </tr>
                        ))
                      ) : (
                        recentJobs.map(job => (
                          <tr key={job.id} className="hover:bg-brand-light/50 transition-colors group">
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{job.title}</div>
                              <div className="text-xs text-brand-navy/50 mt-0.5 flex items-center gap-2">
                                {job.location} • {job.posted}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className="font-medium text-brand-navy">{job.applicants}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                job.status === "Active" ? "bg-semantic-success/10 text-semantic-success border border-semantic-success/20" : "bg-brand-gray/30 text-brand-navy/60 border border-brand-gray/40"
                              )}>
                                {job.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/recruiter/jobs/${job.id}`)} className="h-7 text-xs font-medium">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 7. TOP AI MATCHES */}
          <motion.div variants={slideUp}>
            <Card className="h-full border-brand-gray/40">
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-brand-light/30 border-b border-brand-gray/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-semantic-warning" /> Top AI Matches
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/screening")} className="text-brand-indigo text-xs h-8">
                  View All <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="flex items-center p-3 gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-brand-gray/20" />
                      <div className="flex-1"><div className="h-4 bg-brand-gray/20 rounded w-1/3 mb-2" /><div className="h-3 bg-brand-gray/20 rounded w-1/2" /></div>
                    </div>
                  ))
                ) : (
                  topMatches.map(match => (
                    <div key={match.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-light/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-bold font-display border border-brand-indigo/20">
                            {match.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-semantic-success text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {match.match}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-brand-navy text-sm">{match.name}</h4>
                          <p className="text-xs text-brand-navy/60">{match.role}</p>
                          <div className="flex gap-1 mt-1">
                            {match.skills.slice(0,2).map(skill => (
                              <span key={skill} className="text-[9px] font-medium px-1.5 py-0.5 bg-brand-gray/20 text-brand-navy/70 rounded">
                                {skill}
                              </span>
                            ))}
                            {match.skills.length > 2 && <span className="text-[9px] font-medium px-1.5 py-0.5 text-brand-navy/40">+{match.skills.length - 2}</span>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/recruiter/candidates/${match.id}`)} className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs text-brand-indigo">
                        View
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 8. RECENT APPLICATIONS */}
        <motion.div variants={slideUp}>
          <Card className="border-brand-gray/40">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-brand-light/30 border-b border-brand-gray/30">
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/candidates")} className="text-brand-indigo text-xs h-8">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3">Candidate</th>
                      <th className="px-6 py-3">Target Role</th>
                      <th className="px-6 py-3 text-center">AI Match</th>
                      <th className="px-6 py-3 text-center">Applied</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray/30">
                    {loading ? (
                       <tr className="animate-pulse">
                         <td className="px-6 py-4"><div className="h-4 bg-brand-gray/20 rounded w-24" /></td>
                         <td className="px-6 py-4"><div className="h-4 bg-brand-gray/20 rounded w-32" /></td>
                         <td className="px-6 py-4"><div className="h-4 bg-brand-gray/20 rounded w-8 mx-auto" /></td>
                         <td className="px-6 py-4"><div className="h-4 bg-brand-gray/20 rounded w-16 mx-auto" /></td>
                         <td className="px-6 py-4"><div className="h-5 bg-brand-gray/20 rounded-full w-20" /></td>
                       </tr>
                    ) : (
                      recentApplications.map(app => (
                        <tr 
                          key={app.id} 
                          onClick={() => navigate(`/recruiter/candidates/${app.id}`)}
                          className="hover:bg-brand-indigo/[0.03] transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4 font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-brand-light border border-brand-gray/50 flex items-center justify-center text-[10px] font-bold text-brand-navy/70">
                              {app.candidateName.charAt(0)}
                            </div>
                            {app.candidateName}
                          </td>
                          <td className="px-6 py-4 text-brand-navy/70">{app.role}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "font-bold",
                              app.match >= 90 ? "text-semantic-success" : 
                              app.match >= 75 ? "text-semantic-warning" : "text-semantic-error"
                            )}>
                              {app.match}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-brand-navy/60 text-xs">{app.date}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              app.status === "Shortlisted" ? "bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20" :
                              app.status === "Applied" ? "bg-brand-gray/30 text-brand-navy/60 border border-brand-gray/40" :
                              "bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20"
                            )}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 9. QUICK ACTIONS */}
        <motion.div variants={slideUp}>
          <h2 className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Button variant="outline" className="h-12 bg-white hover:bg-brand-light/50 border-brand-gray/40 justify-start px-4 text-xs font-semibold" onClick={() => navigate("/recruiter/jobs/create")}>
              <Briefcase className="w-4 h-4 mr-2 text-brand-indigo" /> Create Job
            </Button>
            <Button variant="outline" className="h-12 bg-white hover:bg-brand-light/50 border-brand-gray/40 justify-start px-4 text-xs font-semibold" onClick={() => navigate("/recruiter/candidates")}>
              <Users className="w-4 h-4 mr-2 text-brand-blue" /> View Candidates
            </Button>
            <Button variant="outline" className="h-12 bg-white hover:bg-brand-light/50 border-brand-gray/40 justify-start px-4 text-xs font-semibold" onClick={() => navigate("/recruiter/screening")}>
              <Sparkles className="w-4 h-4 mr-2 text-semantic-warning" /> Run Screening
            </Button>
            <Button variant="outline" className="h-12 bg-white hover:bg-brand-light/50 border-brand-gray/40 justify-start px-4 text-xs font-semibold" onClick={() => navigate("/recruiter/shortlist")}>
              <CheckCircle2 className="w-4 h-4 mr-2 text-semantic-success" /> View Shortlist
            </Button>
            <Button variant="outline" className="h-12 bg-white hover:bg-brand-light/50 border-brand-gray/40 justify-start px-4 text-xs font-semibold" onClick={() => navigate("/recruiter/interviews")}>
              <Calendar className="w-4 h-4 mr-2 text-semantic-info" /> Schedule Interview
            </Button>
          </div>
        </motion.div>
        
      </motion.div>
    </DashboardShell>
  )
}
