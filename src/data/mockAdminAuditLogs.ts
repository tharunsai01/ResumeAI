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

export const initialAuditLogs: AuditLog[] = [
  {
    id: "AL-1001",
    eventType: "User Management",
    description: "User account suspended",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "User",
    resourceId: "USR-1012",
    severity: "Warning",
    timestamp: "21 Sep 2026 10:42 AM",
    metadata: {
      "Reason": "Violation of terms",
      "Action": "Suspension"
    }
  },
  {
    id: "AL-1002",
    eventType: "Skill Taxonomy",
    description: "Skill taxonomy updated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Skill",
    resourceId: "SKL-0021",
    severity: "Info",
    timestamp: "21 Sep 2026 10:20 AM",
    metadata: {
      "Skill Name": "Python",
      "Changed Field": "Aliases",
      "Previous": "Python 3",
      "New": "Python 3, Python Language"
    }
  },
  {
    id: "AL-1003",
    eventType: "AI Configuration",
    description: "AI screening configuration changed",
    actorId: "usr-rec-1",
    actorName: "Sarah Jenkins",
    actorRole: "Recruiter",
    resourceType: "Job",
    resourceId: "JOB-104",
    severity: "Warning",
    timestamp: "20 Sep 2026 04:15 PM",
    metadata: {
      "Changed": "Experience Weight",
      "Previous": "20%",
      "New": "25%"
    }
  },
  {
    id: "AL-1004",
    eventType: "Security",
    description: "Prompt injection warning detected",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Resume",
    resourceId: "RES-8821",
    severity: "Critical",
    timestamp: "20 Sep 2026 03:51 PM",
    metadata: {
      "Status": "Recorded",
      "Details": "Instruction-like content was detected during resume processing."
    }
  },
  {
    id: "AL-1005",
    eventType: "AI Processing",
    description: "AI screening completed",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Screening",
    resourceId: "SCR-9901",
    severity: "Info",
    timestamp: "20 Sep 2026 03:55 PM",
    metadata: {
      "Model Version": "demo-model-v1",
      "Job ID": "JOB-104",
      "Resume ID": "RES-8821",
      "Score": "85%"
    }
  },
  {
    id: "AL-1006",
    eventType: "Authentication",
    description: "Failed login attempt",
    actorId: "unknown",
    actorName: "Unknown",
    actorRole: "Candidate",
    resourceType: "Account",
    resourceId: "ACC-5002",
    severity: "Warning",
    timestamp: "20 Sep 2026 02:30 PM",
    metadata: {
      "Attempt": 3,
      "IP": "Hidden for security"
    }
  },
  {
    id: "AL-1007",
    eventType: "Complaint",
    description: "Complaint priority changed",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Complaint",
    resourceId: "CMP-1042",
    severity: "Info",
    timestamp: "20 Sep 2026 11:20 AM",
    metadata: {
      "Previous Priority": "Low",
      "New Priority": "High"
    }
  },
  {
    id: "AL-1008",
    eventType: "Complaint",
    description: "Resolution note added",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Complaint",
    resourceId: "CMP-1042",
    severity: "Info",
    timestamp: "20 Sep 2026 11:45 AM",
    metadata: {
      "Action": "Resolved complaint regarding unfair screening."
    }
  },
  {
    id: "AL-1009",
    eventType: "System",
    description: "System health check completed",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Platform",
    resourceId: "SYS-001",
    severity: "Info",
    timestamp: "20 Sep 2026 06:00 AM",
    metadata: {
      "Status": "All systems operational",
      "Latency": "45ms"
    }
  },
  {
    id: "AL-1010",
    eventType: "Skill Taxonomy",
    description: "Skill deactivated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Skill",
    resourceId: "SKL-0150",
    severity: "Warning",
    timestamp: "19 Sep 2026 04:30 PM",
    metadata: {
      "Skill Name": "Flash",
      "Previous Status": "Active",
      "New Status": "Inactive"
    }
  },
  {
    id: "AL-1011",
    eventType: "Skill Taxonomy",
    description: "Category updated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Category",
    resourceId: "CAT-005",
    severity: "Info",
    timestamp: "19 Sep 2026 02:15 PM",
    metadata: {
      "Category Name": "Cloud Computing",
      "Changed": "Name"
    }
  },
  {
    id: "AL-1012",
    eventType: "User Management",
    description: "User profile viewed",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "User",
    resourceId: "USR-3021",
    severity: "Info",
    timestamp: "19 Sep 2026 01:10 PM",
    metadata: {}
  },
  {
    id: "AL-1013",
    eventType: "User Management",
    description: "User reactivated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "User",
    resourceId: "USR-1012",
    severity: "Info",
    timestamp: "19 Sep 2026 12:45 PM",
    metadata: {
      "Action": "Reactivation after review"
    }
  },
  {
    id: "AL-1014",
    eventType: "Recruitment Activity",
    description: "Candidate shortlisted",
    actorId: "usr-rec-2",
    actorName: "Michael Chen",
    actorRole: "Recruiter",
    resourceType: "Application",
    resourceId: "APP-502",
    severity: "Info",
    timestamp: "18 Sep 2026 03:20 PM",
    metadata: {
      "Job ID": "JOB-105"
    }
  },
  {
    id: "AL-1015",
    eventType: "Authentication",
    description: "Account verification completed",
    actorId: "usr-can-3",
    actorName: "Emily Davis",
    actorRole: "Candidate",
    resourceType: "Account",
    resourceId: "ACC-5003",
    severity: "Info",
    timestamp: "18 Sep 2026 11:30 AM",
    metadata: {
      "Method": "Email"
    }
  },
  {
    id: "AL-1016",
    eventType: "AI Configuration",
    description: "Blind screening enabled",
    actorId: "usr-rec-1",
    actorName: "Sarah Jenkins",
    actorRole: "Recruiter",
    resourceType: "Job",
    resourceId: "JOB-106",
    severity: "Warning",
    timestamp: "18 Sep 2026 09:15 AM",
    metadata: {
      "Feature": "Blind Screening",
      "Status": "Enabled"
    }
  },
  {
    id: "AL-1017",
    eventType: "AI Processing",
    description: "Skill extraction completed",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Resume",
    resourceId: "RES-8822",
    severity: "Info",
    timestamp: "17 Sep 2026 05:40 PM",
    metadata: {
      "Model Version": "demo-model-v1",
      "Skills Extracted": 14
    }
  },
  {
    id: "AL-1018",
    eventType: "Security",
    description: "Suspicious resume content detected",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Resume",
    resourceId: "RES-8825",
    severity: "Critical",
    timestamp: "17 Sep 2026 02:10 PM",
    metadata: {
      "Status": "Quarantined",
      "Details": "Hidden text layer detected in PDF structure."
    }
  },
  {
    id: "AL-1019",
    eventType: "User Management",
    description: "Administrator account created",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "User",
    resourceId: "USR-1002",
    severity: "Warning",
    timestamp: "16 Sep 2026 10:00 AM",
    metadata: {
      "Created By": "System Setup"
    }
  },
  {
    id: "AL-1020",
    eventType: "Complaint",
    description: "Complaint submitted",
    actorId: "usr-can-5",
    actorName: "James Wilson",
    actorRole: "Candidate",
    resourceType: "Complaint",
    resourceId: "CMP-1043",
    severity: "Info",
    timestamp: "16 Sep 2026 09:30 AM",
    metadata: {
      "Subject": "Technical issue during test"
    }
  },
  {
    id: "AL-1021",
    eventType: "System",
    description: "Configuration updated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Platform",
    resourceId: "SYS-CONFIG",
    severity: "Warning",
    timestamp: "15 Sep 2026 04:20 PM",
    metadata: {
      "Changed": "Max Upload Size",
      "Previous": "5MB",
      "New": "10MB"
    }
  },
  {
    id: "AL-1022",
    eventType: "AI Configuration",
    description: "AI matching configuration updated",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "System Config",
    resourceId: "CFG-AI",
    severity: "Warning",
    timestamp: "15 Sep 2026 02:10 PM",
    metadata: {
      "Changed": "Skills Weight",
      "Previous": "55%",
      "New": "50%"
    }
  },
  {
    id: "AL-1023",
    eventType: "Skill Taxonomy",
    description: "Skill added",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Skill",
    resourceId: "SKL-0250",
    severity: "Info",
    timestamp: "14 Sep 2026 11:30 AM",
    metadata: {
      "Skill Name": "Rust",
      "Category": "Programming"
    }
  },
  {
    id: "AL-1024",
    eventType: "Security",
    description: "Security check completed",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Platform",
    resourceId: "SYS-SEC",
    severity: "Info",
    timestamp: "14 Sep 2026 02:00 AM",
    metadata: {
      "Status": "Passed",
      "Vulnerabilities Found": 0
    }
  },
  {
    id: "AL-1025",
    eventType: "AI Processing",
    description: "AI evaluation completed",
    actorId: "system",
    actorName: "System",
    actorRole: "System",
    resourceType: "Evaluation",
    resourceId: "EVAL-101",
    severity: "Info",
    timestamp: "13 Sep 2026 08:45 AM",
    metadata: {
      "Model Version": "demo-model-v1",
      "Type": "Fairness Audit",
      "Result": "Within acceptable bounds"
    }
  },
  {
    id: "AL-1026",
    eventType: "Recruitment Activity",
    description: "Job created",
    actorId: "usr-rec-2",
    actorName: "Michael Chen",
    actorRole: "Recruiter",
    resourceType: "Job",
    resourceId: "JOB-107",
    severity: "Info",
    timestamp: "12 Sep 2026 03:15 PM",
    metadata: {
      "Title": "Senior Frontend Developer"
    }
  },
  {
    id: "AL-1027",
    eventType: "Authentication",
    description: "User login",
    actorId: "usr-admin-1",
    actorName: "Admin User",
    actorRole: "Administrator",
    resourceType: "Account",
    resourceId: "ACC-1001",
    severity: "Info",
    timestamp: "12 Sep 2026 09:00 AM",
    metadata: {
      "IP": "Hidden for security"
    }
  }
]
