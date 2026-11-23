/**
 * Admin Portal Domain Types
 */

// --- Admin Users ---
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

// --- Admin Complaints ---
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

// --- Admin Skills Taxonomy ---
export type SkillStatus = "Active" | "Inactive"
export type CategoryStatus = "Active" | "Inactive"

export interface AdminSkillCategory {
  id: string
  name: string
  description: string
  status: CategoryStatus
}

export interface SkillTaxonomy {
  id: string
  name: string
  categoryId: string
  aliases: string[]
  description: string
  usageCount: number
  status: SkillStatus
  createdAt: string
  updatedAt: string
}

export interface TaxonomyActivity {
  id: string
  action: string
  skill: string
  actor: string
  time: string
}

// --- Admin Audit Logs ---
export type AuditEventType = 
  | "User Management"
  | "Complaint"
  | "Skill Taxonomy"
  | "AI Processing"
  | "AI Configuration"
  | "Security"
  | "Authentication"
  | "System"
  | "Recruitment Activity"

export type ActorRole = "Administrator" | "Recruiter" | "Candidate" | "System"
export type AuditSeverity = "Info" | "Warning" | "Critical"

export interface AuditLog {
  id: string
  eventType: AuditEventType
  description: string
  actorId: string
  actorName: string
  actorRole: ActorRole
  resourceType: string
  resourceId: string
  severity: AuditSeverity
  timestamp: string
  metadata?: Record<string, string | number | boolean>
}

// --- Admin AI Evaluation ---
export interface FairnessPair {
  id: string
  scoreA: number
  scoreB: number
  difference: number
  status: string
}

export interface EvaluationRecord {
  id: string
  modelVersion: string
  dataset: string
  components: string
  date: string
  status: string
  metrics: {
    skillExtraction?: string
    scoreStability?: string
    fairness?: string
    security?: string
  }
}

// --- Admin System Health ---
export type HealthStatus = "Operational" | "Degraded" | "Unavailable"

export interface ServiceEvent {
  message: string
  severity: "Info" | "Warning" | "Critical"
  time: string
}

export interface ServiceHealth {
  id: string
  name: string
  status: HealthStatus
  responseTime: string
  lastChecked: string
  details?: Record<string, string | number>
  recentEvents: ServiceEvent[]
}

export interface SystemEvent {
  event: string
  severity: "Info" | "Warning" | "Critical"
  time: string
}

export interface HealthHistoryPoint {
  time: string
  value: number
}

// --- Admin Settings & Account State ---
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

// --- Backend Live Health Check Types ---
export type BackendDatabaseStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "disconnecting"
  | "uninitialized"
  | "unknown"

export interface BackendHealthData {
  status: "ok" | string
  uptime: number
  timestamp: string
  database: BackendDatabaseStatus | string
}

export interface BackendHealthResponse {
  success: boolean
  data: BackendHealthData
}

export type HealthConnectionState =
  | "loading"
  | "connected"
  | "degraded"
  | "unavailable"
  | "timeout"

export interface LiveHealthStatus {
  healthy: boolean
  state: HealthConnectionState
  uptime: string
  databaseStatus: string
  details?: BackendHealthData
  error?: string
  lastChecked: string
}

