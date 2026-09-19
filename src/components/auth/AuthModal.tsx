import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User as UserIcon, Building2, AlertCircle } from "lucide-react"
import { Button } from "../ui/Button"
import { authService, type UserRole } from "../../services/authService"
import { cn } from "../../lib/utils"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
  initialRole?: UserRole
}

export function AuthModal({ isOpen, onClose, initialMode = "login", initialRole = "candidate" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [role, setRole] = useState<UserRole>(initialRole)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    }
  }, [isOpen, initialMode, initialRole])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "login") {
        await authService.login(email, password)
      } else {
        await authService.register({ email, password, name, role, company })
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card relative w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-semibold text-brand-navy">
                {mode === "login" ? "Welcome back" : `Create ${role === 'candidate' ? 'Candidate' : 'Recruiter'} Account`}
              </h2>
              <p className="text-brand-navy/60 mt-2 text-sm">
                {mode === "login" 
                  ? "Enter your details to access your account." 
                  : "Join HireSmart AI and transform your recruitment experience."}
              </p>
            </div>

            {/* Role Tabs for Login */}
            {mode === "login" && (
              <div className="flex p-1 bg-brand-light rounded-xl mb-6">
                <button
                  onClick={() => setRole("candidate")}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    role === "candidate" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                  )}
                >
                  Candidate
                </button>
                <button
                  onClick={() => setRole("recruiter")}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    role === "recruiter" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                  )}
                >
                  Recruiter
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />
                <p className="text-sm text-semantic-error font-medium">{error}</p>
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

              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-semibold text-brand-indigo hover:underline">
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
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px bg-brand-gray/50 flex-1" />
              <span className="text-xs font-medium text-brand-navy/40 uppercase tracking-wider">OR</span>
              <div className="h-px bg-brand-gray/50 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="btn-interactive btn-secondary rounded-lg w-full flex items-center justify-center gap-3 border-2 hover:-brand-gray/50 font-semibold py-3 h-12"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-brand-navy/60">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="font-semibold text-brand-indigo hover:underline ml-1"
                >
                  {mode === "login" ? "Create one" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
