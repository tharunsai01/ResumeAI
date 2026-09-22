import { motion } from "framer-motion"
import { Shield, ShieldAlert, CheckCircle2, Lock, FileText, Brain, Users, AlertTriangle } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { staggerContainer, slideUp } from "../../lib/animations"
import SpotlightCard from "../../components/ui/SpotlightCard";

const SECTIONS = [
  {
    icon: Lock,
    title: "Protect Candidate Information",
    description: "Candidate resumes and profiles may contain personal information.",
    bullets: [
      "Access candidate information only for legitimate recruitment purposes.",
      "Avoid downloading or sharing candidate information unnecessarily.",
      "Keep candidate documents secure.",
      "Do not publish sensitive candidate information.",
      "Do not share candidate information with unauthorized people."
    ]
  },
  {
    icon: FileText,
    title: "Verify Job Information",
    description: "Before publishing a job, ensure the details are accurate and clear.",
    bullets: [
      "Ensure the job title is accurate.",
      "Clearly describe responsibilities.",
      "Specify required skills.",
      "Provide realistic experience requirements.",
      "Clearly communicate work mode and location.",
      "Avoid misleading descriptions."
    ]
  },
  {
    icon: Brain,
    title: "Use AI Responsibly",
    description: "HireSmart AI provides AI-assisted screening and matching. Important guidelines:",
    bullets: [
      "AI scores should not be treated as final hiring decisions.",
      "Review the candidate's resume.",
      "Consider relevant qualifications and experience.",
      "Investigate unexpected or inconsistent results.",
      "Do not use the system to discriminate against candidates.",
      "Use job-related criteria when reviewing applicants."
    ]
  },
  {
    icon: Users,
    title: "Verify Candidate Information",
    description: "AI screening helps organize candidate information, but recruiters should verify important information before making hiring decisions.",
    bullets: []
  },
  {
    icon: Shield,
    title: "Protect Your Account",
    description: "Keep your recruiter account safe.",
    bullets: [
      "Use a strong password.",
      "Never share your login credentials.",
      "Sign out from shared devices.",
      "Review account activity.",
      "Report suspicious activity."
    ]
  },
  {
    icon: ShieldAlert,
    title: "Be Careful With Communication",
    description: "Recruiters should avoid requesting unnecessary sensitive information from candidates. Do not request:",
    bullets: [
      "Passwords",
      "OTPs",
      "Banking PINs",
      "Credit/debit card credentials",
      "Unnecessary financial information"
    ],
    note: "Unless there is a legitimate, lawful, and appropriate reason through a proper process."
  },
  {
    icon: AlertTriangle,
    title: "Report Suspicious Activity",
    description: "Use the 'Report a Complaint' form if you identify:",
    bullets: [
      "suspicious job postings",
      "suspicious candidate activity",
      "fraudulent requests",
      "unauthorized account activity",
      "misuse of candidate information",
      "inappropriate use of the platform"
    ]
  }
]

export default function RecruiterSafety() {
  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="text-center space-y-4 pt-12 pb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-indigo/10 text-brand-indigo mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-brand-navy">Safety Tips</h1>
          <p className="text-lg text-brand-navy/60 max-w-2xl mx-auto">
            Guidelines for safer and more responsible recruitment on HireSmart AI.
          </p>
        </motion.div>

        {/* CONTENT */}
        <div className="space-y-6">
          {SECTIONS.map((section, idx) => (
            <motion.div key={idx} variants={slideUp}>
              <Card className="border-brand-gray/30 shadow-sm overflow-hidden">
                <div className="bg-brand-light/30 px-6 py-5 border-b border-brand-gray/20 flex items-start gap-4">
                  <SpotlightCard className="glass-card p-3 shrink-0">
                    <section.icon className="w-6 h-6 text-brand-indigo" />
                  </SpotlightCard>
                  <div className="mt-1">
                    <h2 className="text-xl font-bold text-brand-navy">{section.title}</h2>
                  </div>
                </div>
                <CardContent className="p-6 md:p-8">
                  <p className="text-brand-navy/80 font-medium mb-4">{section.description}</p>
                  
                  {section.bullets.length > 0 && (
                    <ul className="space-y-3">
                      {section.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0 mt-0.5" />
                          <span className="text-sm text-brand-navy/70 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.note && (
                    <div className="mt-6 p-4 bg-semantic-warning/10 border border-semantic-warning/20 rounded-lg text-sm text-semantic-warning font-medium italic">
                      {section.note}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </motion.div>
    </DashboardShell>
  )
}
