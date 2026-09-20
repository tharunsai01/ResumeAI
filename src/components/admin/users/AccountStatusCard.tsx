import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import type { AdminUser } from "../../../data/mockAdminUsers"
import { Ban, CheckCircle, AlertTriangle } from "lucide-react"

interface AccountStatusCardProps {
  user: AdminUser
  isCurrentUser: boolean
  onSuspend: () => void
  onReactivate: () => void
}

export function AccountStatusCard({ user, isCurrentUser, onSuspend, onReactivate }: AccountStatusCardProps) {
  return (
    <Card className="h-full border-brand-indigo/10 bg-gradient-to-br from-white to-brand-light/50">
      <CardHeader className="pb-2 mb-4">
        <CardTitle className="text-lg font-display font-semibold text-brand-navy">Account Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {user.status === "Active" && <div className="w-3 h-3 rounded-full bg-semantic-success animate-pulse" />}
            {user.status === "Suspended" && <div className="w-3 h-3 rounded-full bg-semantic-error" />}
            {user.status === "Pending" && <div className="w-3 h-3 rounded-full bg-semantic-warning" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-brand-navy mb-1">{user.status}</h3>
            <p className="text-sm text-brand-navy/60 mb-6">
              {user.status === "Active" && "User currently has access to the HireSmart AI platform."}
              {user.status === "Suspended" && "User access is currently restricted."}
              {user.status === "Pending" && "Account is awaiting review or verification."}
            </p>

            {isCurrentUser ? (
              <div className="p-3 bg-brand-navy/5 border border-brand-navy/10 rounded-lg text-sm text-brand-navy/70 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-brand-indigo" />
                <span>Current Account. You cannot suspend your own administrator account.</span>
              </div>
            ) : (
              <>
                {user.status === "Suspended" ? (
                  <button 
                    onClick={onReactivate}
                    className="flex items-center gap-2 px-4 py-2 bg-semantic-success text-white hover:bg-semantic-success/90 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Reactivate User
                  </button>
                ) : (
                  <button 
                    onClick={onSuspend}
                    className="flex items-center gap-2 px-4 py-2 bg-semantic-error text-white hover:bg-semantic-error/90 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Suspend User
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
