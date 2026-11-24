import type { NotificationType, AppNotification } from "../types/notifications"

export type { NotificationType, AppNotification }

export const defaultMockNotifications: AppNotification[] = [
  {
    id: "notif_cand_1",
    title: "New job match found",
    description: "Software Engineer at TCS matches your profile by 92%.",
    time: "2 hours ago",
    read: false,
    type: "job_match",
    link: "/candidate/jobs",
    role: "candidate"
  },
  {
    id: "notif_cand_2",
    title: "Application status updated",
    description: "Your application for Full Stack Developer moved to Interview.",
    time: "5 hours ago",
    read: false,
    type: "application",
    link: "/candidate/applications",
    role: "candidate"
  },
  {
    id: "notif_cand_3",
    title: "New skill recommendation",
    description: "Learning Kubernetes could improve your DevOps job matches.",
    time: "1 day ago",
    read: true,
    type: "skill",
    link: "/candidate/skills",
    role: "candidate"
  },
  {
    id: "notif_cand_4",
    title: "Interview reminder",
    description: "Your interview with Infosys is tomorrow at 10:00 AM.",
    time: "1 day ago",
    read: true,
    type: "interview",
    link: "/candidate/applications",
    role: "candidate"
  }
]

export const defaultRecruiterNotifications: AppNotification[] = [
  {
    id: "notif_rec_1",
    title: "New Candidate Application",
    description: "A new applicant applied for Senior Frontend Developer.",
    time: "1 hour ago",
    read: false,
    type: "application",
    link: "/recruiter/candidates",
    role: "recruiter"
  },
  {
    id: "notif_rec_2",
    title: "AI Screening Completed",
    description: "AI screening finished for Software Engineer (12 candidates evaluated).",
    time: "3 hours ago",
    read: false,
    type: "job_match",
    link: "/recruiter/screening",
    role: "recruiter"
  },
  {
    id: "notif_rec_3",
    title: "Upcoming Interview",
    description: "Interview with Alex Morgan scheduled for tomorrow at 2:00 PM.",
    time: "6 hours ago",
    read: true,
    type: "interview",
    link: "/recruiter/interviews",
    role: "recruiter"
  },
  {
    id: "notif_rec_4",
    title: "Job Active",
    description: "Your job posting 'Full Stack Engineer' is active and receiving matches.",
    time: "1 day ago",
    read: true,
    type: "other",
    link: "/recruiter/jobs",
    role: "recruiter"
  }
]

export const defaultAdminNotifications: AppNotification[] = [
  {
    id: "notif_adm_1",
    title: "Platform Activity Update",
    description: "5 new candidates and 2 recruiters joined the platform today.",
    time: "1 hour ago",
    read: false,
    type: "other",
    link: "/admin/users",
    role: "admin"
  },
  {
    id: "notif_adm_2",
    title: "User Complaint Submitted",
    description: "A candidate submitted a new issue requiring administrator review.",
    time: "4 hours ago",
    read: false,
    type: "application",
    link: "/admin/complaints",
    role: "admin"
  },
  {
    id: "notif_adm_3",
    title: "System Health Normal",
    description: "All system services and database operations operating at 99.9% uptime.",
    time: "12 hours ago",
    read: true,
    type: "skill",
    link: "/admin/system-health",
    role: "admin"
  },
  {
    id: "notif_adm_4",
    title: "AI Fairness Report Ready",
    description: "Weekly algorithmic fairness and matching accuracy audit report is ready.",
    time: "1 day ago",
    read: true,
    type: "job_match",
    link: "/admin/ai-evaluation",
    role: "admin"
  }
]
