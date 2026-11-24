import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import type { UserRole } from "../../services/authService"

interface ProtectedRouteProps {
  allowedRole?: UserRole
}

export function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-light">
        <div className="w-8 h-8 border-4 border-brand-indigo/20 border-t-brand-indigo rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to landing page and indicate they need to login (could pass state to open auth modal automatically)
    return <Navigate to="/" state={{ from: location, action: "login" }} replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    // If logged in but wrong role, redirect to their respective dashboard
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return <Outlet />
}
