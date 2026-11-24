import { Schema, model } from 'mongoose';
import { JOB_TYPES } from '../constants/enums';

const experienceSchema = new Schema({
  company: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
  location: String,
});

const educationSchema = new Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: Number,
  endYear: Number,
  grade: String,
  description: String,
});

const projectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  role: String,
  technologies: [{ type: String, trim: true }],
  link: String,
  startDate: Date,
  endDate: Date,
});

const certificationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  issuer: { type: String, required: true, trim: true },
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String,
});

const candidateProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, trim: true },
    summary: String,
    phone: String,
    location: { type: String, trim: true },
    avatarUrl: String,
    skills: [{ type: String, trim: true }],
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    bookmarkedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    links: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    preferredJobTypes: [{ type: String, enum: [...JOB_TYPES] }],
    careerPreferences: {
      preferredJobTitles: [{ type: String, trim: true }],
      preferredLocations: [{ type: String, trim: true }],
      expectedSalary: { type: Number, min: 0 },
      willingToRelocate: { type: Boolean, default: false },
    },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

export const CandidateProfile = model('CandidateProfile', candidateProfileSchema);
