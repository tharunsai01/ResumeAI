import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { slideUp, staggerContainer } from "../../lib/animations"
import { cn } from "../../lib/utils"
import { 
  AlertTriangle, UploadCloud, Shield, CheckCircle2, 
  ArrowLeft, LayoutDashboard, Clock, FileText
} from "lucide-react"

// Types
type ComplaintType = 
  | "Suspicious Job Posting"
  | "Suspicious Recruiter"
  | "Job Matching Issue"
  | "Resume Analysis Issue"
  | "Application Issue"
  | "Incorrect Job Information"
  | "Privacy Concern"
  | "Technical Problem"
  | "Harassment or Inappropriate Communication"
  | "Other"

interface Report {
  id: string
  type: ComplaintType
  subject: string
  date: string
  status: "Submitted" | "Under Review" | "Resolved"
}

const COMPLAINT_TYPES: ComplaintType[] = [
  "Suspicious Job Posting",
  "Suspicious Recruiter",
  "Job Matching Issue",
  "Resume Analysis Issue",
  "Application Issue",
  "Incorrect Job Information",
  "Privacy Concern",
  "Technical Problem",
  "Harassment or Inappropriate Communication",
  "Other"
]

export default function ComplaintPage() {
  const navigate = useNavigate()
  
  // Form State
  const [selectedType, setSelectedType] = React.useState<ComplaintType | "">("")
  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  
  // Dynamic Fields State
  const [dynamicFields, setDynamicFields] = React.useState<Record<string, string>>({})
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [generatedId, setGeneratedId] = React.useState("")
  const [error, setError] = React.useState("")

  // History State
  const [reports, setReports] = React.useState<Report[]>([])

  React.useEffect(() => {
    const saved = localStorage.getItem("hiresmart_reports")
    if (saved) {
      try {
        setReports(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse reports", e)
      }
    }
  }, [])

  const handleDynamicChange = (field: string, value: string) => {
    setDynamicFields(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be under 5MB.")
        return
      }
      setFile(file)
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType) {
      setError("Please select a complaint type.")
      return
    }
    if (!subject.trim() || !description.trim()) {
      setError("Subject and Description are required.")
      return
    }

    setError("")
    setIsSubmitting(true)

    const newId = `HS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
    const newReport: Report = {
      id: newId,
      type: selectedType,
      subject,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: "Submitted"
    }
    
    const updatedReports = [newReport, ...reports]
    setReports(updatedReports)
    localStorage.setItem("hiresmart_reports", JSON.stringify(updatedReports))
    
    setGeneratedId(newId)
    setIsSubmitting(false)
    setIsSuccess(true)
  }
  const showSafetyPanel = selectedType === "Suspicious Job Posting" || selectedType === "Suspicious Recruiter"

  return (
    <DashboardShell type="candidate">
      <div className="max-w-7xl mx-auto pb-20 flex flex-col lg:flex-row gap-8">
        
        {/* MAIN FORM AREA */}
        <div className="flex-1 max-w-3xl">
          <motion.div variants={slideUp} initial="initial" animate="animate" className="mb-8">
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Report an Issue</h1>
            <p className="text-brand-navy/60 mt-2">Help us keep HireSmart AI safe, reliable, and useful for candidates.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 sm:p-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-semantic-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-semantic-success" />
                </div>
                <h2 className="text-2xl font-display font-bold text-brand-navy">Report Submitted</h2>
                <p className="text-brand-navy/70 max-w-md mx-auto">
                  Thank you for helping us improve HireSmart AI. Your report has been recorded and will be reviewed by our team shortly.
                </p>
                <div className="bg-brand-light p-4 rounded-xl border border-brand-gray/50 inline-block">
                  <span className="text-sm text-brand-navy/50 block mb-1 uppercase tracking-wider font-semibold">Report ID</span>
                  <span className="font-mono font-bold text-brand-indigo text-lg">{generatedId}</span>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate("/candidate/help")} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Help Center
                  </Button>
                  <Button onClick={() => navigate("/candidate/dashboard")} className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                variants={slideUp}
                initial="initial"
                animate="animate"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>What would you like to report?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as ComplaintType)}
                      className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-3 text-brand-navy text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
                    >
                      <option value="" disabled>Select an option...</option>
                      {COMPLAINT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <AnimatePresence>
                      {showSafetyPanel && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-semantic-warning/10 border border-semantic-warning/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <Shield className="w-5 h-5 text-semantic-warning shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-semantic-warning">Stay Safe</h4>
                                <p className="text-sm text-semantic-warning/80 mt-1">Never send money, OTPs, passwords, banking credentials, or other sensitive information to someone claiming to offer you a job.</p>
                              </div>
                            </div>
                            <Button type="button" variant="outline" className="shrink-0 border-semantic-warning/30 text-semantic-warning hover:bg-semantic-warning/20" onClick={() => navigate("/candidate/safety")}>
                              View Safety Tips
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* DYNAMIC FIELDS */}
                <AnimatePresence>
                  {selectedType && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle>Additional Details</CardTitle>
                          <CardDescription>Please provide specific information regarding the issue.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          
                          {selectedType === "Suspicious Job Posting" && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Job Title</label><Input placeholder="e.g. Frontend Developer" value={dynamicFields.jobTitle || ""} onChange={e => handleDynamicChange("jobTitle", e.target.value)} /></div>
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Company</label><Input placeholder="e.g. Acme Corp" value={dynamicFields.company || ""} onChange={e => handleDynamicChange("company", e.target.value)} /></div>
                              </div>
                              <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Job URL / Reference</label><Input placeholder="https://..." value={dynamicFields.url || ""} onChange={e => handleDynamicChange("url", e.target.value)} /></div>
                              <div>
                                <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Reason for Report</label>
                                <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm" onChange={e => handleDynamicChange("reason", e.target.value)}>
                                  <option>Asking for money</option><option>Suspicious contact info</option><option>Unrealistic salary</option><option>Other</option>
                                </select>
                              </div>
                            </>
                          )}

                          {selectedType === "Suspicious Recruiter" && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Recruiter Name</label><Input value={dynamicFields.recruiterName || ""} onChange={e => handleDynamicChange("recruiterName", e.target.value)} /></div>
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Company</label><Input value={dynamicFields.company || ""} onChange={e => handleDynamicChange("company", e.target.value)} /></div>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Reason for Report</label>
                                <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm" onChange={e => handleDynamicChange("reason", e.target.value)}>
                                  <option>Inappropriate behavior</option><option>Asking for personal info</option><option>Phishing attempt</option><option>Other</option>
                                </select>
                              </div>
                            </>
                          )}

                          {selectedType === "Job Matching Issue" && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Job Title</label><Input value={dynamicFields.jobTitle || ""} onChange={e => handleDynamicChange("jobTitle", e.target.value)} /></div>
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Displayed Match Score</label><Input placeholder="e.g. 45%" value={dynamicFields.score || ""} onChange={e => handleDynamicChange("score", e.target.value)} /></div>
                              </div>
                            </>
                          )}

                          {selectedType === "Resume Analysis Issue" && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Issue Type</label>
                                <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm" onChange={e => handleDynamicChange("issueType", e.target.value)}>
                                  <option>Skills not extracted</option><option>Experience incorrectly parsed</option><option>Education missing</option><option>Other</option>
                                </select>
                              </div>
                            </>
                          )}

                          {selectedType === "Application Issue" && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Job Title</label><Input value={dynamicFields.jobTitle || ""} onChange={e => handleDynamicChange("jobTitle", e.target.value)} /></div>
                                <div>
                                  <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Application Status</label>
                                  <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm" onChange={e => handleDynamicChange("status", e.target.value)}>
                                    <option>Applied</option><option>Under Review</option><option>Shortlisted</option><option>Interview</option><option>Withdrawn</option>
                                  </select>
                                </div>
                              </div>
                            </>
                          )}

                          {selectedType === "Privacy Concern" && (
                            <>
                              <div>
                                <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Concern Type</label>
                                <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm" onChange={e => handleDynamicChange("concern", e.target.value)}>
                                  <option>Data sharing</option><option>Profile visibility</option><option>Data deletion request</option><option>Other</option>
                                </select>
                              </div>
                            </>
                          )}

                          {selectedType === "Technical Problem" && (
                            <>
                              <div><label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Page / Feature</label><Input placeholder="e.g. My Resume page" value={dynamicFields.page || ""} onChange={e => handleDynamicChange("page", e.target.value)} /></div>
                            </>
                          )}

                          {(selectedType === "Incorrect Job Information" || selectedType === "Harassment or Inappropriate Communication" || selectedType === "Other") && (
                            <p className="text-sm text-brand-navy/60 italic">Please provide all necessary details in the description below.</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Subject <span className="text-semantic-error">*</span></label>
                      <Input 
                        placeholder="Briefly describe the issue" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Description <span className="text-semantic-error">*</span></label>
                      <textarea 
                        placeholder="Please provide details so we can understand and investigate the issue." 
                        className="w-full h-32 p-3 text-sm rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 bg-white text-brand-navy resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-navy/60 mb-1.5 uppercase">Attachment (Optional)</label>
                      <div className="border-2 border-dashed border-brand-gray/80 hover:border-brand-indigo/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center bg-brand-light/50 group cursor-pointer relative">
                        <input 
                          type="file" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                        />
                        <UploadCloud className="w-8 h-8 text-brand-navy/40 group-hover:text-brand-indigo transition-colors mb-2" />
                        <p className="text-sm font-medium text-brand-navy/70 group-hover:text-brand-navy">
                          {file ? file.name : "Attach supporting evidence (optional)"}
                        </p>
                        <p className="text-xs text-brand-navy/50 mt-1">PDF, PNG, JPG up to 5MB</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 text-semantic-error rounded-lg flex items-center gap-2 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full sm:w-auto px-8 py-3 rounded-xl text-base"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR - HISTORY */}
        <div className="lg:w-80 shrink-0">
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            <Card className="sticky top-24">
              <CardHeader className="bg-brand-gray/5 border-b border-brand-gray/30 rounded-t-xl">
                <CardTitle className="text-lg">My Reports</CardTitle>
                <CardDescription>Your recent support requests</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-brand-navy/50">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-brand-navy/20" />
                    <p className="font-medium text-sm">No reports filed</p>
                  </div>
                ) : (
                  <div className="divide-y divide-brand-gray/30 max-h-[600px] overflow-y-auto">
                    {reports.map(report => (
                      <div key={report.id} className="p-4 hover:bg-brand-light transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold text-brand-indigo">{report.id}</span>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-2 py-0",
                              report.status === "Submitted" ? "bg-brand-gray/50" : 
                              report.status === "Resolved" ? "bg-semantic-success/20 text-semantic-success" : 
                              "bg-semantic-warning/20 text-semantic-warning"
                            )}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-brand-navy line-clamp-1">{report.subject}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-medium text-brand-navy/50 bg-brand-gray/30 px-2 py-1 rounded line-clamp-1 truncate max-w-[120px]">{report.type}</span>
                          <span className="text-[10px] text-brand-navy/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {report.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardShell>
  )
}
