import * as React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BrainCircuit, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Briefcase, GraduationCap, FolderDot, Code2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { MatchScore } from "../../components/shared/MatchScore"
import { api } from "../../services/api"
import type { ResumeAnalysisResult } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function CandidateResumeAnalysis() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<ResumeAnalysisResult | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Fetch mock data
    const fetchData = async () => {
      try {
        const res = await api.getResumeAnalysis("analysis_mock")
        setData(res)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <DashboardShell type="candidate" userName="Rahul Sharma">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-indigo/30 border-t-brand-indigo" />
            <p className="text-brand-navy/60 font-medium">Loading your analysis...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell type="candidate" userName={data.personalInfo.name}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto space-y-6 pb-12"
      >
        {/* Header Navigation */}
        <motion.div variants={slideUp} className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate("/candidate/resume")}
            className="p-2 rounded-full hover:bg-brand-gray/50 text-brand-navy/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Resume Analysis</h1>
            <p className="text-brand-navy/60">AI-powered insights from your resume.</p>
          </div>
        </motion.div>

        {/* Score & Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Score Card */}
          <motion.div variants={slideUp} className="md:col-span-4">
            <Card className="h-full bg-gradient-to-br from-brand-indigo to-brand-violet text-white border-none shadow-lg shadow-brand-indigo/20">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-white rounded-full p-4 shadow-lg mb-6 text-brand-navy">
                    <MatchScore score={data.score} size="lg" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2">Strong Profile</h2>
                  <p className="text-white/80 text-sm">
                    Your resume demonstrates strong technical skills and relevant experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Breakdown Cards */}
          <motion.div variants={slideUp} className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Skills", score: data.breakdown.skills, icon: Code2, color: "text-brand-blue" },
              { label: "Experience", score: data.breakdown.experience, icon: Briefcase, color: "text-brand-indigo" },
              { label: "Education", score: data.breakdown.education, icon: GraduationCap, color: "text-semantic-success" },
              { label: "Projects", score: data.breakdown.projects, icon: FolderDot, color: "text-semantic-warning" },
            ].map((item) => (
              <Card key={item.label} className="flex flex-col justify-between">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4 text-brand-navy/60">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-display font-bold text-brand-navy">{item.score}%</span>
                  </div>
                  <div className="w-full bg-brand-gray/50 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={cn("h-full rounded-full", 
                        item.score >= 85 ? "bg-semantic-success" : 
                        item.score >= 65 ? "bg-semantic-warning" : "bg-semantic-error"
                      )} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Candidate Summary */}
            <motion.div variants={slideUp}>
              <Card className="border-brand-indigo/30 bg-brand-indigo/5">
                <CardHeader className="pb-3 border-b border-brand-indigo/10 flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-brand-indigo">
                    <BrainCircuit className="w-5 h-5" />
                    AI Candidate Summary
                  </CardTitle>
                  <span className="text-xs font-semibold px-2 py-1 bg-white rounded-md text-brand-indigo/70 border border-brand-indigo/20 shadow-sm">
                    Generated by HireSmart AI
                  </span>
                </CardHeader>
                <CardContent className="pt-4 text-brand-navy/80 leading-relaxed">
                  {data.insights.summary}
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-navy/50" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-brand-gray/80 ml-3 space-y-8">
                    {data.experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-indigo ring-4 ring-white" />
                        <h4 className="text-lg font-semibold text-brand-navy">{exp.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-brand-navy/60 mb-3 mt-1">
                          <span className="font-medium text-brand-indigo">{exp.company}</span>
                          <span>•</span>
                          <span>{exp.duration}</span>
                        </div>
                        <ul className="space-y-2">
                          {exp.description.map((desc, i) => (
                            <li key={i} className="text-sm text-brand-navy/70 flex items-start gap-2">
                              <span className="text-brand-indigo/50 mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" />
                              {desc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Education & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={slideUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-brand-navy/50" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.education.map((edu, idx) => (
                      <div key={idx} className="bg-brand-light p-4 rounded-xl border border-brand-gray/50">
                        <h4 className="font-semibold text-brand-navy">{edu.degree}</h4>
                        <p className="text-sm text-brand-indigo font-medium mt-1">{edu.institution}</p>
                        <p className="text-sm text-brand-navy/60 mt-1">{edu.duration}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={slideUp}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderDot className="w-5 h-5 text-brand-navy/50" />
                      Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.projects.map((proj, idx) => (
                      <div key={idx} className="bg-brand-light p-4 rounded-xl border border-brand-gray/50">
                        <h4 className="font-semibold text-brand-navy">{proj.name}</h4>
                        <p className="text-sm text-brand-navy/70 mt-2 mb-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {proj.techStack.map(tech => (
                            <span key={tech} className="text-[10px] font-semibold bg-white border border-brand-gray/80 text-brand-navy/60 px-2 py-0.5 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Extracted Information */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="text-brand-navy/50 font-medium mb-1">Name</dt>
                      <dd className="font-medium text-brand-navy">{data.personalInfo.name}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-navy/50 font-medium mb-1">Email</dt>
                      <dd className="font-medium text-brand-navy">{data.personalInfo.email}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-navy/50 font-medium mb-1">Experience</dt>
                      <dd className="font-medium text-brand-navy">{data.personalInfo.experience}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-navy/50 font-medium mb-1">Education</dt>
                      <dd className="font-medium text-brand-navy">{data.personalInfo.education}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-navy/50 font-medium mb-1">Location</dt>
                      <dd className="font-medium text-brand-navy">{data.personalInfo.location}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-semantic-warning" />
                    AI Resume Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy uppercase tracking-wider mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {data.insights.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-brand-navy/70">
                          <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy uppercase tracking-wider mb-3">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {data.insights.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-brand-navy/70">
                          <AlertTriangle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Detected / Skill Strength */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Skill Strength</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Group skills for display */}
                  {data.skills.slice(0, 8).map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-brand-navy">{skill.name}</span>
                        <span className="text-xs font-semibold text-brand-navy/50">{skill.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-brand-gray/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.score}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.1 * idx }}
                          className={cn("h-full rounded-full",
                            skill.score >= 85 ? "bg-brand-indigo" :
                            skill.score >= 70 ? "bg-brand-blue" : "bg-semantic-warning"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t border-brand-gray/30">
                    <button 
                      onClick={() => navigate("/candidate/skills")}
                      className="text-sm font-medium text-brand-indigo flex items-center justify-center w-full hover:underline"
                    >
                      View Skill Analysis <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
