import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Building2, Sliders, Brain, Bell, Shield, Palette, ChevronRight, HelpCircle, Sun, Moon, Monitor } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { AI_SCREENING_THRESHOLD } from "../../data/screeningMockData"
import { cn } from "../../lib/utils"
import { settingsService } from "../../services/settingsService"

export default function RecruiterSettings() {
  const [activeTab, setActiveTab] = React.useState("profile")
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  // Profile State
  const [profile, setProfile] = React.useState({
    name: "Rahul Sharma",
    email: "rahul@hiresmart.ai",
    phone: "+91 98765 43210",
    designation: "Talent Acquisition Specialist",
    department: "Human Resources",
    location: "Bangalore, India"
  })

  // Company State
  const [company, setCompany] = React.useState({
    name: "HireSmart Technologies",
    industry: "Information Technology",
    size: "51–200 employees",
    website: "https://hiresmart.ai",
    location: "Bangalore, India",
    about: "We build AI-powered solutions to streamline the recruitment process."
  })

  // Preferences State
  const [prefs, setPrefs] = React.useState({
    jobType: "Full-time",
    workMode: "Hybrid",
    experience: "1-3 years"
  })

  // AI Settings
  const [aiThreshold, setAiThreshold] = React.useState(AI_SCREENING_THRESHOLD.toString())

  // Notifications State
  const [notifs, setNotifs] = React.useState({
    applications: true,
    screening: true,
    shortlist: true,
    reminders: true,
    hiring: false
  })

  // Appearance State
  const [theme, setTheme] = React.useState("Dark")

  // Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)
  const [is2FAModalOpen, setIs2FAModalOpen] = React.useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleThemeChange = (newTheme: string) => { 
    setTheme(newTheme); 
    settingsService.applyTheme(newTheme as "Light" | "Dark" | "System");
    showToast(`Appearance set to ${newTheme}.`) 
  }

  const handleSaveProfile = () => showToast("Profile updated successfully.")
  const handleSaveCompany = () => showToast("Company details updated successfully.")
  const handleSavePrefs = () => showToast("Recruitment preferences updated.")
  const handleSaveAI = () => showToast(`AI Screening threshold updated to ${aiThreshold}%.`)
  const handleNotifToggle = (key: keyof typeof notifs) => setNotifs({ ...notifs, [key]: !notifs[key] })

  const TABS = [
    { id: "profile", label: "Recruiter Profile", icon: User },
    { id: "company", label: "Company Details", icon: Building2 },
    { id: "prefs", label: "Preferences", icon: Sliders },
    { id: "ai", label: "AI Screening", icon: Brain },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <DashboardShell type="recruiter" userName={profile.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6 pb-12 relative">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-brand-navy text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-xl"
            >
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Settings</h1>
          <p className="text-brand-navy/60 mt-1">Manage your account, preferences, and platform configuration.</p>
        </motion.div>

        {/* PROFILE CARD SUMMARY BANNER */}
        <motion.div variants={slideUp}>
          <div className="rounded-2xl shadow-sm overflow-hidden bg-gradient-to-r from-[#2563EB] to-[#60A5FA] relative text-white">
            <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none transform translate-x-10 translate-y-10">
              <svg width="250" height="250" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="p-8 flex flex-col sm:flex-row items-center gap-6 relative z-10">
              <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-white/20 shrink-0 shadow-lg">
                <span className="text-3xl font-display font-bold text-white">{profile.name.charAt(0)}</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-display font-bold text-white">{profile.name}</h2>
                <div className="text-white/90 font-medium text-sm mt-1">{profile.designation} • {profile.department}</div>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 text-xs text-white/80">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {profile.email}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {profile.location}</span>
                </div>
              </div>
              <Button onClick={() => setActiveTab("profile")} className="bg-[#1e293b] text-white hover:bg-slate-800 mt-4 sm:mt-0 shrink-0 border border-white/10">
                Edit Profile
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:w-64 shrink-0">
            {/* Mobile Dropdown */}
            <div className="lg:hidden mb-4">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-3 text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 dark:bg-[#1e293b] dark:border-white/10"
              >
                {TABS.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>

            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex flex-col space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-colors",
                    activeTab === tab.id 
                      ? "bg-brand-indigo/10 text-brand-indigo font-semibold dark:bg-brand-indigo/20 dark:text-brand-indigo" 
                      : "text-brand-navy/70 hover:bg-brand-gray/30 hover:text-brand-navy font-medium dark:text-brand-navy/60 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
              
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recruiter Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Full Name</label>
                        <Input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Email Address</label>
                        <Input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Phone Number</label>
                        <Input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Location</label>
                        <Input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Designation</label>
                        <Input type="text" value={profile.designation} onChange={e => setProfile({...profile, designation: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Department</label>
                        <Input type="text" value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} className="bg-transparent" />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button onClick={handleSaveProfile} className="bg-brand-indigo hover:bg-brand-blue text-white">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* COMPANY TAB */}
              {activeTab === "company" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                    <CardDescription>Update your company's information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Company Name</label>
                      <Input type="text" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} className="bg-transparent" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Industry</label>
                        <Input type="text" value={company.industry} onChange={e => setCompany({...company, industry: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Company Size</label>
                        <select value={company.size} onChange={e => setCompany({...company, size: e.target.value})} className="w-full bg-brand-light border border-brand-gray/40 rounded-xl h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none">
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option>51–200 employees</option>
                          <option>201-500 employees</option>
                          <option>500+ employees</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Website</label>
                        <Input type="url" value={company.website} onChange={e => setCompany({...company, website: e.target.value})} className="bg-transparent" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Location</label>
                        <Input type="text" value={company.location} onChange={e => setCompany({...company, location: e.target.value})} className="bg-transparent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">About Company</label>
                      <textarea value={company.about} onChange={e => setCompany({...company, about: e.target.value})} className="w-full bg-brand-light border border-brand-gray/40 rounded-xl p-4 text-sm focus:border-brand-indigo/50 outline-none min-h-[100px] resize-none" />
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button onClick={handleSaveCompany} className="bg-brand-indigo hover:bg-brand-blue">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === "prefs" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recruitment Preferences</CardTitle>
                    <CardDescription>Set default filters and preferences for your jobs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Default Job Type</label>
                        <select value={prefs.jobType} onChange={e => setPrefs({...prefs, jobType: e.target.value})} className="w-full bg-brand-light border border-brand-gray/40 rounded-xl h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none">
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Default Work Mode</label>
                        <select value={prefs.workMode} onChange={e => setPrefs({...prefs, workMode: e.target.value})} className="w-full bg-brand-light border border-brand-gray/40 rounded-xl h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none">
                          <option>Remote</option>
                          <option>Hybrid</option>
                          <option>On-site</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Preferred Experience Range</label>
                        <select value={prefs.experience} onChange={e => setPrefs({...prefs, experience: e.target.value})} className="w-full bg-brand-light border border-brand-gray/40 rounded-xl h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none">
                          <option>0-1 years</option>
                          <option>1-3 years</option>
                          <option>3-5 years</option>
                          <option>5+ years</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <Button onClick={handleSavePrefs} className="bg-brand-indigo hover:bg-brand-blue">Save Preferences</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI SCREENING TAB */}
              {activeTab === "ai" && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Screening Configuration</CardTitle>
                    <CardDescription>Determine the AI qualification threshold.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-5 flex items-start gap-3 mb-4">
                      <HelpCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-brand-navy">How AI Threshold Works</h4>
                        <p className="text-sm text-brand-navy/70 mt-1">
                          The screening threshold determines the minimum match score required for a candidate to be automatically tagged as <strong>AI Qualified</strong>. AI qualification helps prioritize candidates for recruiter review. It does not make the final hiring decision.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                      <label className="text-sm font-semibold text-brand-navy block">Default Screening Threshold</label>
                      <div className="flex gap-3">
                        {["70", "75", "80", "85", "90"].map(val => (
                          <button
                            key={val}
                            onClick={() => setAiThreshold(val)}
                            className={cn(
                              "flex-1 h-12 rounded-xl text-sm font-bold border transition-all",
                              aiThreshold === val
                                ? "bg-brand-indigo text-white border-brand-indigo shadow-md shadow-brand-indigo/20"
                                : "bg-brand-light text-brand-navy/60 border-brand-gray/40 hover:border-brand-indigo/40"
                            )}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-brand-navy/50">Changes apply to all future candidate AI evaluations.</p>
                    </div>

                    <div className="mt-8 pt-6 flex justify-end border-t border-brand-gray/20">
                      <Button onClick={handleSaveAI} className="bg-brand-indigo hover:bg-brand-blue">Save AI Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose which notifications you want to receive.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-0 divide-y divide-brand-gray/30">
                    {[
                      { key: "applications", label: "New Applications", desc: "Get notified when candidates apply to your jobs." },
                      { key: "screening", label: "AI Screening Completed", desc: "Get notified when AI finishes analyzing a candidate pool." },
                      { key: "shortlist", label: "Candidate Shortlisted", desc: "Get notified when a team member shortlists a candidate." },
                      { key: "reminders", label: "Interview Reminders", desc: "Receive reminders for upcoming scheduled interviews." },
                      { key: "hiring", label: "Hiring Updates", desc: "Get notified about pipeline stage changes." },
                    ].map((item) => (
                      <div key={item.key} className="py-5 flex items-center justify-between">
                        <div className="pr-4">
                          <h4 className="font-semibold text-brand-navy">{item.label}</h4>
                          <p className="text-sm text-brand-navy/60 mt-1">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleNotifToggle(item.key as any)}
                          className={cn(
                            "shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center",
                            notifs[item.key as keyof typeof notifs] ? "bg-semantic-success" : "bg-brand-gray/80"
                          )}
                        >
                          <motion.div layout className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" animate={{ x: notifs[item.key as keyof typeof notifs] ? 24 : 0 }} />
                        </button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>Manage your active logins across devices.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between p-4 border border-brand-gray/50 rounded-xl bg-brand-indigo/5">
                        <div>
                          <h4 className="font-semibold text-brand-navy">Chrome on Windows</h4>
                          <p className="text-sm text-brand-navy/60 mt-1">IP: 192.168.1.100</p>
                          <span className="inline-block mt-2 text-xs font-semibold text-semantic-success bg-semantic-success/10 px-2 py-1 rounded">Active now</span>
                        </div>
                      </div>
                      <button onClick={() => showToast("Signed out of all other sessions ✓")} className="w-full py-3 bg-brand-light text-brand-navy font-semibold rounded-xl hover:bg-brand-gray/30 transition-colors">
                        Sign Out All Other Sessions
                      </button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Authentication</CardTitle>
                      <CardDescription>Update your credentials or 2FA.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-brand-navy">Password</h4>
                          <p className="text-sm text-brand-navy/60 mt-1">••••••••••••</p>
                        </div>
                        <button onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 bg-brand-light text-brand-navy text-sm font-semibold rounded-lg hover:bg-brand-gray/50 transition-colors">
                          Change Password
                        </button>
                      </div>
                      
                      <div className="pt-4 border-t border-brand-gray/30 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-brand-navy">Two-Factor Authentication</h4>
                          <p className="text-sm text-brand-navy/60 mt-1">Protect your account with an extra security layer.</p>
                        </div>
                        <button onClick={() => setIs2FAModalOpen(true)} className="px-4 py-2 bg-brand-light text-brand-navy text-sm font-semibold rounded-lg hover:bg-brand-gray/50 transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === "appearance" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the interface of HireSmart AI.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <h4 className="font-semibold text-brand-navy mb-4">Theme</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: "Light", icon: Sun, label: "Light Mode" },
                          { id: "Dark", icon: Moon, label: "Dark Mode" },
                          { id: "System", icon: Monitor, label: "System Sync" }
                        ].map(t => (
                          <div 
                            key={t.id}
                            onClick={() => handleThemeChange(t.id)}
                            className={cn(
                              "border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                              theme === t.id ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo" : "border-brand-gray/20 bg-white hover:border-brand-gray/40 text-brand-navy/60"
                            )}
                          >
                            <t.icon className="w-8 h-8" />
                            <div className="text-center font-medium text-brand-navy text-sm">{t.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      </motion.div>

      {/* MODALS */}
      <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="Change Email Address">
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">Current Email</label>
            <Input value={profile.email} disabled className="bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">New Email</label>
            <Input type="email" placeholder="new.email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">Confirm New Email</label>
            <Input type="email" placeholder="new.email@example.com" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-gray/20 rounded-lg">Cancel</button>
            <button onClick={() => { setIsEmailModalOpen(false); showToast("Email successfully updated ✓"); }} className="px-4 py-2 bg-brand-indigo text-white font-semibold rounded-lg hover:bg-brand-indigo/90 transition-colors">Update Email</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">New Password</label>
            <Input type="password" placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">Confirm New Password</label>
            <Input type="password" placeholder="Minimum 8 characters" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-gray/20 rounded-lg">Cancel</button>
            <button onClick={() => { setIsPasswordModalOpen(false); showToast("Password successfully changed ✓"); }} className="px-4 py-2 bg-brand-indigo text-white font-semibold rounded-lg hover:bg-brand-indigo/90 transition-colors">Update Password</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={is2FAModalOpen} onClose={() => setIs2FAModalOpen(false)} title="Enable 2-Factor Authentication">
        <div className="mt-4">
          <p className="text-brand-navy/70 mb-6 text-sm">Scan this QR code with your authenticator app (like Google Authenticator or Authy) to add a secondary layer of security.</p>
          <div className="w-48 h-48 bg-white rounded-xl mx-auto flex items-center justify-center shadow-inner mb-6">
            <div className="w-32 h-32 border-4 border-brand-navy border-dashed opacity-50 flex items-center justify-center"><span className="text-brand-navy font-bold">QR Mock</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">Enter 6-digit verification code</label>
            <Input type="text" placeholder="000000" maxLength={6} className="text-center tracking-[0.5em] text-lg font-bold font-mono" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIs2FAModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-gray/20 rounded-lg">Cancel</button>
            <button onClick={() => { setIs2FAModalOpen(false); showToast("2FA Successfully Enabled ✓"); }} className="px-4 py-2 bg-semantic-success text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">Verify & Enable</button>
          </div>
        </div>
      </Modal>

    </DashboardShell>
  )
}
