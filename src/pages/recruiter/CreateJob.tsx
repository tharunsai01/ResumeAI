import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, AlertCircle, ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { jobService } from "../../services/jobService"
import { aiScreeningService } from "../../services/aiScreeningService"
import { staggerContainer, slideUp } from "../../lib/animations"

export default function CreateJob() {
  const navigate = useNavigate()
  
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    title: "",
    company: "HireSmart Corp", // Default company for recruiter
    category: "Software Development",
    location: "",
    type: "Full-time",
    experience: "1–3 Years",
    salary: "",
    description: "",
    skills: [] as string[]
  })
  
  const [aiRequirements, setAiRequirements] = React.useState<{
    requiredSkills: string[]
    preferredSkills: string[]
    experienceRequired: string
    keywords: string[]
  } | null>(null)

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description) return
    setIsAnalyzing(true)
    const result = await aiScreeningService.analyzeJob(formData as any)
    setAiRequirements(result)
    
    // Automatically apply extracted requirements to the form data for job matching
    setFormData(prev => ({
      ...prev,
      skills: result.requiredSkills
    }))
    
    setIsAnalyzing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const newJob = await jobService.createJob({
      title: formData.title,
      company: formData.company,
      location: formData.location,
      type: formData.type as any,
      salary: formData.salary || "Not Disclosed",
      experience: formData.experience as any,
      postedDate: "Just now",
      skills: formData.skills,
      category: formData.category,
      description: formData.description,
      requirements: aiRequirements ? [...aiRequirements.requiredSkills, ...aiRequirements.preferredSkills] : [],
      benefits: ["Health Insurance", "Remote Work Options", "Flexible Hours"]
    } as any)
    
    setIsSubmitting(false)
    navigate(`/recruiter/jobs/${newJob.id}`)
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto pb-12">
        <motion.div variants={slideUp} className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => navigate("/recruiter/jobs")}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">Create New Job</h1>
            <p className="text-brand-navy/60">Post a new position and let AI analyze the requirements.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1">Job Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 focus:ring-2 focus:ring-brand-indigo/20 transition-all text-brand-navy"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Department</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy"
                    >
                      <option>Software Development</option>
                      <option>Data Science & Analytics</option>
                      <option>Cloud Computing & DevOps</option>
                      <option>UI/UX & Product Design</option>
                      <option>Sales & Business Development</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Location</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Remote, Bangalore"
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Employment Type</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 text-brand-navy"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Experience Level</label>
                    <select
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 text-brand-navy"
                    >
                      <option>Entry Level</option>
                      <option>1–3 Years</option>
                      <option>3–5 Years</option>
                      <option>5–8 Years</option>
                      <option>8+ Years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={e => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. ₹15–20 LPA"
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1">Job Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Paste the full job description here..."
                    className="w-full h-48 bg-white border border-brand-gray/50 rounded-xl px-4 py-3 outline-none focus:border-brand-indigo/50 transition-all resize-none text-brand-navy"
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleAnalyze} 
                  disabled={!formData.title || !formData.description || isAnalyzing}
                  className="w-full bg-gradient-to-r from-brand-indigo to-brand-blue"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Analyzing with AI...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" /> Analyze Job with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp} className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader className="bg-brand-indigo/5 border-b border-brand-indigo/10 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-brand-indigo">
                  <Sparkles className="w-5 h-5" /> AI Job Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {!aiRequirements ? (
                    <motion.div 
                      key="empty" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="text-center py-8 text-brand-navy/50"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Enter a title and description, then click Analyze to extract structured requirements.</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-brand-navy mb-2">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiRequirements.requiredSkills.map(s => (
                            <span key={s} className="px-2.5 py-1 bg-semantic-success/10 text-semantic-success text-xs font-medium rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-brand-navy mb-2">Preferred Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {aiRequirements.preferredSkills.map(s => (
                            <span key={s} className="px-2.5 py-1 bg-semantic-warning/10 text-semantic-warning text-xs font-medium rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-brand-navy mb-2">Experience</h4>
                        <p className="text-sm text-brand-navy/70">{aiRequirements.experienceRequired}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-brand-navy mb-2">Keywords</h4>
                        <p className="text-xs text-brand-navy/50 italic leading-relaxed">
                          {aiRequirements.keywords.join(", ")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              <div className="p-4 border-t border-brand-gray/30 bg-brand-light/30">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Publishing..." : "Publish Job"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </form>
      </motion.div>
    </DashboardShell>
  )
}
