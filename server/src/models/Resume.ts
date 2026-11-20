import { Schema, model } from 'mongoose';
import { PARSE_STATUS } from '../constants/enums';

const resumeSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    fileName: String,
    mimeType: String,
    sizeBytes: Number,
    rawText: { type: String, select: false },
    parsedData: {
      skills: [String],
      totalExperienceYears: Number,
      experience: [Schema.Types.Mixed],
      education: [Schema.Types.Mixed],
    },
    parseStatus: { type: String, enum: [...PARSE_STATUS], default: 'pending' },
    parseError: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Resume = model('Resume', resumeSchema);
