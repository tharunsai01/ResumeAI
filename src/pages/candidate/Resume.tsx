import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { UploadCloud, AlertCircle, RefreshCw, FileText, Bot, CheckCircle2, ArrowRight } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { api } from "../../services/api"
import { cn } from "../../lib/utils"

type UploadState = "empty" | "selected" | "uploading" | "analyzing" | "complete" | "error"

export default function CandidateResume() {
  const navigate = useNavigate()
  
  const [file, setFile] = React.useState<File | null>(null)
  const [uploadState, setUploadState] = React.useState<UploadState>("empty")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [isDragging, setIsDragging] = React.useState(false)
  const [analysisStep, setAnalysisStep] = React.useState(0)

  const steps = [
    "Uploading Resume",
    "Extracting Text",
    "Understanding Content",
    "Detecting Skills",
    "Analyzing Experience",
    "Building Candidate Profile",
    "Generating Insights"
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (uploadState === "empty" || uploadState === "error") setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if ((uploadState === "empty" || uploadState === "error") && e.dataTransfer.files?.length > 0) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    setErrorMsg("")
    // Validations
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
      setErrorMsg("Please upload a PDF or DOCX file.")
      setUploadState("error")
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("Maximum file size is 10 MB.")
      setUploadState("error")
      return
    }
    setFile(selectedFile)
    setUploadState("selected")
  }

  const handleAnalyze = async () => {
    if (!file) return
    
    setUploadState("uploading")
    setAnalysisStep(0)
    
    try {
      // Step 1: Upload (mock API)
      await api.uploadResume(file)
      setUploadState("analyzing")
      
      // Step 2: Analyze (mock complex animation flow)
      // We know analyzeResume takes ~4s. We'll sequence the steps over 4s.
      const stepDuration = 4000 / steps.length
      
      const interval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, stepDuration)
      
      const res = await api.analyzeResume("doc_mock")
      if (res.success) {
        clearInterval(interval)
        setAnalysisStep(steps.length)
        setUploadState("complete")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't analyze your resume. Please try again.")
      setUploadState("error")
    }
  }

  return (
    <DashboardShell type="candidate" userName="Rahul Sharma">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-brand-navy">My Resume</h1>
          <p className="text-brand-navy/60 mt-1 max-w-2xl">
            Upload your resume and let HireSmart AI understand your skills, experience, and career profile.
          </p>
        </div>
        <Badge variant={uploadState === "complete" ? "success" : "secondary"}>
          {uploadState === "complete" ? "Analyzed ✓" : "Not Analyzed"}
        </Badge>
      </div>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* EMPTY / ERROR STATE */}
          {(uploadState === "empty" || uploadState === "error") && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-display font-semibold text-brand-navy">Upload your resume</h2>
                  <p className="text-brand-navy/60 mt-2">
                    {uploadState === "empty" 
                      ? "Upload your latest resume and let AI analyze your professional profile."
                      : "Upload your resume to unlock AI-powered profile analysis and personalized job matching."}
                  </p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all duration-300",
                    isDragging 
                      ? "border-brand-indigo bg-brand-indigo/5 scale-[1.02]" 
                      : "border-brand-gray/70 hover:border-brand-indigo/50 hover:bg-brand-light",
                    uploadState === "error" && !isDragging && "border-semantic-error/50 bg-semantic-error/5"
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  />
                  
                  <motion.div 
                    animate={isDragging ? { y: -5 } : { y: 0 }}
                    className="rounded-full bg-brand-indigo/10 p-5 mb-5"
                  >
                    <UploadCloud className={cn("h-10 w-10", isDragging ? "text-brand-indigo animate-pulse" : "text-brand-indigo/80")} />
                  </motion.div>
                  
                  <h3 className="text-lg font-medium text-brand-navy mb-1 pointer-events-none">
                    Drop your resume here
                  </h3>
                  <p className="text-brand-navy/50 text-sm mb-6 pointer-events-none">
                    or choose a file from your computer
                  </p>
                  
                  <Button className="pointer-events-none relative z-10" variant={uploadState === "error" ? "secondary" : "default"}>
                    Choose Resume
                  </Button>
                </div>
                
                <p className="text-center text-xs text-brand-navy/40 mt-4">
                  Supported formats: PDF, DOCX • Maximum size: 10 MB
                </p>

                {uploadState === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 flex items-center justify-center gap-2 text-semantic-error bg-semantic-error/10 py-3 px-4 rounded-lg text-sm font-medium"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {errorMsg}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* SELECTED STATE */}
          {uploadState === "selected" && file && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-2xl border border-brand-indigo/30 shadow-md p-8"
            >
              <h2 className="text-xl font-display font-semibold text-brand-navy mb-6">Ready to analyze</h2>
              
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-brand-gray/60 bg-brand-light gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-12 w-12 rounded-lg bg-brand-indigo/10 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-brand-indigo" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-brand-navy truncate">{file.name}</p>
                    <p className="text-sm text-brand-navy/60">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setUploadState("empty")}>
                    Remove
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <Button variant="outline" size="sm" className="pointer-events-none">
                      Replace
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={handleAnalyze} className="group w-full sm:w-auto">
                  Analyze Resume <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ANALYZING & COMPLETE STATE */}
          {(uploadState === "uploading" || uploadState === "analyzing" || uploadState === "complete") && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-brand-gray/50 shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left side: Checklist */}
                <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-brand-gray/50 flex flex-col justify-center">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-semibold text-brand-navy">
                      {uploadState === "complete" ? "Resume Analysis Complete ✓" : "Analyzing your resume..."}
                    </h2>
                    <p className="text-brand-navy/60 mt-2">
                      {uploadState === "complete" 
                        ? "We've successfully extracted and analyzed your professional profile." 
                        : "HireSmart AI is understanding your professional profile."}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {steps.map((step, idx) => {
                      const isComplete = uploadState === "complete" || analysisStep > idx
                      const isCurrent = uploadState !== "complete" && analysisStep === idx
                      const isPending = uploadState !== "complete" && analysisStep < idx

                      return (
                        <div key={step} className={cn("flex items-center gap-3 transition-opacity duration-300", isPending ? "opacity-30" : "opacity-100")}>
                          <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                            {isComplete ? (
                              <CheckCircle2 className="h-5 w-5 text-semantic-success" />
                            ) : isCurrent ? (
                              <RefreshCw className="h-4 w-4 text-brand-indigo animate-spin" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-brand-navy/20" />
                            )}
                          </div>
                          <span className={cn(
                            "font-medium transition-colors duration-300",
                            isComplete ? "text-brand-navy" : isCurrent ? "text-brand-indigo" : "text-brand-navy/40"
                          )}>
                            {step}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {uploadState === "complete" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button size="lg" className="w-full group" onClick={() => navigate("/candidate/resume/analysis")}>
                          View Analysis <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right side: Stylized Resume Visual */}
                <div className="p-8 bg-brand-light flex items-center justify-center relative overflow-hidden min-h-[300px]">
                  {/* Floating tags */}
                  <AnimatePresence>
                    {uploadState !== "complete" && analysisStep >= 3 && (
                      <>
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: -20, x: -60 }} exit={{ opacity: 0 }} className="absolute z-20 px-2 py-1 bg-white text-brand-indigo text-xs font-bold rounded shadow-md border border-brand-indigo/20 top-1/3 left-1/4">Java</motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: 30, x: 50 }} exit={{ opacity: 0 }} className="absolute z-20 px-2 py-1 bg-white text-brand-indigo text-xs font-bold rounded shadow-md border border-brand-indigo/20 top-1/2 right-1/4 transition-delay-150">React</motion.div>
                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: 60, x: -40 }} exit={{ opacity: 0 }} className="absolute z-20 px-2 py-1 bg-white text-brand-indigo text-xs font-bold rounded shadow-md border border-brand-indigo/20 bottom-1/4 left-1/3 transition-delay-300">Python</motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Document Card */}
                  <div className="relative w-48 h-64 bg-white rounded-md shadow-xl border border-brand-gray overflow-hidden">
                    {/* Simulated text lines */}
                    <div className="p-4 space-y-4">
                      <div className="space-y-1 border-b border-brand-gray/50 pb-2">
                        <div className="h-3 w-3/4 bg-brand-navy/80 rounded" />
                        <div className="h-2 w-1/2 bg-brand-navy/40 rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-brand-gray rounded" />
                        <div className="h-2 w-5/6 bg-brand-gray rounded" />
                        <div className="h-2 w-full bg-brand-gray rounded" />
                        <div className="h-2 w-4/6 bg-brand-gray rounded" />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="h-2 w-1/3 bg-brand-indigo/40 rounded" />
                        <div className="flex gap-1">
                          <div className="h-4 w-10 bg-brand-indigo/10 rounded" />
                          <div className="h-4 w-12 bg-brand-indigo/10 rounded" />
                          <div className="h-4 w-8 bg-brand-indigo/10 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-brand-gray rounded" />
                        <div className="h-2 w-2/3 bg-brand-gray rounded" />
                      </div>
                    </div>

                    {/* Scanning Line */}
                    {uploadState !== "complete" && (
                      <motion.div 
                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent to-brand-indigo/20 border-b-2 border-brand-indigo z-10"
                        animate={{ top: ["-40%", "100%", "-40%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    )}

                    {/* Complete State Overlay */}
                    <AnimatePresence>
                      {uploadState === "complete" && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"
                        >
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="h-16 w-16 bg-semantic-success rounded-full flex items-center justify-center shadow-lg shadow-semantic-success/30"
                          >
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Subtle AI Robot Icon overlay */}
                  <div className="absolute top-4 right-4 h-10 w-10 bg-white rounded-xl shadow border border-brand-gray flex items-center justify-center z-0 opacity-50">
                    <Bot className="h-5 w-5 text-brand-indigo" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardShell>
  )
}
