export type Role = 'candidate' | 'recruiter' | 'admin';
export type ThemePref = 'light' | 'dark' | 'system';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'suspended';
  authProvider: 'local' | 'google' | 'linkedin';
  preferences?: { theme?: ThemePref; emailNotifications?: boolean };
  lastLoginAt?: string;
  createdAt: string;
  suspendedReason?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PageMeta & Record<string, unknown>;
}
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  level: number;
  startYear?: number;
  endYear?: number;
}
export interface Experience {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  current: boolean;
  description: string;
}
export interface ProfileSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years?: number;
}
export interface CandidateProfile {
  _id: string;
  user: string;
  name: string;
  email: string;
  headline: string;
  summary: string;
  phone: string;
  location: string;
  education: Education[];
  experience: Experience[];
  skills: ProfileSkill[];
  projects: { _id?: string; name: string; description: string; url: string; technologies: string[] }[];
  certifications: { _id?: string; name: string; issuer: string; year?: number }[];
  socialLinks: { linkedin: string; github: string; portfolio: string };
  totalExperienceYears: number;
  highestEducationLevel: number;
  activeResume?: { _id: string; originalName: string; status: string } | null;
  openToRecruiters: boolean;
  completeness: number;
}
export interface RecruiterProfile {
  _id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  location: string;
  about: string;
}

export type ResumeStage =
  | 'uploaded'
  | 'validating'
  | 'extracting'
  | 'detecting_skills'
  | 'analysing_experience'
  | 'generating_report'
  | 'completed'
  | 'failed';

export interface SecurityFinding {
  type: string;
  severity: number;
  excerpt: string;
}
export interface ResumeAnalysis {
  profile: {
    name: string;
    headline: string;
    summary: string;
    skills: { name: string; category: string; mentions: number }[];
    unknown_skills: string[];
    experience: { title: string; company: string; start: string; end: string; months: number; description: string }[];
    total_experience_years: number;
    job_titles: string[];
    education: { degree: string; level: number; level_label: string; field: string; institution: string; year: number | null }[];
    highest_education_level: number;
    highest_education_label: string;
    certifications: string[];
    projects: string[];
    sections_found: string[];
  };
  skill_categories: Record<string, number>;
  completeness: { score: number; checks: Record<string, boolean> };
  suggestions: string[];
  extraction_method: string;
  llm_used: boolean;
  document?: { file_type: string; pages: number; truncated: boolean; characters: number };
}
export interface Resume {
  _id: string;
  originalName: string;
  fileType: 'pdf' | 'docx';
  size: number;
  status: ResumeStage;
  stageHistory: { stage: ResumeStage; at: string }[];
  error?: string;
  analysis?: ResumeAnalysis;
  security: { riskScore: number; riskLevel: string; flagged: boolean; findings: SecurityFinding[] };
  reviewStatus: 'none' | 'pending' | 'cleared' | 'rejected';
  isActive: boolean;
  processingMs?: number;
  createdAt: string;
}

export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export interface Job {
  _id: string;
  recruiter: string;
  company: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationLevel: number;
  educationRequired: boolean;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salary?: { min?: number; max?: number; currency: string; period: 'year' | 'month' | 'hour' };
  status: 'draft' | 'published' | 'closed';
  publishedAt?: string;
  deadline?: string | null;
  views: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  match?: { score: number; category: MatchCategory } | null;
  bookmarked?: boolean;
  application?: { status: ApplicationStatus; createdAt: string } | null;
  companyProfile?: Partial<RecruiterProfile> | null;
  security?: { flagged: boolean; riskScore: number; findings: SecurityFinding[] };
}

export type MatchCategory = 'Strong Match' | 'Potential Match' | 'Low Match';
export interface SkillRow {
  skill: string;
  candidate_skill: string | null;
  match_type: 'exact' | 'alias' | 'related' | 'missing';
  required: boolean;
}
export interface MatchComponents {
  skills: number;
  experience: number;
  education: number;
  role: number;
}
export interface MatchResult {
  _id: string;
  candidate: string;
  job: string | Job;
  overallScore: number;
  category: MatchCategory;
  components: MatchComponents;
  matchedSkills: SkillRow[];
  relatedSkills: SkillRow[];
  missingSkills: SkillRow[];
  strengths: string[];
  gaps: string[];
  explanation: string;
  narrative?: string;
  recommendations: string[];
  details?: {
    experience?: { required: number; total: number; relevant: number; note: string | null };
    education?: { note: string | null };
    role?: { title_similarity: number; profile_similarity: number; backend: string };
    skills?: { required_score: number | null; preferred_score: number | null; note: string | null };
  };
  modelVersion: string;
  embeddingBackend: string;
  llmUsed: boolean;
  validated: boolean;
  computedAt: string;
}

export type ApplicationStatus = 'applied' | 'screened' | 'shortlisted' | 'interview' | 'hired' | 'rejected' | 'withdrawn';
export interface Application {
  _id: string;
  job: Job;
  candidate: { _id: string; name: string; email?: string } | string;
  recruiter: string;
  resume?: string | { _id: string; originalName: string; security?: { flagged: boolean }; reviewStatus?: string };
  status: ApplicationStatus;
  statusHistory: { from: ApplicationStatus | null; to: ApplicationStatus; actor: string; note?: string; at: string }[];
  coverLetter: string;
  matchScore?: number | null;
  matchCategory?: MatchCategory;
  matchResult?: MatchResult | null;
  recruiterNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  _id: string;
  application: string;
  job: { _id: string; title: string; company?: string };
  candidate: { _id: string; name: string; email?: string };
  recruiter: { _id: string; name: string } | string;
  scheduledAt: string;
  durationMinutes: number;
  type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
  meetingUrl: string;
  location: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: { rating?: number; strengths?: string; concerns?: string; recommendation?: 'advance' | 'hold' | 'decline'; notes?: string; submittedAt?: string };
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  readAt?: string | null;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  user: { _id: string; name: string; email: string; role: Role } | string;
  subject: string;
  description: string;
  category: 'technical' | 'account' | 'job' | 'ai' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  responses: { _id?: string; author: { _id: string; name: string; role: Role } | string; role: Role; message: string; at: string }[];
  history: { field: string; from: string; to: string; at: string }[];
  createdAt: string;
  resolvedAt?: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: string;
  aliases: string[];
  related: string[];
  status: 'approved' | 'pending' | 'rejected';
  source: 'seed' | 'admin' | 'resume';
  occurrences: number;
}

export interface AuditLog {
  _id: string;
  action: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  actorEmail?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AiEvaluationRun {
  _id: string;
  mode: 'job' | 'benchmark';
  job?: { _id: string; title: string } | null;
  runBy?: { name: string } | string;
  candidateCount: number;
  summary: { meanScore: number; counterfactualPassed: boolean; stabilityPassed: boolean; impactRatio: number | null; formulaValid: boolean };
  result?: any;
  modelVersion?: string;
  embeddingBackend?: string;
  createdAt: string;
}
