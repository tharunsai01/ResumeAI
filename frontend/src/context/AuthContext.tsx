import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, type User } from "../services/authService"

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial load
    setUser(authService.getCurrentUser())
    setIsLoading(false)

    // Listen to changes (login, logout, multi-tab sync)
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser())
    }

    window.addEventListener("hiresmart_auth_changed", handleAuthChange)
    window.addEventListener("storage", handleAuthChange) // for cross-tab auth state syncing

    return () => {
      window.removeEventListener("hiresmart_auth_changed", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
