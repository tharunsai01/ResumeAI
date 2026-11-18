import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Briefcase, Mail, Phone, MapPin, 
  Camera, Check, CheckCircle2, AlertCircle, Pencil, X,
  Users, Award
} from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { staggerContainer, slideUp } from "../../lib/animations"
import { recruiterProfileService } from "../../services/recruiterProfileService"
import type { RecruiterProfile } from "../../services/recruiterProfileService"
import { pipelineService } from "../../services/pipelineService"
import { jobService } from "../../services/jobService"
import SpotlightCard from "../../components/ui/SpotlightCard"

export default function RecruiterProfilePage() {
  const [profile, setProfile] = React.useState<RecruiterProfile>(() => recruiterProfileService.getProfile())
  const [editedProfile, setEditedProfile] = React.useState<RecruiterProfile>(() => recruiterProfileService.getProfile())
  const [isEditing, setIsEditing] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)
  const [toastType, setToastType] = React.useState<"success" | "error">("success")

  // Overview stats
  const [activeJobsCount, setActiveJobsCount] = React.useState(0)
  const [pipelineCount, setPipelineCount] = React.useState(0)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const p = recruiterProfileService.getProfile()
      setProfile(p)
      if (!isEditing) {
        setEditedProfile(p)
      }
    }

    window.addEventListener("hiresmart_recruiter_profile_updated", handleProfileUpdate)
    return () => window.removeEventListener("hiresmart_recruiter_profile_updated", handleProfileUpdate)
  }, [isEditing])

  React.useEffect(() => {
    // Load dynamic counts for overview
    jobService.getRecruiterJobs().then(jobs => {
      setActiveJobsCount(jobs.filter(j => j.status === "Active").length)
    }).catch(() => {})

    const pCandidates = pipelineService.getCandidates()
    setPipelineCount(pCandidates.length)
  }, [])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!editedProfile.fullName.trim()) {
      newErrors.fullName = "Full name is required."
    }
    if (!editedProfile.designation.trim()) {
      newErrors.designation = "Job title / designation is required."
    }
    if (!editedProfile.company.trim()) {
      newErrors.company = "Company name is required."
    }
    if (!editedProfile.email.trim()) {
      newErrors.email = "Email address is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedProfile.email.trim())) {
      newErrors.email = "Please enter a valid email address."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      showToast("Please fix the validation errors before saving.", "error")
      return
    }

    const saved = recruiterProfileService.updateProfile(editedProfile)
    setProfile(saved)
    setEditedProfile(saved)
    setIsEditing(false)
    setErrors({})
    showToast("Recruiter profile updated successfully ✓", "success")
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setErrors({})
    setIsEditing(false)
  }

  const handleChange = (field: keyof RecruiterProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        setEditedProfile(prev => ({ ...prev, avatar: result }))
        showToast("Profile photo selected. Click 'Save Changes' to persist.", "success")
      }
    }
    reader.readAsDataURL(file)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R"
  }

  return (
    <DashboardShell type="recruiter" userName={profile.fullName.split(" ")[0] || "Recruiter"}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6 pb-16 relative">
        
        {/* TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
                toastType === "success" 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {toastType === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP ACTION HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Recruiter Profile</h1>
            <p className="text-brand-navy/60 mt-1">Manage your recruitment identity, professional details, and company information.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="bg-brand-indigo hover:bg-brand-indigo/90 text-white flex items-center gap-2 shadow-sm"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  className="border-brand-gray/40 text-brand-navy flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-brand-indigo hover:bg-brand-indigo/90 text-white flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* HERO BANNER & AVATAR CARD */}
        <motion.div variants={slideUp}>
          <PremiumCard className="overflow-hidden border border-brand-gray/30 shadow-md">
            <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-brand-indigo via-brand-blue to-brand-navy/80 relative" />
            <PremiumCardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 gap-4">
                
                {/* Avatar with Camera upload trigger */}
                <div className="flex items-end gap-4">
                  <div className="relative group rounded-2xl p-1 bg-white shadow-xl">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gradient-to-br from-brand-indigo/15 to-brand-blue/15 border border-brand-indigo/20 flex items-center justify-center overflow-hidden">
                      {editedProfile.avatar ? (
                        <img src={editedProfile.avatar} alt={editedProfile.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-display font-bold text-brand-indigo">
                          {getInitials(isEditing ? editedProfile.fullName : profile.fullName)}
                        </span>
                      )}
                    </div>

                    {isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="Change profile photo"
                          className="absolute inset-1 rounded-xl bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                        >
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-medium tracking-wide">Upload</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>

                  <div className="pb-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy">
                        {isEditing ? editedProfile.fullName || "Recruiter" : profile.fullName}
                      </h2>
                      <Badge variant="default" className="bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 font-semibold text-xs tracking-wide">
                        RECRUITER
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-brand-navy/70 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-indigo" />
                      {isEditing ? editedProfile.designation || "Designation" : profile.designation}
                    </p>
                  </div>
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-navy/70 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 bg-brand-gray/10 px-3 py-1.5 rounded-lg border border-brand-gray/20 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-brand-indigo" />
                    <span>{isEditing ? editedProfile.company || "Company" : profile.company}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-brand-gray/10 px-3 py-1.5 rounded-lg border border-brand-gray/20 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{isEditing ? editedProfile.location || "Location" : profile.location}</span>
                  </div>
                </div>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: PROFILE DETAILS & BIO */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PERSONAL & PROFESSIONAL INFORMATION */}
            <motion.div variants={slideUp}>
              <SpotlightCard className="glass-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-brand-gray/20">
                  <h3 className="text-lg font-semibold text-brand-navy flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-brand-indigo" /> Professional Information
                  </h3>
                  {isEditing && (
                    <span className="text-xs text-brand-navy/50 font-medium">* Required fields</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Full Name {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <div>
                        <Input
                          value={editedProfile.fullName}
                          onChange={e => handleChange("fullName", e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className={errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.fullName && (
                          <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20">
                        {profile.fullName || "—"}
                      </p>
                    )}
                  </div>

                  {/* Job Title / Designation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Designation / Role {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <div>
                        <Input
                          value={editedProfile.designation}
                          onChange={e => handleChange("designation", e.target.value)}
                          placeholder="e.g. Senior Talent Acquisition Specialist"
                          className={errors.designation ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.designation && (
                          <p className="text-xs text-red-500 mt-1">{errors.designation}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20">
                        {profile.designation || "—"}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Company Name {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <div>
                        <Input
                          value={editedProfile.company}
                          onChange={e => handleChange("company", e.target.value)}
                          placeholder="e.g. HireSmart Technologies"
                          className={errors.company ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.company && (
                          <p className="text-xs text-red-500 mt-1">{errors.company}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-brand-indigo/60" />
                        {profile.company || "—"}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Email Address {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <div>
                        <Input
                          type="email"
                          value={editedProfile.email}
                          onChange={e => handleChange("email", e.target.value)}
                          placeholder="e.g. rahul@hiresmart.ai"
                          className={errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-indigo/60" />
                        {profile.email || "—"}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={e => handleChange("phone", e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand-indigo/60" />
                        {profile.phone || "—"}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-brand-navy/80 uppercase tracking-wider">
                      Location / Region
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.location}
                        onChange={e => handleChange("location", e.target.value)}
                        placeholder="e.g. Bangalore, India"
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy bg-brand-light/60 p-2.5 rounded-lg border border-brand-gray/20 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-indigo/60" />
                        {profile.location || "—"}
                      </p>
                    )}
                  </div>

                </div>
              </SpotlightCard>
            </motion.div>

            {/* ABOUT / PROFESSIONAL BIO */}
            <motion.div variants={slideUp}>
              <SpotlightCard className="glass-card p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-brand-gray/20">
                  <h3 className="text-lg font-semibold text-brand-navy">About & Hiring Focus</h3>
                  <p className="text-xs text-brand-navy/60 mt-0.5">Brief description about your recruiting specialization and candidate outreach.</p>
                </div>

                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editedProfile.about}
                    onChange={e => handleChange("about", e.target.value)}
                    placeholder="Describe your role, candidate focus, engineering or leadership talent goals..."
                    className="w-full rounded-md border border-brand-gray bg-white p-3 text-sm text-brand-navy placeholder:text-brand-navy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo transition-colors"
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-brand-navy/80 bg-brand-light/40 p-4 rounded-xl border border-brand-gray/20 whitespace-pre-wrap">
                    {profile.about || "No description provided yet. Click 'Edit Profile' to add your bio."}
                  </p>
                )}
              </SpotlightCard>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: RECRUITER STATS & ORGANIZATION */}
          <div className="space-y-6">
            
            {/* ORGANIZATION CARD */}
            <motion.div variants={slideUp}>
              <PremiumCard className="border border-brand-gray/30 shadow-sm">
                <PremiumCardHeader className="pb-3 border-b border-brand-gray/20">
                  <PremiumCardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-indigo" /> Organization Details
                  </PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent className="pt-4 space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-brand-navy/50 uppercase font-semibold block">Company</span>
                    <span className="font-semibold text-brand-navy">{profile.company}</span>
                  </div>
                  <div>
                    <span className="text-xs text-brand-navy/50 uppercase font-semibold block">Industry</span>
                    <span className="text-brand-navy/80">Information Technology & AI</span>
                  </div>
                  <div>
                    <span className="text-xs text-brand-navy/50 uppercase font-semibold block">Headquarters</span>
                    <span className="text-brand-navy/80">{profile.location || "Bangalore, India"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-brand-navy/50 uppercase font-semibold block">Recruitment Domain</span>
                    <span className="text-brand-navy/80">Software Engineering, ML & Product</span>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* ACTIVITY & PIPELINE OVERVIEW */}
            <motion.div variants={slideUp}>
              <PremiumCard className="border border-brand-gray/30 shadow-sm">
                <PremiumCardHeader className="pb-3 border-b border-brand-gray/20">
                  <PremiumCardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-indigo" /> Hiring Activity
                  </PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent className="pt-4 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-light/60 border border-brand-gray/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-brand-navy/60 font-medium">Active Jobs</div>
                        <div className="text-lg font-bold text-brand-navy">{activeJobsCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-light/60 border border-brand-gray/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-brand-navy/60 font-medium">Pipeline Candidates</div>
                        <div className="text-lg font-bold text-brand-navy">{pipelineCount}</div>
                      </div>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

          </div>

        </div>

      </motion.div>
    </DashboardShell>
  )
}
