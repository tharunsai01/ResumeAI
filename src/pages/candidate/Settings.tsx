import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { settingsService } from "../../services/settingsService"
import { profileService } from "../../services/profileService"
import type { CandidateSettings } from "../../data/mockSettings"
import type { CandidateProfile } from "../../data/mockProfile"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import { 
  User, Bell, Briefcase, Lock, Palette, Shield, ChevronRight, Check, AlertTriangle, Laptop, Monitor
} from "lucide-react"

type TabId = "account" | "notifications" | "job_preferences" | "privacy" | "appearance" | "security"
interface SettingsPageProps {
  type?: "candidate" | "recruiter"
}

export default function CandidateSettingsPage({ type = "candidate" }: SettingsPageProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState<TabId>("account")
  const [settings, setSettings] = React.useState<CandidateSettings | null>(() => settingsService.getSettings())
  const [profile] = React.useState<CandidateProfile | null>(() => profileService.getCandidateProfile())
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState("Settings saved successfully ✓")

  // Modals state
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

  React.useEffect(() => {
    // If we need to listen for settings or profile changes, we could do it here
  }, [])

  const saveSettings = (newSettings: CandidateSettings) => {
    settingsService.saveSettings(newSettings)
    settingsService.applyTheme(newSettings.appearance.theme)
    setSettings(newSettings)
    triggerToast()
  }

  const triggerToast = (msg?: string) => {
    if (msg) setToastMessage(msg)
    else setToastMessage("Settings saved successfully ✓")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleToggle = (section: keyof CandidateSettings, field: string) => {
    if (!settings) return
    const newSettings = {
      ...settings,
      [section]: {
        ...(settings[section] as any),
        [field]: !(settings[section] as any)[field]
      }
    }
    saveSettings(newSettings)
  }

  if (!settings || !profile) return null

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "job_preferences", label: "Job Preferences", icon: Briefcase },
    { id: "privacy", label: "Privacy & Recommendations", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ]

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all local data? This will reset your session.")) {
      settingsService.clearAllLocalData()
      navigate("/")
    }
  }

  return (
    <DashboardShell type={type} userName={profile.fullName.split(' ')[0]}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-20">
        
        {/* PAGE HEADER */}
        <motion.div variants={slideUp} className="mb-8">
          <h1 className="text-3xl font-display font-semibold text-brand-navy">Settings</h1>
          <p className="text-brand-navy/60 mt-2">Manage your account settings and preferences.</p>
        </motion.div>

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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:w-64 shrink-0">
            {/* Mobile Dropdown */}
            <div className="lg:hidden mb-4">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabId)}
                className="w-full bg-white border border-brand-gray/50 rounded-xl px-4 py-3 text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
            </div>

            {/* Desktop Sidebar */}
            <nav className="hidden lg:flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-colors",
                    activeTab === tab.id 
                      ? "bg-brand-indigo/10 text-brand-indigo font-semibold" 
                      : "text-brand-navy/70 hover:bg-brand-gray/30 hover:text-brand-navy font-medium"
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
          <div className="flex-1 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* ------------------------------------------------ */}
                {/* ACCOUNT SETTINGS */}
                {/* ------------------------------------------------ */}
                {activeTab === "account" && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Manage your personal profile and contact details.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center border-2 border-brand-gray/50 overflow-hidden shrink-0">
                            {profile.avatar ? (
                              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl font-bold text-brand-navy/30">{profile.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-brand-navy text-lg">{profile.fullName}</h3>
                            <p className="text-brand-navy/60 text-sm mt-1">{profile.currentRole}</p>
                            <button onClick={() => navigate("/candidate/profile")} className="mt-2 text-sm font-medium text-brand-indigo hover:underline">
                              Edit Complete Profile
                            </button>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-brand-gray/30 grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="flex items-center justify-between bg-brand-light px-4 py-2.5 rounded-lg border border-brand-gray/50">
                              <span className="text-sm font-medium text-brand-navy">{profile.email}</span>
                              <button onClick={() => setIsEmailModalOpen(true)} className="text-xs font-semibold text-brand-indigo hover:underline">Change</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Phone Number</label>
                            <div className="bg-brand-light px-4 py-2.5 rounded-lg border border-brand-gray/50">
                              <span className="text-sm font-medium text-brand-navy">{profile.phone}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-brand-navy">Password</h4>
                            <p className="text-sm text-brand-navy/60 mt-1">••••••••••••</p>
                          </div>
                          <button onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 bg-brand-light text-brand-navy text-sm font-semibold rounded-lg hover:bg-brand-gray/50 transition-colors">
                            Change Password
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* ------------------------------------------------ */}
                {/* NOTIFICATIONS */}
                {/* ------------------------------------------------ */}
                {activeTab === "notifications" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Choose which notifications you want to receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-0 divide-y divide-brand-gray/30">
                      {[
                        { id: "jobMatchAlerts", title: "Job Match Alerts", desc: "Get notified when new jobs strongly match your profile." },
                        { id: "applicationStatusUpdates", title: "Application Updates", desc: "Get notified when your application status changes." },
                        { id: "interviewReminders", title: "Interview Reminders", desc: "Receive reminders for upcoming interviews." },
                        { id: "skillRecommendations", title: "Skill Recommendations", desc: "Get alerts when a high-priority skill gap is identified." },
                        { id: "recruiterMessages", title: "Recruiter Messages", desc: "When a recruiter contacts you." },
                        { id: "productUpdates", title: "Product Updates", desc: "News, feature updates, and HireSmart AI announcements." },
                      ].map((item) => (
                        <div key={item.id} className="py-5 flex items-center justify-between">
                          <div className="pr-4">
                            <h4 className="font-semibold text-brand-navy">{item.title}</h4>
                            <p className="text-sm text-brand-navy/60 mt-1">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => handleToggle("notifications", item.id)}
                            className={cn("shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center", (settings.notifications as any)[item.id] ? "bg-semantic-success" : "bg-brand-gray/80")}
                          >
                            <motion.div 
                              layout 
                              className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm"
                              animate={{ x: (settings.notifications as any)[item.id] ? 24 : 0 }}
                            />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* ------------------------------------------------ */}
                {/* JOB PREFERENCES */}
                {/* ------------------------------------------------ */}
                {activeTab === "job_preferences" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Preferences</CardTitle>
                      <CardDescription>Control how HireSmart AI finds and recommends opportunities for you. These settings sync with your candidate profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">Preferred Job Titles</label>
                        <Input value={profile.careerPreferences.preferredJobTitles.join(", ")} disabled className="bg-brand-light" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-navy mb-2">Preferred Locations</label>
                        <Input value={profile.careerPreferences.preferredLocations.join(", ")} disabled className="bg-brand-light" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Expected Salary</label>
                          <Input value={profile.careerPreferences.expectedSalary} disabled className="bg-brand-light" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-navy mb-2">Willing to Relocate</label>
                          <div className="h-10 flex items-center px-3 border border-brand-gray/50 rounded-xl bg-brand-light">
                            {profile.careerPreferences.willingToRelocate ? "Yes" : "No"}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <button onClick={() => navigate("/candidate/profile")} className="px-4 py-2 bg-brand-navy text-white text-sm font-semibold rounded-lg hover:bg-brand-navy/90 transition-colors shadow-sm">
                          Edit Job Preferences in Profile
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ------------------------------------------------ */}
                {/* PRIVACY & RECOMMENDATIONS */}
                {/* ------------------------------------------------ */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy Settings</CardTitle>
                        <CardDescription>Control your visibility to recruiters.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-0 divide-y divide-brand-gray/30">
                        {[
                          { id: "visibleToRecruiters", title: "Visible to Recruiters", desc: "Recruiters can discover your professional profile when you are open to opportunities." },
                          { id: "allowRecruitersToContact", title: "Allow Recruiters to Contact Me", desc: "Receive direct messages and interview requests from verified recruiters." },
                          { id: "showInRecruiterSearch", title: "Show Profile in Recruiter Search", desc: "Appear in global search results based on your skills." },
                        ].map((item) => (
                          <div key={item.id} className="py-5 flex items-center justify-between">
                            <div className="pr-4">
                              <h4 className="font-semibold text-brand-navy">{item.title}</h4>
                              <p className="text-sm text-brand-navy/60 mt-1">{item.desc}</p>
                            </div>
                            <button 
                              onClick={() => handleToggle("privacy", item.id)}
                              className={cn("shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center", (settings.privacy as any)[item.id] ? "bg-semantic-success" : "bg-brand-gray/80")}
                            >
                              <motion.div layout className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" animate={{ x: (settings.privacy as any)[item.id] ? 24 : 0 }} />
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI Recommendation Preferences</CardTitle>
                        <CardDescription>Determine which parts of your profile HireSmart AI uses when recommending jobs.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-0 divide-y divide-brand-gray/30">
                        {[
                          { id: "useResumeSkills", title: "Use Resume Skills", desc: "Match jobs based on skills extracted from your resume." },
                          { id: "useCareerPreferences", title: "Use Career Preferences", desc: "Factor in your preferred roles, locations, and salary." },
                          { id: "useExperience", title: "Use Experience Level", desc: "Recommend jobs fitting your current career level." },
                        ].map((item) => (
                          <div key={item.id} className="py-5 flex items-center justify-between">
                            <div className="pr-4">
                              <h4 className="font-semibold text-brand-navy">{item.title}</h4>
                              <p className="text-sm text-brand-navy/60 mt-1">{item.desc}</p>
                            </div>
                            <button 
                              onClick={() => handleToggle("aiRecommendations", item.id)}
                              className={cn("shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center", (settings.aiRecommendations as any)[item.id] ? "bg-semantic-success" : "bg-brand-gray/80")}
                            >
                              <motion.div layout className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" animate={{ x: (settings.aiRecommendations as any)[item.id] ? 24 : 0 }} />
                            </button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* ------------------------------------------------ */}
                {/* APPEARANCE */}
                {/* ------------------------------------------------ */}
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
                            { id: "Light", icon: Monitor, label: "Light Mode" },
                            { id: "Dark", icon: Laptop, label: "Dark Mode" },
                            { id: "System", icon: Monitor, label: "System Sync" }
                          ].map(theme => (
                            <div 
                              key={theme.id}
                              onClick={() => saveSettings({ ...settings, appearance: { ...settings.appearance, theme: theme.id as any } })}
                              className={cn(
                                "border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors",
                                settings.appearance.theme === theme.id ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo" : "border-brand-gray/30 hover:border-brand-gray/80 text-brand-navy/60"
                              )}
                            >
                              <theme.icon className="w-8 h-8" />
                              <span className="font-semibold">{theme.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-brand-gray/30 flex items-center justify-between">
                        <div className="pr-4">
                          <h4 className="font-semibold text-brand-navy">Reduce Motion</h4>
                          <p className="text-sm text-brand-navy/60 mt-1">Reduce animations and motion effects throughout the application.</p>
                        </div>
                        <button 
                          onClick={() => handleToggle("appearance", "reduceMotion")}
                          className={cn("shrink-0 w-12 h-6 rounded-full transition-colors relative flex items-center", settings.appearance.reduceMotion ? "bg-semantic-success" : "bg-brand-gray/80")}
                        >
                          <motion.div layout className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" animate={{ x: settings.appearance.reduceMotion ? 24 : 0 }} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ------------------------------------------------ */}
                {/* SECURITY */}
                {/* ------------------------------------------------ */}
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
                        <button onClick={() => triggerToast("Signed out of all other sessions ✓")} className="w-full py-3 bg-brand-light text-brand-navy font-semibold rounded-xl hover:bg-brand-gray/30 transition-colors">
                          Sign Out All Other Sessions
                        </button>
                      </CardContent>
                    </Card>

                    <Card className="border-semantic-error/30">
                      <CardHeader>
                        <CardTitle className="text-semantic-error flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions for your account.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-semantic-error/5 rounded-xl">
                          <div>
                            <h4 className="font-semibold text-brand-navy">Clear Local Data</h4>
                            <p className="text-sm text-brand-navy/60 mt-1">Removes all saved settings, notifications, and mock data from this browser.</p>
                          </div>
                          <button onClick={handleClearData} className="shrink-0 px-4 py-2 bg-semantic-error/10 text-semantic-error font-semibold rounded-lg hover:bg-semantic-error/20 transition-colors">
                            Clear Data
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-semantic-error/5 rounded-xl">
                          <div>
                            <h4 className="font-semibold text-brand-navy">Delete Account</h4>
                            <p className="text-sm text-brand-navy/60 mt-1">Permanently delete your account and all associated data.</p>
                          </div>
                          <button onClick={() => setIsDeleteModalOpen(true)} className="shrink-0 px-4 py-2 bg-semantic-error text-white font-semibold rounded-lg hover:bg-semantic-error/90 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
            <Input value={profile.email} disabled className="bg-brand-light" />
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
            <button onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-light rounded-lg">Cancel</button>
            <button onClick={() => { setIsEmailModalOpen(false); triggerToast(); }} className="px-4 py-2 bg-brand-indigo text-white font-semibold rounded-lg">Update Email</button>
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
            <button onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-light rounded-lg">Cancel</button>
            <button onClick={() => { setIsPasswordModalOpen(false); triggerToast(); }} className="px-4 py-2 bg-brand-indigo text-white font-semibold rounded-lg">Update Password</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete your account?">
        <div className="mt-4">
          <p className="text-brand-navy/70 mb-6">This action cannot be undone. All your data, applications, and profile information will be permanently removed.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 font-semibold text-brand-navy hover:bg-brand-light rounded-lg">Cancel</button>
            <button onClick={handleClearData} className="px-4 py-2 bg-semantic-error text-white font-semibold rounded-lg">Delete Account</button>
          </div>
        </div>
      </Modal>

    </DashboardShell>
  )
}
