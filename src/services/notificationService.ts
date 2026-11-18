import { 
  defaultMockNotifications, 
  defaultRecruiterNotifications, 
  defaultAdminNotifications 
} from "../data/mockNotifications"
import type { AppNotification } from "../data/mockNotifications"
import { authService } from "./authService"

export type NotificationRole = "candidate" | "recruiter" | "admin"

const BASE_STORAGE_KEY = "hiresmart_notifications"

function getStorageKey(role: NotificationRole): string {
  return `${BASE_STORAGE_KEY}_${role}`
}

function resolveRole(explicitRole?: string): NotificationRole {
  if (explicitRole === "candidate" || explicitRole === "recruiter" || explicitRole === "admin") {
    return explicitRole
  }
  const currentUser = authService.getCurrentUser()
  if (currentUser?.role === "candidate" || currentUser?.role === "recruiter" || currentUser?.role === "admin") {
    return currentUser.role
  }
  return "candidate"
}

function getDefaultNotifications(role: NotificationRole): AppNotification[] {
  switch (role) {
    case "recruiter":
      return defaultRecruiterNotifications
    case "admin":
      return defaultAdminNotifications
    case "candidate":
    default:
      return defaultMockNotifications
  }
}

function sanitizeNotificationLink(link: string | undefined, role: NotificationRole): string {
  if (!link) {
    return role === "admin" ? "/admin" : `/${role}/dashboard`
  }

  // Public routes are accessible to all roles
  const publicRoutes = ["/about", "/terms", "/privacy", "/safety", "/help", "/complaint"]
  if (publicRoutes.includes(link) || publicRoutes.some(p => link.startsWith(`${p}/`))) {
    return link
  }

  // Check if link matches the target role prefix
  if (role === "admin") {
    if (link.startsWith("/admin")) return link
    return "/admin"
  } else {
    if (link.startsWith(`/${role}`)) return link
    return `/${role}/dashboard`
  }
}

export const notificationService = {
  getNotifications(role?: string): AppNotification[] {
    const targetRole = resolveRole(role)
    const storageKey = getStorageKey(targetRole)

    if (typeof window !== "undefined") {
      let stored = localStorage.getItem(storageKey)
      
      // Backward compatibility: If candidate storage doesn't exist yet, check legacy key
      if (!stored && targetRole === "candidate") {
        stored = localStorage.getItem(BASE_STORAGE_KEY)
      }

      if (stored) {
        try {
          const parsed: AppNotification[] = JSON.parse(stored)
          // Sanitize any corrupt or cross-role links
          const sanitized = parsed.map(n => ({
            ...n,
            role: targetRole,
            link: sanitizeNotificationLink(n.link, targetRole)
          }))
          return sanitized
        } catch (e) {
          console.error(`Failed to parse notifications for ${targetRole}`, e)
        }
      }

      // Initialize with role-specific defaults
      const defaults = getDefaultNotifications(targetRole)
      localStorage.setItem(storageKey, JSON.stringify(defaults))
      return defaults
    }

    return getDefaultNotifications(targetRole)
  },

  saveNotifications(notifications: AppNotification[], role?: string): void {
    const targetRole = resolveRole(role)
    const storageKey = getStorageKey(targetRole)

    if (typeof window !== "undefined") {
      const sanitized = notifications.map(n => ({
        ...n,
        role: targetRole,
        link: sanitizeNotificationLink(n.link, targetRole)
      }))
      localStorage.setItem(storageKey, JSON.stringify(sanitized))
      window.dispatchEvent(new Event("hiresmart_notifications_updated"))
    }
  },

  getUnreadCount(role?: string): number {
    return this.getNotifications(role).filter(n => !n.read).length
  },

  markAsRead(id: string, role?: string): void {
    const notifications = this.getNotifications(role)
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    this.saveNotifications(updated, role)
  },

  markAllAsRead(role?: string): void {
    const notifications = this.getNotifications(role)
    const updated = notifications.map(n => ({ ...n, read: true }))
    this.saveNotifications(updated, role)
  },

  deleteNotification(id: string, role?: string): void {
    const notifications = this.getNotifications(role)
    const updated = notifications.filter(n => n.id !== id)
    this.saveNotifications(updated, role)
  },

  addNotification(notification: Omit<AppNotification, "id" | "time" | "read">, role?: string): void {
    const targetRole = resolveRole(role || notification.role)
    const notifications = this.getNotifications(targetRole)
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${targetRole}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      time: "Just now",
      read: false,
      role: targetRole,
      link: sanitizeNotificationLink(notification.link, targetRole)
    }
    this.saveNotifications([newNotification, ...notifications], targetRole)
  }
}
