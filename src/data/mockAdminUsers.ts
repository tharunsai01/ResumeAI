export type AdminUserRole = "Candidate" | "Recruiter" | "Administrator"
export type AdminUserStatus = "Active" | "Suspended" | "Pending"
export type AdminUserVerification = "Verified" | "Unverified"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  verification: AdminUserVerification
  joinedAt: string
  lastActive: string
  profile?: {
    headline?: string
    company?: string
    education?: string
    experience?: string
    skills?: string[]
    department?: string
  }
  activitySummary?: {
    label1: string
    value1: number
    label2: string
    value2: number
    label3: string
    value3: number
  }
  recentActivity?: {
    action: string
    time: string
  }[]
  security?: {
    events: number
  }
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "mock_admin_123",
    name: "Admin User",
    email: "admin@hiresmart.ai",
    role: "Administrator",
    status: "Active",
    verification: "Verified",
    joinedAt: "01 Jan 2026",
    lastActive: "Just now",
    profile: {
      department: "Platform Operations",
    },
    activitySummary: {
      label1: "User Actions", value1: 24,
      label2: "Complaint Reviews", value2: 8,
      label3: "Audit Events", value3: 42
    },
    recentActivity: [
      { action: "Signed in", time: "Just now" },
      { action: "Reviewed complaint", time: "2 hours ago" },
      { action: "Updated skill taxonomy", time: "1 day ago" },
      { action: "Viewed audit logs", time: "2 days ago" }
    ],
    security: { events: 0 }
  },
  {
    id: "usr_002",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@hiresmart.ai",
    role: "Administrator",
    status: "Active",
    verification: "Verified",
    joinedAt: "15 Jan 2026",
    lastActive: "15 min ago",
    profile: {
      department: "Security Team",
    },
    activitySummary: {
      label1: "User Actions", value1: 15,
      label2: "Complaint Reviews", value2: 32,
      label3: "Audit Events", value3: 120
    },
    recentActivity: [
      { action: "Signed in", time: "15 min ago" },
      { action: "Suspended user account", time: "2 hours ago" }
    ],
    security: { events: 0 }
  },
  {
    id: "usr_003",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    role: "Candidate",
    status: "Active",
    verification: "Verified",
    joinedAt: "12 Sep 2026",
    lastActive: "10 min ago",
    profile: {
      headline: "Senior Frontend Developer",
      education: "B.Tech Computer Science, XYZ University",
      experience: "5 years",
      skills: ["React", "TypeScript", "Tailwind CSS"]
    },
    activitySummary: {
      label1: "Applications", value1: 12,
      label2: "Resume Updates", value2: 3,
      label3: "Profile Updates", value3: 4
    },
    recentActivity: [
      { action: "Signed in", time: "10 min ago" },
      { action: "Updated profile", time: "2 hours ago" },
      { action: "Uploaded resume", time: "1 day ago" },
      { action: "Viewed recommended jobs", time: "2 days ago" }
    ],
    security: { events: 0 }
  },
  {
    id: "usr_004",
    name: "TechCorp Inc.",
    email: "careers@techcorp.com",
    role: "Recruiter",
    status: "Active",
    verification: "Verified",
    joinedAt: "05 Aug 2026",
    lastActive: "1 hour ago",
    profile: {
      company: "TechCorp Inc.",
    },
    activitySummary: {
      label1: "Jobs Created", value1: 8,
      label2: "Candidates Reviewed", value2: 124,
      label3: "Screening Activities", value3: 76
    },
    recentActivity: [
      { action: "Signed in", time: "1 hour ago" },
      { action: "Created a job", time: "2 hours ago" },
      { action: "Viewed candidates", time: "1 day ago" },
      { action: "Updated screening configuration", time: "2 days ago" }
    ],
    security: { events: 2 }
  },
  {
    id: "usr_005",
    name: "Michael Chen",
    email: "m.chen99@example.com",
    role: "Candidate",
    status: "Pending",
    verification: "Unverified",
    joinedAt: "20 Sep 2026",
    lastActive: "1 day ago",
  },
  {
    id: "usr_006",
    name: "Emma Watson",
    email: "emma.w@example.com",
    role: "Candidate",
    status: "Suspended",
    verification: "Verified",
    joinedAt: "10 Feb 2026",
    lastActive: "2 weeks ago",
  },
  {
    id: "usr_007",
    name: "Global Solutions",
    email: "hr@globalsolutions.net",
    role: "Recruiter",
    status: "Active",
    verification: "Verified",
    joinedAt: "14 Jul 2026",
    lastActive: "3 hours ago",
  },
  {
    id: "usr_008",
    name: "David Smith",
    email: "david.smith@example.com",
    role: "Candidate",
    status: "Active",
    verification: "Unverified",
    joinedAt: "19 Sep 2026",
    lastActive: "5 min ago",
  },
  {
    id: "usr_009",
    name: "Priya Patel",
    email: "priya.p@example.com",
    role: "Candidate",
    status: "Active",
    verification: "Verified",
    joinedAt: "01 Mar 2026",
    lastActive: "2 days ago",
  },
  {
    id: "usr_010",
    name: "Innovate Tech",
    email: "recruitment@innovate.co",
    role: "Recruiter",
    status: "Suspended",
    verification: "Unverified",
    joinedAt: "11 May 2026",
    lastActive: "1 month ago",
  },
  {
    id: "usr_011",
    name: "James Wilson",
    email: "j.wilson@example.com",
    role: "Candidate",
    status: "Pending",
    verification: "Unverified",
    joinedAt: "21 Sep 2026",
    lastActive: "4 hours ago",
  },
  {
    id: "usr_012",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    role: "Candidate",
    status: "Active",
    verification: "Verified",
    joinedAt: "22 Aug 2026",
    lastActive: "12 hours ago",
  },
  {
    id: "usr_013",
    name: "NextGen Startups",
    email: "hello@nextgen.io",
    role: "Recruiter",
    status: "Active",
    verification: "Verified",
    joinedAt: "30 Jun 2026",
    lastActive: "20 min ago",
  },
  {
    id: "usr_014",
    name: "Oliver Brown",
    email: "oliver.b@example.com",
    role: "Candidate",
    status: "Active",
    verification: "Verified",
    joinedAt: "04 Apr 2026",
    lastActive: "3 days ago",
  },
  {
    id: "usr_015",
    name: "Isabella Garcia",
    email: "isabella.g@example.com",
    role: "Candidate",
    status: "Suspended",
    verification: "Unverified",
    joinedAt: "16 Jan 2026",
    lastActive: "3 months ago",
  }
]
