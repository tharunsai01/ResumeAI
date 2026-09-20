import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Modal } from "../../components/ui/Modal"
import { 
  User, ShieldCheck, Key, Bell, Palette, Lock, Activity,
  CheckCircle2, Monitor, Smartphone, Laptop,
  ArrowRight, ShieldAlert, LogOut
} from "lucide-react"
import { useAdminSettings } from "../../contexts/AdminSettingsContext"
import { staggerContainer } from "../../lib/animations"
import { cn } from "../../lib/utils"

const SettingsToggle = ({ label, description, checked, onChange, disabled = false }: any) => (
  <div className="flex items-start justify-between py-3 border-b border-brand-gray/10 last:border-0">
    <div className="pr-4">
      <div className="text-sm font-semibold text-brand-navy">{label}</div>
      {description && <div className="text-xs text-brand-navy/60 mt-0.5 max-w-lg leading-relaxed">{description}</div>}
    </div>
    <button 
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-11 h-6 rounded-full transition-colors relative shrink-0",
        checked ? "bg-brand-indigo" : "bg-brand-gray/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className={cn(
        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
        checked && "translate-x-5"
      )} />
    </button>
  </div>
)

export default function AdminSettings() {
  const { settings, updateSettings, signoutOtherSessions } = useAdminSettings()
  
  const [activeTab, setActiveTab] = useState("profile")
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Local state for forms
  const [profile, setProfile] = useState(settings.profile)
  const [notifications, setNotifications] = useState(settings.notifications)
  const [appearance, setAppearance] = useState(settings.appearance)
  const [privacy, setPrivacy] = useState(settings.privacy)
  const [sessionPrefs, setSessionPrefs] = useState(settings.sessions.preferences)

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false)
  const [signoutModalOpen, setSignoutModalOpen] = useState(false)

  // Password Form State
  const [pwdForm, setPwdForm] = useState({ current: "", new: "", confirm: "" })
  const pwdValid = pwdForm.new.length >= 8 && pwdForm.new === pwdForm.confirm

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSaveProfile = () => {
    updateSettings("profile", profile)
    showToast("Administrator profile updated successfully.")
  }

  const handleSaveNotifications = () => {
    updateSettings("notifications", notifications)
    showToast("Administrator settings updated successfully.")
  }

  const handleSaveAppearance = () => {
    updateSettings("appearance", appearance)
    showToast("Administrator settings updated successfully.")
  }

  const handleSavePrivacy = () => {
    updateSettings("privacy", privacy)
    showToast("Administrator settings updated successfully.")
  }

  const handleSaveSessionPrefs = () => {
    updateSettings("sessions", { preferences: sessionPrefs })
    showToast("Administrator settings updated successfully.")
  }

  const handleChangePassword = () => {
    if (!pwdValid) return
    setPasswordModalOpen(false)
    setPwdForm({ current: "", new: "", confirm: "" })
    showToast("Password updated successfully.")
  }

  const handleSignoutOther = () => {
    signoutOtherSessions()
    setSignoutModalOpen(false)
    showToast("Other sessions signed out.")
  }

  const tabs = [
    { id: "account_heading", label: "ACCOUNT", isHeading: true },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Account Security", icon: ShieldCheck },
    { id: "sessions", label: "Login & Sessions", icon: Key },
    { id: "prefs_heading", label: "PREFERENCES", isHeading: true },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "activity_heading", label: "ADMIN ACTIVITY", isHeading: true },
    { id: "activity", label: "My Activity", icon: Activity },
  ]



  const getDeviceIcon = (device: string) => {
    if (device.includes("Mobile") || device.includes("Android") || device.includes("iPhone")) return <Smartphone className="w-5 h-5 text-brand-navy/50" />
    if (device.includes("MacBook") || device.includes("Laptop")) return <Laptop className="w-5 h-5 text-brand-navy/50" />
    return <Monitor className="w-5 h-5 text-brand-navy/50" />
  }

  return (
    <AdminShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6 pb-12">
        
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg z-[100]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AdminPageHeader 
          title="Administrator Account Settings" 
          description="Manage your administrator account information and personal security preferences."
        />

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 shrink-0">
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-1 md:gap-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {tabs.map((tab, idx) => {
                if (tab.isHeading) {
                  return (
                    <div key={`head_${idx}`} className="hidden md:block text-[10px] font-bold text-brand-navy/40 uppercase tracking-wider mt-4 mb-2 px-4">
                      {tab.label}
                    </div>
                  )
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id!)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal",
                      activeTab === tab.id 
                        ? "bg-brand-indigo text-white shadow-sm" 
                        : "text-brand-navy/70 hover:bg-brand-light/50"
                    )}
                  >
                    {tab.icon && <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : "text-brand-navy/50")} />}
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >

                {/* PROFILE */}
                {activeTab === "profile" && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Administrator Profile</CardTitle>
                        <p className="text-sm text-brand-navy/60">Manage your administrator account information.</p>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-brand-gray/10">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-brand-indigo/10 flex items-center justify-center text-2xl font-bold text-brand-indigo uppercase">
                              {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : profile.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xl font-bold text-brand-navy">{profile.name}</div>
                              <div className="text-sm text-brand-navy/60">{profile.email}</div>
                              <div className="mt-1 flex gap-2">
                                <span className="text-[10px] font-bold text-brand-indigo bg-brand-indigo/10 px-2 py-0.5 rounded uppercase">{profile.role}</span>
                                <span className="text-[10px] font-bold text-brand-navy/50 bg-brand-gray/10 border border-brand-gray/20 px-2 py-0.5 rounded uppercase">{profile.id}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="h-8 text-xs bg-white text-brand-navy">Change Photo</Button>
                            <Button variant="outline" className="h-8 text-xs bg-white text-semantic-error border-semantic-error/30 hover:bg-semantic-error/5">Remove</Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-brand-navy">Full Name</label>
                            <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-brand-navy">Email Address</label>
                            <Input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-brand-navy">Phone Number <span className="text-brand-navy/40 font-normal">(Optional)</span></label>
                            <Input type="tel" value={profile.phone || ""} onChange={e => setProfile({...profile, phone: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-brand-navy">Department <span className="text-brand-navy/40 font-normal">(Optional)</span></label>
                            <Input value={profile.department || ""} onChange={e => setProfile({...profile, department: e.target.value})} />
                          </div>
                          <div className="space-y-1.5 opacity-70">
                            <label className="text-sm font-medium text-brand-navy">Admin Role</label>
                            <Input value={profile.role} readOnly className="bg-brand-gray/5 cursor-not-allowed" />
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-brand-gray/10 gap-3">
                          <Button variant="outline" onClick={() => setProfile(settings.profile)}>Cancel</Button>
                          <Button onClick={handleSaveProfile} className="bg-brand-indigo hover:bg-brand-blue">
                            Save Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Admin ID</div>
                            <div className="text-sm font-medium text-brand-navy">{profile.id}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Role</div>
                            <div className="text-sm font-medium text-brand-navy">{profile.role}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Account Status</div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" /> {profile.status}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Email Verification</div>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                              <CheckCircle2 className="w-4 h-4" /> Verified
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Account Created</div>
                            <div className="text-sm font-medium text-brand-navy">{profile.createdAt}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Last Active</div>
                            <div className="text-sm font-medium text-brand-navy">{profile.lastActive}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* SECURITY */}
                {activeTab === "security" && (
                  <>
                    <Card className="bg-brand-indigo/5 border-brand-indigo/20 shadow-none">
                      <CardContent className="p-4 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-brand-navy mb-0.5">Administrator Account Security</h4>
                          <p className="text-sm text-brand-navy/80">
                            Administrator accounts have elevated platform access. Keep your credentials secure and enable additional sign-in protection when available.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between py-4 border-b border-brand-gray/10">
                          <div>
                            <div className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                              Password <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 tracking-wider uppercase">Protected</span>
                            </div>
                            <div className="text-xs text-brand-navy/60 mt-1">{settings.security.lastPasswordChange}</div>
                          </div>
                          <Button variant="outline" onClick={() => setPasswordModalOpen(true)} className="bg-white">Change Password</Button>
                        </div>

                        <div className="flex items-center justify-between py-4">
                          <div>
                            <div className="text-sm font-semibold text-brand-navy flex items-center gap-2">
                              Two-Factor Authentication 
                              {settings.security.twoFactorEnabled 
                                ? <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 tracking-wider uppercase">Enabled</span>
                                : <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-gray/10 text-brand-navy/50 tracking-wider uppercase">Disabled</span>
                              }
                            </div>
                            <div className="text-xs text-brand-navy/60 mt-1 max-w-sm">
                              Add an additional verification step when signing in to your administrator account.
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setTwoFactorModalOpen(true)} className="bg-white">Manage 2FA</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* SESSIONS */}
                {activeTab === "sessions" && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Session Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between max-w-lg">
                          <div>
                            <label className="text-sm font-semibold text-brand-navy block">Session Timeout</label>
                            <p className="text-xs text-brand-navy/60 mt-1">Automatically sign out after inactivity.</p>
                          </div>
                          <select 
                            className="bg-white border border-brand-gray/20 rounded-lg px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                            value={sessionPrefs.timeoutMinutes}
                            onChange={(e) => setSessionPrefs({timeoutMinutes: Number(e.target.value)})}
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>60 minutes</option>
                          </select>
                        </div>
                        <div className="mt-4 pt-4 border-t border-brand-gray/10 flex justify-end">
                          <Button onClick={handleSaveSessionPrefs} className="bg-brand-indigo hover:bg-brand-blue">
                            Save Changes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-brand-gray/10">
                        <CardTitle>Active Sessions</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          {settings.sessions.activeList.map(session => (
                            <div key={session.id} className="flex items-start justify-between p-4 rounded-xl border border-brand-gray/10 bg-brand-light/30">
                              <div className="flex items-start gap-4">
                                <div className="p-2 bg-white rounded-lg border border-brand-gray/20 shadow-sm mt-0.5">
                                  {getDeviceIcon(session.device)}
                                </div>
                                <div>
                                  <div className="font-semibold text-brand-navy flex items-center gap-2">
                                    {session.device}
                                    {session.isCurrent && <span className="px-2 py-0.5 bg-brand-indigo/10 text-brand-indigo text-[10px] font-bold uppercase tracking-wider rounded">Current Session</span>}
                                  </div>
                                  <div className="text-sm text-brand-navy/70 mt-1 flex items-center gap-3">
                                    <span>{session.browser}</span>
                                    <span className="w-1 h-1 rounded-full bg-brand-gray/40" />
                                    <span>{session.location}</span>
                                  </div>
                                  <div className="text-xs text-brand-navy/50 mt-2 font-medium flex items-center gap-1.5">
                                    {session.isCurrent ? <span className="w-2 h-2 rounded-full bg-emerald-500" /> : <span className="w-2 h-2 rounded-full bg-brand-gray/30" />}
                                    Last active: {session.lastActive}
                                  </div>
                                </div>
                              </div>
                              {!session.isCurrent && (
                                <Button variant="ghost" className="text-semantic-error hover:bg-semantic-error/10 hover:text-semantic-error">
                                  Sign Out
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-semantic-error/30 bg-semantic-error/5">
                      <CardHeader>
                        <CardTitle className="text-semantic-error flex items-center gap-2">
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-brand-navy">Sign Out All Other Sessions</div>
                            <div className="text-xs text-brand-navy/70 mt-1">This will sign out all active sessions except the current one.</div>
                          </div>
                          <Button onClick={() => setSignoutModalOpen(true)} className="bg-semantic-error hover:bg-red-600 shrink-0">
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out Other Sessions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* NOTIFICATIONS */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Administrator Notifications</CardTitle>
                        <p className="text-sm text-brand-navy/60">Choose which platform events should generate administrator notifications.</p>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <SettingsToggle 
                          label="Complaint Alerts" 
                          checked={notifications.alerts.complaint}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, complaint: v}})}
                        />
                        <SettingsToggle 
                          label="Critical Security Alerts" 
                          checked={notifications.alerts.criticalSecurity}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, criticalSecurity: v}})}
                        />
                        <SettingsToggle 
                          label="System Health Alerts" 
                          checked={notifications.alerts.systemHealth}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, systemHealth: v}})}
                        />
                        <SettingsToggle 
                          label="AI Evaluation Alerts" 
                          checked={notifications.alerts.aiEvaluation}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, aiEvaluation: v}})}
                        />
                        <SettingsToggle 
                          label="User Management Alerts" 
                          checked={notifications.alerts.userManagement}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, userManagement: v}})}
                        />
                        <SettingsToggle 
                          label="Skill Taxonomy Updates" 
                          checked={notifications.alerts.skillTaxonomy}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, skillTaxonomy: v}})}
                        />
                        <SettingsToggle 
                          label="Audit Activity Alerts" 
                          checked={notifications.alerts.auditActivity}
                          onChange={(v: boolean) => setNotifications({...notifications, alerts: {...notifications.alerts, auditActivity: v}})}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2 text-sm text-brand-navy font-medium">
                            <input type="checkbox" checked={notifications.channels.inApp} onChange={e => setNotifications({...notifications, channels: {...notifications.channels, inApp: e.target.checked}})} className="rounded text-brand-indigo focus:ring-brand-indigo w-4 h-4" />
                            In-App Notifications
                          </label>
                          <label className="flex items-center gap-2 text-sm text-brand-navy font-medium">
                            <input type="checkbox" checked={notifications.channels.email} onChange={e => setNotifications({...notifications, channels: {...notifications.channels, email: e.target.checked}})} className="rounded text-brand-indigo focus:ring-brand-indigo w-4 h-4" />
                            Email Notifications
                          </label>
                        </div>
                        <div className="flex justify-end pt-6 mt-4 border-t border-brand-gray/10">
                          <Button onClick={handleSaveNotifications} className="bg-brand-indigo hover:bg-brand-blue">Save Changes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* APPEARANCE */}
                {activeTab === "appearance" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Appearance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div>
                        <label className="text-sm font-medium text-brand-navy mb-3 block">Theme</label>
                        <div className="flex gap-4">
                          {['Dark', 'Light', 'System'].map((theme) => (
                            <label key={theme} className={cn(
                              "flex-1 p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-3 transition-all",
                              appearance.theme === theme ? "border-brand-indigo bg-brand-indigo/5" : "border-brand-gray/20 hover:border-brand-gray/40"
                            )}>
                              <input 
                                type="radio" 
                                name="theme" 
                                value={theme}
                                checked={appearance.theme === theme}
                                onChange={() => setAppearance({...appearance, theme: theme as any})}
                                className="sr-only" 
                              />
                              <div className="w-8 h-8 rounded-full border border-brand-gray/20 flex items-center justify-center bg-white shadow-sm">
                                {appearance.theme === theme && <div className="w-3 h-3 rounded-full bg-brand-indigo" />}
                              </div>
                              <span className="text-sm font-medium text-brand-navy">{theme}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-brand-navy mb-3 block">Interface Density</label>
                        <div className="flex gap-4 max-w-sm">
                          {['Comfortable', 'Compact'].map((density) => (
                            <label key={density} className={cn(
                              "flex-1 py-2 px-4 rounded-lg border text-center cursor-pointer transition-all",
                              appearance.density === density ? "border-brand-indigo bg-brand-indigo/5 text-brand-indigo font-medium" : "border-brand-gray/20 text-brand-navy/60 hover:border-brand-gray/40"
                            )}>
                              <input 
                                type="radio" 
                                name="density" 
                                value={density}
                                checked={appearance.density === density}
                                onChange={() => setAppearance({...appearance, density: density as any})}
                                className="sr-only" 
                              />
                              {density}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-brand-gray/10 pt-4">
                        <SettingsToggle 
                          label="Enable Animations" 
                          description="Show UI transitions and motion effects. Disable for reduced motion preference."
                          checked={appearance.animations}
                          onChange={(v: boolean) => setAppearance({...appearance, animations: v})}
                        />
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <Button onClick={handleSaveAppearance} className="bg-brand-indigo hover:bg-brand-blue">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* PRIVACY */}
                {activeTab === "privacy" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Privacy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="max-w-md space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-brand-navy">Profile Visibility</label>
                          <select 
                            className="w-full px-3 py-2 bg-white border border-brand-gray/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                            value={privacy.profileVisibility}
                            onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value as any})}
                          >
                            <option value="Organization Only">Organization Only</option>
                            <option value="Private">Private</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-brand-navy">Activity Visibility</label>
                          <select 
                            className="w-full px-3 py-2 bg-white border border-brand-gray/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
                            value={privacy.activityVisibility}
                            onChange={(e) => setPrivacy({...privacy, activityVisibility: e.target.value as any})}
                          >
                            <option value="Private">Private</option>
                            <option value="Organization Only">Organization Only</option>
                          </select>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-brand-gray/10">
                        <SettingsToggle 
                          label="Show Admin Email in Profile" 
                          checked={privacy.showEmailInProfile}
                          onChange={(v: boolean) => setPrivacy({...privacy, showEmailInProfile: v})}
                        />
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button onClick={handleSavePrivacy} className="bg-brand-indigo hover:bg-brand-blue">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* MY ACTIVITY */}
                {activeTab === "activity" && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b border-brand-gray/10 pb-4 mb-4">
                      <CardTitle>My Activity</CardTitle>
                      <Button variant="outline" className="bg-white text-xs h-8" onClick={() => window.location.href = '/admin/audit-logs'}>
                        View Full Audit Activity <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="relative border-l-2 border-brand-gray/20 ml-3 pl-6 space-y-6">
                          {settings.recentActivity.map(act => (
                            <div key={act.id} className="relative">
                              <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-white border-2 border-brand-indigo shadow-sm" />
                              <p className="text-sm font-medium text-brand-navy">{act.action}</p>
                              <p className="text-xs text-brand-navy/50 mt-1">{act.time}</p>
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

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Password"
        className="max-w-md"
      >
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-navy">Current Password</label>
            <Input type="password" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} />
          </div>
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-medium text-brand-navy">New Password</label>
            <Input type="password" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-navy">Confirm New Password</label>
            <Input type="password" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} />
          </div>

          <div className="bg-brand-light/50 p-4 rounded-lg mt-4 text-xs text-brand-navy/70 space-y-1">
            <div className="font-semibold text-brand-navy mb-2">Password Requirements:</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-brand-gray/60"/> Minimum 8 characters</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-brand-gray/60"/> At least one uppercase letter</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-brand-gray/60"/> At least one number</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-brand-gray/60"/> At least one special character</div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-brand-gray/10">
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={!pwdValid} className="bg-brand-indigo hover:bg-brand-blue">Update Password</Button>
          </div>
        </div>
      </Modal>

      {/* TWO FACTOR MODAL */}
      <Modal
        isOpen={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title="Two-Factor Authentication"
        className="max-w-md"
      >
        <div className="py-2 space-y-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              <div>
                <div className="font-bold text-emerald-900">2FA is Enabled</div>
                <div className="text-xs text-emerald-700/80 mt-0.5">Your account is secure.</div>
              </div>
            </div>
            <Button variant="outline" className="h-8 text-xs bg-white text-emerald-800 border-emerald-200">Disable</Button>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-brand-navy mb-3">Verification Method</h4>
            <div className="flex items-center justify-between p-4 rounded-lg border border-brand-gray/20">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-brand-navy/60" />
                <div>
                  <div className="text-sm font-medium text-brand-navy">Authenticator App</div>
                  <div className="text-xs text-brand-navy/50 mt-0.5">Default method</div>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setTwoFactorModalOpen(false)} className="bg-brand-indigo hover:bg-brand-blue">Done</Button>
          </div>
        </div>
      </Modal>

      {/* SIGN OUT OTHER SESSIONS MODAL */}
      <Modal
        isOpen={signoutModalOpen}
        onClose={() => setSignoutModalOpen(false)}
        title="Sign out other sessions?"
      >
        <div className="py-2">
          <p className="text-sm text-brand-navy/70 mb-6">
            All other administrator sessions will be signed out immediately. Your current session will remain active.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSignoutModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSignoutOther} className="bg-semantic-error hover:bg-red-600">Sign Out Sessions</Button>
          </div>
        </div>
      </Modal>

    </AdminShell>
  )
}
