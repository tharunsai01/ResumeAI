import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  ArrowRight, BrainCircuit, FileText, Briefcase, CheckCircle2, 
  Search, BarChart, Shield, Target, Users, Zap, Lock, User
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { MatchScore } from "../components/shared/MatchScore"
import { RoleSelector } from "../components/auth/RoleSelector"
import { AuthModal } from "../components/auth/AuthModal"
import { useAuth } from "../context/AuthContext"
import { Navigate, Link } from "react-router-dom"
import type { UserRole } from "../services/authService"

export default function Landing() {
  const { user } = useAuth()
  
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate")

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
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
    setAuthMode("register")
    setIsAuthModalOpen(true)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-brand-light flex flex-col font-sans">
      
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-gray/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="h-10 w-10 rounded-xl bg-brand-indigo flex items-center justify-center shadow-lg shadow-brand-indigo/20">
                <span className="text-white font-display font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-display font-semibold text-brand-navy">
                HireSmart <span className="text-brand-indigo">AI</span>
              </span>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-brand-navy/70">
              <button onClick={() => scrollToSection('features')} className="hover:text-brand-indigo transition-colors">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-brand-indigo transition-colors">How It Works</button>
              <button onClick={() => scrollToSection('candidates')} className="hover:text-brand-indigo transition-colors">For Candidates</button>
              <button onClick={() => scrollToSection('recruiters')} className="hover:text-brand-indigo transition-colors">For Recruiters</button>
            </nav>

            <div className="flex items-center space-x-4">
              <button onClick={handleSignIn} className="text-sm font-semibold text-brand-navy hover:text-brand-indigo transition-colors px-4 py-2 hidden sm:block">
                Sign In
              </button>
              <Button onClick={handleGetStarted} className="px-6 py-2.5 h-auto rounded-xl">Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* A. Hero Section */}
        <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden bg-white">
          <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
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
                <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-brand-indigo bg-brand-indigo/10 mb-8 border border-brand-indigo/20">
                  <SparkleIcon className="w-4 h-4 mr-2" />
                  AI-Powered Recruitment Platform
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight font-display font-extrabold text-brand-navy leading-[1.1]">
                  Smarter Hiring.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-violet">Brighter Careers.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-brand-navy/70 leading-relaxed max-w-lg">
                  AI-powered resume screening and intelligent job matching that connects the right talent with the right opportunity.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleGetStarted} size="lg" className="px-8 h-14 rounded-xl text-base group">
                    Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button onClick={() => scrollToSection('features')} variant="secondary" size="lg" className="px-8 h-14 rounded-xl text-base bg-brand-light border-brand-gray/50 hover:bg-brand-gray/20">
                    Explore Platform
                  </Button>
                </div>
              </motion.div>

              <div className="mt-20 lg:mt-0 relative h-[500px] hidden md:block">
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
                      <h3 className="font-semibold text-brand-navy">Best Match</h3>
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
        <section id="features" className="py-24 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">Intelligent Recruitment Tools</h2>
              <p className="mt-4 text-brand-navy/60 text-lg">Everything you need to hire or get hired, powered by advanced AI algorithms.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <section id="how-it-works" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-navy">How HireSmart AI Works</h2>
              <p className="mt-4 text-brand-navy/60 text-lg">A unified platform engineered for a seamless hiring experience.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16">
              {/* Candidate Flow */}
              <div className="bg-brand-light rounded-3xl p-8 lg:p-12 border border-brand-gray/50">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-brand-navy">Candidate Flow</h3>
                </div>
                <div className="space-y-6">
                  <WorkflowStep number="01" title="Upload Resume" desc="Drop your CV and let AI instantly parse your experience." />
                  <WorkflowStep number="02" title="Skill Extraction" desc="AI identifies your core competencies and strengths." />
                  <WorkflowStep number="03" title="Job Matching" desc="Get instantly matched with open roles requiring your skills." />
                  <WorkflowStep number="04" title="Apply & Track" desc="Submit applications and monitor your progress in real-time." />
                  <WorkflowStep number="05" title="Interview & Hire" desc="Connect with recruiters and land your perfect job." isLast />
                </div>
              </div>

              {/* Recruiter Flow */}
              <div className="bg-brand-indigo/5 rounded-3xl p-8 lg:p-12 border border-brand-indigo/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-brand-indigo/10 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-brand-indigo" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-brand-navy">Recruiter Flow</h3>
                </div>
                <div className="space-y-6">
                  <WorkflowStep number="01" title="Create Job" desc="Post an opportunity and let AI determine the required skills." />
                  <WorkflowStep number="02" title="Receive Applications" desc="Candidates apply directly through the HireSmart platform." />
                  <WorkflowStep number="03" title="AI Screening" desc="AI evaluates and ranks every candidate against your job description." />
                  <WorkflowStep number="04" title="Shortlist Candidates" desc="Review the top matches and move them through your pipeline." />
                  <WorkflowStep number="05" title="Interview & Hire" desc="Schedule meetings and make data-driven hiring decisions." isLast />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* D. Candidate Section */}
        <section id="candidates" className="py-24 bg-brand-navy text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-indigo via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Take Control of Your Career trajectory</h2>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue shrink-0" />
                    <span className="text-white/80">Upload your resume and instantly understand how ATS systems view your profile.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue shrink-0" />
                    <span className="text-white/80">Discover jobs that genuinely match your skills, not just keyword searches.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue shrink-0" />
                    <span className="text-white/80">Identify critical skill gaps and get actionable recommendations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-blue shrink-0" />
                    <span className="text-white/80">Track all your applications in one centralized, beautiful dashboard.</span>
                  </li>
                </ul>
                <Button onClick={() => { setSelectedRole("candidate"); setIsRoleSelectorOpen(false); setIsAuthModalOpen(true); setAuthMode("register"); }} variant="default" className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                  Explore Candidate Experience
                </Button>
              </div>
              <div className="mt-12 lg:mt-0 relative">
                <div className="glass-card /10 backdrop-blur-xl -white/20 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-brand-blue rounded-full flex items-center justify-center font-bold text-xl">
                      JD
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">John Doe</h4>
                      <p className="text-white/60 text-sm">Senior Frontend Engineer</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">React Expertise</span>
                        <span className="font-bold text-brand-blue">98%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full"><div className="h-full w-[98%] bg-brand-blue rounded-full"></div></div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">System Architecture</span>
                        <span className="font-bold text-brand-blue">85%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full"><div className="h-full w-[85%] bg-brand-blue rounded-full"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* E. Recruiter Section */}
        <section id="recruiters" className="py-24 bg-brand-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center flex flex-col-reverse lg:flex-row">
              <div className="mt-12 lg:mt-0 relative w-full">
                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-brand-gray/30 pb-4">
                    <h4 className="font-bold text-brand-navy">AI Screening Results</h4>
                    <span className="text-xs font-bold text-brand-indigo bg-brand-indigo/10 px-3 py-1 rounded-full">Frontend Dev</span>
                  </div>
                  <div className="space-y-3">
                    {[94, 88, 76].map((score, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-light transition-colors border border-transparent hover:border-brand-gray/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-brand-navy/5 rounded-full flex items-center justify-center font-bold text-sm text-brand-navy">
                            C{i+1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-navy">Candidate {i+1}</p>
                            <p className="text-xs text-brand-navy/50">Applied 2h ago</p>
                          </div>
                        </div>
                        <MatchScore score={score} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-brand-navy">Scale Your Hiring with Precision</h2>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-indigo shrink-0" />
                    <span className="text-brand-navy/70">Create job postings and let AI automatically extract the true skill requirements.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-indigo shrink-0" />
                    <span className="text-brand-navy/70">Automatically screen hundreds of resumes in seconds without bias.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-indigo shrink-0" />
                    <span className="text-brand-navy/70">Identify the strongest candidates instantly with comprehensive AI match scores.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand-indigo shrink-0" />
                    <span className="text-brand-navy/70">Manage your entire hiring pipeline, from shortlisting to final interviews.</span>
                  </li>
                </ul>
                <Button onClick={() => { setSelectedRole("recruiter"); setIsRoleSelectorOpen(false); setIsAuthModalOpen(true); setAuthMode("register"); }} className="bg-brand-indigo hover:bg-brand-indigo/90 text-white">
                  Explore Recruiter Experience
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* F. AI Matching Demonstration */}
        <section className="py-24 bg-white border-y border-brand-gray/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-brand-navy">Transparent AI Matching</h2>
              <p className="mt-4 text-brand-navy/60 text-lg">AI provides powerful decision support, but humans retain final hiring control.</p>
            </div>

            <div className="bg-brand-light rounded-3xl p-8 border border-brand-gray/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 rounded-bl-full -z-10"></div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="font-semibold text-brand-navy uppercase tracking-wider text-sm mb-6">The Analysis</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-brand-gray/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-brand-navy">Candidate</span>
                        <span className="text-sm text-brand-navy/60">Software Engineer</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Zap className="w-6 h-6 text-brand-indigo" />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-brand-gray/30">
                      <div className="mb-2 text-sm font-medium text-brand-navy">Required Job Skills</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-brand-gray/20 text-brand-navy text-xs rounded">React</span>
                        <span className="px-2 py-1 bg-brand-gray/20 text-brand-navy text-xs rounded">Node.js</span>
                        <span className="px-2 py-1 bg-brand-gray/20 text-brand-navy text-xs rounded">MongoDB</span>
                        <span className="px-2 py-1 bg-brand-gray/20 text-brand-navy text-xs rounded">TypeScript</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
                  <h3 className="font-bold text-brand-navy mb-8">AI Match Breakdown</h3>
                  
                  <div className="w-full space-y-4 mb-8">
                    <MatchBar label="Skills Match" score={94} />
                    <MatchBar label="Experience Match" score={89} />
                    <MatchBar label="Education Match" score={92} />
                    <MatchBar label="Role Similarity" score={95} />
                  </div>
                  
                  <div className="pt-6 border-t border-brand-gray/30 w-full flex flex-col items-center">
                    <span className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Overall Match</span>
                    <MatchScore score={92} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* G. Trust / Safety section */}
        <section className="py-24 bg-brand-navy text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="w-16 h-16 text-brand-blue mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12">Built on Trust and Responsibility</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <Lock className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Candidate data is strictly private. Resumes and personal information are handled securely and only shared with explicitly applied jobs.
                </p>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <BrainCircuit className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold mb-3">Responsible AI</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Our AI models are designed for transparent matching. We provide the "why" behind every match score to prevent hidden algorithmic bias.
                </p>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-left">
                <Users className="w-8 h-8 text-brand-blue mb-4" />
                <h3 className="text-xl font-bold mb-3">Human Final Say</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  AI performs the heavy lifting of screening and matching, but no automatic hiring decisions are made. Recruiters retain total control.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* H. Final CTA */}
        <section className="py-32 bg-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-brand-navy mb-6">Find Better Matches.<br />Hire Smarter.</h2>
            <p className="text-xl text-brand-navy/60 mb-10">Join thousands of candidates and forward-thinking recruiters transforming the future of work.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleGetStarted} size="lg" className="px-10 h-14 rounded-xl text-lg">Get Started</Button>
              <Button onClick={handleSignIn} variant="secondary" size="lg" className="px-10 h-14 rounded-xl text-lg bg-brand-light border-brand-gray/50 hover:bg-brand-gray/20">Sign In</Button>
            </div>
          </div>
        </section>
      </main>

      {/* I. Footer */}
      <footer className="bg-brand-navy pt-20 pb-10 border-t border-white/10 text-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-brand-indigo flex items-center justify-center">
                  <span className="text-white font-display font-bold">H</span>
                </div>
                <span className="text-xl font-display font-semibold text-white">
                  HireSmart <span className="text-brand-indigo">AI</span>
                </span>
              </div>
              <p className="text-sm text-white/50 mb-6">
                The next generation of recruitment, powered by artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('candidates')} className="hover:text-white transition-colors">For Candidates</button></li>
                <li><button onClick={() => scrollToSection('recruiters')} className="hover:text-white transition-colors">For Recruiters</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/recruiter/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/recruiter/complaint" className="hover:text-white transition-colors">Report a Complaint</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/recruiter/safety" className="hover:text-white transition-colors">Safety Tips</Link></li>
                <li><Link to="/recruiter/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/recruiter/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/recruiter/about" className="hover:text-white transition-colors">About HireSmart AI</Link></li>
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
    <div className="glass-card p-6 shadow-sm hover: transition-shadow">
      <div className="w-12 h-12 bg-brand-indigo/10 rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-brand-indigo" />
      </div>
      <h3 className="text-lg font-bold text-brand-navy mb-2">{title}</h3>
      <p className="text-brand-navy/60 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function WorkflowStep({ number, title, desc, isLast = false }: { number: string, title: string, desc: string, isLast?: boolean }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white border border-brand-gray flex items-center justify-center text-xs font-bold text-brand-navy shrink-0 shadow-sm">
          {number}
        </div>
        {!isLast && <div className="w-px h-full bg-brand-gray/50 my-2"></div>}
      </div>
      <div className="pb-6">
        <h4 className="font-bold text-brand-navy text-lg">{title}</h4>
        <p className="text-brand-navy/60 text-sm mt-1">{desc}</p>
      </div>
    </div>
  )
}

function MatchBar({ label, score }: { label: string, score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-brand-navy/70 font-medium">{label}</span>
        <span className="font-bold text-brand-navy">{score}%</span>
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
