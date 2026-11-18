import { motion } from "framer-motion"
import { ShieldCheck, Info, FileText, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent } from "../../components/ui/PremiumCard"
import { staggerContainer, slideUp } from "../../lib/animations"

const PRIVACY_SECTIONS = [
  {
    id: "intro",
    title: "1. Introduction",
    content: "HireSmart AI is an AI-based resume screening and job matching system designed to connect candidates with relevant opportunities and help recruiters review applicants."
  },
  {
    id: "collection",
    title: "2. Information We May Collect",
    content: "When implemented, the platform may collect the following information:",
    lists: [
      {
        title: "Recruiter information:",
        items: ["Name", "Email", "Phone number", "Job title", "Company information", "Account preferences"]
      },
      {
        title: "Job information:",
        items: ["Job title", "Description", "Skills", "Experience requirements", "Location", "Work mode"]
      },
      {
        title: "Candidate information:",
        items: ["Name", "Contact information", "Resume", "Skills", "Education", "Experience", "Job preferences", "Application information"]
      }
    ]
  },
  {
    id: "usage",
    title: "3. How Information Is Used",
    content: "Information may be used to:",
    bullets: [
      "manage accounts",
      "create and manage jobs",
      "process applications",
      "analyze resumes",
      "extract skills",
      "calculate job-candidate matches",
      "provide recommendations",
      "manage interviews",
      "provide analytics",
      "improve platform functionality",
      "respond to complaints and support requests"
    ]
  },
  {
    id: "ai-processing",
    title: "4. AI Processing",
    content: "Resume information may be processed by the AI components of the system to identify skills, experience, education, and other job-related information.",
    important: "AI processing should be limited to appropriate recruitment-related purposes."
  },
  {
    id: "access",
    title: "5. Recruiter Access",
    content: "Recruiters should only access candidate information relevant to their recruitment activities."
  },
  {
    id: "security",
    title: "6. Data Security",
    content: "HireSmart AI is designed with data security in mind. Security controls will be implemented as part of the backend and production deployment stages."
  },
  {
    id: "retention",
    title: "7. Data Retention",
    content: "Data retention policies will be defined during the backend implementation and production deployment stages."
  },
  {
    id: "rights",
    title: "8. User Rights",
    content: "Users should have appropriate mechanisms to:",
    bullets: [
      "review information",
      "correct inaccurate information",
      "request deletion where applicable",
      "understand how information is used"
    ]
  },
  {
    id: "third-party",
    title: "9. Third-Party Services",
    content: "If third-party authentication, AI services, cloud storage, or other services are introduced later, their involvement and data handling should be documented."
  },
  {
    id: "updates",
    title: "10. Policy Updates",
    content: "The privacy policy may be updated as the platform develops."
  },
  {
    id: "contact",
    title: "11. Contact",
    content: "For privacy-related concerns, use the platform's support/complaint mechanism."
  }
]

export default function RecruiterPrivacy() {
  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="text-center space-y-3 sm:space-y-4 pt-8 sm:pt-12 pb-4 sm:pb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-brand-indigo/10 text-brand-indigo mb-2">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-navy break-words">Privacy Policy</h1>
          <p className="text-sm sm:text-lg text-brand-navy/60 max-w-2xl mx-auto break-words leading-relaxed">
            How HireSmart AI is designed to handle recruiter and candidate information.
          </p>
        </motion.div>

        {/* DEMO NOTICE */}
        <motion.div variants={slideUp}>
          <div className="bg-brand-indigo/5 border-l-4 border-brand-indigo p-4 sm:p-6 rounded-r-xl flex items-start gap-3 sm:gap-4 shadow-sm">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-brand-indigo mb-1 text-sm sm:text-base break-words">Project Privacy Notice</h3>
              <p className="text-xs sm:text-sm text-brand-navy/80 font-medium leading-relaxed">
                This document outlines the intended data handling practices of the HireSmart AI platform. Specific security infrastructure, encryption, storage, and legal compliance features are planned for future implementation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <motion.div variants={slideUp}>
          <PremiumCard className="border-brand-gray/30 shadow-sm overflow-hidden">
            <div className="bg-brand-light/30 px-4 sm:px-8 py-4 sm:py-6 border-b border-brand-gray/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-indigo shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-brand-navy break-words">HireSmart AI Privacy Overview</h2>
              </div>
            </div>
            <PremiumCardContent className="p-4 sm:p-8">
              <div className="space-y-8 sm:space-y-12">
                {PRIVACY_SECTIONS.map((section) => (
                  <div key={section.id}>
                    <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-3 sm:mb-4 border-b border-brand-gray/20 pb-2 break-words">
                      {section.title}
                    </h3>
                    
                    <div className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                      <p className="font-medium text-brand-navy/80 break-words">{section.content}</p>

                      {section.bullets && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 sm:gap-y-3 mt-3 sm:mt-4">
                          {section.bullets.map((bullet, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.lists && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                          {section.lists.map((list, lIdx) => (
                            <div key={lIdx} className="bg-brand-light/50 rounded-xl p-4 sm:p-5 border border-brand-gray/20">
                              <h4 className="font-bold text-brand-navy mb-2 sm:mb-3 text-sm sm:text-base break-words">{list.title}</h4>
                              <ul className="space-y-1.5 sm:space-y-2">
                                {list.items.map((item, iIdx) => (
                                  <li key={iIdx} className="flex items-center gap-2 text-xs sm:text-sm text-brand-navy/70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/60 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}

                      {section.important && (
                        <div className="mt-4 sm:mt-6 p-3.5 sm:p-4 bg-semantic-warning/10 border border-semantic-warning/20 rounded-lg text-semantic-warning/90 font-medium italic shadow-sm text-xs sm:text-sm leading-relaxed">
                          <span className="font-bold mr-1">Important:</span> 
                          {section.important}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

      </motion.div>
    </DashboardShell>
  )
}
