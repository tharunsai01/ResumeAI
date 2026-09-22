import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"
import { Modal } from "../../components/ui/Modal"
import { profileService } from "../../services/profileService"
import type { CandidateProfile } from "../../data/mockProfile"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import { 
  Camera, CheckCircle2, MapPin, Mail, 
  Phone, Plus, Trash2, Eye, Sparkles, Check
} from "lucide-react"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function CandidateProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = React.useState(false)
  const [showToast, setShowToast] = React.useState(false)

  // Modals state
  const [isSkillModalOpen, setIsSkillModalOpen] = React.useState(false)
  const [isExpModalOpen, setIsExpModalOpen] = React.useState(false)
  const [isEduModalOpen, setIsEduModalOpen] = React.useState(false)
  const [isInterestModalOpen, setIsInterestModalOpen] = React.useState(false)
  const [profile, setProfile] = React.useState<CandidateProfile | null>(() => profileService.getCandidateProfile())
  const [editedProfile, setEditedProfile] = React.useState<CandidateProfile | null>(() => profileService.getCandidateProfile())

  React.useEffect(() => {
    // If we need to listen for profile changes, we could do it here
  }, [])

  const handleSave = () => {
    if (editedProfile) {
      const updated = profileService.updateCandidateProfile(editedProfile)
      setProfile(updated)
      setEditedProfile(updated)
      setIsEditing(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  if (!profile || !editedProfile) return null

  // Profile completion breakdowns (mocked calculations based on user instructions)
  const completionItems = [
    { label: "Basic Information", done: !!profile.fullName && !!profile.email && !!profile.phone && !!profile.location },
    { label: "Resume Uploaded", done: true }, // Assumed true for now
    { label: "Skills Added", done: profile.skills.length > 0 },
    { label: "Education Added", done: profile.education.length > 0 },
    { label: "Experience Added", done: profile.experience.length > 0 },
    { label: "Career Preferences", done: profile.careerPreferences.preferredJobTitles.length > 0 }
  ]

  const handleChange = (field: keyof CandidateProfile, value: any) => {
    setEditedProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleNestedChange = (section: keyof CandidateProfile, field: string, value: any) => {
    setEditedProfile(prev => {
      if (!prev) return null
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value
        }
      }
    })
  }

  return (
    <DashboardShell type="candidate" userName={profile.fullName.split(' ')[0]}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-20">
        
        {/* PAGE HEADER */}
        <MotionSpotlightCard variants={slideUp} className="glass-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
          <div>
            <h1 className="text-2xl font-display font-semibold text-brand-navy">My Profile</h1>
            <p className="text-brand-navy/60">Manage your professional profile and career preferences.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-indigo bg-brand-indigo/10 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Profile Completion: {profile.profileCompletion}%
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-interactive btn-primary bg-brand-navy px-4 py-2 text-sm font-semibold rounded-lg shadow-sm">
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn-interactive btn-secondary rounded-lg px-4 py-2 text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-interactive btn-secondary px-4 py-2 text-sm font-semibold rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            )}
            <button onClick={() => navigate("/candidate/profile/preview")} className="btn-interactive btn-secondary px-4 py-2 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2">
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
              <span className="font-medium">Profile updated successfully ✓</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HERO */}
            <motion.div variants={slideUp}>
              <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-brand-indigo to-brand-blue relative" />
                <CardContent className="px-8 pb-8 pt-0 relative">
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
                </CardContent>
              </Card>
            </motion.div>

            {/* SUMMARY */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* SKILLS SUMMARY */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Skills</CardTitle>
                  <button onClick={() => setIsSkillModalOpen(true)} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <div key={skill.id} className="flex items-center gap-2 px-3 py-1.5 bg-brand-light rounded-lg border border-brand-gray/50">
                        <span className="text-sm font-semibold text-brand-navy">{skill.name}</span>
                        <span className="text-xs text-brand-navy/50 px-1.5 py-0.5 bg-white rounded-md border border-brand-gray/50">{skill.level}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* EXPERIENCE */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Experience</CardTitle>
                  <button onClick={() => setIsExpModalOpen(true)} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Experience
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {profile.experience.map(exp => (
                      <div key={exp.id} className="relative pl-6 border-l border-brand-gray/80">
                        <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-indigo ring-4 ring-white" />
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-brand-navy">{exp.jobTitle}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-brand-navy/60 mt-1 mb-2">
                              <span className="font-medium text-brand-indigo">{exp.company}</span>
                              <span>•</span>
                              <span>{exp.startDate} – {exp.endDate}</span>
                              <span>•</span>
                              <span>{exp.location}</span>
                            </div>
                            <p className="text-sm text-brand-navy/70 leading-relaxed">{exp.description}</p>
                          </div>
                          {isEditing && (
                            <div className="flex gap-2">
                              <button onClick={() => profileService.removeExperience(exp.id)} className="btn-interactive p-1.5 text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* EDUCATION */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  <button onClick={() => setIsEduModalOpen(true)} className="text-sm font-medium text-brand-indigo flex items-center hover:underline">
                    <Plus className="w-4 h-4 mr-1" /> Add Education
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.education.map(edu => (
                      <div key={edu.id} className="flex justify-between items-start bg-brand-light p-4 rounded-xl border border-brand-gray/50">
                        <div>
                          <h4 className="font-semibold text-brand-navy">{edu.degree}</h4>
                          <p className="text-sm text-brand-indigo font-medium mt-1">{edu.fieldOfStudy} • {edu.institution}</p>
                          <p className="text-sm text-brand-navy/60 mt-1">{edu.startYear} – {edu.endYear} {edu.grade && `• ${edu.grade}`}</p>
                        </div>
                        {isEditing && (
                          <button onClick={() => profileService.removeEducation(edu.id)} className="btn-interactive p-1.5 text-semantic-error hover:bg-semantic-error/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* PROFILE COMPLETION */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* AI PROFILE INSIGHT */}
            <motion.div variants={slideUp}>
              <Card className="border-semantic-warning/30 bg-semantic-warning/5">
                <CardHeader className="pb-3 border-b border-semantic-warning/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-semantic-warning-dark">
                      <Sparkles className="w-5 h-5" /> AI Profile Insight
                    </CardTitle>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-white px-2 py-1 rounded border border-semantic-warning/20 text-semantic-warning-dark">AI-Generated</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 text-brand-navy/80 text-sm leading-relaxed">
                  Your profile is well positioned for <strong className="font-semibold text-brand-navy">Software Engineer</strong> and <strong className="font-semibold text-brand-navy">Full Stack Developer</strong> roles. Adding more cloud experience and completing your career preferences could improve the relevance of your recommended jobs.
                </CardContent>
              </Card>
            </motion.div>

            {/* CAREER PREFERENCES */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Career Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Preferred Roles</span>
                    <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredJobTitles.join(", ") || "Not set"}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Locations</span>
                    <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredLocations.join(", ") || "Not set"}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Work Mode</span>
                    <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.preferredWorkMode.join(", ") || "Not set"}</p>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Expected Salary</span>
                    {isEditing ? (
                      <Input value={editedProfile.careerPreferences.expectedSalary} onChange={e => handleNestedChange("careerPreferences", "expectedSalary", e.target.value)} className="h-8 text-sm" />
                    ) : (
                      <p className="text-sm font-medium text-brand-navy">{profile.careerPreferences.expectedSalary || "Not set"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CAREER INTERESTS */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Career Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.careerInterests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20">
                        {interest}
                      </Badge>
                    ))}
                    {isEditing && (
                      <button onClick={() => setIsInterestModalOpen(true)} className="text-xs font-medium text-brand-navy/50 border border-dashed border-brand-gray/80 rounded-full px-3 py-1 hover:border-brand-indigo hover:text-brand-indigo transition-colors">
                        + Add Interest
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* VISIBILITY */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Visibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-brand-navy">Open to Opportunities</h4>
                      <p className="text-xs text-brand-navy/50 mt-0.5">Let recruiters know you're looking.</p>
                    </div>
                    <button 
                      disabled={!isEditing}
                      onClick={() => handleChange("openToWork", !editedProfile.openToWork)}
                      className={cn("w-11 h-6 rounded-full transition-colors relative flex items-center", editedProfile.openToWork ? "bg-semantic-success" : "bg-brand-gray/80")}
                    >
                      <motion.div 
                        layout 
                        className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"
                        animate={{ x: editedProfile.openToWork ? 20 : 0 }}
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
                      value={editedProfile.visibility}
                      onChange={e => handleChange("visibility", e.target.value)}
                      className="text-sm border border-brand-gray/50 rounded-lg p-1.5 focus:outline-none focus:border-brand-indigo bg-white text-brand-navy"
                    >
                      <option>Visible to Recruiters</option>
                      <option>Private</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Add Skill Modal */}
      <Modal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} title="Add Skill">
        <div className="space-y-4 mt-4">
          <Input placeholder="Skill Name (e.g. Docker)" />
          <select className="w-full h-10 px-3 rounded-xl border border-brand-gray/50 text-brand-navy bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Expert</option>
          </select>
          <button onClick={() => { setIsSkillModalOpen(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="btn-interactive btn-primary bg-brand-navy w-full h-10 rounded-xl font-semibold mt-4">Save Skill</button>
        </div>
      </Modal>

      {/* Add Experience Modal */}
      <Modal isOpen={isExpModalOpen} onClose={() => setIsExpModalOpen(false)} title="Add Experience">
        <div className="space-y-4 mt-4">
          <Input placeholder="Job Title (e.g. Software Engineer)" />
          <Input placeholder="Company (e.g. Google)" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Start Date (e.g. 2020)" />
            <Input placeholder="End Date (e.g. Present)" />
          </div>
          <textarea placeholder="Description" className="w-full h-24 p-3 text-sm rounded-xl border border-brand-gray/50 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 bg-white text-brand-navy resize-none" />
          <button onClick={() => { setIsExpModalOpen(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="btn-interactive btn-primary bg-brand-navy w-full h-10 rounded-xl font-semibold mt-4">Save Experience</button>
        </div>
      </Modal>

      {/* Add Education Modal */}
      <Modal isOpen={isEduModalOpen} onClose={() => setIsEduModalOpen(false)} title="Add Education">
        <div className="space-y-4 mt-4">
          <Input placeholder="Degree (e.g. B.S. Computer Science)" />
          <Input placeholder="Institution (e.g. Stanford University)" />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Start Year (e.g. 2016)" />
            <Input placeholder="End Year (e.g. 2020)" />
          </div>
          <button onClick={() => { setIsEduModalOpen(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="btn-interactive btn-primary bg-brand-navy w-full h-10 rounded-xl font-semibold mt-4">Save Education</button>
        </div>
      </Modal>

      {/* Add Interest Modal */}
      <Modal isOpen={isInterestModalOpen} onClose={() => setIsInterestModalOpen(false)} title="Add Career Interest">
        <div className="space-y-4 mt-4">
          <Input placeholder="Interest (e.g. Open Source, AI Research)" />
          <button onClick={() => { setIsInterestModalOpen(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="btn-interactive btn-primary bg-brand-navy w-full h-10 rounded-xl font-semibold mt-4">Save Interest</button>
        </div>
      </Modal>

    </DashboardShell>
  )
}
