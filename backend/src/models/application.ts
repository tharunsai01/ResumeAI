import { Schema, model } from 'mongoose';
import { APPLICATION_STATUS } from '../constants/enums';

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: [...APPLICATION_STATUS], required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String,
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    coverLetter: String,
    matchScore: { type: Number, min: 0, max: 100 },
    matchedSkills: [String],
    partialSkills: [String],
    missingSkills: [String],
    matchResult: { type: Schema.Types.ObjectId, ref: 'MatchResult' },
    recruiterNotes: [
      {
        note: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: [...APPLICATION_STATUS], default: 'applied' },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });

export const Application = model('Application', applicationSchema);
