export interface AdminProfile {
  id: string
  name: string
  email: string
  role: string
  status: string
  emailVerified: boolean
  department?: string
  createdAt: string
  lastActive: string
  phone?: string
  avatar?: string | null
}

export interface AdminSecurity {
  twoFactorEnabled: boolean
  lastPasswordChange: string
}

export interface AdminSession {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
}

export interface AdminSessionPreferences {
  timeoutMinutes: number
}

export interface AdminNotifications {
  alerts: {
    complaint: boolean
    criticalSecurity: boolean
    systemHealth: boolean
    aiEvaluation: boolean
    userManagement: boolean
    skillTaxonomy: boolean
    auditActivity: boolean
  }
  channels: {
    inApp: boolean
    email: boolean
  }
}

export interface AdminAppearance {
  theme: "Dark" | "Light" | "System"
  density: "Comfortable" | "Compact"
  animations: boolean
}

export interface AdminPrivacy {
  profileVisibility: "Private" | "Organization Only"
  activityVisibility: "Private" | "Organization Only"
  showEmailInProfile: boolean
}

export interface AdminActivityItem {
  id: string
  action: string
  time: string
}

export interface AdminAccountState {
  profile: AdminProfile
  security: AdminSecurity
  sessions: {
    preferences: AdminSessionPreferences
    activeList: AdminSession[]
  }
  notifications: AdminNotifications
  appearance: AdminAppearance
  privacy: AdminPrivacy
  recentActivity: AdminActivityItem[]
}

export const defaultMockAdminAccount: AdminAccountState = {
  profile: {
    id: "ADM-001",
    name: "Tharun",
    email: "admin@hiresmart.ai",
    role: "Administrator",
    status: "Active",
    emailVerified: true,
    department: "Platform Administration",
    createdAt: "12 September 2026",
    lastActive: "Just now",
    avatar: null
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: "Last changed 24 days ago"
  },
  sessions: {
    preferences: {
      timeoutMinutes: 30
    },
    activeList: [
      {
        id: "sess_1",
        device: "Windows Desktop",
        browser: "Chrome",
        location: "Current Session",
        lastActive: "Just now",
        isCurrent: true
      },
      {
        id: "sess_2",
        device: "MacBook",
        browser: "Chrome",
        location: "Bengaluru, IN",
        lastActive: "2 hours ago",
        isCurrent: false
      },
      {
        id: "sess_3",
        device: "Android Device",
        browser: "Chrome",
        location: "Bengaluru, IN",
        lastActive: "Yesterday",
        isCurrent: false
      }
    ]
  },
  notifications: {
    alerts: {
      complaint: true,
      criticalSecurity: true,
      systemHealth: true,
      aiEvaluation: true,
      userManagement: true,
      skillTaxonomy: true,
      auditActivity: false
    },
    channels: {
      inApp: true,
      email: true
    }
  },
  appearance: {
    theme: "Dark",
    density: "Comfortable",
    animations: true
  },
  privacy: {
    profileVisibility: "Organization Only",
    activityVisibility: "Private",
    showEmailInProfile: true
  },
  recentActivity: [
    { id: "act_1", action: "Updated user status", time: "Today · 10:42 AM" },
    { id: "act_2", action: "Reviewed complaint CMP-1042", time: "Today · 09:31 AM" },
    { id: "act_3", action: "Updated skill taxonomy", time: "Yesterday · 04:20 PM" },
    { id: "act_4", action: "Viewed AI evaluation", time: "Yesterday · 02:15 PM" },
    { id: "act_5", action: "Updated administrator profile", time: "18 Sep 2026 · 11:10 AM" }
  ]
}
