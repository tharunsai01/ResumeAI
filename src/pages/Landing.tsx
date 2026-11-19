import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, BrainCircuit, FileText, Briefcase, CheckCircle2,
  Search, BarChart, Shield, Target, Users, Zap, Lock, User,
  Moon, Sun, Menu, X
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { MatchScore } from "../components/shared/MatchScore"
import { RoleSelector } from "../components/auth/RoleSelector"
import { AuthModal } from "../components/auth/AuthModal"
import { useAuth } from "../context/AuthContext"
import { Navigate, Link } from "react-router-dom"
import type { UserRole } from "../services/authService"
import LightRays from "../components/ui/LightRays"
import { PremiumCard, PremiumCardContent, PremiumCardTitle, PremiumCardDescription } from "../components/ui/PremiumCard"
import { settingsService } from "../services/settingsService"
import { useEffect } from "react"

export default function Landing() {
  const { user } = useAuth()

  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [theme, setTheme] = useState(settingsService.getSettings().appearance.theme)

  useEffect(() => {
    // Make sure theme matches settings service
    setTheme(settingsService.getSettings().appearance.theme)
  }, [])

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark')
    const newTheme = isDark ? 'Light' : 'Dark'
    settingsService.updateSettings({
      appearance: {
        ...settingsService.getSettings().appearance,
        theme: newTheme
      }
    })
    setTheme(newTheme)
  }

  // If already logged in, redirect to dashboard
  if (user) {
    const dashboardPath = user.role === "admin" ? "/admin" : `/${user.role}/dashboard`
    return <Navigate to={dashboardPath} replace />
  }

  const handleGetStarted = () => {
    setIsRoleSelectorOpen(true)
  }

  const handleSignIn = () => {
    setAuthMode("login")
    setIsAuthModalOpen(true)
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setIsRoleSelectorOpen(false)
    if (role === "admin") {
      setAuthMode("login")
    } else {
      setAuthMode("register")
    }
    setIsAuthModalOpen(true)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans">

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md border-b border-brand-gray/30 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20 items-center">
            <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-brand-indigo flex items-center justify-center shadow-lg shadow-brand-indigo/20 shrink-0">
                <span className="text-white font-display font-bold text-lg sm:text-xl">H</span>
              </div>
              <span className="text-lg sm:text-2xl font-display font-semibold text-brand-navy dark:text-white truncate">
                HireSmart <span className="text-brand-indigo">AI</span>
              </span>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-brand-navy/70 dark:text-white/70">
              <button onClick={() => scrollToSection('features')} className="hover:text-brand-indigo transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-brand-indigo transition-colors">How It Works</button>
              <button onClick={() => scrollToSection('candidates')} className="hover:text-brand-indigo transition-colors">For Candidates</button>
              <button onClick={() => scrollToSection('recruiters')} className="hover:text-brand-indigo transition-colors">For Recruiters</button>
            </nav>

            <div className="flex items-center space-x-1.5 sm:space-x-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg text-brand-navy/60 dark:text-white/60 hover:text-brand-indigo dark:hover:text-brand-indigo transition-colors shrink-0"
                title="Toggle Theme"
              >
                {theme === "Dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={handleSignIn} className="text-sm font-semibold text-brand-navy dark:text-white/80 hover:text-brand-indigo transition-colors px-4 py-2 hidden sm:block">
                Sign In
              </button>
              <Button onClick={handleGetStarted} className="px-4 sm:px-6 py-2 sm:py-2.5 h-auto text-xs sm:text-sm">Get Started</Button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-lg text-brand-navy/60 dark:text-white/60 hover:text-brand-indigo dark:hover:text-brand-indigo lg:hidden transition-colors shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 dark:bg-brand-navy/95 border-b border-brand-gray/30 dark:border-white/10 px-4 py-4 space-y-3 backdrop-blur-md shadow-lg overflow-hidden"
            >
              <nav className="flex flex-col space-y-2 text-sm font-semibold text-brand-navy/80 dark:text-white/80">
                <button
                  onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-brand-light dark:hover:bg-white/5 transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => { scrollToSection('how-it-works'); setIsMobileMenuOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-brand-light dark:hover:bg-white/5 transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => { scrollToSection('candidates'); setIsMobileMenuOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-brand-light dark:hover:bg-white/5 transition-colors"
                >
                  For Candidates
                </button>
                <button
                  onClick={() => { scrollToSection('recruiters'); setIsMobileMenuOpen(false); }}
                  className="text-left px-3 py-2.5 rounded-lg hover:bg-brand-light dark:hover:bg-white/5 transition-colors"
                >
                  For Recruiters
                </button>
                <div className="pt-3 border-t border-brand-gray/20 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Button
                    onClick={() => { handleGetStarted(); setIsMobileMenuOpen(false); }}
                    className="w-full text-center justify-center py-2.5 text-sm"
                  >
                    Get Started
                  </Button>
                  <button
                    onClick={() => { handleSignIn(); setIsMobileMenuOpen(false); }}
                    className="text-center px-3 py-2.5 text-brand-indigo dark:text-brand-blue font-semibold hover:underline text-sm"
                  >
                    Sign In to Existing Account
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-16 sm:pt-20">
        {/* A. Hero Section */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-white dark:bg-brand-navy">
          <LightRays
            raysOrigin="top-center"
            raysColor="#8B5CF6"
            raysSpeed={1.5}
            lightSpread={1.2}
            rayLength={3}
            followMouse={true}
            mouseInfluence={0.15}
            noiseAmount={0.02}
            distortion={0}
            className="opacity-40"
            pulsating={true}
            fadeDistance={1}
            saturation={1}
          />
          <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-indigo/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-violet/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <div className="inline-flex items-center rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-brand-indigo bg-brand-indigo/10 mb-6 sm:mb-8 border border-brand-indigo/20 max-w-full">
                  <SparkleIcon className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">AI-Powered Recruitment Platform</span>
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight font-display font-extrabold text-brand-navy dark:text-white leading-[1.15] sm:leading-[1.1] break-words">
                  Smarter Hiring.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">Brighter Careers.</span>
                </h1>
                <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-brand-navy/70 dark:text-white/70 leading-relaxed max-w-lg break-words">
                  AI-powered resume screening and intelligent job matching that connects the right talent with the right opportunity.
                </p>
                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button onClick={handleGetStarted} size="lg" className="w-full sm:w-auto px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base group justify-center">
                    Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button onClick={() => scrollToSection('features')} variant="secondary" size="lg" className="w-full sm:w-auto px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base justify-center">
                    Explore Platform
                  </Button>
                </div>
              </motion.div>

              <div className="mt-16 lg:mt-0 relative h-[500px] hidden md:block">
                {/* Visual Representation of Workflow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <svg className="absolute inset-0 w-full h-full text-brand-indigo/20" viewBox="0 0 500 500" fill="none">
                    <path d="M 100 150 C 250 150, 250 250, 400 250" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" className="animate-[dash_4s_linear_infinite]" />
                    <path d="M 100 350 C 250 350, 250 250, 400 250" stroke="currentColor" strokeWidth="2" strokeDasharray="6,6" className="animate-[dash_4s_linear_infinite]" />
                  </svg>

                  {/* Resume Node */}
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 4 }} className="glass-card absolute left-10 top-24 p-5 w-48 z-10">
                    <FileText className="w-8 h-8 text-brand-blue mb-3" />
                    <div className="h-2 w-24 bg-brand-gray rounded mb-2"></div>
                    <div className="h-2 w-16 bg-brand-gray rounded"></div>
                  </motion.div>

                  {/* Job Node */}
                  <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 5 }} className="glass-card absolute left-10 bottom-24 p-5 w-48 z-10">
                    <Briefcase className="w-8 h-8 text-brand-violet mb-3" />
                    <div className="h-2 w-24 bg-brand-gray rounded mb-2"></div>
                    <div className="h-2 w-16 bg-brand-gray rounded"></div>
                  </motion.div>

                  {/* AI Brain */}
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="h-24 w-24 bg-gradient-to-tr from-brand-indigo to-brand-violet rounded-3xl shadow-2xl shadow-brand-indigo/30 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <BrainCircuit className="w-12 h-12 text-white relative z-10" />
                    </div>
                  </motion.div>

                  {/* Match Node */}
                  <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 4.5 }} className="glass-card absolute right-10 top-1/2 -translate-y-1/2 p-6 w-56 z-10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-brand-navy dark:text-white">Best Match</h3>
                      <MatchScore score={94} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-brand-indigo/10 text-brand-indigo text-xs font-semibold rounded-md">React</span>
                      <span className="px-2 py-1 bg-brand-indigo/10 text-brand-indigo text-xs font-semibold rounded-md">TypeScript</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* B. Platform Features */}
        <section id="features" className="py-16 sm:py-20 lg:py-24 bg-brand-light dark:bg-brand-navy/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-brand-navy dark:text-white break-words">Intelligent Recruitment Tools</h2>
              <p className="mt-3 sm:mt-4 text-brand-navy/60 dark:text-white/60 text-base sm:text-lg break-words">Everything you need to hire or get hired, powered by advanced AI algorithms.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <FeatureCard icon={BrainCircuit} title="AI Resume Analysis" desc="Instantly extract skills, experience, and qualifications from any resume format." />
              <FeatureCard icon={Target} title="Intelligent Job Matching" desc="Sophisticated matching algorithms pair candidates with their ideal roles." />
              <FeatureCard icon={Search} title="AI Candidate Screening" desc="Automatically rank applications based on precise job requirements." />
              <FeatureCard icon={BarChart} title="Skill Gap Analysis" desc="Identify missing skills and get personalized recommendations for improvement." />
              <FeatureCard icon={Users} title="Candidate Ranking" desc="See the strongest candidates first with objective AI match scores." />
              <FeatureCard icon={FileText} title="Application Tracking" desc="Seamlessly manage the entire recruitment pipeline from application to hire." />
              <FeatureCard icon={BarChart} title="Recruitment Analytics" desc="Gain insights into hiring velocity, pipeline health, and conversion rates." />
              <FeatureCard icon={CheckCircle2} title="Interview Management" desc="Schedule, conduct, and track interviews directly within the platform." />
            </div>
          </div>
        </section>

        {/* C. How It Works */}
        <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-brand-navy">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-brand-navy dark:text-white break-words">How HireSmart AI Works</h2>
              <p className="mt-3 sm:mt-4 text-brand-navy/60 dark:text-white/60 text-base sm:text-lg break-words">A unified platform engineered for a seamless hiring experience.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
              {/* Candidate Flow */}
              <PremiumCard>
                <PremiumCardContent className="p-4 sm:p-8 lg:p-12 h-full">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue" />
                    </div>
                    <h3 className="premium-card-text text-xl sm:text-2xl font-display font-bold text-brand-navy dark:text-white transition-colors break-words">Candidate Flow</h3>
                  </div>
                  <div className="space-y-6">
                    <WorkflowStep number="01" title="Upload Resume" desc="Drop your CV and let AI instantly parse your experience." />
                    <WorkflowStep number="02" title="Skill Extraction" desc="AI identifies your core competencies and strengths." />
                    <WorkflowStep number="03" title="Job Matching" desc="Get instantly matched with open roles requiring your skills." />
                    <WorkflowStep number="04" title="Apply & Track" desc="Submit applications and monitor your progress in real-time." />
                    <WorkflowStep number="05" title="Interview & Hire" desc="Connect with recruiters and land your perfect job." isLast />
                  </div>
                </PremiumCardContent>
              </PremiumCard>

              {/* Recruiter Flow */}
              <PremiumCard>
                <PremiumCardContent className="p-4 sm:p-8 lg:p-12 h-full">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-indigo/10 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
                    </div>
                    <h3 className="premium-card-text text-xl sm:text-2xl font-display font-bold text-brand-navy dark:text-white transition-colors break-words">Recruiter Flow</h3>
                  </div>
                  <div className="space-y-6">
                    <WorkflowStep number="01" title="Create Job" desc="Post an opportunity and let AI determine the required skills." />
                    <WorkflowStep number="02" title="Receive Applications" desc="Candidates apply directly through the HireSmart platform." />
                    <WorkflowStep number="03" title="AI Screening" desc="AI evaluates and ranks every candidate against your job description." />
                    <WorkflowStep number="04" title="Shortlist Candidates" desc="Review the top matches and move them through your pipeline." />
                    <WorkflowStep number="05" title="Interview & Hire" desc="Schedule meetings and make data-driven hiring decisions." isLast />
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </div>
          </div>
        </section>

        {/* D. Candidate Section */}
        <section id="candidates" className="py-16 sm:py-20 lg:py-24 bg-brand-navy text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-indigo via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4 sm:mb-6 break-words">Take Control of Your Career Trajectory</h2>
                <ul className="space-y-4 mb-8 sm:mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm sm:text-base">Upload your resume and instantly understand how ATS systems view your profile.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm sm:text-base">Discover jobs that genuinely match your skills, not just keyword searches.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm sm:text-base">Identify critical skill gaps and get actionable recommendations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-blue shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm sm:text-base">Track all your applications in one centralized, beautiful dashboard.</span>
                  </li>
                </ul>
                <Button onClick={() => { setSelectedRole("candidate"); setIsRoleSelectorOpen(false); setIsAuthModalOpen(true); setAuthMode("register"); }} variant="default" className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white py-3 px-6 justify-center">
                  Explore Candidate Experience
                </Button>
              </div>
              <div className="mt-10 lg:mt-0 relative">
                <PremiumCard>
                  <PremiumCardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-brand-blue rounded-full flex items-center justify-center font-bold text-lg sm:text-xl text-white shrink-0">
                        JD
                      </div>
                      <div className="min-w-0">
                        <h4 className="premium-card-text font-bold text-base sm:text-lg text-slate-800 dark:text-white transition-colors truncate">John Doe</h4>
                        <p className="premium-card-text text-slate-500 dark:text-white/60 text-xs sm:text-sm transition-colors truncate">Senior Frontend Engineer</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-3.5 sm:p-4">
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span className="premium-card-text text-slate-700 dark:text-white/80 transition-colors">React Expertise</span>
                          <span className="font-bold text-brand-blue">98%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full"><div className="h-full w-[98%] bg-brand-blue rounded-full"></div></div>
                      </div>
                      <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-3.5 sm:p-4">
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span className="premium-card-text text-slate-700 dark:text-white/80 transition-colors">System Architecture</span>
                          <span className="font-bold text-brand-blue">85%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full"><div className="h-full w-[85%] bg-brand-blue rounded-full"></div></div>
                      </div>
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </div>
            </div>
          </div>
        </section>

        {/* E. Recruiter Section */}
        <section id="recruiters" className="py-16 sm:py-20 lg:py-24 bg-brand-light dark:bg-brand-navy/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="relative w-full order-2 lg:order-1">
                <PremiumCard>
                  <PremiumCardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-brand-gray/30 pb-4">
                      <h4 className="premium-card-text font-bold text-slate-800 dark:text-white transition-colors text-sm sm:text-base truncate mr-2">AI Screening Results</h4>
                      <span className="text-xs font-bold text-brand-indigo bg-brand-indigo/10 px-2.5 sm:px-3 py-1 rounded-full shrink-0">Frontend Dev</span>
                    </div>
                    <div className="space-y-3">
                      {[94, 88, 76].map((score, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-brand-light/10 transition-colors border border-transparent hover:border-brand-gray/30">
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 mr-2">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-100 dark:bg-brand-navy/50 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm text-brand-navy dark:text-white shrink-0">
                              C{i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="premium-card-text text-xs sm:text-sm font-bold text-slate-800 dark:text-white transition-colors truncate">Candidate {i + 1}</p>
                              <p className="premium-card-text text-[11px] sm:text-xs text-slate-500 dark:text-brand-navy/50 transition-colors truncate">Applied 2h ago</p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <MatchScore score={score} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </PremiumCardContent>
                </PremiumCard>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-4 sm:mb-6 text-brand-navy dark:text-white break-words">Scale Your Hiring with Precision</h2>
                <ul className="space-y-4 mb-8 sm:mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo shrink-0 mt-0.5" />
                    <span className="text-brand-navy/70 dark:text-white/70 text-sm sm:text-base">Create job postings and let AI automatically extract the true skill requirements.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo shrink-0 mt-0.5" />
                    <span className="text-brand-navy/70 dark:text-white/70 text-sm sm:text-base">Automatically screen hundreds of resumes in seconds without bias.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo shrink-0 mt-0.5" />
                    <span className="text-brand-navy/70 dark:text-white/70 text-sm sm:text-base">Identify the strongest candidates instantly with comprehensive AI match scores.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo shrink-0 mt-0.5" />
                    <span className="text-brand-navy/70 dark:text-white/70 text-sm sm:text-base">Manage your entire hiring pipeline, from shortlisting to final interviews.</span>
                  </li>
                </ul>
                <Button onClick={() => { setSelectedRole("recruiter"); setIsRoleSelectorOpen(false); setIsAuthModalOpen(true); setAuthMode("register"); }} className="w-full sm:w-auto py-3 px-6 justify-center">
                  Explore Recruiter Experience
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* F. AI Matching Demonstration */}
        <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-brand-navy border-y border-brand-gray/30 dark:border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy dark:text-white break-words">Transparent AI Matching</h2>
              <p className="mt-3 sm:mt-4 text-brand-navy/60 dark:text-white/60 text-base sm:text-lg break-words">AI provides powerful decision support, but humans retain final hiring control.</p>
            </div>

            <div className="bg-brand-light dark:bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-brand-gray/50 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 rounded-bl-full -z-10"></div>

              <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h3 className="font-semibold text-brand-navy dark:text-white uppercase tracking-wider text-xs sm:text-sm mb-4 sm:mb-6">The Analysis</h3>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white dark:bg-brand-navy p-4 rounded-xl border border-brand-gray/30 dark:border-white/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-brand-navy dark:text-white text-sm sm:text-base">Candidate</span>
                        <span className="text-xs sm:text-sm text-brand-navy/60 dark:text-white/60">Software Engineer</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
                    </div>
                    <div className="bg-white dark:bg-brand-navy p-4 rounded-xl border border-brand-gray/30 dark:border-white/10">
                      <div className="mb-2 text-xs sm:text-sm font-medium text-brand-navy dark:text-white">Required Job Skills</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-brand-gray/20 dark:bg-white/10 text-brand-navy dark:text-white text-xs rounded">React</span>
                        <span className="px-2 py-1 bg-brand-gray/20 dark:bg-white/10 text-brand-navy dark:text-white text-xs rounded">Node.js</span>
                        <span className="px-2 py-1 bg-brand-gray/20 dark:bg-white/10 text-brand-navy dark:text-white text-xs rounded">MongoDB</span>
                        <span className="px-2 py-1 bg-brand-gray/20 dark:bg-white/10 text-brand-navy dark:text-white text-xs rounded">TypeScript</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-8 flex flex-col items-center justify-center text-center w-full">
                  <h3 className="font-bold text-brand-navy dark:text-white mb-6 sm:mb-8 text-base sm:text-lg">AI Match Breakdown</h3>

                  <div className="w-full space-y-4 mb-6 sm:mb-8">
                    <MatchBar label="Skills Match" score={94} />
                    <MatchBar label="Experience Match" score={89} />
                    <MatchBar label="Education Match" score={92} />
                    <MatchBar label="Role Similarity" score={95} />
                  </div>

                  <div className="pt-5 sm:pt-6 border-t border-brand-gray/30 dark:border-white/10 w-full flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-semibold text-brand-navy/60 dark:text-white/60 uppercase tracking-wider mb-2">Overall Match</span>
                    <MatchScore score={92} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* G. Trust / Safety section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-brand-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-brand-blue mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-8 sm:mb-12 break-words">Built on Trust and Responsibility</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <Lock className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Candidate data is strictly private. Resumes and personal information are handled securely and only shared with explicitly applied jobs.
                </p>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <BrainCircuit className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Responsible AI</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Our AI models are designed for transparent matching. We provide the "why" behind every match score to prevent hidden algorithmic bias.
                </p>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <Users className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Human Final Say</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  AI performs the heavy lifting of screening and matching, but no automatic hiring decisions are made. Recruiters retain total control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* H. Final CTA */}
        <section className="py-20 sm:py-28 lg:py-32 bg-white dark:bg-brand-navy text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-brand-navy dark:text-white mb-4 sm:mb-6 break-words">Find Better Matches.<br />Hire Smarter.</h2>
            <p className="text-base sm:text-lg md:text-xl text-brand-navy/60 dark:text-white/60 mb-8 sm:mb-10 max-w-xl mx-auto break-words">Join thousands of candidates and forward-thinking recruiters transforming the future of work.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Button onClick={handleGetStarted} size="lg" className="btn-gradient-fill w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg justify-center">Get Started</Button>
              <Button onClick={handleSignIn} variant="secondary" size="lg" className="btn-gradient-fill-secondary w-full sm:w-auto px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg justify-center">Sign In</Button>
            </div>
          </div>
        </section>
      </main>

      {/* I. Footer */}
      <footer className="bg-brand-navy pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 border-t border-white/10 text-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-10 sm:mb-16">
            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="h-8 w-8 rounded-lg bg-brand-indigo flex items-center justify-center">
                  <span className="text-white font-display font-bold">H</span>
                </div>
                <span className="text-xl font-display font-semibold text-white">
                  HireSmart <span className="text-brand-indigo">AI</span>
                </span>
              </div>
              <p className="text-sm text-white/50 mb-6 max-w-sm">
                The next generation of recruitment, powered by artificial intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('candidates')} className="hover:text-white transition-colors">For Candidates</button></li>
                <li><button onClick={() => scrollToSection('recruiters')} className="hover:text-white transition-colors">For Recruiters</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/complaint" className="hover:text-white transition-colors">Report a Complaint</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <li><Link to="/safety" className="hover:text-white transition-colors">Safety Tips</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About HireSmart AI</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">© {new Date().getFullYear()} HireSmart AI. All rights reserved.</p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>

      <RoleSelector
        isOpen={isRoleSelectorOpen}
        onClose={() => setIsRoleSelectorOpen(false)}
        onSelectRole={handleRoleSelect}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={selectedRole}
      />
    </div>
  )
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <PremiumCard className="w-full">
      <PremiumCardContent className="p-5 sm:p-6 h-full flex flex-col justify-between">
        <div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-indigo/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-indigo" />
          </div>
          <PremiumCardTitle className="text-base sm:text-lg mb-2 break-words">{title}</PremiumCardTitle>
          <PremiumCardDescription className="text-xs sm:text-sm leading-relaxed break-words">{desc}</PremiumCardDescription>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  )
}

function WorkflowStep({ number, title, desc, isLast = false }: { number: string, title: string, desc: string, isLast?: boolean }) {
  return (
    <div className="flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-brand-navy border border-brand-gray dark:border-white/20 flex items-center justify-center text-xs font-bold text-brand-navy dark:text-white shrink-0 shadow-sm">
          {number}
        </div>
        {!isLast && <div className="w-px h-full bg-brand-gray/50 dark:bg-white/10 my-2"></div>}
      </div>
      <div className="pb-5 sm:pb-6 min-w-0">
        <h4 className="font-bold text-brand-navy dark:text-white text-base sm:text-lg break-words">{title}</h4>
        <p className="text-brand-navy/60 dark:text-white/60 text-xs sm:text-sm mt-1 leading-relaxed break-words">{desc}</p>
      </div>
    </div>
  )
}

function MatchBar({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-brand-navy/70 dark:text-white/70 font-medium">{label}</span>
        <span className="font-bold text-brand-navy dark:text-white">{score}%</span>
      </div>
      <div className="h-2 w-full bg-brand-gray/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-brand-indigo rounded-full"
        />
      </div>
    </div>
  )
}
