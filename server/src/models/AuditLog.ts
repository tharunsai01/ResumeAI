import { Schema, model } from 'mongoose';

const auditLogSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },          // e.g. 'user.suspend'
    targetType: { type: String, required: true },      // 'user' | 'complaint'
    targetId: { type: Schema.Types.ObjectId, required: true },
    meta: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model('AuditLog', auditLogSchema);
