import { Schema, model } from 'mongoose';

export interface IAuditLog {
  action: string;
  actorId?: Schema.Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actorEmail: { type: String, index: true },
    actorRole: { type: String, index: true },
    targetType: { type: String, index: true },
    targetId: { type: String, index: true },
    ipAddress: String,
    userAgent: String,
    details: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failure'], default: 'success', index: true },
    errorMessage: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog = model('AuditLog', auditLogSchema);
