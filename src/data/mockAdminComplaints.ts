export type ComplaintStatus = "Open" | "In Review" | "Resolved" | "Closed"
export type ComplaintPriority = "Low" | "Medium" | "High" | "Critical"
export type ComplaintCategory = "Account" | "Resume" | "AI & Matching" | "Job/Recruiter" | "Technical" | "Privacy & Security" | "Other"

export interface ComplaintActivity {
  action: string
  time: string
  admin?: string
}

export interface AdminComplaint {
  id: string
  subject: string
  description: string
  submittedBy: {
    name: string
    email: string
    id: string
  }
  role: "Candidate" | "Recruiter"
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  resolutionNotes?: string
  resolvedBy?: string
  resolvedAt?: string
  activity: ComplaintActivity[]
}

export const mockAdminComplaints: AdminComplaint[] = [
  {
    id: "CMP-1042",
    subject: "Resume processing failed",
    description: "The resume analysis completed but several skills were not detected correctly. The candidate believes the extracted information does not match the uploaded resume.",
    submittedBy: { name: "Aarav Sharma", email: "aarav.sharma@example.com", id: "usr_003" },
    role: "Candidate",
    category: "AI & Matching",
    priority: "High",
    status: "Open",
    createdAt: "18 Sep 2026",
    updatedAt: "18 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "18 Sep 2026 · 10:42 AM" }
    ]
  },
  {
    id: "CMP-1041",
    subject: "Unable to update profile",
    description: "When I try to save my profile changes, the screen freezes and the save button stays loading indefinitely.",
    submittedBy: { name: "Sarah Jenkins", email: "sarah.jenkins@example.com", id: "usr_010" },
    role: "Candidate",
    category: "Account",
    priority: "Medium",
    status: "In Review",
    createdAt: "17 Sep 2026",
    updatedAt: "18 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "17 Sep 2026 · 02:15 PM" },
      { action: "Status changed to In Review", time: "18 Sep 2026 · 09:00 AM", admin: "Admin User" }
    ]
  },
  {
    id: "CMP-1040",
    subject: "Incorrect job recommendation",
    description: "I am a frontend developer but I keep getting recommendations for senior backend Java roles.",
    submittedBy: { name: "Priya Patel", email: "priya.patel@example.com", id: "usr_011" },
    role: "Candidate",
    category: "AI & Matching",
    priority: "Medium",
    status: "Open",
    createdAt: "17 Sep 2026",
    updatedAt: "17 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "17 Sep 2026 · 11:30 AM" }
    ]
  },
  {
    id: "CMP-1039",
    subject: "Unable to create job",
    description: "The 'Create Job' button is disabled on my recruiter dashboard even though my account is verified.",
    submittedBy: { name: "TechCorp Inc.", email: "careers@techcorp.com", id: "usr_004" },
    role: "Recruiter",
    category: "Job/Recruiter",
    priority: "High",
    status: "Resolved",
    createdAt: "16 Sep 2026",
    updatedAt: "17 Sep 2026",
    resolutionNotes: "Fixed a bug with the verification status check in the frontend validation logic.",
    resolvedBy: "Admin User",
    resolvedAt: "17 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "16 Sep 2026 · 04:00 PM" },
      { action: "Status changed to Resolved", time: "17 Sep 2026 · 10:20 AM", admin: "Admin User" }
    ]
  },
  {
    id: "CMP-1038",
    subject: "Account verification issue",
    description: "I haven't received my email verification link after requesting it three times.",
    submittedBy: { name: "James Smith", email: "james.smith@example.com", id: "usr_012" },
    role: "Candidate",
    category: "Account",
    priority: "Low",
    status: "Resolved",
    createdAt: "15 Sep 2026",
    updatedAt: "16 Sep 2026",
    resolutionNotes: "Resent the verification email manually via the SendGrid admin panel. User confirmed receipt.",
    resolvedBy: "System Admin",
    resolvedAt: "16 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "15 Sep 2026 · 08:22 AM" },
      { action: "Status changed to Resolved", time: "16 Sep 2026 · 09:15 AM", admin: "System Admin" }
    ]
  },
  {
    id: "CMP-1037",
    subject: "Suspicious activity report",
    description: "I noticed three login attempts from an unknown IP address in my security logs.",
    submittedBy: { name: "Global Solutions", email: "hr@globalsolutions.com", id: "usr_005" },
    role: "Recruiter",
    category: "Privacy & Security",
    priority: "Critical",
    status: "In Review",
    createdAt: "15 Sep 2026",
    updatedAt: "16 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "15 Sep 2026 · 07:45 PM" },
      { action: "Priority changed to Critical", time: "16 Sep 2026 · 08:00 AM", admin: "Admin User" },
      { action: "Status changed to In Review", time: "16 Sep 2026 · 08:05 AM", admin: "Admin User" }
    ]
  },
  {
    id: "CMP-1036",
    subject: "Resume parsing timeout",
    description: "Uploading a 5MB PDF resume causes a timeout error after 30 seconds.",
    submittedBy: { name: "Maria Garcia", email: "maria.garcia@example.com", id: "usr_013" },
    role: "Candidate",
    category: "Resume",
    priority: "Medium",
    status: "Closed",
    createdAt: "14 Sep 2026",
    updatedAt: "16 Sep 2026",
    resolutionNotes: "Increased the API timeout limit for the parsing microservice.",
    resolvedBy: "Backend Team",
    resolvedAt: "15 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "14 Sep 2026 · 01:12 PM" },
      { action: "Status changed to Resolved", time: "15 Sep 2026 · 02:00 PM", admin: "Backend Team" },
      { action: "Status changed to Closed", time: "16 Sep 2026 · 10:00 AM", admin: "System Admin" }
    ]
  },
  {
    id: "CMP-1035",
    subject: "Cannot view candidate profile",
    description: "Clicking on a candidate's profile from the shortlist redirects to a 404 page.",
    submittedBy: { name: "Innovate Ltd", email: "recruitment@innovate.co", id: "usr_014" },
    role: "Recruiter",
    category: "Technical",
    priority: "High",
    status: "Open",
    createdAt: "18 Sep 2026",
    updatedAt: "18 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "18 Sep 2026 · 03:20 PM" }
    ]
  },
  {
    id: "CMP-1034",
    subject: "Data deletion request",
    description: "Please delete all my account data and uploaded resumes according to GDPR.",
    submittedBy: { name: "John Doe", email: "john.doe@example.com", id: "usr_015" },
    role: "Candidate",
    category: "Privacy & Security",
    priority: "High",
    status: "In Review",
    createdAt: "18 Sep 2026",
    updatedAt: "18 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "18 Sep 2026 · 04:55 PM" },
      { action: "Status changed to In Review", time: "18 Sep 2026 · 05:10 PM", admin: "Compliance Officer" }
    ]
  },
  {
    id: "CMP-1033",
    subject: "Subscription billing error",
    description: "I was double charged for my monthly recruiter premium subscription.",
    submittedBy: { name: "Acme Corp", email: "billing@acmecorp.com", id: "usr_016" },
    role: "Recruiter",
    category: "Other",
    priority: "Critical",
    status: "Resolved",
    createdAt: "12 Sep 2026",
    updatedAt: "13 Sep 2026",
    resolutionNotes: "Refunded the duplicate charge via Stripe. Confirmed with customer.",
    resolvedBy: "Billing Admin",
    resolvedAt: "13 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "12 Sep 2026 · 09:00 AM" },
      { action: "Status changed to Resolved", time: "13 Sep 2026 · 11:30 AM", admin: "Billing Admin" }
    ]
  },
  {
    id: "CMP-1032",
    subject: "Inappropriate job posting",
    description: "A recommended job posting contains inappropriate language and unreasonable demands.",
    submittedBy: { name: "Emma Wilson", email: "emma.wilson@example.com", id: "usr_017" },
    role: "Candidate",
    category: "Job/Recruiter",
    priority: "High",
    status: "Resolved",
    createdAt: "11 Sep 2026",
    updatedAt: "12 Sep 2026",
    resolutionNotes: "Suspended the offending recruiter account and removed the job posting.",
    resolvedBy: "Admin User",
    resolvedAt: "12 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "11 Sep 2026 · 10:15 AM" },
      { action: "Status changed to Resolved", time: "12 Sep 2026 · 01:45 PM", admin: "Admin User" }
    ]
  },
  {
    id: "CMP-1031",
    subject: "Platform completely down",
    description: "The dashboard fails to load with a 500 Internal Server Error.",
    submittedBy: { name: "Startup Inc", email: "founder@startup.io", id: "usr_018" },
    role: "Recruiter",
    category: "Technical",
    priority: "Critical",
    status: "Closed",
    createdAt: "10 Sep 2026",
    updatedAt: "11 Sep 2026",
    resolutionNotes: "Outage caused by database migration failure. Rollback completed.",
    resolvedBy: "System Admin",
    resolvedAt: "10 Sep 2026",
    activity: [
      { action: "Complaint submitted", time: "10 Sep 2026 · 02:30 AM" },
      { action: "Priority changed to Critical", time: "10 Sep 2026 · 02:35 AM", admin: "System Auto" },
      { action: "Status changed to Resolved", time: "10 Sep 2026 · 04:00 AM", admin: "System Admin" },
      { action: "Status changed to Closed", time: "11 Sep 2026 · 09:00 AM", admin: "System Admin" }
    ]
  }
]
