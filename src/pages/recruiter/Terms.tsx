import { motion } from "framer-motion"
import { Scale, AlertTriangle, FileText, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent } from "../../components/ui/PremiumCard"
import { staggerContainer, slideUp } from "../../lib/animations"

const TERMS_SECTIONS = [
  {
    id: 1,
    title: "Acceptance of Terms",
    content: "By using HireSmart AI, recruiters agree to use the platform responsibly and in accordance with applicable laws and these terms."
  },
  {
    id: 2,
    title: "Recruiter Accounts",
    content: "Recruiters are responsible for maintaining accurate account information and protecting their account credentials."
  },
  {
    id: 3,
    title: "Company Information",
    content: "Recruiters should provide accurate company information and should only post jobs on behalf of organizations they are authorized to represent."
  },
  {
    id: 4,
    title: "Job Posting Requirements",
    content: "Job postings should:",
    bullets: [
      "contain accurate information",
      "describe genuine opportunities",
      "include relevant requirements",
      "avoid misleading claims",
      "comply with applicable laws"
    ]
  },
  {
    id: 5,
    title: "Candidate Information",
    content: "Candidate information must be used only for legitimate recruitment purposes.\n\nRecruiters should not misuse, redistribute, or unnecessarily expose candidate information."
  },
  {
    id: 6,
    title: "AI-Assisted Screening",
    content: "HireSmart AI may provide automated or AI-assisted resume analysis, skill extraction, matching, ranking, and screening information.",
    important: "AI-generated results are intended to assist recruitment workflows and should not be treated as the sole basis for employment decisions."
  },
  {
    id: 7,
    title: "Recruiter Responsibility",
    content: "Recruiters remain responsible for:",
    bullets: [
      "reviewing candidate information",
      "verifying relevant qualifications",
      "making hiring decisions",
      "complying with employment laws",
      "using fair and job-related evaluation criteria"
    ]
  },
  {
    id: 8,
    title: "Prohibited Activities",
    content: "Do not use the platform for:",
    bullets: [
      "fraudulent job postings",
      "scams",
      "harassment",
      "discrimination",
      "unauthorized data collection",
      "impersonation",
      "malicious activity",
      "misuse of candidate information"
    ]
  },
  {
    id: 9,
    title: "Account Security",
    content: "Recruiters are responsible for protecting their account credentials."
  },
  {
    id: 10,
    title: "Platform Availability",
    content: "The platform may be modified, updated, or temporarily unavailable during maintenance or development."
  },
  {
    id: 11,
    title: "Intellectual Property",
    content: "HireSmart AI's software, interface, branding, and original content are part of the project/platform and should not be reproduced without authorization."
  },
  {
    id: 12,
    title: "Changes to Terms",
    content: "Terms may be updated as the platform evolves."
  },
  {
    id: 13,
    title: "Contact",
    content: "For issues related to the platform, use the 'Report a Complaint' form."
  }
]

export default function RecruiterTerms() {
  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="text-center space-y-4 pt-12 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-indigo/10 text-brand-indigo mb-2">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-brand-navy">Terms & Conditions</h1>
          <p className="text-lg text-brand-navy/60 max-w-2xl mx-auto">
            Terms governing the use of HireSmart AI by recruiters and organizations.
          </p>
        </motion.div>

        {/* DEMO NOTICE */}
        <motion.div variants={slideUp}>
          <div className="bg-semantic-warning/10 border-l-4 border-semantic-warning p-6 rounded-r-xl flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-semantic-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-semantic-warning mb-1">Project Legal Notice</h3>
              <p className="text-sm text-semantic-warning/90 font-medium">
                These terms are provided as part of the HireSmart AI project and should be reviewed by qualified legal professionals before being used as production legal terms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <motion.div variants={slideUp}>
          <PremiumCard className="border-brand-gray/30 shadow-sm overflow-hidden">
            <div className="bg-brand-light/30 px-8 py-6 border-b border-brand-gray/20">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-indigo" />
                <h2 className="text-lg font-bold text-brand-navy">HireSmart AI Terms of Use</h2>
              </div>
            </div>
            <PremiumCardContent className="p-8">
              <div className="space-y-10">
                {TERMS_SECTIONS.map((section) => (
                  <div key={section.id} className="relative pl-10">
                    <div className="absolute left-0 top-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-brand-indigo text-white text-xs font-bold shadow-sm">
                      {section.id}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy mb-3">{section.title}</h3>
                      
                      <div className="text-sm text-brand-navy/70 leading-relaxed whitespace-pre-line space-y-4">
                        <p>{section.content}</p>

                        {section.bullets && (
                          <ul className="space-y-2 mt-3">
                            {section.bullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-brand-indigo shrink-0 mt-0.5" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.important && (
                          <div className="mt-4 p-4 bg-brand-light border border-brand-gray/30 rounded-lg text-brand-navy font-medium italic shadow-sm">
                            <span className="font-bold text-brand-indigo mr-1">Important:</span> 
                            {section.important}
                          </div>
                        )}
                      </div>
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
