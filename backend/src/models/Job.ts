import { Schema, model, type InferSchemaType } from 'mongoose';
import { EMPLOYMENT_TYPES, JOB_STATUSES, WORK_MODES } from '../constants';

const jobSchema = new Schema(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 20000 },
    requiredSkills: { type: [String], default: [] },
    preferredSkills: { type: [String], default: [] },
    minExperienceYears: { type: Number, min: 0, max: 40, default: 0 },
    educationLevel: { type: Number, min: 0, max: 5, default: 0 },
    educationRequired: { type: Boolean, default: false },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, default: 'full-time' },
    workMode: { type: String, enum: WORK_MODES, default: 'onsite', index: true },
    location: { type: String, maxlength: 120, default: '' },
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, maxlength: 3, default: 'USD' },
      period: { type: String, enum: ['year', 'month', 'hour'], default: 'year' },
    },
    status: { type: String, enum: JOB_STATUSES, default: 'draft', index: true },
    publishedAt: Date,
    closedAt: Date,
    deadline: Date,
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    security: {
      flagged: { type: Boolean, default: false },
      riskScore: { type: Number, default: 0 },
      findings: { type: [Schema.Types.Mixed], default: [] },
    },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ requiredSkills: 1 });

export type IJob = InferSchemaType<typeof jobSchema>;
export const Job = model('Job', jobSchema);
