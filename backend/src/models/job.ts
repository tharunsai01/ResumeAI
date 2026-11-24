import { Schema, model } from 'mongoose';
import { JOB_STATUS, JOB_TYPES, WORK_MODES, EDUCATION_LEVELS } from '../constants/enums';

const jobSchema = new Schema(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    companyOverview: { type: String, trim: true },
    department: { type: String, trim: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    location: { type: String, trim: true },
    workMode: { type: String, enum: [...WORK_MODES], default: 'onsite' },
    jobType: { type: String, enum: [...JOB_TYPES], default: 'full-time' },
    requiredSkills: [{ type: String, trim: true }],
    niceToHaveSkills: [{ type: String, trim: true }],
    minExperienceYears: { type: Number, default: 0, min: 0 },
    maxExperienceYears: { type: Number, min: 0 },
    educationLevel: { type: String, enum: [...EDUCATION_LEVELS], default: 'any' },
    salary: { min: Number, max: Number, currency: String },
    openings: { type: Number, default: 1, min: 1 },
    deadline: Date,
    applicationCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: [...JOB_STATUS], default: 'draft' },
    screening: {
      threshold: { type: Number, default: 80, min: 0, max: 100 },
      weights: {
        skills: { type: Number, default: 50 },
        experience: { type: Number, default: 30 },
        education: { type: Number, default: 20 },
      },
    },
    parsedRequirements: Schema.Types.Mixed,
  },
  { timestamps: true },
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = model('Job', jobSchema);
