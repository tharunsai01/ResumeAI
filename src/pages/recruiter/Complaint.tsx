import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Paperclip, Send, CheckCircle2 } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

const CATEGORIES = [
  "Account & Profile",
  "Job Posting",
  "Candidate",
  "Application",
  "AI Screening",
  "Shortlisting",
  "Interview",
  "Privacy & Data",
  "Technical Issue",
  "Suspicious Activity",
  "Other"
]

export default function RecruiterComplaint() {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [formData, setFormData] = React.useState({
    subject: "",
    category: "",
    priority: "Medium",
    description: "",
    attachment: null as File | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission for frontend demo
    setIsSubmitted(true)
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-3xl mx-auto space-y-8 pb-16">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="text-center space-y-4 pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-semantic-error/10 text-semantic-error mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-brand-navy">Report a Complaint</h1>
          <p className="text-lg text-brand-navy/60 max-w-xl mx-auto">
            Tell us about an issue related to your account, job posting, candidate, interview, or HireSmart AI experience.
          </p>
        </motion.div>

        {/* CONTENT */}
        <motion.div variants={slideUp}>
          <Card className="border-brand-gray/30 shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-semantic-success/10 text-semantic-success mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-navy mb-3">Complaint submitted successfully.</h2>
                  <p className="text-brand-navy/60 max-w-md mx-auto mb-8">
                    Your report has been recorded. Our support process will review the information provided.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">Submit Another Report</Button>
                </motion.div>
              ) : (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-brand-light/30 px-8 py-6 border-b border-brand-gray/20">
                    <p className="text-sm text-brand-navy/70 leading-relaxed font-medium">
                      We take platform safety, fairness, privacy, and user experience seriously. Use this form to report an issue that requires attention.
                    </p>
                  </div>
                  
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Category <span className="text-semantic-error">*</span></label>
                          <select 
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-transparent border border-brand-gray/40 rounded-xl h-11 px-4 text-brand-navy text-sm focus:border-brand-indigo outline-none"
                          >
                            <option value="" disabled>Select a category...</option>
                            {CATEGORIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Priority <span className="text-semantic-error">*</span></label>
                          <div className="flex gap-3">
                            {["Low", "Medium", "High"].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setFormData({...formData, priority: p})}
                                className={cn(
                                  "flex-1 h-11 rounded-xl text-sm font-semibold transition-colors border",
                                  formData.priority === p 
                                    ? p === "High" ? "bg-semantic-error/10 border-semantic-error/30 text-semantic-error" 
                                      : p === "Medium" ? "bg-semantic-warning/10 border-semantic-warning/30 text-semantic-warning"
                                      : "bg-brand-indigo/10 border-brand-indigo/30 text-brand-indigo"
                                    : "bg-transparent border-brand-gray/30 text-brand-navy/60 hover:bg-brand-gray/10"
                                )}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">Subject <span className="text-semantic-error">*</span></label>
                        <Input 
                          required 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          placeholder="Brief summary of the issue" 
                          className="bg-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">Description <span className="text-semantic-error">*</span></label>
                        <textarea 
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Describe the issue clearly. Include relevant job, candidate, or application information when appropriate."
                          className="w-full bg-transparent border border-brand-gray/40 rounded-xl p-4 text-brand-navy text-sm focus:border-brand-indigo outline-none min-h-[160px] resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">Attachment (Optional)</label>
                        <div className="border-2 border-dashed border-brand-gray/40 rounded-xl p-6 text-center hover:border-brand-indigo/50 transition-colors cursor-pointer bg-brand-light/20 relative">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFormData({...formData, attachment: e.target.files?.[0] || null})} />
                          <Paperclip className="w-6 h-6 text-brand-navy/40 mx-auto mb-2" />
                          <p className="text-sm font-medium text-brand-navy">{formData.attachment ? formData.attachment.name : "Click to upload or drag and drop"}</p>
                          <p className="text-xs text-brand-navy/50 mt-1">PNG, JPG, PDF up to 10MB</p>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" className="bg-brand-indigo hover:bg-brand-indigo/90">
                          <Send className="w-4 h-4 mr-2" /> Submit Complaint
                        </Button>
                      </div>

                    </form>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

      </motion.div>
    </DashboardShell>
  )
}
