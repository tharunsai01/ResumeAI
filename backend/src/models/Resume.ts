import { Schema, model, type InferSchemaType } from 'mongoose';
import { RESUME_STAGES } from '../constants';

const resumeSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalName: { type: String, required: true, maxlength: 150 },
    storedName: { type: String, required: true, select: false },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    size: { type: Number, required: true },
    sha256: { type: String, required: true },
    status: { type: String, enum: RESUME_STAGES, default: 'uploaded', index: true },
    stageHistory: [{ stage: { type: String, enum: RESUME_STAGES }, at: { type: Date, default: Date.now } }],
    error: { type: String, maxlength: 300 },
    text: { type: String, select: false },
    analysis: { type: Schema.Types.Mixed },
    security: {
      riskScore: { type: Number, default: 0 },
      riskLevel: { type: String, default: 'none' },
      flagged: { type: Boolean, default: false, index: true },
      findings: { type: [Schema.Types.Mixed], default: [] },
    },
    reviewStatus: { type: String, enum: ['none', 'pending', 'cleared', 'rejected'], default: 'none', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    isActive: { type: Boolean, default: false },
    processingMs: Number,
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true },
);

resumeSchema.index({ candidate: 1, createdAt: -1 });

export type IResume = InferSchemaType<typeof resumeSchema>;
export const Resume = model('Resume', resumeSchema);
