// src/data/mockAdminDashboard.ts

export const adminDashboardStats = {
  totalUsers: {
    value: 1248,
    breakdown: {
      candidates: 1086,
      recruiters: 148,
      administrators: 14,
    }
  },
  activeUsers: {
    value: 1172,
    trend: { value: "6.4%", isPositive: true },
  },
  activeJobs: {
    value: 86,
    trend: { value: "8", isPositive: true },
  },
  openComplaints: {
    value: 5,
    highPriority: 2,
  },
  resumesProcessed: {
    value: 3842,
    trend: { value: "12.8%", isPositive: true },
  },
  aiEvaluationStatus: {
    value: "Healthy",
    lastEvaluation: "2 days ago"
  }
}

export const platformActivityData = [
  { name: 'Jan', activeUsers: 850, registrations: 120, resumes: 320 },
  { name: 'Feb', activeUsers: 900, registrations: 150, resumes: 400 },
  { name: 'Mar', activeUsers: 950, registrations: 110, resumes: 450 },
  { name: 'Apr', activeUsers: 1020, registrations: 180, resumes: 520 },
  { name: 'May', activeUsers: 1100, registrations: 200, resumes: 610 },
  { name: 'Jun', activeUsers: 1172, registrations: 210, resumes: 700 },
]

export const complaintOverview = {
  open: 5,
  inReview: 3,
  resolved: 42,
  highPriority: 2,
}

export const aiEvaluationOverview = {
  processing: {
    processed: 3842,
    successful: 3796,
    warnings: 46,
  },
  security: {
    checksCompleted: 3842,
    suspiciousContent: 4,
    promptInjection: 14,
  },
  evaluation: {
    skillExtraction: "Evaluated",
    scoreStability: "Evaluated",
    fairnessTest: "Passed",
  }
}

export const auditActivities = [
  {
    id: "1",
    activity: "Updated AI screening configuration",
    actor: "Admin User",
    role: "Administrator",
    timestamp: "2 min ago",
    status: "success"
  },
  {
    id: "2",
    activity: "Complaint status updated to In Review",
    actor: "Sarah Jenkins",
    role: "Administrator",
    timestamp: "15 min ago",
    status: "info"
  },
  {
    id: "3",
    activity: "Created a new job posting",
    actor: "TechCorp Inc.",
    role: "Recruiter",
    timestamp: "1 hour ago",
    status: "success"
  },
  {
    id: "4",
    activity: "Suspicious resume upload blocked",
    actor: "System",
    role: "System",
    timestamp: "3 hours ago",
    status: "warning"
  },
  {
    id: "5",
    activity: "Changed skill taxonomy (React -> React.js)",
    actor: "Admin User",
    role: "Administrator",
    timestamp: "5 hours ago",
    status: "success"
  }
]

export const systemHealth = {
  uptime: "99.9%",
  services: [
    { name: "Application", status: "Operational", healthy: true },
    { name: "Database", status: "Operational", healthy: true },
    { name: "AI Processing", status: "Operational", healthy: true },
    { name: "Resume Processing", status: "Operational", healthy: true },
    { name: "API Services", status: "Operational", healthy: true },
  ]
}

export const skillTaxonomyOverview = {
  totalSkills: 248,
  categories: 12,
  recentlyUpdated: 12,
  exampleCategories: [
    "Programming",
    "Frontend",
    "Backend",
    "Database",
    "Cloud",
    "DevOps",
    "Cybersecurity",
    "Data & AI"
  ]
}
