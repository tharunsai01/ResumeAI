import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, AlertCircle, X } from "lucide-react"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../../components/ui/PremiumCard"
import { Button } from "../../../components/ui/Button"
import { slideUp } from "../../../lib/animations"
import { cn } from "../../../lib/utils"

export interface JobFormData {
  title: string
  company: string
  category: string
  location: string
  type: string
  workMode: string
  experience: string
  salary: string
  salaryNotDisclosed: boolean
  description: string
  requiredSkills: string[]
  preferredSkills: string[]
}

interface JobFormProps {
  initialData?: Partial<JobFormData>
  onSubmit: (data: JobFormData, status: "Active" | "Draft") => void
  onCancel: () => void
  isSubmitting: boolean
}

export function JobForm({ initialData, onSubmit, onCancel, isSubmitting }: JobFormProps) {
  const [formData, setFormData] = React.useState<JobFormData>({
    title: initialData?.title || "",
    company: initialData?.company || "HireSmart Technologies",
    category: initialData?.category || "Software Development",
    location: initialData?.location || "",
    type: initialData?.type || "Full-time",
    workMode: initialData?.workMode || "Hybrid",
    experience: initialData?.experience || "1–3 Years",
    salary: initialData?.salary || "",
    salaryNotDisclosed: initialData?.salaryNotDisclosed || false,
    description: initialData?.description || "",
    requiredSkills: initialData?.requiredSkills || [],
    preferredSkills: initialData?.preferredSkills || []
  })

  const [newRequiredSkill, setNewRequiredSkill] = React.useState("")
  const [newPreferredSkill, setNewPreferredSkill] = React.useState("")
  const [errors, setErrors] = React.useState<Partial<Record<keyof JobFormData, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof JobFormData, string>> = {}
    if (!formData.title.trim()) newErrors.title = "Job title is required."
    if (!formData.company.trim()) newErrors.company = "Company is required."
    if (!formData.location.trim()) newErrors.location = "Location is required."
    if (!formData.description.trim()) newErrors.description = "Please enter a job description."
    if (formData.requiredSkills.length === 0) newErrors.requiredSkills = "Add at least one required skill."
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData, "Active")
    }
  }

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, "Draft")
  }

  const addSkill = (type: "required" | "preferred", value: string) => {
    if (!value.trim()) return
    if (type === "required" && !formData.requiredSkills.includes(value.trim())) {
      setFormData(prev => ({ ...prev, requiredSkills: [...prev.requiredSkills, value.trim()] }))
      if (errors.requiredSkills) setErrors(prev => ({ ...prev, requiredSkills: undefined }))
    } else if (type === "preferred" && !formData.preferredSkills.includes(value.trim())) {
      setFormData(prev => ({ ...prev, preferredSkills: [...prev.preferredSkills, value.trim()] }))
    }
  }

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    if (type === "required") {
      setFormData(prev => ({ ...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill) }))
    } else {
      setFormData(prev => ({ ...prev, preferredSkills: prev.preferredSkills.filter(s => s !== skill) }))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle>Basic Information</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => { setFormData({ ...formData, title: e.target.value }); if(errors.title) setErrors({...errors, title: undefined}) }}
                placeholder="e.g. Senior Frontend Developer"
                className={cn(
                  "w-full bg-white border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all text-brand-navy",
                  errors.title ? "border-semantic-error focus:border-semantic-error" : "border-brand-gray/50 focus:border-brand-indigo/50"
                )}
              />
              {errors.title && <p className="text-xs text-semantic-error mt-1">{errors.title}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => { setFormData({ ...formData, company: e.target.value }); if(errors.company) setErrors({...errors, company: undefined}) }}
                  className={cn(
                    "w-full bg-white border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all text-brand-navy",
                    errors.company ? "border-semantic-error focus:border-semantic-error" : "border-brand-gray/50 focus:border-brand-indigo/50"
                  )}
                />
                {errors.company && <p className="text-xs text-semantic-error mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Department</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy"
                >
                  <option>Software Development</option>
                  <option>Data Science & Analytics</option>
                  <option>Cloud Computing & DevOps</option>
                  <option>UI/UX & Product Design</option>
                  <option>Sales & Business Development</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => { setFormData({ ...formData, location: e.target.value }); if(errors.location) setErrors({...errors, location: undefined}) }}
                  placeholder="e.g. Remote, Bangalore"
                  className={cn(
                    "w-full bg-white border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all text-brand-navy",
                    errors.location ? "border-semantic-error focus:border-semantic-error" : "border-brand-gray/50 focus:border-brand-indigo/50"
                  )}
                />
                {errors.location && <p className="text-xs text-semantic-error mt-1">{errors.location}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Work Mode *</label>
                <select
                  value={formData.workMode}
                  onChange={e => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Employment Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 text-brand-navy"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-navy mb-1">Experience Level *</label>
                <select
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 text-brand-navy"
                >
                  <option>Fresher</option>
                  <option>0–2 years</option>
                  <option>1–3 Years</option>
                  <option>2–4 years</option>
                  <option>3–5 Years</option>
                  <option>5–8 Years</option>
                  <option>8+ Years</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-brand-navy">Salary Range</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-navy/70">
                  <input 
                    type="checkbox" 
                    checked={formData.salaryNotDisclosed}
                    onChange={e => setFormData({ ...formData, salaryNotDisclosed: e.target.checked, salary: e.target.checked ? "" : formData.salary })}
                    className="rounded text-brand-indigo focus:ring-brand-indigo"
                  />
                  Salary not disclosed
                </label>
              </div>
              <input
                type="text"
                value={formData.salary}
                disabled={formData.salaryNotDisclosed}
                onChange={e => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. ₹15 LPA - ₹20 LPA"
                className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-2.5 outline-none focus:border-brand-indigo/50 transition-all text-brand-navy disabled:bg-brand-gray/10 disabled:text-brand-navy/40"
              />
            </div>
          </PremiumCardContent>
        </PremiumCard>

        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle>Job Description & Responsibilities</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent>
            <div>
              <textarea
                value={formData.description}
                onChange={e => { setFormData({ ...formData, description: e.target.value }); if(errors.description) setErrors({...errors, description: undefined}) }}
                placeholder="Describe the role, responsibilities, and what the candidate will work on..."
                className={cn(
                  "w-full h-64 bg-white border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all resize-none text-brand-navy",
                  errors.description ? "border-semantic-error focus:border-semantic-error" : "border-brand-gray/50 focus:border-brand-indigo/50"
                )}
              />
              {errors.description && <p className="text-xs text-semantic-error mt-1">{errors.description}</p>}
            </div>
          </PremiumCardContent>
        </PremiumCard>

        <PremiumCard>
          <PremiumCardHeader>
            <PremiumCardTitle>Skills & Requirements</PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">Required Skills *</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {formData.requiredSkills.map(skill => (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                      key={skill} 
                      className="px-3 py-1 bg-brand-navy text-white text-xs font-medium rounded-md flex items-center gap-1"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill("required", skill)} className="hover:text-brand-gray/70"><X className="w-3 h-3" /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequiredSkill}
                  onChange={e => setNewRequiredSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("required", newRequiredSkill); setNewRequiredSkill(""); } }}
                  placeholder="Enter skill..."
                  className={cn(
                    "flex-1 bg-white border rounded-xl px-4 py-2 outline-none focus:border-brand-indigo/50 transition-all text-sm",
                    errors.requiredSkills ? "border-semantic-error focus:border-semantic-error" : "border-brand-gray/50"
                  )}
                />
                <Button type="button" variant="outline" onClick={() => { addSkill("required", newRequiredSkill); setNewRequiredSkill(""); }}>Add</Button>
              </div>
              {errors.requiredSkills && <p className="text-xs text-semantic-error mt-1">{errors.requiredSkills}</p>}
            </div>

            <div className="pt-4 border-t border-brand-gray/20">
              <label className="block text-sm font-medium text-brand-navy mb-2">Preferred Skills (Optional)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <AnimatePresence>
                  {formData.preferredSkills.map(skill => (
                    <motion.span 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                      key={skill} 
                      className="px-3 py-1 bg-brand-light border border-brand-gray/50 text-brand-navy text-xs font-medium rounded-md flex items-center gap-1"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill("preferred", skill)} className="hover:text-brand-navy/70"><X className="w-3 h-3" /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPreferredSkill}
                  onChange={e => setNewPreferredSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred", newPreferredSkill); setNewPreferredSkill(""); } }}
                  placeholder="Enter preferred skill..."
                  className="flex-1 bg-white border border-brand-gray/50 rounded-xl px-4 py-2 outline-none focus:border-brand-indigo/50 transition-all text-sm"
                />
                <Button type="button" variant="outline" onClick={() => { addSkill("preferred", newPreferredSkill); setNewPreferredSkill(""); }}>Add</Button>
              </div>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-6">
        <PremiumCard className="sticky top-24 border-brand-indigo/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.1)]">
          <div className="h-1 w-full bg-gradient-to-r from-brand-indigo to-brand-blue rounded-t-xl" />
          <PremiumCardHeader className="bg-brand-indigo/[0.02] pb-4">
            <PremiumCardTitle className="flex items-center gap-2 text-brand-indigo text-lg">
              <Sparkles className="w-5 h-5" /> AI Matching Preview
            </PremiumCardTitle>
            <p className="text-xs text-brand-navy/60 leading-relaxed mt-2">
              These requirements will be used by HireSmart AI to compare candidate profiles against this job.
            </p>
          </PremiumCardHeader>
          <PremiumCardContent className="p-5 space-y-5 border-t border-brand-gray/20">
            <div>
              <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Required Core Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {formData.requiredSkills.length > 0 ? formData.requiredSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo text-[10px] font-bold rounded">{s}</span>
                )) : <span className="text-xs text-brand-navy/40 italic">No skills added yet</span>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Experience</div>
                <div className="text-sm font-medium text-brand-navy">{formData.experience}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Work Mode</div>
                <div className="text-sm font-medium text-brand-navy">{formData.workMode}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-gray/20">
              <div className="flex items-start gap-2 bg-brand-light p-3 rounded-lg border border-brand-gray/30">
                <AlertCircle className="w-4 h-4 text-brand-navy/40 shrink-0 mt-0.5" />
                <p className="text-xs text-brand-navy/60 leading-relaxed">
                  AI analysis will run automatically when applications are received to compute role similarity.
                </p>
              </div>
            </div>
          </PremiumCardContent>
          <div className="p-4 bg-brand-light/30 border-t border-brand-gray/30 flex flex-col gap-3">
            <Button onClick={handlePublish} disabled={isSubmitting} className="w-full bg-gradient-to-r from-brand-indigo to-brand-blue">
              {isSubmitting ? "Publishing..." : "Publish Job"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="flex-1 bg-white">
                Save as Draft
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
