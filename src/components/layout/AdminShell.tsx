import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, Users, AlertOctagon, Tags, ScrollText, 
  BrainCircuit, Activity, Settings, LogOut, Bell, Menu,
  Search, Shield, FileText as FileTextIcon, Lock, Info, ChevronDown, ChevronUp, Sun, Moon, HelpCircle, CheckCircle2, Check
} from "lucide-react"
import { cn } from "../../lib/utils"
import { notificationService } from "../../services/notificationService"
import { authService } from "../../services/authService"
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
    if (isDark) {
      document.documentElement.classList.remove("dark")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      setIsDark(true)
    }
  }

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
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Complaints", icon: AlertOctagon, href: "/admin/complaints" },
    { name: "Skill Taxonomy", icon: Tags, href: "/admin/skills" },
    { name: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs" },
  ]

  const aiPlatformLinks = [
    { name: "AI Evaluation", icon: BrainCircuit, href: "/admin/ai-evaluation" },
    { name: "System Health", icon: Activity, href: "/admin/system-health" },
  ]

  const settingsLinks = [
    { name: "Settings", icon: Settings, href: "/admin/settings" },
  ]

  const helpSupportLinks = [
    { name: "Help Center", icon: HelpCircle, href: "/admin/help" },
    { name: "Report a Complaint", icon: AlertOctagon, href: "/admin/complaint" },
  ]

  const moreLinks = [
    { name: "Safety Tips", icon: Shield, href: "/admin/safety" },
    { name: "Terms & Conditions", icon: FileTextIcon, href: "/admin/terms" },
    { name: "Privacy Policy", icon: Lock, href: "/admin/privacy" },
    { name: "About HireSmart AI", icon: Info, href: "/admin/about" },
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
        <h4 className="px-3 text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">{title}</h4>
      ) : (
        <div className="w-8 h-px bg-brand-gray/30 mx-auto mb-4 mt-2" />
      )}
      <div className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.href}
            end={link.href === "/admin"}
            onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-100 active:scale-95 group",
              isActive 
                ? "bg-brand-indigo/10 text-brand-indigo font-medium" 
                : "text-brand-navy/70 hover:bg-brand-indigo/10 hover:text-brand-indigo"
            )}
            title={(!isSidebarOpen && !isMobileOpen) ? link.name : undefined}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {(isSidebarOpen || isMobileOpen) && <span>{link.name}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  )

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex h-16 items-center px-6 border-b border-brand-gray/30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-indigo flex items-center justify-center">
              <span className="text-white font-display font-bold">H</span>
            </div>
            {(isSidebarOpen || isMobileOpen) && (
              <span className="text-xl font-display font-semibold text-brand-navy whitespace-nowrap">
                HireSmart <span className="text-brand-indigo">AI</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-4 px-3">
          
          {renderNavGroup({ title: "Administration", links: adminLinks })}
          {renderNavGroup({ title: "AI & Platform", links: aiPlatformLinks })}
          {renderNavGroup({ title: "Settings", links: settingsLinks })}

          <div className="mb-6">
            {(isSidebarOpen || isMobileOpen) ? (
              <h4 className="px-3 text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-2">Help & Support</h4>
            ) : (
              <div className="w-8 h-px bg-brand-gray/30 mx-auto mb-4 mt-2" />
            )}
            <div className="space-y-1">
              {helpSupportLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-100 active:scale-95",
                    isActive 
                      ? "bg-brand-indigo/10 text-brand-indigo font-medium" 
                      : "text-brand-navy/70 hover:bg-brand-indigo/10 hover:text-brand-indigo"
                  )}
                  title={(!isSidebarOpen && !isMobileOpen) ? link.name : undefined}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  {(isSidebarOpen || isMobileOpen) && <span>{link.name}</span>}
                </NavLink>
              ))}
              
              {/* More Dropdown */}
              <div>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-100 active:scale-95",
                    "text-brand-navy/70 hover:bg-brand-gray/30 hover:text-brand-navy"
                  )}
                  title={(!isSidebarOpen && !isMobileOpen) ? "More Options" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">⋯</span>
                    {(isSidebarOpen || isMobileOpen) && <span>More</span>}
                  </div>
                  {(isSidebarOpen || isMobileOpen) && (
                    isMoreOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isMoreOpen && (isSidebarOpen || isMobileOpen) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-9 mt-1 space-y-1 border-l-2 border-brand-gray/50 pl-3"
                    >
                      {moreLinks.map((link) => (
                        <NavLink
                          key={link.name}
                          to={link.href}
                          onClick={() => { if (isMobileOpen) setIsMobileOpen(false) }}
                          className={({ isActive }) => cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-100 active:scale-95 text-sm",
                            isActive 
                              ? "bg-brand-indigo/10 text-brand-indigo font-medium" 
                              : "text-brand-navy/60 hover:bg-brand-gray/30 hover:text-brand-navy"
                          )}
                        >
                          <link.icon className="h-4 w-4 shrink-0" />
                          <span>{link.name}</span>
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
      <div className="p-4 border-t border-brand-gray/30">
        <button
          onClick={handleLogout}
          className="btn-interactive rounded-lg bg-semantic-error text-white hover:bg-semantic-error/90 shadow-sm flex w-full items-center gap-3 px-3 py-2 text-brand-navy/70 duration-100 active:scale-95 hover:bg-semantic-error/10 hover:text-semantic-error"
          title={(!isSidebarOpen && !isMobileOpen) ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(isSidebarOpen || isMobileOpen) && <span>Logout</span>}
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
        <header className="flex h-16 items-center justify-between border-b border-brand-gray/50 bg-white/80 backdrop-blur-md px-4 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobile}
              className="p-2 text-brand-navy/60 hover:bg-brand-gray/50 rounded-lg lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 text-brand-navy/60 hover:bg-brand-gray/50 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden sm:flex items-center bg-brand-light rounded-full px-4 py-2 text-sm text-brand-navy/60 w-64 border border-brand-gray/50">
              <Search className="h-4 w-4 mr-2 text-brand-navy/40" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none w-full placeholder:text-brand-navy/40"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-navy/60 hover:bg-brand-gray/50 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-brand-navy/60 hover:bg-brand-gray/50 rounded-lg transition-colors"
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
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <MotionSpotlightCard 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="glass-card absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="p-4 border-b border-brand-gray/30 flex items-center justify-between bg-brand-light/30">
                        <h3 className="font-semibold text-brand-navy">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllAsRead} className="text-xs text-brand-indigo hover:underline font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-brand-navy/50">
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
                                notif.read ? "bg-white hover:bg-brand-light" : "bg-brand-indigo/5 hover:bg-brand-indigo/10"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={cn("text-sm font-semibold truncate", notif.read ? "text-brand-navy/70" : "text-brand-navy")}>{notif.title}</p>
                                  <span className="text-[10px] text-brand-navy/40 shrink-0 whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className={cn("text-xs mt-0.5 line-clamp-2", notif.read ? "text-brand-navy/50" : "text-brand-navy/70")}>{notif.description}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </MotionSpotlightCard>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-brand-gray/50" />
            
            <div className="relative">
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
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <MotionSpotlightCard 
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
                    </MotionSpotlightCard>
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
