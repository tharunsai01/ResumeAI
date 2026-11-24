/**
 * Smaller models: Interview, Notification, Complaint, Skill, ScreeningSettings,
 * AuditLog, AiEvaluation, MatchResult.
 */
import { Schema, model, type InferSchemaType } from 'mongoose';
import { AUDIT_CATEGORIES, COMPLAINT_STATUSES, INTERVIEW_STATUSES, INTERVIEW_TYPES, PRIORITIES } from '../constants';

// --- Interview ------------------------------------------------------------------
const interviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, min: 15, max: 480, default: 45 },
    type: { type: String, enum: INTERVIEW_TYPES, default: 'video' },
    meetingUrl: { type: String, maxlength: 500, default: '' },
    location: { type: String, maxlength: 200, default: '' },
    notes: { type: String, maxlength: 2000, default: '' },
    status: { type: String, enum: INTERVIEW_STATUSES, default: 'scheduled', index: true },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      strengths: { type: String, maxlength: 2000 },
      concerns: { type: String, maxlength: 2000 },
      recommendation: { type: String, enum: ['advance', 'hold', 'decline'] },
      notes: { type: String, maxlength: 3000 },
      submittedAt: Date,
    },
  },
  { timestamps: true },
);
export type IInterview = InferSchemaType<typeof interviewSchema>;
export const Interview = model('Interview', interviewSchema);

// --- Notification ----------------------------------------------------------------
const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, maxlength: 50 },
    title: { type: String, required: true, maxlength: 150 },
    message: { type: String, maxlength: 500, default: '' },
    link: { type: String, maxlength: 300, default: '' },
    readAt: Date,
  },
  { timestamps: true },
);
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
export const Notification = model('Notification', notificationSchema);

// --- Complaint / support ticket -------------------------------------------------
const complaintSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 5000 },
    category: { type: String, enum: ['technical', 'account', 'job', 'ai', 'other'], default: 'other' },
    priority: { type: String, enum: PRIORITIES, default: 'medium', index: true },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'open', index: true },
    responses: [
      {
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        role: String,
        message: { type: String, maxlength: 5000 },
        at: { type: Date, default: Date.now },
      },
    ],
    history: [{ field: String, from: String, to: String, by: { type: Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
    resolvedAt: Date,
  },
  { timestamps: true },
);
export const Complaint = model('Complaint', complaintSchema);

// --- Skill taxonomy -------------------------------------------------------------
const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    category: { type: String, default: 'Other', maxlength: 60, index: true },
    aliases: { type: [String], default: [] },
    related: { type: [String], default: [] },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved', index: true },
    source: { type: String, enum: ['seed', 'admin', 'resume'], default: 'admin' },
    occurrences: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export type ISkill = InferSchemaType<typeof skillSchema>;
export const Skill = model('Skill', skillSchema);

// --- Screening settings (per job) -----------------------------------------------
const screeningSettingsSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    autoScreenOnApply: { type: Boolean, default: true },
    highlightThreshold: { type: Number, min: 0, max: 100, default: 80 },
    blindReview: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
export const ScreeningSettings = model('ScreeningSettings', screeningSettingsSchema);

// --- Audit log ------------------------------------------------------------------
const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: String,
    actorEmail: String,
    action: { type: String, required: true, maxlength: 80, index: true },
    category: { type: String, enum: AUDIT_CATEGORIES, required: true, index: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info', index: true },
    targetType: String,
    targetId: String,
    ip: String,
    userAgent: { type: String, maxlength: 300 },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * Number(process.env.AUDIT_RETENTION_DAYS || 365), name: 'audit_retention' },
);
export const AuditLog = model('AuditLog', auditLogSchema);

// --- AI evaluation run ----------------------------------------------------------
const aiEvaluationSchema = new Schema(
  {
    mode: { type: String, enum: ['job', 'benchmark'], required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    runBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    candidateCount: Number,
    summary: {
      meanScore: Number,
      counterfactualPassed: Boolean,
      stabilityPassed: Boolean,
      impactRatio: Number,
      formulaValid: Boolean,
    },
    result: Schema.Types.Mixed,
    modelVersion: String,
    embeddingBackend: String,
  },
  { timestamps: true },
);
export const AiEvaluation = model('AiEvaluation', aiEvaluationSchema);

// --- Match result ---------------------------------------------------------------
const matchResultSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    inputHash: { type: String, required: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    category: { type: String, enum: ['Strong Match', 'Potential Match', 'Low Match'], required: true },
    components: {
      skills: { type: Number, min: 0, max: 100 },
      experience: { type: Number, min: 0, max: 100 },
      education: { type: Number, min: 0, max: 100 },
      role: { type: Number, min: 0, max: 100 },
    },
    matchedSkills: [Schema.Types.Mixed],
    relatedSkills: [Schema.Types.Mixed],
    missingSkills: [Schema.Types.Mixed],
    strengths: [String],
    gaps: [String],
    explanation: String,
    narrative: String,
    recommendations: [String],
    details: Schema.Types.Mixed,
    modelVersion: String,
    embeddingBackend: String,
    llmUsed: Boolean,
    validated: { type: Boolean, required: true },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
matchResultSchema.index({ candidate: 1, job: 1 }, { unique: true });
export type IMatchResult = InferSchemaType<typeof matchResultSchema>;
export const MatchResult = model('MatchResult', matchResultSchema);
