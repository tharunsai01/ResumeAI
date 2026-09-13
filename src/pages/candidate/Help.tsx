import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { 
  FileText, BrainCircuit, Search as SearchIcon, 
  Briefcase, BarChart, User, Settings, Shield,

  ChevronDown, ChevronUp, AlertTriangle, LifeBuoy
} from "lucide-react"

const helpCategories = [
  {
    id: "resume",
    title: "Resume & AI Analysis",
    icon: FileText,
    description: "Learn how HireSmart AI analyzes your resume, skills, experience, and education.",
    faqs: [
      { q: "How do I upload my resume?", a: "Navigate to 'My Resume' from the sidebar and click the upload area or drag and drop your PDF/DOCX file." },
      { q: "Which resume formats are supported?", a: "We currently support PDF and DOCX formats up to 5MB." },
      { q: "How does AI analyze my resume?", a: "Our AI extracts key entities like skills, education, and experience, cross-referencing them with industry standards to build your digital profile." },
      { q: "How is my profile score calculated?", a: "The score is based on the completeness of your profile, the strength of your skills, and the clarity of your experience descriptions." },
      { q: "Why is some information missing from my analysis?", a: "If your resume has complex formatting or images, the AI might miss some details. You can always edit your profile manually." },
      { q: "How can I improve my resume score?", a: "Ensure you use standard fonts, clear section headings, and include measurable achievements in your experience." },
      { q: "How do I replace my existing resume?", a: "Go to the 'My Resume' page and click 'Replace Resume' to upload a new version." }
    ]
  },
  {
    id: "matching",
    title: "AI Job Matching",
    icon: BrainCircuit,
    description: "Understand how HireSmart AI finds and ranks jobs based on your profile.",
    faqs: [
      { q: "How is my match percentage calculated?", a: "The match score compares your extracted skills, experience level, and preferences against the job requirements." },
      { q: "What factors affect my job match?", a: "Primary factors include mandatory skills, years of experience, preferred location, and salary expectations." },
      { q: "Why did I receive a low match score?", a: "A low score usually means missing required technical skills or a mismatch in seniority level." },
      { q: "How does the AI compare my skills with job requirements?", a: "The AI understands skill synonyms and related technologies, ensuring you aren't penalized for using different terminology." },
      { q: "How can I improve my job matches?", a: "Keep your skills updated in your Profile and refine your Job Preferences in Settings." },
      { q: "What does a 90%+ match mean?", a: "A 90%+ match indicates you meet almost all core requirements and are a highly competitive candidate for the role." },
      { q: "Why are some jobs recommended to me?", a: "Recommendations are based on your profile strength, past applications, and career trajectory." }
    ]
  },
  {
    id: "jobs",
    title: "Find Jobs & Recommendations",
    icon: SearchIcon,
    description: "Get help searching, filtering, saving, and discovering relevant opportunities.",
    faqs: [
      { q: "How do I search for jobs?", a: "Use the global search bar in the top navigation or visit the 'Find Jobs' page to browse." },
      { q: "How do I filter jobs?", a: "On the Find Jobs page, use the filter panel to narrow down by location, type, and salary." },
      { q: "How do I save a job?", a: "Click the bookmark icon on any job card to save it for later." },
      { q: "How does Recommended Jobs work?", a: "It curates a daily list of opportunities where your AI Match Score is exceptionally high." },
      { q: "How do I update my job preferences?", a: "Go to Settings > Job Preferences to update your target titles and locations." },
      { q: "Why am I seeing certain job recommendations?", a: "Recommendations rely heavily on the 'Target Roles' specified in your profile." }
    ]
  },
  {
    id: "applications",
    title: "Applications",
    icon: Briefcase,
    description: "Track your applications and understand recruitment progress.",
    faqs: [
      { q: "How do I apply for a job?", a: "Click 'Apply Now' on a job card. Your HireSmart AI profile and resume will be automatically securely submitted." },
      { q: "Where can I see my applications?", a: "The 'Applications' page tracks all your active and past applications." },
      { q: "How do I check application status?", a: "The status badge on the Applications page updates in real-time as recruiters review your profile." },
      { q: "What does Shortlisted mean?", a: "The recruiter has reviewed your profile and moved you to the next stage of consideration." },
      { q: "What does Interview mean?", a: "You have been selected for an interview. The recruiter will reach out with scheduling details." },
      { q: "What does Rejected mean?", a: "The employer has decided to move forward with other candidates." },
      { q: "Can I withdraw an application?", a: "Yes, you can click 'Withdraw' on the application details page to remove yourself from consideration." }
    ]
  },
  {
    id: "skills",
    title: "Skill Analysis",
    icon: BarChart,
    description: "Understand your strengths, skill gaps, and career recommendations.",
    faqs: [
      { q: "How does Skill Analysis work?", a: "We compare your skills against market demand for your target roles to identify strengths and gaps." },
      { q: "What are my strongest skills?", a: "These are skills you possess that are highly demanded in your target industry." },
      { q: "What is a skill gap?", a: "A missing skill that frequently appears in job postings you are targeting." },
      { q: "How are missing skills identified?", a: "By aggregating requirements from thousands of active job postings matching your preferences." },
      { q: "How can I improve my skill score?", a: "Acquire the recommended skills and add them to your profile to increase your marketability." },
      { q: "How does skill analysis affect job matching?", a: "Closing skill gaps directly increases your Match Score for relevant jobs." },
      { q: "How does HireSmart AI recommend career skills?", a: "We prioritize skills that offer the highest return on investment for your specific career path." }
    ]
  },
  {
    id: "profile",
    title: "Profile & Preferences",
    icon: User,
    description: "Manage your professional profile and job preferences.",
    faqs: [
      { q: "How do I edit my profile?", a: "Navigate to the Profile page and click the 'Edit Profile' button." },
      { q: "How do I update my experience?", a: "Click the '+ Add Experience' button in the Experience section of your profile." },
      { q: "How do I update my skills?", a: "You can add new skills or adjust your proficiency levels in the Skills section of your profile." },
      { q: "How do I change preferred locations?", a: "Update your location preferences in the Settings page under Job Preferences." },
      { q: "How do I change job type?", a: "Adjust your preferred employment types (Full-time, Contract, etc.) in your profile settings." },
      { q: "How do I update salary expectations?", a: "Navigate to Settings > Job Preferences to set your desired compensation." },
      { q: "How do profile changes affect job matching?", a: "Updates to your profile instantly recalculate your Match Scores across all jobs." }
    ]
  },
  {
    id: "settings",
    title: "Account & Settings",
    icon: Settings,
    description: "Manage your account, notifications, privacy, and preferences.",
    faqs: [
      { q: "How do I change my password?", a: "Go to Settings > Account and click 'Change Password'." },
      { q: "How do I manage notifications?", a: "Navigate to Settings > Notifications to toggle email and in-app alerts." },
      { q: "How do I manage privacy settings?", a: "Visit Settings > Privacy to control who can see your profile." },
      { q: "How do I change appearance settings?", a: "Go to Settings > Appearance to switch between Light and Dark mode." },
      { q: "How do I clear local demo data?", a: "In Settings > Security, use the 'Clear Local Data' option in the Danger Zone." },
      { q: "How do I manage my account?", a: "All account management options are centralized in the Settings dashboard." }
    ]
  },
  {
    id: "safety",
    title: "Safety & Privacy",
    icon: Shield,
    description: "Learn how to stay safe while applying for jobs and using HireSmart AI.",
    faqs: [
      { q: "How do I identify suspicious job postings?", a: "Look out for requests for money, vague job descriptions, or unusually high salaries for entry-level work." },
      { q: "Will HireSmart AI ask for payment?", a: "HireSmart AI is completely free for candidates. We will never ask you for payment to apply for jobs." },
      { q: "Should I share OTP or passwords with recruiters?", a: "Never. Legitimate employers will never ask for your passwords or OTPs." },
      { q: "How do I report suspicious recruiters?", a: "Use the 'Report a Complaint' page to flag any inappropriate or suspicious behavior." },
      { q: "How is my resume information used?", a: "Your information is used strictly to match you with relevant jobs and is only shared with employers when you apply." },
      { q: "How can I manage my privacy settings?", a: "You can hide your profile from recruiter searches via Settings > Privacy." }
    ]
  }
]

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="border-b border-brand-gray/30 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left py-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/50 rounded-lg px-2 -mx-2 hover:bg-brand-gray/10 transition-colors"
      >
        <span className="font-medium text-brand-navy pr-4 text-sm sm:text-base">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-brand-navy/50 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-brand-navy/50 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-brand-navy/70 text-sm leading-relaxed px-2">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function HelpCenterPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false)

  // Filter logic
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return helpCategories

    const query = searchQuery.toLowerCase()
    return helpCategories.map(category => {
      const categoryMatch = category.title.toLowerCase().includes(query) || category.description.toLowerCase().includes(query)
      const matchingFaqs = category.faqs.filter(faq => 
        faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query)
      )

      if (categoryMatch || matchingFaqs.length > 0) {
        return {
          ...category,
          // If category matches, show all faqs. If not, only show matching faqs.
          faqs: categoryMatch && matchingFaqs.length === 0 ? category.faqs : matchingFaqs
        }
      }
      return null
    }).filter(Boolean) as typeof helpCategories
  }, [searchQuery])

  return (
    <DashboardShell type="candidate">
      <div className="max-w-5xl mx-auto pb-20 space-y-12">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 bg-brand-navy text-white rounded-3xl p-8 sm:p-16 shadow-xl relative overflow-hidden"
        >
          {/* Decorative background circles */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-indigo blur-3xl" />
            <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-brand-violet blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-display font-bold">How can we help you?</h1>
            <p className="text-white/80 mt-4 text-sm sm:text-lg">
              Find answers about resumes, AI analysis, job matching, applications, and your HireSmart AI profile.
            </p>
            
            <div className="mt-8 relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-brand-navy/40" />
              </div>
              <input
                type="text"
                placeholder="Search Help Center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl text-brand-navy bg-white border-2 border-transparent focus:border-brand-indigo focus:outline-none shadow-lg text-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* CATEGORIES & FAQS */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-brand-navy/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-navy">No results found</h3>
              <p className="text-brand-navy/60">Try searching for different keywords.</p>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredCategories.map((category) => (
                <motion.div key={category.id} variants={slideUp} className="flex flex-col h-full">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-4 bg-brand-gray/5 border-b border-brand-gray/30 rounded-t-xl">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 flex items-center justify-center shrink-0">
                          <category.icon className="w-5 h-5 text-brand-indigo" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm">{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                      <div className="space-y-1">
                        {category.faqs.map((faq, idx) => (
                          <FaqItem key={idx} question={faq.q} answer={faq.a} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* QUICK HELP SECTION */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-12 border-t border-brand-gray/30"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-semibold text-brand-navy">Need more help?</h2>
            <p className="text-brand-navy/60 mt-2">If you couldn't find the answer you were looking for, try these options.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <Card className="hover:border-semantic-warning/50 transition-colors group cursor-pointer" onClick={() => navigate("/candidate/complaint")}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-semantic-warning/10 text-semantic-warning mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Report a Complaint</h3>
                  <p className="text-xs text-brand-navy/60 mt-2 h-10">Report a suspicious job, recruiter, application issue, or platform problem.</p>
                </div>
                <Button variant="outline" className="w-full mt-4">Report an Issue</Button>
              </CardContent>
            </Card>

            <Card className="hover:border-semantic-success/50 transition-colors group cursor-pointer" onClick={() => navigate("/candidate/safety")}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-semantic-success/10 text-semantic-success mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Safety Tips</h3>
                  <p className="text-xs text-brand-navy/60 mt-2 h-10">Learn how to protect yourself while applying for jobs.</p>
                </div>
                <Button variant="outline" className="w-full mt-4">View Safety Tips</Button>
              </CardContent>
            </Card>

            <Card className="hover:border-brand-indigo/50 transition-colors group cursor-pointer" onClick={() => setIsSupportModalOpen(true)}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-indigo/10 text-brand-indigo mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">Contact Support</h3>
                  <p className="text-xs text-brand-navy/60 mt-2 h-10">Can't find the answer you're looking for? Reach out to our team.</p>
                </div>
                <Button variant="outline" className="w-full mt-4">Contact Support</Button>
              </CardContent>
            </Card>

          </div>
        </motion.div>

      </div>

      {/* SUPPORT MODAL */}
      <Modal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} title="Contact Support">
        <div className="space-y-4 mt-4">
          <p className="text-sm text-brand-navy/70 mb-4">
            Our support team is available Monday to Friday, 9 AM - 6 PM. We typically respond within 24 hours.
          </p>
          <Input placeholder="Subject" />
          <textarea 
            placeholder="How can we help you?" 
            className="w-full h-32 p-3 text-sm rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 bg-white text-brand-navy resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsSupportModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              alert("Support request sent successfully!")
              setIsSupportModalOpen(false)
            }}>Send Message</Button>
          </div>
        </div>
      </Modal>

    </DashboardShell>
  )
}
