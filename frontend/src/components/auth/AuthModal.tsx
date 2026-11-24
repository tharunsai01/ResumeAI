import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User as UserIcon, Building2, AlertCircle, CheckCircle2, ArrowLeft, Info } from "lucide-react"
import { Button } from "../ui/Button"
import { authService, type UserRole } from "../../services/authService"
import { cn } from "../../lib/utils"
import SpotlightCard from "../ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
  initialRole?: UserRole
}

export function AuthModal({ isOpen, onClose, initialMode = "login", initialRole = "candidate" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode)
  const [role, setRole] = useState<UserRole>(initialRole)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forgotStatus, setForgotStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)

  // Reset state when modal opens/closes or initial props change
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setRole(initialRole)
      setEmail("")
      setPassword("")
      setName("")
      setCompany("")
      setError(null)
      setForgotStatus(null)
    }
  }, [isOpen, initialMode, initialRole])

  // Automatically close modal when user logs in via OAuth or other tab
  React.useEffect(() => {
    const handleAuthChanged = () => {
      if (authService.getCurrentUser()) {
        onClose()
      }
    }
    window.addEventListener("hiresmart_auth_changed", handleAuthChanged)
    return () => window.removeEventListener("hiresmart_auth_changed", handleAuthChanged)
  }, [onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "forgot") {
        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
          throw new Error("Email address is required.")
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error("Please enter a valid email address.")
        }

        // Mock verification delay
        await new Promise(resolve => setTimeout(resolve, 600))

        const isAdmin = cleanEmail === "admin@hiresmart.ai" || cleanEmail === "admin"
        const existingUsers = authService.getUsers()
        const userExists = existingUsers.some((u: any) => u.email && u.email.toLowerCase() === cleanEmail)

        if (isAdmin || userExists) {
          setForgotStatus({
            type: "success",
            message: `Account verified for ${cleanEmail}. In production, an email with a secure one-time password reset link is dispatched. For this demo, your account is confirmed active in the mock database.`
          })
        } else {
          setForgotStatus({
            type: "error",
            message: `No account matching "${cleanEmail}" was found in local demo accounts. Please verify your email or create a new account.`
          })
        }
        return
      }

      if (mode === "login") {
        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
          throw new Error("Email address is required.")
        }
        if (!password) {
          throw new Error("Password is required.")
        }
        await authService.login(cleanEmail, password, role)
      } else {
        if (role === "admin") {
          throw new Error("Administrator accounts cannot be self-registered.")
        }
        const cleanEmail = email.trim().toLowerCase()
        if (!cleanEmail) {
          throw new Error("Email address is required.")
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          throw new Error("Please enter a valid email address.")
        }
        if (!name.trim()) {
          throw new Error("Full name is required.")
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.")
        }
        await authService.register({ email: cleanEmail, password, name: name.trim(), role, company: company.trim() })
      }
      onClose()
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (mode === "register" && role === "admin") {
        throw new Error("Administrator accounts cannot be registered via Google OAuth.")
      }
      // If registering, pass the selected role. If logging in, don't pass role so it tries to find the existing user.
      await authService.googleAuth(mode === "register" ? role : undefined)
      onClose()
    } catch (err: any) {
      setError(err.message || "Google authentication failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        
        <MotionSpotlightCard
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-card relative w-full max-w-md overflow-hidden flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] my-auto"
        >
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <button onClick={onClose} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 overscroll-contain">
            <div className="text-center mb-5 sm:mb-8 pr-8 pl-2">
              <h2 className="text-lg sm:text-2xl font-display font-semibold text-brand-navy break-words">
                {mode === "forgot"
                  ? "Reset Password"
                  : mode === "login" 
                    ? "Welcome back" 
                    : `Create ${role === 'candidate' ? 'Candidate' : role === 'admin' ? 'Admin' : 'Recruiter'} Account`}
              </h2>
              <p className="text-brand-navy/60 mt-1.5 sm:mt-2 text-xs sm:text-sm break-words leading-relaxed">
                {mode === "forgot"
                  ? "Enter your account email to verify existence and request reset instructions."
                  : mode === "login" 
                    ? "Enter your details to access your account." 
                    : "Join HireSmart AI and transform your recruitment experience."}
              </p>
            </div>

            {/* Role Tabs */}
            {mode !== "forgot" && (
              <div className="flex p-1 bg-brand-light rounded-xl mb-5 sm:mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRole("candidate")
                    setError(null)
                  }}
                  className={cn(
                    "flex-1 py-1.5 sm:py-2 px-1 text-xs sm:text-sm font-semibold rounded-lg transition-all text-center truncate",
                    role === "candidate" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                  )}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("recruiter")
                    setError(null)
                  }}
                  className={cn(
                    "flex-1 py-1.5 sm:py-2 px-1 text-xs sm:text-sm font-semibold rounded-lg transition-all text-center truncate",
                    role === "recruiter" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                  )}
                >
                  Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("admin")
                    if (mode === "register") {
                      setMode("login")
                      setError("Administrator accounts cannot be self-registered. Please sign in with existing credentials.")
                    } else {
                      setError(null)
                    }
                  }}
                  className={cn(
                    "flex-1 py-1.5 sm:py-2 px-1 text-xs sm:text-sm font-semibold rounded-lg transition-all text-center truncate",
                    role === "admin" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                  )}
                >
                  Admin
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />
                <p className="text-sm text-semantic-error font-medium">{error}</p>
              </div>
            )}

            {mode === "forgot" && forgotStatus && (
              <div className={cn(
                "mb-6 p-4 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 border",
                forgotStatus.type === "success" && "bg-emerald-50 text-emerald-800 border-emerald-200",
                forgotStatus.type === "error" && "bg-red-50 text-red-800 border-red-200",
                forgotStatus.type === "info" && "bg-blue-50 text-blue-800 border-blue-200"
              )}>
                {forgotStatus.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                {forgotStatus.type === "error" && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                {forgotStatus.type === "info" && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                <div>{forgotStatus.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-indigo/50 text-brand-navy"
                  />
                </div>
              )}

              {mode === "register" && role === "recruiter" && (
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                  <input
                    type="text"
                    placeholder="Company Name (Optional)"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-indigo/50 text-brand-navy"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-brand-light border border-brand-gray/50 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-indigo/50 text-brand-navy"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-indigo/50 text-brand-navy"
                  />
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => {
                      setMode("forgot")
                      setError(null)
                      setForgotStatus(null)
                    }}
                    className="text-xs font-semibold text-brand-indigo hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 h-12"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === "forgot" 
                    ? "Verify Account & Request Reset" 
                    : mode === "login" 
                      ? "Sign In" 
                      : "Create Account"
                )}
              </Button>
            </form>

            {mode !== "forgot" && (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px bg-brand-gray/50 flex-1" />
                  <span className="text-xs font-medium text-brand-navy/40 uppercase tracking-wider">OR</span>
                  <div className="h-px bg-brand-gray/50 flex-1" />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="btn-interactive btn-secondary rounded-lg w-full flex items-center justify-center gap-2.5 sm:gap-3 border-2 hover:border-brand-gray/50 font-semibold py-2.5 sm:py-3 h-11 sm:h-12 text-xs sm:text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 text-center">
              {mode === "forgot" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                    setForgotStatus(null)
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-indigo hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              ) : (
                <p className="text-sm text-brand-navy/60">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === "login") {
                        if (role === "admin") {
                          setRole("candidate")
                        }
                        setMode("register")
                        setError(null)
                      } else {
                        setMode("login")
                        setError(null)
                      }
                    }}
                    className="font-semibold text-brand-indigo hover:underline ml-1"
                  >
                    {mode === "login" ? "Create one" : "Sign In"}
                  </button>
                </p>
              )}
            </div>
          </div>
        </MotionSpotlightCard>
      </div>
    </AnimatePresence>
  )
}
