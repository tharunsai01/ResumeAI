import { Schema, model, type InferSchemaType } from 'mongoose';

const educationSchema = new Schema(
  {
    institution: { type: String, maxlength: 150, default: '' },
    degree: { type: String, maxlength: 150, default: '' },
    field: { type: String, maxlength: 120, default: '' },
    level: { type: Number, min: 0, max: 5, default: 0 },
    startYear: { type: Number, min: 1950, max: 2100 },
    endYear: { type: Number, min: 1950, max: 2100 },
  },
  { _id: true },
);

const experienceSchema = new Schema(
  {
    title: { type: String, maxlength: 150, required: true },
    company: { type: String, maxlength: 150, default: '' },
    location: { type: String, maxlength: 120, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 2000, default: '' },
  },
  { _id: true },
);

const candidateProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, maxlength: 150, default: '' },
    summary: { type: String, maxlength: 3000, default: '' },
    phone: { type: String, maxlength: 30, default: '' },
    location: { type: String, maxlength: 120, default: '' },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    skills: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, maxlength: 80 },
            level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
            years: { type: Number, min: 0, max: 50 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    projects: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, maxlength: 120 },
            description: { type: String, maxlength: 1000, default: '' },
            url: { type: String, maxlength: 300, default: '' },
            technologies: { type: [String], default: [] },
          },
          { _id: true },
        ),
      ],
      default: [],
    },
    certifications: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, maxlength: 150 },
            issuer: { type: String, maxlength: 120, default: '' },
            year: { type: Number, min: 1950, max: 2100 },
          },
          { _id: true },
        ),
      ],
      default: [],
    },
    socialLinks: {
      linkedin: { type: String, maxlength: 300, default: '' },
      github: { type: String, maxlength: 300, default: '' },
      portfolio: { type: String, maxlength: 300, default: '' },
    },
    totalExperienceYears: { type: Number, min: 0, max: 60, default: 0 },
    highestEducationLevel: { type: Number, min: 0, max: 5, default: 0 },
    activeResume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    bookmarkedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    openToRecruiters: { type: Boolean, default: false, index: true },
    completeness: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true },
);

candidateProfileSchema.index({ 'skills.name': 1 });

export type ICandidateProfile = InferSchemaType<typeof candidateProfileSchema>;
export const CandidateProfile = model('CandidateProfile', candidateProfileSchema);
