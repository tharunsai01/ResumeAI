export type NotificationType = "job_match" | "application" | "skill" | "interview" | "other"

export interface AppNotification {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: NotificationType
  link?: string
}

export const defaultMockNotifications: AppNotification[] = [
  {
    id: "notif_1",
    title: "New job match found",
    description: "Software Engineer at TCS matches your profile by 92%.",
    time: "2 hours ago",
    read: false,
    type: "job_match",
    link: "/candidate/jobs"
  },
  {
    id: "notif_2",
    title: "Application status updated",
    description: "Your application for Full Stack Developer moved to Interview.",
    time: "5 hours ago",
    read: false,
    type: "application",
    link: "/candidate/applications"
  },
  {
    id: "notif_3",
    title: "New skill recommendation",
    description: "Learning Kubernetes could improve your DevOps job matches.",
    time: "1 day ago",
    read: true,
    type: "skill",
    link: "/candidate/skills"
  },
  {
    id: "notif_4",
    title: "Interview reminder",
    description: "Your interview with Infosys is tomorrow at 10:00 AM.",
    time: "1 day ago",
    read: true,
    type: "interview",
    link: "/candidate/applications"
  }
]
