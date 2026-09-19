import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, BrainCircuit, ChevronRight, BookOpen, Target, Activity, Filter, Code2, Database, Layout, Server, Cloud, Wrench } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { MatchScore } from "../../components/shared/MatchScore"
import { SkillBadge } from "../../components/shared/SkillBadge"
import { skillService } from "../../services/skillService"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import type { SkillData, CareerPath, SkillTrend, SkillRoleComparison } from "../../data/mockSkills"

export default function CandidateSkills() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<{
    overallScore: number
    categories: any[]
    detectedSkills: SkillData[]
    gaps: SkillData[]
    recommendations: SkillData[]
    careerPaths: CareerPath[]
    trend: SkillTrend[]
    comparisons: SkillRoleComparison[]
    demand: SkillData[]
  } | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")
  const [levelFilter, setLevelFilter] = React.useState<string>("All")
  const [priorityFilter, setPriorityFilter] = React.useState<string>("All")
  
  const [selectedRole, setSelectedRole] = React.useState<string>("Software Engineer")
  const [selectedSkill, setSelectedSkill] = React.useState<SkillData | null>(null)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysis, gaps, recommendations, careerPaths, demand, comparisons] = await Promise.all([
          skillService.analyzeSkills(),
          skillService.calculateSkillGaps(),
          skillService.getSkillRecommendations(),
          skillService.getCareerPaths(),
          skillService.getSkillDemand(),
          skillService.getRoleComparisons()
        ])
        
        setData({
          ...analysis,
          gaps,
          recommendations,
          careerPaths,
          demand,
          comparisons
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <DashboardShell type="candidate" userName="Rahul Kumar">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-indigo/30 border-t-brand-indigo" />
            <p className="text-brand-navy/60 font-medium">Analyzing your skills...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Filtered skills
  const allSkills = [...data.detectedSkills, ...data.gaps.filter(g => !g.isDetected)]
  const filteredSkills = allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter
    const matchesLevel = levelFilter === "All" || s.level === levelFilter
    const matchesPriority = priorityFilter === "All" || s.priority === priorityFilter
    return matchesSearch && matchesCategory && matchesLevel && matchesPriority
  })

  // Group detected skills
  const groupedDetectedSkills = data.detectedSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, SkillData[]>)

  const currentComparison = data.comparisons.find(c => c.role === selectedRole)

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case "Programming": return Code2
      case "Frontend": return Layout
      case "Backend": return Server
      case "Database": return Database
      case "Cloud & DevOps": return Cloud
      case "Tools": return Wrench
      default: return Code2
    }
  }

  return (
    <DashboardShell type="candidate" userName="Rahul Kumar">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto space-y-8 pb-12"
      >
        {/* 1. Page Header */}
        <motion.div variants={slideUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Skill Analysis</h1>
            <p className="text-brand-navy/60 mt-1">Understand your strengths, identify skill gaps, and discover what to learn next.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium bg-white border border-brand-gray/50 px-4 py-2 rounded-lg shadow-sm">
            Profile Strength
            <span className="text-brand-indigo font-bold text-lg">{data.overallScore}%</span>
          </div>
        </motion.div>

        {/* 2. Overall Skill Score (Hero) */}
        <motion.div variants={slideUp}>
          <Card className="bg-gradient-to-br from-brand-navy to-brand-indigo text-white overflow-hidden relative border-none shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="shrink-0 bg-white rounded-full p-2 shadow-xl text-brand-navy">
                <MatchScore score={data.overallScore} size="lg" />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">Your Skill Profile</h2>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4">Strong Technical Profile</Badge>
                <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
                  Your technical profile is strong for software engineering roles, with opportunities to improve cloud, DevOps, and advanced backend skills.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 14. AI Career Insight */}
        <motion.div variants={slideUp}>
          <Card className="border-brand-indigo/30 bg-brand-indigo/5">
            <CardContent className="p-6 flex gap-4">
              <div className="shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-brand-indigo/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-brand-indigo" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-brand-navy">AI Career Insight</h3>
                  <Badge variant="outline" className="text-[10px] py-0 border-brand-indigo/30 text-brand-indigo">Generated from your resume</Badge>
                </div>
                <p className="text-sm text-brand-navy/70 leading-relaxed">
                  Your strongest opportunities currently appear to be Software Engineer, Full Stack Developer, and Backend Developer roles. Your Java, Python, React, and database skills provide a strong foundation. Improving AWS, Docker, Kubernetes, and system design could expand your opportunities into cloud-native and DevOps-oriented roles.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Skill Category Overview */}
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-brand-navy">Category Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.categories.map((cat, i) => {
              const Icon = getCategoryIcon(cat.category)
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand-light rounded-lg">
                          <Icon className="w-5 h-5 text-brand-indigo" />
                        </div>
                        <span className="font-semibold text-brand-navy">{cat.category}</span>
                      </div>
                      <span className="font-bold text-brand-navy">{cat.score}%</span>
                    </div>
                    <div className="w-full bg-brand-gray/50 h-1.5 rounded-full overflow-hidden mb-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cat.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 * i }}
                        className={cn("h-full rounded-full", cat.score >= 80 ? "bg-semantic-success" : cat.score >= 60 ? "bg-semantic-warning" : "bg-semantic-error")}
                      />
                    </div>
                    <p className="text-xs text-brand-navy/60">{cat.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>

        {/* 4. Skills Detected From Resume */}
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-brand-navy">Skills Detected From Your Resume</h2>
          <Card>
            <CardContent className="p-6 divide-y divide-brand-gray/30">
              {Object.entries(groupedDetectedSkills).map(([category, skills]) => (
                <div key={category} className={cn("py-4 first:pt-0 last:pb-0")}>
                  <h3 className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <SkillBadge 
                        key={skill.id} 
                        name={skill.name} 
                        level={skill.level} 
                        onClick={() => setSelectedSkill(skill)}
                        className="cursor-pointer hover:shadow-sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 5. Skill Proficiency & 6. Levels Legend */}
          <motion.div variants={slideUp} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-semibold text-brand-navy">Skill Proficiency</h2>
              <div className="flex items-center gap-3 text-[10px] font-medium text-brand-navy/50 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-gray/80"></span>Beginner</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-semantic-warning"></span>Inter</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue"></span>Adv</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-indigo"></span>Expert</span>
              </div>
            </div>
            <Card className="h-[420px] overflow-hidden">
              <CardContent className="p-6 h-full flex flex-col">
                <p className="text-xs text-brand-navy/50 mb-4 italic">* AI-estimated proficiency based on resume context</p>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 hide-scrollbar">
                  {data.detectedSkills.sort((a,b) => b.currentScore - a.currentScore).slice(0, 10).map((skill, idx) => (
                    <div key={skill.id} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-brand-navy w-24 truncate">{skill.name}</span>
                        <div className="flex-1 mx-4 h-2 bg-brand-gray/50 rounded-full overflow-hidden flex">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.currentScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.05 * idx }}
                            className={cn("h-full", 
                              skill.level === "Expert" ? "bg-brand-indigo" :
                              skill.level === "Advanced" ? "bg-brand-blue" :
                              skill.level === "Intermediate" ? "bg-semantic-warning" : "bg-brand-gray/80"
                            )}
                          />
                        </div>
                        <span className="text-xs font-semibold text-brand-navy/60 w-8 text-right">{skill.currentScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 7. Top Strengths */}
          <motion.div variants={slideUp} className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Your Top Strengths</h2>
            <Card className="h-[420px] overflow-hidden">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="divide-y divide-brand-gray/30 overflow-y-auto hide-scrollbar">
                  {data.detectedSkills.sort((a,b) => b.currentScore - a.currentScore).slice(0, 5).map((skill, idx) => (
                    <div key={skill.id} className="p-5 flex gap-4 hover:bg-brand-light/30 transition-colors">
                      <div className="text-2xl font-display font-bold text-brand-navy/20 w-8 shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-brand-navy">{skill.name}</h4>
                          <Badge variant="success" className="bg-semantic-success/10 text-semantic-success text-[10px] py-0">{skill.currentScore}%</Badge>
                        </div>
                        <p className="text-xs text-brand-navy/60 leading-relaxed">{skill.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 8. Skill Gaps & 9. Gap Priority */}
        <motion.div variants={slideUp} className="space-y-4">
          <div>
            <h2 className="text-xl font-display font-semibold text-brand-navy">Skill Gaps</h2>
            <p className="text-brand-navy/60 text-sm">Skills that could improve your job opportunities.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.gaps.slice(0,4).map((gap) => (
              <Card key={gap.id} className="relative overflow-hidden group cursor-pointer hover:border-brand-indigo/30 transition-colors" onClick={() => setSelectedSkill(gap)}>
                <div className={cn("absolute top-0 left-0 w-1 h-full", 
                  gap.priority === "High" ? "bg-semantic-error" : 
                  gap.priority === "Medium" ? "bg-semantic-warning" : "bg-brand-blue"
                )} />
                <CardContent className="p-5 pl-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-brand-navy">{gap.name}</h3>
                    <Badge variant={gap.priority === "High" ? "warning" : "secondary"} className="text-[10px] uppercase">
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-brand-navy/60">
                      <span>Current:</span>
                      <span className="font-medium text-brand-navy">{gap.currentScore}%</span>
                    </div>
                    <div className="flex justify-between text-brand-navy/60">
                      <span>Target:</span>
                      <span className="font-medium text-brand-navy">{gap.targetScore}%</span>
                    </div>
                    <div className="flex justify-between text-brand-indigo font-medium">
                      <span>Gap:</span>
                      <span>{gap.targetScore - gap.currentScore}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-brand-gray/50 rounded-full flex overflow-hidden">
                    <div className="bg-brand-navy/40 h-full transition-all duration-1000" style={{ width: `${gap.currentScore}%` }} />
                    <div className="bg-brand-indigo h-full transition-all duration-1000" style={{ width: `${gap.targetScore - gap.currentScore}%` }} />
                  </div>
                  <p className="text-xs text-brand-navy/60 mt-4 line-clamp-2">{gap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* 10. AI Learning Recommendations */}
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-brand-navy">What Should You Learn Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recommendations.slice(0, 3).map((rec, i) => (
              <Card key={rec.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-indigo text-white flex items-center justify-center text-xs font-bold shadow-sm">
                        {i + 1}
                      </div>
                      <CardTitle className="text-lg">{rec.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <p className="text-sm text-brand-navy/70 italic mb-4 bg-brand-light/50 p-3 rounded-lg">"{rec.description}"</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-4 h-4 text-brand-navy/40" />
                        <span className="text-brand-navy/60">Difficulty:</span>
                        <span className="font-medium text-brand-navy">{rec.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Activity className="w-4 h-4 text-brand-navy/40" />
                        <span className="text-brand-navy/60">Effort:</span>
                        <span className="font-medium text-brand-navy">{rec.estimatedEffort}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSkill(rec)} className="text-sm font-medium text-brand-indigo flex items-center hover:underline mt-auto group">
                    View learning steps <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* 11. Recommended Career Paths */}
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-brand-navy">Recommended Career Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.careerPaths.slice(0,3).map((path, i) => (
              <Card key={i} className="hover:border-brand-indigo/30 transition-colors shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="font-semibold text-brand-navy text-lg leading-tight">{path.title}</h3>
                    <Badge variant={path.readinessScore >= 80 ? "success" : "secondary"}>
                      {path.readinessScore}% ready
                    </Badge>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-[10px] text-brand-navy/50 uppercase tracking-wider font-semibold block mb-2">Strong Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {path.strongSkills.map(s => <Badge key={s} variant="outline" className="text-[10px] py-0 border-brand-indigo/20 text-brand-indigo bg-brand-indigo/5">{s}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-navy/50 uppercase tracking-wider font-semibold block mb-2">To Improve</span>
                      <div className="flex flex-wrap gap-1.5">
                        {path.missingSkills.map(s => <Badge key={s} variant="secondary" className="text-[10px] py-0 bg-brand-gray/30 text-brand-navy/60">{s}</Badge>)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 12. Job Market Connection */}
          <motion.div variants={slideUp} className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Skills That Employers Want</h2>
            <Card>
              <CardContent className="p-0 divide-y divide-brand-gray/30">
                {data.demand.slice(0, 6).map((skill) => (
                  <div key={skill.id} className="p-4 flex items-center justify-between hover:bg-brand-light/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", skill.isDetected ? "bg-semantic-success" : "bg-brand-gray/50")} />
                      <span className="font-medium text-brand-navy group-hover:text-brand-indigo transition-colors">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-brand-navy/60">In {skill.jobDemand}% of jobs</span>
                      <div className="w-20 h-1.5 bg-brand-gray/50 rounded-full overflow-hidden">
                        <div className="bg-brand-indigo h-full" style={{ width: `${skill.jobDemand}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* 13. Impact on Job Matching & 15. Skill Trend */}
          <motion.div variants={slideUp} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-display font-semibold text-brand-navy">Improve Your Job Matches</h2>
              <Card className="bg-brand-light/50 border-dashed border-brand-gray">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-brand-gray/50">
                    <span className="text-sm font-medium text-brand-navy/70">Current Profile</span>
                    <Badge variant="outline" className="border-brand-indigo text-brand-indigo bg-white">85% avg match</Badge>
                  </div>
                  {data.gaps.slice(0, 3).map(gap => (
                    <div key={gap.id} className="flex justify-between items-center">
                      <span className="text-sm text-brand-navy">After improving <span className="font-semibold">{gap.name}</span></span>
                      <span className="text-sm font-medium text-semantic-success bg-semantic-success/10 px-2 py-0.5 rounded">+{Math.ceil((gap.targetScore - gap.currentScore) / 5)}%</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-brand-navy/40 text-right italic mt-2">* Estimated potential improvement</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display font-semibold text-brand-navy">Skill Development</h2>
              <Card>
                <CardContent className="p-6">
                  {/* Lightweight CSS Chart */}
                  <div className="h-32 flex items-end justify-between gap-2 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between border-l border-b border-brand-gray/50 pointer-events-none">
                      <div className="border-t border-brand-gray/30 w-full" />
                      <div className="border-t border-brand-gray/30 w-full" />
                      <div className="border-t border-brand-gray/30 w-full" />
                      <div className="border-t border-brand-gray/30 w-full" />
                    </div>
                    {/* Bars */}
                    {data.trend.map((point, i) => (
                      <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-crosshair z-10">
                        <div 
                          className="w-full max-w-[40px] bg-brand-indigo/70 rounded-t-sm relative transition-all duration-300 group-hover:bg-brand-indigo"
                          style={{ height: `${point.score}%` }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-[10px] font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                            {point.score}
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-brand-navy/60 mt-3">{point.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* 16. Skill Comparison */}
        <motion.div variants={slideUp} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Your Skills vs Target Role</h2>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 rounded-lg border border-brand-gray bg-white text-sm font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 shadow-sm cursor-pointer"
            >
              {data.comparisons.map(c => <option key={c.role} value={c.role}>{c.role}</option>)}
            </select>
          </div>
          {currentComparison && (
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Your Coverage</span>
                        <span className="text-sm font-bold text-brand-indigo">{currentComparison.userCoverage}%</span>
                      </div>
                      <div className="h-3 w-full bg-brand-gray/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${currentComparison.userCoverage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1 }}
                          className="h-full bg-brand-indigo" 
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Target Coverage</span>
                        <span className="text-sm font-bold text-brand-navy/60">{currentComparison.targetCoverage}%</span>
                      </div>
                      <div className="h-3 w-full bg-brand-gray/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${currentComparison.targetCoverage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-brand-navy/30" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-semantic-warning/10 rounded-xl border border-semantic-warning/20">
                      <span className="font-semibold text-semantic-warning-dark">Skill Gap</span>
                      <span className="text-2xl font-bold text-semantic-warning-dark">{currentComparison.targetCoverage - currentComparison.userCoverage}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy uppercase tracking-wider mb-4">Missing Key Skills for {selectedRole}</h4>
                    <ul className="space-y-3">
                      {currentComparison.missingSkills.map(skill => (
                        <li key={skill} className="flex items-center gap-3 text-sm font-medium text-brand-navy/70 bg-brand-light p-3 rounded-lg border border-brand-gray/50">
                          <div className="w-2 h-2 rounded-full bg-semantic-error" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* 17. Skill Search & 18. Filters */}
        <motion.div variants={slideUp} className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-brand-navy">All Skills Directory</h2>
          <Card className="overflow-hidden">
            <CardHeader className="pb-4 border-b border-brand-gray/30 bg-brand-light/30">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/40" />
                  <Input 
                    placeholder="Search your skills and recommendations..." 
                    className="pl-9 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0">
                  <div className="flex items-center gap-2 px-2 border-r border-brand-gray/50 mr-1">
                    <Filter className="w-4 h-4 text-brand-navy/40" />
                  </div>
                  <select 
                    value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-brand-gray bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-indigo cursor-pointer shadow-sm"
                  >
                    <option value="All">All Categories</option>
                    {data.categories.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
                  </select>
                  <select 
                    value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-brand-gray bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-indigo cursor-pointer shadow-sm"
                  >
                    <option value="All">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <select 
                    value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-brand-gray bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-indigo cursor-pointer shadow-sm"
                  >
                    <option value="All">All Priorities</option>
                    <option value="High">High Priority Gap</option>
                    <option value="Medium">Medium Priority Gap</option>
                    <option value="Low">Low Priority Gap</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[10px] text-brand-navy/50 uppercase tracking-wider bg-brand-light/50 border-b border-brand-gray/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Skill</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Level</th>
                      <th className="px-6 py-4 font-semibold text-center">Score</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gray/20">
                    {filteredSkills.map(skill => (
                      <tr key={skill.id} className="hover:bg-brand-light/30 transition-colors cursor-pointer group" onClick={() => setSelectedSkill(skill)}>
                        <td className="px-6 py-4 font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{skill.name}</td>
                        <td className="px-6 py-4 text-brand-navy/70 text-xs font-medium">{skill.category}</td>
                        <td className="px-6 py-4"><SkillBadge name={skill.level} variant="outline" /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold text-brand-navy">{skill.currentScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {skill.priority === "High" ? <Badge variant="warning" className="text-[10px] shadow-sm">HIGH</Badge> : 
                           skill.priority === "Medium" ? <Badge variant="secondary" className="bg-semantic-warning/20 text-semantic-warning-dark text-[10px] shadow-sm">MED</Badge> :
                           <span className="text-brand-navy/40 text-xs font-medium">Low</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="w-4 h-4 text-brand-navy/40 inline-block group-hover:text-brand-indigo transition-colors group-hover:translate-x-1" />
                        </td>
                      </tr>
                    ))}
                    {filteredSkills.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Search className="w-8 h-8 text-brand-navy/20 mx-auto mb-3" />
                          <p className="text-brand-navy/50 font-medium">No skills found matching your filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      {/* 19. Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <Modal 
            isOpen={!!selectedSkill} 
            onClose={() => setSelectedSkill(null)}
            title={selectedSkill.name}
          >
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/50">
                  <p className="text-[10px] text-brand-navy/50 uppercase tracking-wider font-bold mb-1.5">AI Estimated Level</p>
                  <div className="flex items-center gap-2">
                    <SkillBadge name={selectedSkill.level} variant="default" />
                  </div>
                </div>
                <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/50">
                  <p className="text-[10px] text-brand-navy/50 uppercase tracking-wider font-bold mb-1.5">Current Score</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-display font-bold text-brand-navy">{selectedSkill.currentScore}%</p>
                    {selectedSkill.targetScore > selectedSkill.currentScore && (
                      <Badge variant="outline" className="text-[10px] py-0 border-brand-indigo text-brand-indigo">
                        Target: {selectedSkill.targetScore}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-brand-navy mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4 text-brand-indigo" /> Why It Matters
                </h4>
                <p className="text-sm text-brand-navy/80 leading-relaxed bg-brand-indigo/5 p-4 rounded-xl border border-brand-indigo/10 shadow-inner">
                  {selectedSkill.description}
                </p>
              </div>

              {selectedSkill.targetScore > selectedSkill.currentScore && (
                <div>
                  <h4 className="text-sm font-semibold text-brand-navy mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <BookOpen className="w-4 h-4 text-brand-indigo" /> Recommended Next Steps
                  </h4>
                  <div className="glass-card space-y-3 text-sm text-brand-navy/70 p-5">
                    {selectedSkill.recommendation.split('\n').map((step, i) => (
                      <div key={i} className="flex gap-3">
                        {step.match(/^\d+\./) ? (
                          <span className="font-bold text-brand-indigo shrink-0">{step.split('.')[0]}.</span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo mt-1.5 shrink-0" />
                        )}
                        <span className="leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 mt-4 px-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-navy/60">
                      <Target className="w-3.5 h-3.5" /> Diff: <span className="text-brand-navy">{selectedSkill.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-brand-navy/60">
                      <Activity className="w-3.5 h-3.5" /> Effort: <span className="text-brand-navy">{selectedSkill.estimatedEffort}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
