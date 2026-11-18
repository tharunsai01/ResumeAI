import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, Users, AlertOctagon, Tags, ScrollText, 
  BrainCircuit, Activity, Settings, LogOut, Bell, Menu,
  Search, Shield, FileText as FileTextIcon, Lock, Info, ChevronDown, ChevronUp, ChevronRight, Sun, Moon, HelpCircle, CheckCircle2, Check,
  User, Calendar, Star, BarChart, AlertTriangle
} from "lucide-react"
import { cn } from "../../lib/utils"
import { notificationService } from "../../services/notificationService"
import { authService } from "../../services/authService"
import { settingsService } from "../../services/settingsService"
import type { AppNotification } from "../../data/mockNotifications"
import { PageTransition } from "./PageTransition"
import SpotlightCard from "../ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isMoreOpen, setIsMoreOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  
  // Notification State
  const [isNotifOpen, setIsNotifOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => notificationService.getNotifications())
  const unreadCount = notifications.filter(n => !n.read).length

  // Theme Toggle State
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    try {
      const currentSettings = settingsService.getSettings();
      settingsService.updateSettings({
        appearance: {
          ...currentSettings.appearance,
          theme: newIsDark ? "Dark" : "Light"
        }
      });
    } catch (e) {
      console.error("Failed to persist theme", e);
    }
  }

  const notifRef = React.useRef<HTMLDivElement>(null)
  const profileRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    const handleUpdate = () => setNotifications(notificationService.getNotifications())
    const handleStorage = () => setNotifications(notificationService.getNotifications())
    
    window.addEventListener('hiresmart_notifications_updated', handleUpdate)
    window.addEventListener('storage', handleStorage)
    
    return () => {
      window.removeEventListener('hiresmart_notifications_updated', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const adminLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin", iconBg: "bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20" },
    { name: "Users", icon: Users, href: "/admin/users", iconBg: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
    { name: "Complaints", icon: AlertOctagon, href: "/admin/complaints", iconBg: "bg-red-500/10 text-red-500 dark:bg-red-500/20" },
    { name: "Skill Taxonomy", icon: Tags, href: "/admin/skills", iconBg: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20" },
    { name: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs", iconBg: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20" },
  ]

  const aiPlatformLinks = [
    { name: "AI Evaluation", icon: BrainCircuit, href: "/admin/ai-evaluation", iconBg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20" },
    { name: "System Health", icon: Activity, href: "/admin/system-health", iconBg: "bg-sky-500/10 text-sky-500 dark:bg-sky-500/20" },
  ]

  const settingsLinks = [
    { name: "Settings", icon: Settings, href: "/admin/settings", iconBg: "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20" },
  ]

  const helpSupportLinks = [
    { name: "Help Center", icon: HelpCircle, href: "/admin/help", iconBg: "bg-sky-500/10 text-sky-500 dark:bg-sky-500/20" },
    { name: "Report a Complaint", icon: AlertOctagon, href: "/admin/complaint", iconBg: "bg-red-500/10 text-red-500 dark:bg-red-500/20" },
  ]

  const moreLinks = [
    { name: "Safety Tips", icon: Shield, href: "/admin/safety", iconBg: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20" },
    { name: "Terms & Conditions", icon: FileTextIcon, href: "/admin/terms", iconBg: "bg-slate-500/10 text-slate-500 dark:bg-slate-500/20" },
    { name: "Privacy Policy", icon: Lock, href: "/admin/privacy", iconBg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20" },
    { name: "About HireSmart AI", icon: Info, href: "/admin/about", iconBg: "bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20" },
  ]

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen)

  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    navigate("/")
  }

  const handleNotificationClick = (notif: AppNotification) => {
    notificationService.markAsRead(notif.id)
    setNotifications(notificationService.getNotifications())
    setIsNotifOpen(false)
    if (notif.link) {
      navigate(notif.link)
    }
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
    setNotifications(notificationService.getNotifications())
  }

  const renderNavGroup = ({ title, links }: { title: string, links: typeof adminLinks }) => (
    <div className="mb-6">
      {(isSidebarOpen || isMobileOpen) ? (
        <h4 className="px-1 text-[11px] font-bold text-brand-navy/40 dark:text-white/30 uppercase tracking-widest mb-3">{title}</h4>
      ) : (
        <div className="w-8 h-px bg-brand-gray/30 mx-auto mb-4 mt-4" />
      )}
      <div className="space-y-1 relative">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === "/admin"}
            onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 active:scale-95 relative group",
              isActive 
                ? "bg-brand-indigo/10 dark:bg-brand-indigo/20" 
                : "hover:bg-brand-gray/30 dark:hover:bg-white/5"
            )}
            title={(!isSidebarOpen && !isMobileOpen) ? link.name : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-indigo rounded-r-full" />}
                <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors", link.iconBg)}>
                  <link.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                {(isSidebarOpen || isMobileOpen) && (
                  <>
                    <span className={cn("text-[15px] transition-colors whitespace-nowrap", isActive ? "text-brand-indigo dark:text-brand-indigo font-medium" : "text-brand-navy dark:text-white/80 font-normal")}>{link.name}</span>
                    <ChevronRight className={cn("w-4 h-4 ml-auto transition-opacity shrink-0", isActive ? "opacity-100 text-brand-indigo" : "opacity-0 group-hover:opacity-30 text-brand-navy/60")} />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex h-[80px] items-center px-5 border-b border-brand-gray/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[12px] bg-brand-indigo flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-display font-bold text-lg">H</span>
            </div>
            {(isSidebarOpen || isMobileOpen) && (
              <span className="text-lg font-display font-bold text-brand-navy dark:text-white whitespace-nowrap overflow-hidden">
                HireSmart <span className="text-brand-indigo">AI</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 py-4">
          
          {renderNavGroup({ title: "Administration", links: adminLinks })}
          {renderNavGroup({ title: "AI & Platform", links: aiPlatformLinks })}
          {renderNavGroup({ title: "Settings", links: settingsLinks })}

          <div className="mb-6">
            {(isSidebarOpen || isMobileOpen) ? (
              <h4 className="px-1 text-[11px] font-bold text-brand-navy/40 uppercase tracking-widest mb-3">Help & Support</h4>
            ) : (
              <div className="w-8 h-px bg-brand-gray/30 mx-auto mb-4 mt-4" />
            )}
            <div className="space-y-1 relative">
              {helpSupportLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 active:scale-95 relative group",
                    isActive 
                      ? "bg-brand-indigo/10 dark:bg-brand-indigo/20" 
                      : "hover:bg-brand-gray/30 dark:hover:bg-white/5"
                  )}
                  title={(!isSidebarOpen && !isMobileOpen) ? link.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-indigo rounded-r-full" />}
                      <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 transition-colors", link.iconBg)}>
                        <link.icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </div>
                      {(isSidebarOpen || isMobileOpen) && (
                        <>
                          <span className={cn("text-[15px] transition-colors whitespace-nowrap", isActive ? "text-brand-indigo dark:text-brand-indigo font-medium" : "text-brand-navy dark:text-white/80 font-normal")}>{link.name}</span>
                          <ChevronRight className={cn("w-4 h-4 ml-auto transition-opacity shrink-0", isActive ? "opacity-100 text-brand-indigo" : "opacity-0 group-hover:opacity-30 text-brand-navy/60")} />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              
              {/* More Dropdown */}
              <div>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 active:scale-95 relative group",
                    "hover:bg-brand-gray/30 dark:hover:bg-white/5"
                  )}
                  title={(!isSidebarOpen && !isMobileOpen) ? "More Options" : undefined}
                >
                  <div className="w-9 h-9 rounded-[10px] bg-brand-gray/10 dark:bg-white/5 flex items-center justify-center shrink-0 transition-colors text-brand-navy/60 group-hover:text-brand-navy dark:text-white/60 dark:group-hover:text-white">
                    <span className="text-xl -mt-1 leading-none">⋯</span>
                  </div>
                  {(isSidebarOpen || isMobileOpen) && (
                    <>
                      <span className="text-[15px] text-brand-navy dark:text-white/80 font-normal transition-colors group-hover:text-brand-navy dark:group-hover:text-white">More</span>
                      <ChevronRight className={cn("w-4 h-4 ml-auto text-brand-navy/40 dark:text-white/30 transition-transform", isMoreOpen && "rotate-90")} />
                    </>
                  )}
                </button>
                <AnimatePresence>
                  {isMoreOpen && (isSidebarOpen || isMobileOpen) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-[22px] mt-1 space-y-1 border-l-2 border-brand-gray/20 dark:border-white/10 pl-[18px]"
                    >
                      {moreLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.href}
                          onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-200 active:scale-95 relative group",
                            isActive 
                              ? "bg-brand-indigo/10 dark:bg-brand-indigo/20" 
                              : "hover:bg-brand-gray/30 dark:hover:bg-white/5"
                          )}
                        >
                          {({ isActive }) => (
                            <>
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors", link.iconBg)}>
                                <link.icon className="h-4 w-4" strokeWidth={2} />
                              </div>
                              <span className={cn("text-sm transition-colors", isActive ? "text-brand-indigo dark:text-brand-indigo font-medium" : "text-brand-navy/80 dark:text-white/60 group-hover:text-brand-navy dark:group-hover:text-white")}>{link.name}</span>
                            </>
                          )}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 active:scale-95 relative group",
            "bg-rose-500/10 dark:bg-rose-500/10 hover:bg-rose-500/20 dark:hover:bg-rose-500/20"
          )}
          title={(!isSidebarOpen && !isMobileOpen) ? "Logout" : undefined}
        >
          <div className="w-9 h-9 rounded-[10px] bg-rose-500/20 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          {(isSidebarOpen || isMobileOpen) && (
            <>
              <span className="text-[15px] text-rose-600 dark:text-rose-400 font-medium transition-colors">Logout</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 text-rose-500 transition-opacity shrink-0" />
            </>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-brand-light">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="hidden lg:block z-20 h-full bg-white border-r border-brand-gray/50 shadow-sm"
      >
        {renderSidebarContent()}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 z-30 bg-brand-navy/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-brand-gray/50 shadow-2xl lg:hidden"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-brand-gray/50 bg-white/80 dark:bg-brand-navy/80 backdrop-blur-md px-4 sm:px-6 z-40 relative shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobile}
              className="p-2 text-brand-navy/60 dark:text-white/60 hover:bg-brand-gray/50 dark:hover:bg-white/10 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 text-brand-navy/60 dark:text-white/60 hover:bg-brand-gray/50 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden sm:flex items-center bg-brand-light dark:bg-white/5 rounded-full px-4 py-2 text-sm text-brand-navy/60 dark:text-white/60 w-64 border border-brand-gray/50 dark:border-white/10">
              <Search className="h-4 w-4 mr-2 text-brand-navy/40" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-full placeholder:text-brand-navy/40 dark:placeholder:text-white/40"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-navy/60 dark:text-white/60 hover:bg-brand-gray/50 dark:hover:bg-white/10 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Center */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-brand-navy/60 dark:text-white/60 hover:bg-brand-gray/50 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 h-4 w-4 rounded-full bg-semantic-error border-2 border-white flex items-center justify-center text-[9px] font-bold text-white"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="p-4 border-b border-brand-gray/30 flex items-center justify-between bg-brand-light/30">
                        <h3 className="font-semibold text-brand-navy dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-xs text-brand-indigo hover:underline font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-brand-navy/50 dark:text-white/50">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-semantic-success/50" />
                            <p className="font-medium">You're all caught up</p>
                            <p className="text-xs">No new notifications right now.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-brand-gray/50 group",
                                notif.read ? "bg-white dark:bg-[#0F172A] hover:bg-brand-light dark:hover:bg-white/5" : "bg-brand-indigo/5 dark:bg-brand-indigo/20 hover:bg-brand-indigo/10 dark:hover:bg-brand-indigo/30"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={cn("text-sm font-semibold truncate", notif.read ? "text-brand-navy/70 dark:text-white/70" : "text-brand-navy dark:text-white")}>{notif.title}</p>
                                  <span className="text-[10px] text-brand-navy/40 dark:text-white/40 shrink-0 whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className={cn("text-xs mt-0.5 line-clamp-2", notif.read ? "text-brand-navy/50 dark:text-white/50" : "text-brand-navy/70 dark:text-white/70")}>{notif.description}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-brand-gray/50" />
            <div className="relative" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-brand-navy">{user?.name || "Administrator"}</p>
                  <p className="text-xs text-brand-navy/60 capitalize">Administrator</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center font-semibold border border-brand-indigo/20">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card absolute right-0 top-full mt-2 w-48 z-50 overflow-hidden flex flex-col py-2"
                    >
                      <button onClick={() => { setIsProfileOpen(false); navigate(`/admin/settings`); }} className="w-full text-left px-4 py-2 text-sm text-brand-navy/70 hover:bg-brand-light hover:text-brand-indigo transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <div className="h-px w-full bg-brand-gray/30 my-1" />
                      <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-semantic-error/80 hover:bg-semantic-error/10 transition-colors flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-brand-light">
          <div className="mx-auto max-w-7xl h-full">
            <AnimatePresence mode="wait">
              <PageTransition>
                {children}
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
