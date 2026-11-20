import { Schema, model } from 'mongoose';
import { JOB_TYPES } from '../constants/enums';

const experienceSchema = new Schema({
  company: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  startDate: Date,
  endDate: Date,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: Number,
  endYear: Number,
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
    links: { linkedin: String, github: String, portfolio: String },
    preferredJobTypes: [{ type: String, enum: [...JOB_TYPES] }],
  },
  { timestamps: true },
);

export const CandidateProfile = model('CandidateProfile', candidateProfileSchema);
