import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Users, Brain, BarChart, Shield, Calendar, User, Briefcase, Target, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

const HELP_CATEGORIES = [
  {
    id: "account",
    title: "Account & Profile",
    icon: User,
    description: "Learn how to manage your recruiter account, profile information, company details, and account preferences.",
    articles: [
      { q: "How do I update my recruiter profile?", a: "Go to Settings and select the Recruiter Profile tab to update your personal information." },
      { q: "How do I update company information?", a: "Navigate to Settings and open the Company Details tab to update your organization's information." },
      { q: "How do I change my account settings?", a: "Account preferences, including theme and notification settings, can be modified in the Settings menu." },
      { q: "How do I manage notification preferences?", a: "Use the Notifications tab in Settings to control which alerts you receive." },
      { q: "How do I secure my recruiter account?", a: "Visit the Security tab in Settings to change your password or enable Two-Factor Authentication (2FA)." }
    ]
  },
  {
    id: "jobs",
    title: "Job Management",
    icon: Briefcase,
    description: "Create, manage, edit, publish, and monitor job opportunities from the Jobs section.",
    articles: [
      { q: "How do I create a job?", a: "Click 'Create Job' from the Jobs dashboard and fill out the required details, including title, description, and requirements." },
      { q: "What information should I include in a job description?", a: "Clearly describe the responsibilities, required skills, experience level, work mode, and location." },
      { q: "How do I edit a job?", a: "Open a job from the Jobs dashboard and click the 'Edit Job' button to modify its details." },
      { q: "How do I close a job?", a: "Open the job details and click 'Close Job'. The job will no longer accept new applications." },
      { q: "How do I view applications for a job?", a: "Click on a specific job card to view its details, or use the 'View Candidates' button to see all applicants for that role." }
    ]
  },
  {
    id: "candidates",
    title: "Candidate Management",
    icon: Users,
    description: "Review applicants, inspect candidate profiles, view resumes, and manage candidates throughout the recruitment process.",
    articles: [
      { q: "How do I view candidates?", a: "Navigate to the Candidates section to see a list of all applicants across your jobs." },
      { q: "How do I view a candidate's resume?", a: "Click on a candidate's name to open their full profile, where you can view their uploaded resume." },
      { q: "How do I compare candidates?", a: "Use the AI Screening tab or candidate filters to rank candidates based on skills, experience, and match scores." },
      { q: "How do I shortlist a candidate?", a: "Review a candidate's profile and click the 'Shortlist' button to move them to the next stage." },
      { q: "How do I reject or move a candidate to another stage?", a: "Use the action buttons on the candidate profile or the Kanban board in the Interviews section." }
    ]
  },
  {
    id: "screening",
    title: "AI Resume Screening",
    icon: Brain,
    description: "HireSmart AI analyzes candidate resumes against the requirements of a job and generates match information to help recruiters review applications more efficiently.",
    workflow: "Job Requirements → Resume Analysis → Skill Extraction → Requirement Matching → Match Score → Candidate Ranking → Recruiter Review",
    note: "The AI-generated match score is intended to support recruiter review. Recruiters should review the candidate's resume, qualifications, experience, and other relevant information before making a hiring decision.",
    articles: []
  },
  {
    id: "match-score",
    title: "AI Match Score",
    icon: Target,
    description: "The match score represents how closely the candidate's available profile and resume information correspond to the requirements of a particular job.",
    articles: [
      { q: "What does the AI match score mean?", a: "A match score indicates alignment between a resume and job requirements. For example, 80% and above indicates an AI Qualified / Strong Match, 60%–79% indicates a Potential Match, and below 60% indicates a Lower Match. Note: This threshold can be configured in Settings. An AI match score is not a guarantee of job performance or hiring success." }
    ]
  },
  {
    id: "shortlisting",
    title: "Shortlisting Candidates",
    icon: CheckCircle2,
    description: "Recruiters can review AI-assisted candidate rankings and manually shortlist candidates for the next recruitment stage.",
    workflow: "1. Open AI Screening\n2. Review candidate match information\n3. Open the candidate profile\n4. Review resume and qualifications\n5. Select Shortlist\n6. Candidate moves to the shortlist pipeline",
    articles: []
  },
  {
    id: "interviews",
    title: "Interviews",
    icon: Calendar,
    description: "Use the Interviews section to manage interview stages, schedules, candidate information, and interview status.",
    articles: [
      { q: "How do I schedule an interview?", a: "Select a shortlisted candidate and click 'Schedule Interview'. Enter the time, date, and interviewer details." },
      { q: "How do I reschedule an interview?", a: "Open the interview details and click 'Edit' to update the schedule." },
      { q: "How do I update interview status?", a: "Use the Hiring Pipeline board to drag candidates to different stages (e.g., Interview Completed, Hired)." },
      { q: "How do I view upcoming interviews?", a: "Check the calendar or list view in the Interviews section for a summary of upcoming meetings." }
    ]
  },
  {
    id: "analytics",
    title: "Recruitment Analytics",
    icon: BarChart,
    description: "Analytics provides an overview of recruitment activity, including applications, screening activity, shortlisted candidates, interviews, and hiring progress.",
    articles: [
      { q: "What metrics are tracked?", a: "The analytics dashboard tracks total Applications, AI Screened candidates, AI Qualified candidates, Shortlisted candidates, Interviews conducted, and Hired candidates." }
    ]
  },
  {
    id: "responsible-ai",
    title: "Using AI Responsibly",
    icon: Shield,
    description: "HireSmart AI is designed to assist recruiters, not replace recruiter judgment.",
    articles: [
      { q: "Best practices for using AI", a: "• Review candidate resumes before making decisions.\n• Treat AI recommendations as decision-support information.\n• Verify important candidate information.\n• Avoid making decisions using inappropriate personal characteristics.\n• Use consistent job requirements.\n• Keep candidate information confidential.\n• Report incorrect or suspicious AI results." }
    ]
  }
]

export default function RecruiterHelp() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [expandedArticles, setExpandedArticles] = React.useState<Record<string, boolean>>({})

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return HELP_CATEGORIES
    const query = searchQuery.toLowerCase()
    
    return HELP_CATEGORIES.map(category => {
      const matchesCategory = category.title.toLowerCase().includes(query) || category.description.toLowerCase().includes(query)
      const matchingArticles = category.articles.filter(a => a.q.toLowerCase().includes(query) || a.a.toLowerCase().includes(query))
      
      if (matchesCategory || matchingArticles.length > 0) {
        return { ...category, articles: matchingArticles.length > 0 ? matchingArticles : category.articles }
      }
      return null
    }).filter(Boolean) as typeof HELP_CATEGORIES
  }, [searchQuery])

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="text-center space-y-4 pt-12 pb-6">
          <h1 className="text-4xl font-display font-bold text-brand-navy">Help Center</h1>
          <p className="text-lg text-brand-navy/60 max-w-2xl mx-auto">
            Find answers and guidance for managing jobs, reviewing candidates, and using HireSmart AI.
          </p>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-brand-navy mb-4">How can we help you?</h2>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-brand-navy/40" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-brand-gray/40 rounded-full h-12 pl-12 pr-4 text-sm focus:border-brand-indigo outline-none shadow-sm transition-all focus:shadow-md"
              />
            </div>
          </div>
        </motion.div>

        {/* CONTENT SECTIONS */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-brand-navy/60 bg-white rounded-2xl border border-brand-gray/20">
              No help topics found matching "{searchQuery}". Try a different term.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <motion.div key={category.id} variants={slideUp}>
                <Card className="overflow-hidden border-brand-gray/30 shadow-sm">
                  <div className="bg-brand-light/30 px-6 py-5 border-b border-brand-gray/20 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                      <category.icon className="w-6 h-6 text-brand-indigo" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-navy">{category.title}</h3>
                      <p className="text-sm text-brand-navy/70 mt-1 leading-relaxed">{category.description}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    {category.workflow && (
                      <div className="px-6 py-5 bg-brand-indigo/5 border-b border-brand-indigo/10">
                        <h4 className="text-xs font-bold text-brand-indigo uppercase tracking-wider mb-2">Workflow</h4>
                        <div className="text-sm text-brand-navy/80 whitespace-pre-line font-medium">
                          {category.workflow.includes("→") ? (
                            <div className="flex flex-wrap items-center gap-2">
                              {category.workflow.split("→").map((step, i, arr) => (
                                <React.Fragment key={i}>
                                  <span className="bg-white px-3 py-1.5 rounded-lg border border-brand-indigo/20 shadow-sm">{step.trim()}</span>
                                  {i < arr.length - 1 && <span className="text-brand-indigo/40">→</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            category.workflow
                          )}
                        </div>
                      </div>
                    )}
                    
                    {category.note && (
                      <div className="px-6 py-4 bg-semantic-warning/5 border-b border-semantic-warning/10 text-sm text-brand-navy/80 italic">
                        {category.note}
                      </div>
                    )}

                    <div className="divide-y divide-brand-gray/10">
                      {category.articles.map((article, aIdx) => {
                        const isExpanded = expandedArticles[`${category.id}-${aIdx}`]
                        return (
                          <div key={aIdx} className="group">
                            <button
                              onClick={() => toggleArticle(`${category.id}-${aIdx}`)}
                              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-brand-gray/5 transition-colors"
                            >
                              <span className="font-medium text-brand-navy group-hover:text-brand-indigo transition-colors">{article.q}</span>
                              <ChevronDown className={cn("w-5 h-5 text-brand-navy/40 transition-transform shrink-0 ml-4", isExpanded && "rotate-180")} />
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                >
                                  <div className="px-6 pb-5 text-sm text-brand-navy/70 leading-relaxed whitespace-pre-line">
                                    {article.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

      </motion.div>
    </DashboardShell>
  )
}
