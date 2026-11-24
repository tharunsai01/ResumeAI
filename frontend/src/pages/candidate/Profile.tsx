import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { Input } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { profileService } from "../../services/profileService"
import { authService } from "../../services/authService"
import type { CandidateProfile, Education, Experience } from "../../data/mockProfile"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import { 
  Camera, CheckCircle2, MapPin, Mail, 
  Phone, Plus, Trash2, Eye, Sparkles, Check, Pencil, AlertCircle
} from "lucide-react"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function CandidateProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("Profile updated successfully ✓")

  const [profile, setProfile] = React.useState<CandidateProfile>(() => profileService.getCandidateProfile())
  const [editedProfile, setEditedProfile] = React.useState<CandidateProfile>(() => profileService.getCandidateProfile())

  // Skill Modal State
  const [isSkillModalOpen, setIsSkillModalOpen] = React.useState(false)
  const [editingSkillId, setEditingSkillId] = React.useState<string | null>(null)
  const [skillName, setSkillName] = React.useState("")
  const [skillLevel, setSkillLevel] = React.useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate")
  const [skillError, setSkillError] = React.useState<string | null>(null)

  // Experience Modal State
  const [isExpModalOpen, setIsExpModalOpen] = React.useState(false)
  const [editingExpId, setEditingExpId] = React.useState<string | null>(null)
  const [expJobTitle, setExpJobTitle] = React.useState("")
  const [expCompany, setExpCompany] = React.useState("")
  const [expLocation, setExpLocation] = React.useState("")
  const [expStartDate, setExpStartDate] = React.useState("")
  const [expEndDate, setExpEndDate] = React.useState("")
  const [expCurrentlyWorking, setExpCurrentlyWorking] = React.useState(false)
  const [expDescription, setExpDescription] = React.useState("")
  const [expError, setExpError] = React.useState<string | null>(null)

  // Education Modal State
  const [isEduModalOpen, setIsEduModalOpen] = React.useState(false)
  const [editingEduId, setEditingEduId] = React.useState<string | null>(null)
  const [eduDegree, setEduDegree] = React.useState("")
  const [eduFieldOfStudy, setEduFieldOfStudy] = React.useState("")
  const [eduInstitution, setEduInstitution] = React.useState("")
  const [eduStartYear, setEduStartYear] = React.useState("")
  const [eduEndYear, setEduEndYear] = React.useState("")
  const [eduGrade, setEduGrade] = React.useState("")
  const [eduError, setEduError] = React.useState<string | null>(null)

  // Interest Modal State
  const [isInterestModalOpen, setIsInterestModalOpen] = React.useState(false)
  const [interestName, setInterestName] = React.useState("")
  const [interestError, setInterestError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
    profileService.fetchLiveProfile().then(liveProfile => {
      if (isMounted && liveProfile) {
        setProfile(liveProfile)
        if (!isEditing) {
          setEditedProfile(liveProfile)
        }
      }
    }).catch(err => {
      console.warn("Could not fetch live profile:", err)
    })
    return () => { isMounted = false }
  }, [])

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = profileService.getCandidateProfile()
      setProfile(updated)
      if (!isEditing) {
        setEditedProfile(updated)
      }
    }
    window.addEventListener("hiresmart_profile_updated", handleProfileUpdate)
    return () => window.removeEventListener("hiresmart_profile_updated", handleProfileUpdate)
  }, [isEditing])

  const triggerToast = (msg?: string) => {
    setToastMessage(msg || "Profile updated successfully ✓")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSave = () => {
    if (editedProfile) {
      const updated = profileService.updateCandidateProfile(editedProfile)
      setProfile(updated)
      setEditedProfile(updated)
      setIsEditing(false)

      // Sync name in session if modified
      const currentSession = authService.getCurrentUser()
      if (currentSession && currentSession.name !== updated.fullName) {
        localStorage.setItem("hiresmart_session", JSON.stringify({ ...currentSession, name: updated.fullName }))
        window.dispatchEvent(new Event('hiresmart_auth_changed'))
      }

      triggerToast("Profile updated successfully ✓")
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleChange = (field: keyof CandidateProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (section: keyof CandidateProfile, field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }))
  }

  // --- SKILL ACTIONS ---
  const handleOpenAddSkill = () => {
    setEditingSkillId(null)
    setSkillName("")
    setSkillLevel("Intermediate")
    setSkillError(null)
    setIsSkillModalOpen(true)
  }

  const handleOpenEditSkill = (skill: { id: string; name: string; level: any }) => {
    setEditingSkillId(skill.id)
    setSkillName(skill.name)
    setSkillLevel(skill.level)
    setSkillError(null)
    setIsSkillModalOpen(true)
  }

  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false)
    setEditingSkillId(null)
    setSkillName("")
    setSkillError(null)
  }

  const handleSaveSkill = () => {
    const cleanName = skillName.trim()
    if (!cleanName) {
      setSkillError("Skill name is required.")
      return
    }

    try {
      if (editingSkillId) {
        const updated = profileService.updateSkill({
          id: editingSkillId,
          name: cleanName,
          level: skillLevel,
          category: "Programming"
        })
        setProfile(updated)
        setEditedProfile(updated)
        triggerToast(`Updated skill "${cleanName}" ✓`)
      } else {
        const updated = profileService.addSkill({
          id: `s_${Date.now()}`,
          name: cleanName,
          level: skillLevel,
          category: "Programming"
        })
        setProfile(updated)
        setEditedProfile(updated)
        triggerToast(`Added skill "${cleanName}" ✓`)
      }
      handleCloseSkillModal()
    } catch (err: any) {
      setSkillError(err.message || "Failed to save skill.")
    }
  }

  const handleDeleteSkill = (skillId: string) => {
    const updated = profileService.removeSkill(skillId)
    setProfile(updated)
    setEditedProfile(updated)
    triggerToast("Skill removed successfully ✓")
  }

  // --- EXPERIENCE ACTIONS ---
  const handleOpenAddExp = () => {
    setEditingExpId(null)
    setExpJobTitle("")
    setExpCompany("")
    setExpLocation("")
    setExpStartDate("")
    setExpEndDate("")
    setExpCurrentlyWorking(false)
    setExpDescription("")
    setExpError(null)
    setIsExpModalOpen(true)
  }

  const handleOpenEditExp = (exp: Experience) => {
    setEditingExpId(exp.id)
    setExpJobTitle(exp.jobTitle)
    setExpCompany(exp.company)
    setExpLocation(exp.location || "")
    setExpStartDate(exp.startDate)
    setExpEndDate(exp.endDate === "Present" ? "" : exp.endDate)
    setExpCurrentlyWorking(exp.currentlyWorking || exp.endDate === "Present")
    setExpDescription(exp.description || "")
    setExpError(null)
    setIsExpModalOpen(true)
  }

  const handleCloseExpModal = () => {
    setIsExpModalOpen(false)
    setEditingExpId(null)
    setExpError(null)
  }

  const handleSaveExp = () => {
    if (!expJobTitle.trim()) {
      setExpError("Job Title is required.")
      return
    }
    if (!expCompany.trim()) {
      setExpError("Company Name is required.")
      return
    }
    if (!expStartDate.trim()) {
      setExpError("Start Date is required.")
      return
    }

    const expData: Experience = {
      id: editingExpId || `exp_${Date.now()}`,
      jobTitle: expJobTitle.trim(),
      company: expCompany.trim(),
      location: expLocation.trim() || "Remote",
      startDate: expStartDate.trim(),
      endDate: expCurrentlyWorking ? "Present" : (expEndDate.trim() || "Present"),
      currentlyWorking: expCurrentlyWorking,
      description: expDescription.trim()
    }

    try {
      let updated: CandidateProfile
      if (editingExpId) {
        updated = profileService.updateExperience(expData)
        triggerToast("Experience updated successfully ✓")
      } else {
        updated = profileService.addExperience(expData)
        triggerToast("Experience added successfully ✓")
      }
      setProfile(updated)
      setEditedProfile(updated)
      handleCloseExpModal()
    } catch (err: any) {
      setExpError(err.message || "Failed to save experience.")
    }
  }

  const handleDeleteExp = (expId: string) => {
    const updated = profileService.removeExperience(expId)
    setProfile(updated)
    setEditedProfile(updated)
    triggerToast("Experience removed ✓")
  }

  // --- EDUCATION ACTIONS ---
  const handleOpenAddEdu = () => {
    setEditingEduId(null)
    setEduDegree("")
    setEduFieldOfStudy("")
    setEduInstitution("")
    setEduStartYear("")
    setEduEndYear("")
    setEduGrade("")
    setEduError(null)
    setIsEduModalOpen(true)
  }

  const handleOpenEditEdu = (edu: Education) => {
    setEditingEduId(edu.id)
    setEduDegree(edu.degree)
    setEduFieldOfStudy(edu.fieldOfStudy)
    setEduInstitution(edu.institution)
    setEduStartYear(edu.startYear)
    setEduEndYear(edu.endYear)
    setEduGrade(edu.grade || "")
    setEduError(null)
    setIsEduModalOpen(true)
  }

  const handleCloseEduModal = () => {
    setIsEduModalOpen(false)
    setEditingEduId(null)
    setEduError(null)
  }

  const handleSaveEdu = () => {
    if (!eduDegree.trim()) {
      setEduError("Degree is required.")
      return
    }
    if (!eduInstitution.trim()) {
      setEduError("Institution is required.")
      return
    }
    if (!eduStartYear.trim()) {
      setEduError("Start Year is required.")
      return
    }
    if (!eduEndYear.trim()) {
      setEduError("End Year is required.")
      return
    }

    const eduData: Education = {
      id: editingEduId || `edu_${Date.now()}`,
      degree: eduDegree.trim(),
      fieldOfStudy: eduFieldOfStudy.trim() || "General",
      institution: eduInstitution.trim(),
      startYear: eduStartYear.trim(),
      endYear: eduEndYear.trim(),
      grade: eduGrade.trim()
    }

    try {
      let updated: CandidateProfile
      if (editingEduId) {
        updated = profileService.updateEducation(eduData)
        triggerToast("Education updated successfully ✓")
      } else {
        updated = profileService.addEducation(eduData)
        triggerToast("Education added successfully ✓")
      }
      setProfile(updated)
      setEditedProfile(updated)
      handleCloseEduModal()
    } catch (err: any) {
      setEduError(err.message || "Failed to save education.")
    }
  }

  const handleDeleteEdu = (eduId: string) => {
    const updated = profileService.removeEducation(eduId)
    setProfile(updated)
    setEditedProfile(updated)
    triggerToast("Education removed ✓")
  }

  // --- CAREER INTERESTS ACTIONS ---
  const handleOpenAddInterest = () => {
    setInterestName("")
    setInterestError(null)
    setIsInterestModalOpen(true)
  }

  const handleCloseInterestModal = () => {
    setIsInterestModalOpen(false)
    setInterestName("")
    setInterestError(null)
  }

  const handleSaveInterest = () => {
    const clean = interestName.trim()
    if (!clean) {
      setInterestError("Interest cannot be empty.")
      return
    }

    try {
      const updated = profileService.addCareerInterest(clean)
      setProfile(updated)
      setEditedProfile(updated)
      triggerToast(`Added "${clean}" to career interests ✓`)
      handleCloseInterestModal()
    } catch (err: any) {
      setInterestError(err.message || "Failed to add interest.")
    }
  }

  const handleDeleteInterest = (interest: string) => {
    const updated = profileService.removeCareerInterest(interest)
    setProfile(updated)
    setEditedProfile(updated)
    triggerToast("Interest removed ✓")
  }

  // Profile completion breakdowns
  const completionItems = [
    { label: "Basic Information", done: !!profile.fullName && !!profile.email && !!profile.phone && !!profile.location },
    { label: "Resume Uploaded", done: true },
    { label: "Skills Added", done: profile.skills.length > 0 },
    { label: "Education Added", done: profile.education.length > 0 },
    { label: "Experience Added", done: profile.experience.length > 0 },
    { label: "Career Preferences", done: profile.careerPreferences.preferredJobTitles.length > 0 }
  ]

  return (
    <DashboardShell type="candidate" userName={profile.fullName.split(' ')[0]}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-20">
        
        {/* PAGE HEADER */}
        <MotionSpotlightCard variants={slideUp} className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 sm:p-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-semibold text-brand-navy">My Profile</h1>
            <p className="text-sm sm:text-base text-brand-navy/60">Manage your professional profile and career preferences.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-indigo bg-brand-indigo/10 px-3 sm:px-4 py-2 rounded-lg shrink-0">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile Completion: {profile.profileCompletion}%
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 text-sm font-semibold rounded-lg shadow-sm shrink-0">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button onClick={handleCancel} className="btn-interactive btn-secondary rounded-lg px-4 py-2 text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-interactive btn-primary bg-brand-indigo text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-sm">
                  Save Changes
                </button>
              </div>
            )}
            <button onClick={() => navigate("/candidate/profile/preview")} className="btn-interactive btn-secondary px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 shrink-0">
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </MotionSpotlightCard>

        {/* Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-semantic-success text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HERO */}
            <motion.div variants={slideUp}>
              <PremiumCard className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-brand-indigo to-brand-blue relative" />
                <PremiumCardContent className="px-4 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-16 mb-4">
                    <div className="relative group cursor-pointer rounded-full overflow-hidden border-4 border-white shadow-lg w-24 h-24 sm:w-32 sm:h-32 bg-brand-light flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-brand-navy/30 font-display font-bold">{profile.fullName.charAt(0)}</span>
                      )}
                      {isEditing && (
                        <div className="absolute inset-0 bg-brand-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    {editedProfile.openToWork && (
                      <Badge variant="success" className="mt-4 sm:mt-0 font-medium tracking-wide">
                        OPEN TO OPPORTUNITIES
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      {isEditing ? (
                        <Input value={editedProfile.fullName} onChange={e => handleChange("fullName", e.target.value)} className="text-2xl font-bold font-display max-w-sm mb-2" />
                      ) : (
                        <h2 className="text-2xl font-bold font-display text-brand-navy">{profile.fullName}</h2>
                      )}
                      
                      {isEditing ? (
                        <Input value={editedProfile.currentRole} onChange={e => handleChange("currentRole", e.target.value)} className="max-w-sm" />
                      ) : (
                        <p className="text-lg text-brand-navy/80 font-medium">{profile.currentRole}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-brand-navy/60">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {isEditing ? <Input value={editedProfile.email} onChange={e => handleChange("email", e.target.value)} className="h-7 text-xs" /> : profile.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {isEditing ? <Input value={editedProfile.location} onChange={e => handleChange("location", e.target.value)} className="h-7 text-xs" /> : profile.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {isEditing ? <Input value={editedProfile.phone} onChange={e => handleChange("phone", e.target.value)} className="h-7 text-xs" /> : profile.phone}
                      </div>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* SUMMARY */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader>
                  <PremiumCardTitle>Professional Summary</PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent>
                  {isEditing ? (
                    <div>
                      <textarea 
                        value={editedProfile.summary} 
                        onChange={e => handleChange("summary", e.target.value)}
                        maxLength={500}
                        className="w-full h-32 p-3 text-sm rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 bg-white text-brand-navy resize-none"
                      />
                      <div className="text-xs text-right text-brand-navy/40 mt-1">
                        {editedProfile.summary.length} / 500
                      </div>
                    </div>
                  ) : (
                    <p className="text-brand-navy/80 text-sm leading-relaxed">{profile.summary}</p>
                  )}
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* SKILLS */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader className="flex flex-row items-center justify-between">
                  <PremiumCardTitle>Skills ({profile.skills.length})</PremiumCardTitle>
                  <button onClick={handleOpenAddSkill} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </button>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length === 0 ? (
                      <p className="text-sm text-brand-navy/40 italic">No skills added yet. Click "+ Add Skill" to add your skills.</p>
                    ) : (
                      profile.skills.map(skill => (
                        <div key={skill.id} className="group flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-lg border border-brand-gray/50">
                          <span className="text-sm font-semibold text-brand-navy">{skill.name}</span>
                          <span className="text-xs text-brand-navy/50 px-1.5 py-0.5 bg-white rounded-md border border-brand-gray/50">{skill.level}</span>
                          <div className="flex items-center gap-1 ml-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenEditSkill(skill)} 
                              className="text-brand-navy/40 hover:text-brand-indigo p-0.5"
                              title="Edit Skill"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSkill(skill.id)} 
                              className="text-brand-navy/40 hover:text-semantic-error p-0.5"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* EXPERIENCE */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader className="flex flex-row items-center justify-between">
                  <PremiumCardTitle>Experience ({profile.experience.length})</PremiumCardTitle>
                  <button onClick={handleOpenAddExp} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Experience
                  </button>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="space-y-6">
                    {profile.experience.length === 0 ? (
                      <p className="text-sm text-brand-navy/40 italic">No experience added yet. Click "+ Add Experience" to record work history.</p>
                    ) : (
                      profile.experience.map(exp => (
                        <div key={exp.id} className="relative pl-6 border-l border-brand-gray/80 group">
                          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-indigo ring-4 ring-white" />
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="text-lg font-semibold text-brand-navy">{exp.jobTitle}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-brand-navy/60 mt-1 mb-2">
                                <span className="font-medium text-brand-indigo">{exp.company}</span>
                                <span>•</span>
                                <span>{exp.startDate} – {exp.endDate}</span>
                                <span>•</span>
                                <span>{exp.location}</span>
                              </div>
                              <p className="text-sm text-brand-navy/70 leading-relaxed whitespace-pre-line">{exp.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={() => handleOpenEditExp(exp)} 
                                className="btn-interactive p-1.5 text-brand-indigo hover:bg-brand-indigo/10 rounded-md transition-colors"
                                title="Edit Experience"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteExp(exp.id)} 
                                className="btn-interactive p-1.5 text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors"
                                title="Delete Experience"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* EDUCATION */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader className="flex flex-row items-center justify-between">
                  <PremiumCardTitle>Education ({profile.education.length})</PremiumCardTitle>
                  <button onClick={handleOpenAddEdu} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Education
                  </button>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="space-y-4">
                    {profile.education.length === 0 ? (
                      <p className="text-sm text-brand-navy/40 italic">No education records added yet. Click "+ Add Education" to add details.</p>
                    ) : (
                      profile.education.map(edu => (
                        <div key={edu.id} className="flex justify-between items-start bg-brand-light p-4 rounded-xl border border-brand-gray/50 group">
                          <div className="flex-1 pr-4">
                            <h4 className="font-semibold text-brand-navy">{edu.degree}</h4>
                            <p className="text-sm text-brand-indigo font-medium mt-1">{edu.fieldOfStudy} • {edu.institution}</p>
                            <p className="text-sm text-brand-navy/60 mt-1">{edu.startYear} – {edu.endYear} {edu.grade && `• ${edu.grade}`}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => handleOpenEditEdu(edu)} 
                              className="btn-interactive p-1.5 text-brand-indigo hover:bg-brand-indigo/10 rounded-md transition-colors"
                              title="Edit Education"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEdu(edu.id)} 
                              className="btn-interactive p-1.5 text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors"
                              title="Delete Education"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* PROFILE COMPLETION */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader>
                  <PremiumCardTitle>Profile Completion</PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-brand-gray/30" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-semantic-success" strokeWidth="3" strokeDasharray={`${profile.profileCompletion}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <span className="absolute text-sm font-bold text-brand-navy">{profile.profileCompletion}%</span>
                    </div>
                    <p className="text-sm text-brand-navy/60">Complete your profile to improve job recommendations.</p>
                  </div>
                  <ul className="space-y-3">
                    {completionItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-brand-gray/80" />
                        )}
                        <span className={item.done ? "text-brand-navy/80" : "text-brand-navy/50"}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* AI PROFILE INSIGHT */}
            <motion.div variants={slideUp}>
              <PremiumCard className="border-semantic-warning/30 bg-semantic-warning/5">
                <PremiumCardHeader className="pb-3 border-b border-semantic-warning/10">
                  <div className="flex items-center justify-between">
                    <PremiumCardTitle className="flex items-center gap-2 text-semantic-warning-dark">
                      <Sparkles className="w-5 h-5" /> AI Profile Insight
                    </PremiumCardTitle>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white px-2 py-1 rounded border border-semantic-warning/20 text-semantic-warning-dark">AI-Generated</span>
                  </div>
                </PremiumCardHeader>
                <PremiumCardContent className="pt-4 text-brand-navy/80 text-sm leading-relaxed">
                  Your profile is well positioned for <strong className="font-semibold text-brand-navy">Software Engineer</strong> and <strong className="font-semibold text-brand-navy">Full Stack Developer</strong> roles. Adding more cloud experience and completing your career preferences could improve the relevance of your recommended jobs.
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* CAREER PREFERENCES */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader>
                  <PremiumCardTitle>Career Preferences</PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Preferred Roles</span>
                    {isEditing ? (
                      <Input 
                        value={editedProfile.careerPreferences.preferredJobTitles.join(", ")} 
                        onChange={e => handleNestedChange("careerPreferences", "preferredJobTitles", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                        placeholder="e.g. Software Engineer, Frontend Developer"
                        className="h-8 text-sm" 
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredJobTitles.join(", ") || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Locations</span>
                    {isEditing ? (
                      <Input 
                        value={editedProfile.careerPreferences.preferredLocations.join(", ")} 
                        onChange={e => handleNestedChange("careerPreferences", "preferredLocations", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                        placeholder="e.g. Bangalore, Hyderabad, Remote"
                        className="h-8 text-sm" 
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredLocations.join(", ") || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Work Mode</span>
                    {isEditing ? (
                      <Input 
                        value={editedProfile.careerPreferences.preferredWorkMode.join(", ")} 
                        onChange={e => handleNestedChange("careerPreferences", "preferredWorkMode", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                        placeholder="e.g. Remote, Hybrid, On-site"
                        className="h-8 text-sm" 
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredWorkMode.join(", ") || "Not set"}</p>
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Expected Salary</span>
                    {isEditing ? (
                      <Input 
                        value={editedProfile.careerPreferences.expectedSalary} 
                        onChange={e => handleNestedChange("careerPreferences", "expectedSalary", e.target.value)} 
                        className="h-8 text-sm" 
                        placeholder="e.g. ₹6–10 LPA" 
                      />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.expectedSalary || "Not set"}</p>
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* CAREER INTERESTS */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader className="flex flex-row items-center justify-between">
                  <PremiumCardTitle>Career Interests ({profile.careerInterests.length})</PremiumCardTitle>
                  <button onClick={handleOpenAddInterest} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </PremiumCardHeader>
                <PremiumCardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.careerInterests.length === 0 ? (
                      <p className="text-sm text-brand-navy/40 italic">No interests added yet.</p>
                    ) : (
                      profile.careerInterests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20 flex items-center gap-1.5 py-1 px-2.5">
                          <span>{interest}</span>
                          <button 
                            onClick={() => handleDeleteInterest(interest)} 
                            className="text-brand-indigo/60 hover:text-semantic-error transition-colors ml-1 font-bold"
                            title="Remove Interest"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

            {/* VISIBILITY */}
            <motion.div variants={slideUp}>
              <PremiumCard>
                <PremiumCardHeader>
                  <PremiumCardTitle>Profile Visibility</PremiumCardTitle>
                </PremiumCardHeader>
                <PremiumCardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-navy">Open to Opportunities</h4>
                      <p className="text-xs text-brand-navy/50 mt-0.5">Let recruiters know you're looking.</p>
                    </div>
                    <button 
                      disabled={!isEditing}
                      onClick={() => handleChange("openToWork", !editedProfile.openToWork)}
                      className={cn("w-11 h-6 rounded-full transition-colors relative flex items-center", (isEditing ? editedProfile.openToWork : profile.openToWork) ? "bg-semantic-success" : "bg-brand-gray/80")}
                    >
                      <motion.div 
                        layout 
                        className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"
                        animate={{ x: (isEditing ? editedProfile.openToWork : profile.openToWork) ? 20 : 0 }}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-navy">Visibility</h4>
                      <p className="text-xs text-brand-navy/50 mt-0.5">Who can see your profile.</p>
                    </div>
                    <select 
                      disabled={!isEditing}
                      value={isEditing ? editedProfile.visibility : profile.visibility}
                      onChange={e => handleChange("visibility", e.target.value)}
                      className="text-sm border border-brand-gray/50 rounded-lg p-1.5 focus:outline-none focus:border-brand-indigo bg-white text-brand-navy"
                    >
                      <option>Visible to Recruiters</option>
                      <option>Private</option>
                    </select>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Add/Edit Skill Modal */}
      <Modal isOpen={isSkillModalOpen} onClose={handleCloseSkillModal} title={editingSkillId ? "Edit Skill" : "Add Skill"}>
        <div className="space-y-4 mt-4">
          {skillError && (
            <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-center gap-2 text-semantic-error text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{skillError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Skill Name *</label>
            <Input 
              placeholder="e.g. Docker, React, Python" 
              value={skillName}
              onChange={e => { setSkillName(e.target.value); setSkillError(null); }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Proficiency Level</label>
            <select 
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-brand-gray/30">
            <button onClick={handleCloseSkillModal} className="btn-interactive btn-ghost px-4 py-2 font-semibold text-sm rounded-lg w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveSkill} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 font-semibold text-sm rounded-lg shadow-sm w-full sm:w-auto">
              {editingSkillId ? "Update Skill" : "Save Skill"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Experience Modal */}
      <Modal isOpen={isExpModalOpen} onClose={handleCloseExpModal} title={editingExpId ? "Edit Experience" : "Add Experience"}>
        <div className="space-y-4 mt-4">
          {expError && (
            <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-center gap-2 text-semantic-error text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{expError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Job Title *</label>
            <Input placeholder="e.g. Software Engineer" value={expJobTitle} onChange={e => { setExpJobTitle(e.target.value); setExpError(null); }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Company *</label>
            <Input placeholder="e.g. Google, TCS" value={expCompany} onChange={e => { setExpCompany(e.target.value); setExpError(null); }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Location</label>
            <Input placeholder="e.g. Bangalore, India / Remote" value={expLocation} onChange={e => setExpLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Start Date *</label>
              <Input placeholder="e.g. Jun 2022" value={expStartDate} onChange={e => { setExpStartDate(e.target.value); setExpError(null); }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">End Date</label>
              <Input placeholder="e.g. Aug 2023" value={expCurrentlyWorking ? "Present" : expEndDate} disabled={expCurrentlyWorking} onChange={e => setExpEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="expCurrentlyWorking" 
              checked={expCurrentlyWorking} 
              onChange={e => setExpCurrentlyWorking(e.target.checked)}
              className="rounded border-brand-gray/50 text-brand-indigo focus:ring-brand-indigo/50"
            />
            <label htmlFor="expCurrentlyWorking" className="text-sm text-brand-navy/80 font-medium">I currently work here</label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Description</label>
            <textarea 
              placeholder="Key responsibilities and achievements..." 
              value={expDescription} 
              onChange={e => setExpDescription(e.target.value)}
              className="w-full h-24 p-3 text-sm rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 bg-white text-brand-navy resize-none" 
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-brand-gray/30">
            <button onClick={handleCloseExpModal} className="btn-interactive btn-ghost px-4 py-2 font-semibold text-sm rounded-lg w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveExp} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 font-semibold text-sm rounded-lg shadow-sm w-full sm:w-auto">
              {editingExpId ? "Update Experience" : "Save Experience"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Education Modal */}
      <Modal isOpen={isEduModalOpen} onClose={handleCloseEduModal} title={editingEduId ? "Edit Education" : "Add Education"}>
        <div className="space-y-4 mt-4">
          {eduError && (
            <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-center gap-2 text-semantic-error text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{eduError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Degree *</label>
            <Input placeholder="e.g. Bachelor of Engineering" value={eduDegree} onChange={e => { setEduDegree(e.target.value); setEduError(null); }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Field of Study *</label>
            <Input placeholder="e.g. Computer Science and Engineering" value={eduFieldOfStudy} onChange={e => { setEduFieldOfStudy(e.target.value); setEduError(null); }} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Institution *</label>
            <Input placeholder="e.g. XYZ University" value={eduInstitution} onChange={e => { setEduInstitution(e.target.value); setEduError(null); }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Start Year *</label>
              <Input placeholder="e.g. 2019" value={eduStartYear} onChange={e => { setEduStartYear(e.target.value); setEduError(null); }} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">End Year *</label>
              <Input placeholder="e.g. 2023" value={eduEndYear} onChange={e => { setEduEndYear(e.target.value); setEduError(null); }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Grade / CGPA (Optional)</label>
            <Input placeholder="e.g. 8.5 CGPA or 85%" value={eduGrade} onChange={e => setEduGrade(e.target.value)} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-brand-gray/30">
            <button onClick={handleCloseEduModal} className="btn-interactive btn-ghost px-4 py-2 font-semibold text-sm rounded-lg w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveEdu} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 font-semibold text-sm rounded-lg shadow-sm w-full sm:w-auto">
              {editingEduId ? "Update Education" : "Save Education"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Career Interest Modal */}
      <Modal isOpen={isInterestModalOpen} onClose={handleCloseInterestModal} title="Add Career Interest">
        <div className="space-y-4 mt-4">
          {interestError && (
            <div className="p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-center gap-2 text-semantic-error text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{interestError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-1.5">Interest *</label>
            <Input 
              placeholder="e.g. Artificial Intelligence, Cloud Computing" 
              value={interestName} 
              onChange={e => { setInterestName(e.target.value); setInterestError(null); }} 
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-brand-gray/30">
            <button onClick={handleCloseInterestModal} className="btn-interactive btn-ghost px-4 py-2 font-semibold text-sm rounded-lg w-full sm:w-auto">Cancel</button>
            <button onClick={handleSaveInterest} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 font-semibold text-sm rounded-lg shadow-sm w-full sm:w-auto">
              Save Interest
            </button>
          </div>
        </div>
      </Modal>

    </DashboardShell>
  )
}
