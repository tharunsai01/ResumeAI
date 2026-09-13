import { defaultMockNotifications } from "../data/mockNotifications"
import type { AppNotification } from "../data/mockNotifications"

const NOTIFICATIONS_STORAGE_KEY = "hiresmart_notifications"

export const notificationService = {
  getNotifications(): AppNotification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error("Failed to parse notifications", e)
      }
    }
    
    // Initialize with default
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(defaultMockNotifications))
    return defaultMockNotifications
  },

  saveNotifications(notifications: AppNotification[]): void {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(new Event("hiresmart_notifications_updated"))
  },

  getUnreadCount(): number {
    return this.getNotifications().filter(n => !n.read).length
  },

  markAsRead(id: string): void {
    const notifications = this.getNotifications()
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n)
    this.saveNotifications(updated)
  },

  markAllAsRead(): void {
    const notifications = this.getNotifications()
    const updated = notifications.map(n => ({ ...n, read: true }))
    this.saveNotifications(updated)
  },

  deleteNotification(id: string): void {
    const notifications = this.getNotifications()
    const updated = notifications.filter(n => n.id !== id)
    this.saveNotifications(updated)
  },

  addNotification(notification: Omit<AppNotification, "id" | "time" | "read">): void {
    const notifications = this.getNotifications()
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      time: "Just now",
      read: false
    }
    this.saveNotifications([newNotification, ...notifications])
  }
}
