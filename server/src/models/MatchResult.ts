import { Schema, model } from 'mongoose';

const matchResultSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skillsScore: { type: Number, min: 0, max: 100, required: true },
    experienceScore: { type: Number, min: 0, max: 100, required: true },
    educationScore: { type: Number, min: 0, max: 100, required: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    matchedSkills: [String],
    missingSkills: [String],
    explanation: String,
    meetsThreshold: { type: Boolean, default: false },
    modelVersion: String,
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

matchResultSchema.index({ job: 1, overallScore: -1 });

export const MatchResult = model('MatchResult', matchResultSchema);
