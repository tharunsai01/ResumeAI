import * as React from "react"
import { motion } from "framer-motion"
import { Sparkles, Target, Brain, Globe, User, Briefcase, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { staggerContainer, slideUp } from "../../lib/animations"
import SpotlightCard from "../../components/ui/SpotlightCard";

export default function RecruiterAbout() {
  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-12 pb-20">
        
        {/* HERO */}
        <motion.div variants={slideUp} className="text-center space-y-6 pt-16 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-blue text-white shadow-lg mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-navy via-brand-indigo to-brand-blue">
            About HireSmart AI
          </h1>
          <h2 className="text-2xl font-bold text-brand-navy">Smarter Hiring. Better Matches.</h2>
          <p className="text-lg text-brand-navy/70 max-w-2xl mx-auto leading-relaxed">
            HireSmart AI is an AI-based resume screening and job matching system designed to make recruitment more organized, efficient, and data-informed.
          </p>
        </motion.div>

        {/* OUR GOAL */}
        <motion.div variants={slideUp}>
          <Card className="border-brand-gray/30 shadow-sm overflow-hidden bg-brand-navy text-white">
            <CardContent className="p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-indigo/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-blue/20 rounded-full blur-3xl"></div>
              
              <Target className="w-12 h-12 text-brand-indigo mx-auto mb-4 relative z-10" />
              <h3 className="text-2xl font-display font-bold relative z-10">Our Goal</h3>
              <div className="space-y-4 text-white/80 font-medium leading-relaxed max-w-2xl mx-auto relative z-10">
                <p>
                  Traditional recruitment can require recruiters to manually review large numbers of resumes and compare candidate qualifications with job requirements.
                </p>
                <p>
                  HireSmart AI aims to assist this process by analyzing resumes, extracting relevant skills, matching candidate profiles with job requirements, and presenting recruiters with structured candidate insights.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* HOW IT WORKS WORKFLOW */}
        <motion.div variants={slideUp} className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-brand-navy">How HireSmart AI Works</h3>
            <div className="w-16 h-1 bg-brand-indigo mx-auto mt-4 rounded-full"></div>
          </div>
          
          <Card className="border-brand-gray/30 shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 text-sm font-bold text-brand-navy text-center">
                {["Job Creation", "Candidate Applications", "Resume Analysis", "Skill Extraction", "Requirement Matching", "AI Match Score", "Candidate Ranking", "Recruiter Review", "Shortlisting", "Interview", "Hiring Decision"].map((step, idx, arr) => (
                  <React.Fragment key={idx}>
                    <div className="bg-brand-light/80 border border-brand-gray/30 px-4 py-2.5 rounded-lg shadow-sm hover:border-brand-indigo/40 hover:bg-brand-indigo/5 transition-colors">
                      {step}
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="text-brand-indigo/40 px-1 hidden sm:block">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FOR RECRUITERS & CANDIDATES */}
        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-brand-gray/30 shadow-sm hover:border-brand-indigo/30 transition-colors">
            <div className="bg-brand-indigo/5 px-8 py-6 border-b border-brand-indigo/10 flex items-center gap-4">
              <SpotlightCard className="glass-card p-3 text-brand-indigo shrink-0">
                <Briefcase className="w-6 h-6" />
              </SpotlightCard>
              <h3 className="text-xl font-bold text-brand-navy">For Recruiters</h3>
            </div>
            <CardContent className="p-8">
              <p className="text-sm text-brand-navy/60 mb-6 font-medium">HireSmart AI provides tools to:</p>
              <ul className="space-y-3">
                {["Create jobs", "Manage applications", "Review candidates", "Analyze resumes", "View AI-assisted match scores", "Shortlist candidates", "Manage interviews", "Track hiring progress", "View recruitment analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-navy/80 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-indigo shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-brand-gray/30 shadow-sm hover:border-brand-blue/30 transition-colors">
            <div className="bg-brand-blue/5 px-8 py-6 border-b border-brand-blue/10 flex items-center gap-4">
              <SpotlightCard className="glass-card p-3 text-brand-blue shrink-0">
                <User className="w-6 h-6" />
              </SpotlightCard>
              <h3 className="text-xl font-bold text-brand-navy">For Candidates</h3>
            </div>
            <CardContent className="p-8">
              <p className="text-sm text-brand-navy/60 mb-6 font-medium">Candidates can:</p>
              <ul className="space-y-3">
                {["Create a professional profile", "Upload resumes", "Discover relevant jobs", "View recommended opportunities", "Track applications", "Analyze skills", "Manage their career information"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-navy/80 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI-ASSISTED RECRUITMENT */}
        <motion.div variants={slideUp}>
          <Card className="border-brand-indigo/30 shadow-md overflow-hidden bg-brand-light/30">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-brand-indigo/10 flex items-center justify-center shrink-0">
                <Brain className="w-10 h-10 text-brand-indigo" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy mb-3">AI-Assisted Recruitment</h3>
                <p className="text-brand-navy/80 font-medium mb-4 leading-relaxed">
                  HireSmart AI uses AI to assist with resume analysis and job-candidate matching.
                </p>
                <div className="bg-white border-l-4 border-brand-indigo p-4 rounded-r-lg shadow-sm">
                  <p className="text-brand-navy font-semibold text-sm">
                    <span className="text-brand-indigo">Important:</span> AI-generated recommendations are designed to support human decision-making. Recruiters remain responsible for reviewing candidates and making final hiring decisions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>



        {/* OUR VISION */}
        <motion.div variants={slideUp}>
          <div className="text-center px-4 py-12 rounded-3xl bg-brand-navy text-white relative overflow-hidden shadow-xl border border-brand-navy/80">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/20 to-brand-blue/20"></div>
            <Globe className="w-12 h-12 text-white/50 mx-auto mb-6 relative z-10" />
            <h3 className="text-2xl font-bold mb-6 relative z-10">Our Vision</h3>
            <p className="text-xl md:text-2xl font-display font-medium leading-relaxed max-w-3xl mx-auto text-white/90 relative z-10 italic">
              "To create a recruitment platform where technology reduces repetitive work while keeping human judgment, transparency, and responsible decision-making at the center of the hiring process."
            </p>
          </div>
        </motion.div>

      </motion.div>
    </DashboardShell>
  )
}
