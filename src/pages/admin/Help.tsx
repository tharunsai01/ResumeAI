import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, ChevronDown, Users, AlertOctagon, Tags, 
  BrainCircuit, Activity, Settings, ArrowRight, 
  HelpCircle, RotateCcw
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

interface HelpArticle {
  q: string
  a: string
}

interface HelpCategory {
  id: string
  title: string
  icon: any
  route: string
  description: string
  articles: HelpArticle[]
}

const ADMIN_HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "users",
    title: "User Management & Governance",
    icon: Users,
    route: "/admin/users",
    description: "Manage candidate and recruiter accounts, inspect profile details, and control access permissions.",
    articles: [
      {
        q: "How do I inspect and manage registered users?",
        a: "Navigate to the Users section from the navigation menu. You can search by name or email, filter by Candidate, Recruiter, or Admin roles, and filter by status (Active, Inactive, Suspended)."
      },
      {
        q: "How do I suspend or deactivate an account?",
        a: "Open the user's details page from the Users table and click the 'Suspend Account' or 'Deactivate' action. You will be prompted to confirm before the account is suspended."
      },
      {
        q: "Can new administrator accounts be self-registered?",
        a: "No. For platform security, administrator accounts cannot be self-registered via public sign-up or Google OAuth. They must be provisioned directly by existing administrators."
      }
    ]
  },
  {
    id: "complaints",
    title: "Complaint Resolution & Disputes",
    icon: AlertOctagon,
    route: "/admin/complaints",
    description: "Review tickets submitted by candidates and recruiters, assign priorities, and submit formal resolutions.",
    articles: [
      {
        q: "How do complaints reach administrators?",
        a: "When candidates or recruiters submit an issue through their respective Help or Complaint forms, a ticket is created in the Complaints management queue with initial status 'Open'."
      },
      {
        q: "How do I update the priority or assign a complaint?",
        a: "Click on any complaint in the queue to view its full details. Use the status and priority controls to update the stage from 'Open' to 'In Progress' or 'Resolved'."
      },
      {
        q: "What is required to resolve a complaint?",
        a: "When marking a ticket as 'Resolved', enter resolution notes summarizing the investigation and remediation steps. The ticket records the administrator's name and timestamp."
      }
    ]
  },
  {
    id: "skills",
    title: "Skill Taxonomy Management",
    icon: Tags,
    route: "/admin/skills",
    description: "Standardize skills, define technical categories, and tune market demand weights used in AI screening.",
    articles: [
      {
        q: "How does the skill taxonomy affect candidate matching?",
        a: "The taxonomy standardizes candidate skill declarations against job requirements. Categories include Programming, Frontend, Backend, Database, Cloud & DevOps, and Tools."
      },
      {
        q: "How do I add or adjust a platform skill?",
        a: "Visit the Skill Taxonomy section, click 'Add Skill', enter the canonical name, select its category, assign an initial demand score, and provide relevant aliases."
      }
    ]
  },
  {
    id: "ai-eval",
    title: "AI Model Evaluation & Fairness",
    icon: BrainCircuit,
    route: "/admin/ai-evaluation",
    description: "Inspect algorithm scoring distributions, verify parity benchmarks, and audit screening decisions.",
    articles: [
      {
        q: "What is the AI screening qualification threshold?",
        a: "The default threshold is 80%. Candidates scoring 80% or above are categorized as AI-qualified for recruiter review. Detailed criteria can be tuned in Recruiter Settings."
      },
      {
        q: "How do administrators audit algorithm bias?",
        a: "Use the AI Evaluation dashboard to inspect demographic parity metrics, score distributions, and false-negative audit logs across job postings."
      }
    ]
  },
  {
    id: "system-health",
    title: "System Health & Audit Logs",
    icon: Activity,
    route: "/admin/system-health",
    description: "Monitor platform services, API quotas, latency benchmarks, and immutable audit logs.",
    articles: [
      {
        q: "Where do I check database and API availability?",
        a: "The System Health dashboard displays real-time uptime metrics, database latency, background worker status, and external AI API quota utilization."
      },
      {
        q: "How are administrative actions audited?",
        a: "All critical actions (role changes, account suspensions, complaint resolutions, setting modifications) are recorded with an immutable audit log timestamp."
      }
    ]
  },
  {
    id: "settings",
    title: "Platform Security & Settings",
    icon: Settings,
    route: "/admin/settings",
    description: "Configure administrator profile, 2FA demo preferences, theme appearance, and session timeouts.",
    articles: [
      {
        q: "How do I change my administrator profile photo?",
        a: "Navigate to Admin Settings > Profile, click 'Change Photo', select an image under 5MB, and save. To revert, click 'Remove' to restore the default initial avatar."
      },
      {
        q: "What does the 2FA switch in Admin Settings do?",
        a: "It controls the frontend demo security preference. In production environments, full 2FA requires backend SMS or TOTP authenticator validation."
      },
      {
        q: "How do I manage active administrator sessions?",
        a: "Under the Sessions tab in Settings, view all active login devices and click 'Sign Out Other Sessions' to terminate non-current device sessions."
      }
    ]
  }
]

export default function AdminHelp() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedArticle, setExpandedArticle] = React.useState<string | null>("users-0")

  const toggleArticle = (key: string) => {
    setExpandedArticle(prev => prev === key ? null : key)
  }

  const filteredCategories = React.useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return ADMIN_HELP_CATEGORIES

    return ADMIN_HELP_CATEGORIES.map(cat => {
      const categoryMatches = cat.title.toLowerCase().includes(term) || cat.description.toLowerCase().includes(term)
      const matchingArticles = cat.articles.filter(a => 
        a.q.toLowerCase().includes(term) || a.a.toLowerCase().includes(term)
      )

      if (categoryMatches || matchingArticles.length > 0) {
        return {
          ...cat,
          articles: categoryMatches ? cat.articles : matchingArticles
        }
      }
      return null
    }).filter(Boolean) as HelpCategory[]
  }, [searchTerm])

  return (
    <AdminShell>
      <AdminPageHeader 
        title="Admin Help Center" 
        description="Comprehensive guides, troubleshooting documentation, and operational resources for platform administrators."
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-8 pb-16">
        
        {/* SEARCH BAR */}
        <motion.div variants={slideUp}>
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-brand-navy/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search admin documentation, user policies, complaint handling, or AI audits..."
              className="pl-12 pr-10 h-12 text-sm bg-white shadow-sm border-brand-gray/40 rounded-xl focus-visible:ring-brand-indigo"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-navy/40 hover:text-brand-navy bg-brand-gray/20 rounded-md px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* QUICK NAVIGATION SHORTCUTS */}
        <motion.div variants={slideUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-brand-navy">Administrator Quick Navigation</h3>
            <span className="text-xs text-brand-navy/50">Direct links to management portals</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ADMIN_HELP_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(cat.route)}
                  className="p-4 rounded-xl bg-white border border-brand-gray/30 hover:border-brand-indigo/40 hover:shadow-md transition-all text-left flex flex-col justify-between group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo group-hover:bg-brand-indigo group-hover:text-white transition-colors mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-navy line-clamp-1">{cat.title.split(" ")[0]} Portal</div>
                    <div className="text-[11px] text-brand-navy/50 flex items-center gap-1 mt-1 group-hover:text-brand-indigo transition-colors font-medium">
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* DOCUMENTATION CATEGORIES & ACCORDIONS */}
        <div className="space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-brand-gray/30">
              <HelpCircle className="w-12 h-12 text-brand-navy/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-brand-navy">No articles match your query</h3>
              <p className="text-xs text-brand-navy/60 mt-1 mb-4">Try searching for broader keywords like "users", "complaints", "2FA", or "skills".</p>
              <Button onClick={() => setSearchTerm("")} variant="outline" size="sm">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Search
              </Button>
            </div>
          ) : (
            filteredCategories.map(category => {
              const Icon = category.icon
              return (
                <motion.div key={category.id} variants={slideUp}>
                  <PremiumCard className="overflow-hidden border border-brand-gray/30 shadow-sm">
                    <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/50 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <PremiumCardTitle className="text-lg">{category.title}</PremiumCardTitle>
                            <p className="text-xs text-brand-navy/60 mt-0.5">{category.description}</p>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(category.route)}
                          className="text-xs shrink-0 self-start sm:self-center border-brand-gray/40 text-brand-navy hover:bg-brand-gray/10"
                        >
                          Launch {category.title.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </PremiumCardHeader>

                    <PremiumCardContent className="p-4 sm:p-6 space-y-3">
                      {category.articles.map((art, idx) => {
                        const key = `${category.id}-${idx}`
                        const isExpanded = expandedArticle === key

                        return (
                          <div 
                            key={key} 
                            className="rounded-xl border border-brand-gray/30 bg-white overflow-hidden transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => toggleArticle(key)}
                              className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
                            >
                              <span className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-brand-indigo/70 shrink-0" />
                                {art.q}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-brand-navy/40 transition-transform shrink-0", isExpanded && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 pt-0 text-xs text-brand-navy/70 leading-relaxed border-t border-brand-gray/10 bg-brand-light/20">
                                    {art.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              )
            })
          )}
        </div>

      </motion.div>
    </AdminShell>
  )
}
