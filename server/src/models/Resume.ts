import { Schema, model } from 'mongoose';
import { PARSE_STATUS } from '../constants/enums';

const resumeSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: String,
    storedFileName: String,
    mimeType: String,
    sizeBytes: Number,
    rawText: { type: String, select: false },
    parsedData: {
      skills: [String],
      totalExperienceYears: Number,
      experience: [Schema.Types.Mixed],
      education: [Schema.Types.Mixed],
      contact: {
        email: String,
        phone: String,
      },
    },
    aiAnalysis: {
      summary: String,
      qualityScore: Number,
      breakdown: {
        skills: Number,
        experience: Number,
        education: Number,
        projects: Number,
      },
      skills: [
        {
          name: String,
          score: Number,
          category: String,
        },
      ],
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      missingKeywords: [String],
      analyzedAt: Date,
      provider: String,
    },
    parseStatus: { type: String, enum: [...PARSE_STATUS], default: 'pending' },
    parseError: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Resume = model('Resume', resumeSchema);
