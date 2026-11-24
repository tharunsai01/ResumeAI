import { Schema, model } from 'mongoose';

export interface IScreeningSettings {
  recruiter?: Schema.Types.ObjectId;
  job?: Schema.Types.ObjectId;
  isDefault: boolean;
  threshold: number;
  weights: {
    skills: number;
    experience: number;
    education: number;
    roleSimilarity: number;
  };
  autoShortlistThreshold?: number;
  autoRejectThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

const screeningSettingsSchema = new Schema(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    isDefault: { type: Boolean, default: false },
    threshold: { type: Number, default: 80, min: 0, max: 100 },
    weights: {
      skills: { type: Number, default: 50, min: 0, max: 100 },
      experience: { type: Number, default: 20, min: 0, max: 100 },
      education: { type: Number, default: 10, min: 0, max: 100 },
      roleSimilarity: { type: Number, default: 20, min: 0, max: 100 },
    },
    autoShortlistThreshold: { type: Number, min: 0, max: 100 },
    autoRejectThreshold: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true },
);

screeningSettingsSchema.index({ recruiter: 1, job: 1 });

export const ScreeningSettings = model('ScreeningSettings', screeningSettingsSchema);
