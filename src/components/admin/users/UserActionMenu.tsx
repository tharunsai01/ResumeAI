import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react"
import type { AdminUser } from "../../../data/mockAdminUsers"
import { useNavigate } from "react-router-dom"
import { authService } from "../../../services/authService"

interface UserActionMenuProps {
  user: AdminUser
  onSuspend: (user: AdminUser) => void
  onReactivate: (user: AdminUser) => void
}

export function UserActionMenu({ user, onSuspend, onReactivate }: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const currentUser = authService.getCurrentUser()
  const isCurrentUser = currentUser?.email === user.email

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-brand-navy/50 hover:bg-brand-gray/30 rounded-lg transition-colors focus:outline-none"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-brand-gray/30 overflow-hidden z-20 py-1"
            >
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate(`/admin/users/${user.id}`)
                }}
                className="w-full text-left px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-brand-indigo" />
                View Details
              </button>
              
              <div className="h-px bg-brand-gray/20 my-1" />

              {isCurrentUser ? (
                <div className="px-4 py-2 text-xs text-brand-navy/40 font-medium italic flex items-center gap-2">
                  Current Account (Safe)
                </div>
              ) : (
                <>
                  {user.status === "Suspended" ? (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onReactivate(user)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-brand-navy hover:bg-brand-light flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-semantic-success" />
                      Reactivate User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        onSuspend(user)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-semantic-error hover:bg-semantic-error/10 flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      Suspend User
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
