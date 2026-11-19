import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User as UserIcon, Building2, AlertCircle } from "lucide-react"
import { Button } from "../ui/Button"
import { authService, type UserRole } from "../../services/authService"
import { cn } from "../../lib/utils"
import SpotlightCard from "../ui/SpotlightCard";
import { GoogleLogin } from '@react-oauth/google';
import { ApiClientError } from '../../services/httpClient';

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

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
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const [pickedRole, setPickedRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [pickedCompany, setPickedCompany] = useState('');
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

 const handleGoogle = async (credential: string) => {
  try {
    await authService.googleAuth(
      credential,
      mode === 'register' ? role : undefined,
      mode === 'register' ? company : undefined,
    );
    // close the modal / navigate, same as your email login does
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 422) {
      // new Google user on the login tab: ask for a role first
      setPendingCredential(credential);
      if (err.details?.code === 'COMPANY_REQUIRED') setPickedRole('recruiter');
    } else {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }
}; 

 const handleClose = () => {
  setPendingCredential(null);
  onClose();
};

const finishGoogleSignup = async () => {
  if (!pendingCredential) return;
  if (pickedRole === 'recruiter' && !pickedCompany.trim()) {
    setError('Company name is required for recruiters');
    return;
  }
  try {
    await authService.googleAuth(
      pendingCredential,
      pickedRole,
      pickedRole === 'recruiter' ? pickedCompany.trim() : undefined,
    );
    setPendingCredential(null);
    // close the modal / navigate, exactly as your normal login does
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Google sign-in failed');
  }
};


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
        />
        
        <MotionSpotlightCard
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass-card relative w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={handleClose} className="p-2 text-brand-navy/40 hover:bg-brand-gray/50 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

         <div className="p-8">
	   {pendingCredential ? (
	    <div>
	     <h2 className="text-2xl font-display font-semibold text-brand-navy text-center mb-6">
                Almost done
             </h2>
             <p className="text-brand-navy/60 text-sm text-center mb-6">
              How will you use HireSmart AI?
             </p>

            {error && (
  <div className="mb-6 p-3 bg-semantic-error/10 border border-semantic-error/20 rounded-xl flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-semantic-error shrink-0" />
    <p className="text-sm text-semantic-error font-medium">{error}</p>
  </div>
)} 

             <div className="flex p-1 bg-brand-light rounded-xl mb-6">
             {(['candidate', 'recruiter'] as const).map((r) => (
  <button
    key={r}
    type="button"
    onClick={() => setPickedRole(r)}
    className={cn(
      "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
      pickedRole === r
        ? "bg-white text-brand-indigo shadow-sm"
        : "text-brand-navy/60 hover:text-brand-navy",
    )}
  >
    {r === 'candidate' ? 'Candidate' : 'Recruiter'}
  </button>
))} 
             </div>

        {pickedRole === 'recruiter' && (
             <input
               value={pickedCompany}
               onChange={(e) => setPickedCompany(e.target.value)}
               placeholder="Company name"
               className="w-full bg-brand-light border border-brand-gray/50 rounded-xl px-4 py-3 mb-4 outline-none focus:border-brand-indigo/50 text-brand-navy"
             />
        )}

        <Button type="button" onClick={finishGoogleSignup} className="w-full py-3 h-12">
         Continue
        </Button>
        <button type="button" onClick={() => setPendingCredential(null)}
              className="w-full mt-3 text-sm text-brand-navy/60 hover:underline">
         Cancel
        </button>
    </div>
  ) : (
    <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-semibold text-brand-navy">
                {mode === "login" ? "Welcome back" : `Create ${role === 'candidate' ? 'Candidate' : role === 'admin' ? 'Admin' : 'Recruiter'} Account`}
              </h2>
              <p className="text-brand-navy/60 mt-2 text-sm">
                {mode === "login" 
                  ? "Enter your details to access your account." 
                  : "Join HireSmart AI and transform your recruitment experience."}
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-brand-light rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole("candidate")}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                  role === "candidate" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                )}
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                  role === "recruiter" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                )}
              >
                Recruiter
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                  role === "admin" ? "bg-white text-brand-indigo shadow-sm" : "text-brand-navy/60 hover:text-brand-navy"
                )}
              >
                Admin
              </button>
            </div>

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

          <div className="flex justify-center">
  <GoogleLogin
    onSuccess={(res) => handleGoogle(res.credential!)}
    onError={() => setError('Google sign-in failed')}
    width="340"
  />
</div> 

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
	     </>
	     )}
          </div>
        </MotionSpotlightCard>
      </div>
    </AnimatePresence>
  )
}
