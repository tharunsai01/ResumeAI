import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import { authService, type UserRole } from "../services/authService"
import { Button } from "../components/ui/Button"
import SpotlightCard from "../components/ui/SpotlightCard"

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function handleExchange() {
      const code = searchParams.get("code")
      const error = searchParams.get("error")
      const errorDesc = searchParams.get("error_description")
      const stateParam = searchParams.get("state")

      if (error) {
        if (isMounted) {
          setStatus("error")
          setErrorMessage(errorDesc || error || "Authentication access was denied or cancelled.")
        }
        return
      }

      if (!code) {
        if (isMounted) {
          setStatus("error")
          setErrorMessage("No authorization code was received from the identity provider.")
        }
        return
      }

      let detectedRole: UserRole = "candidate"

      if (stateParam) {
        try {
          let base64 = stateParam.replace(/-/g, "+").replace(/_/g, "/")
          while (base64.length % 4 !== 0) {
            base64 += "="
          }
          const jsonStr = atob(base64)
          const stateData = JSON.parse(jsonStr)

          if (stateData.role === "candidate" || stateData.role === "recruiter") {
            detectedRole = stateData.role
          }
        } catch {
          // Fallback if state format differs
        }
      }

      try {
        const sessionUser = await authService.googleAuth(detectedRole, code)

        if (!isMounted) return

        setStatus("success")

        // If in popup window, notify opener and close
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({ type: "hiresmart_oauth_success", user: sessionUser }, window.location.origin)
            setTimeout(() => window.close(), 600)
            return
          } catch {
            // Popup messaging failed, proceed with redirect
          }
        }

        // Navigate to appropriate destination
        setTimeout(() => {
          if (sessionUser.role === "admin") {
            navigate("/admin", { replace: true })
          } else if (sessionUser.role === "recruiter") {
            navigate("/recruiter/dashboard", { replace: true })
          } else {
            navigate("/candidate/dashboard", { replace: true })
          }
        }, 800)
      } catch (err: any) {
        if (isMounted) {
          setStatus("error")
          setErrorMessage(err.message || "Failed to complete authentication with the provider.")
        }
      }
    }

    handleExchange()

    return () => {
      isMounted = false
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <SpotlightCard className="glass-card max-w-md w-full p-8 text-center shadow-xl border border-brand-gray/50 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-3 border-brand-indigo/20 border-t-brand-indigo rounded-full animate-spin mb-6" />
              <h2 className="text-xl font-display font-semibold text-brand-navy mb-2">
                Authenticating with Google
              </h2>
              <p className="text-sm text-brand-navy/60">
                Verifying your credentials and establishing a secure session...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-brand-navy mb-2">
                Authentication Successful
              </h2>
              <p className="text-sm text-brand-navy/60 mb-6">
                Welcome to HireSmart AI. Redirecting to your dashboard...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-display font-semibold text-brand-navy mb-2">
                Authentication Failed
              </h2>
              <p className="text-sm text-brand-navy/60 mb-6 max-w-sm">
                {errorMessage || "An unexpected error occurred during the OAuth handshake."}
              </p>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => navigate("/", { replace: true })}
                  className="flex-1"
                >
                  Return Home
                </Button>
                <Button
                  onClick={() => navigate("/", { state: { action: "login" }, replace: true })}
                  className="flex-1 flex items-center justify-center gap-1.5"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </SpotlightCard>
    </div>
  )
}
