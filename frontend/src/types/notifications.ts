/**
 * Notification System Domain Types
 */

export type NotificationType = "job_match" | "application" | "skill" | "interview" | "other"
export type NotificationRole = "candidate" | "recruiter" | "admin"

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
  link?: string
  role?: NotificationRole
}
