import { Schema, model } from 'mongoose';
import { PARSE_STATUS } from '../constants/enums';

const resumeSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: String,
    originalFilename: String,
    storedFileName: String,
    filePath: String,
    mimeType: String,
    fileType: String,
    sizeBytes: Number,
    fileSize: Number,
    fileHash: { type: String, index: true },
    rawText: { type: String, select: false },
    parsedData: {
      skills: [String],
      totalExperienceYears: Number,
      experience: [Schema.Types.Mixed],
      education: [Schema.Types.Mixed],
      projects: [Schema.Types.Mixed],
      certifications: [Schema.Types.Mixed],
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
    securityResult: {
      isSafe: { type: Boolean, default: true },
      flags: [String],
      scannedAt: { type: Date, default: Date.now },
    },
    aiModelInfo: {
      model: String,
      provider: String,
      version: String,
    },
    parseStatus: { type: String, enum: [...PARSE_STATUS], default: 'pending' },
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    parseError: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

resumeSchema.index({ candidate: 1, isActive: 1 });
resumeSchema.index({ candidate: 1, fileHash: 1 });

export const Resume = model('Resume', resumeSchema);
