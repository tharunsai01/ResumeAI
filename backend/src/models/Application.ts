import { Schema, model, type InferSchemaType } from 'mongoose';
import { APPLICATION_STATUSES } from '../constants';

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'applied', index: true },
    statusHistory: [
      {
        from: { type: String, enum: [...APPLICATION_STATUSES, null] },
        to: { type: String, enum: APPLICATION_STATUSES },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        actor: { type: String, enum: ['candidate', 'recruiter', 'admin', 'system'], default: 'recruiter' },
        note: { type: String, maxlength: 500 },
        at: { type: Date, default: Date.now },
      },
    ],
    coverLetter: { type: String, maxlength: 5000, default: '' },
    matchResult: { type: Schema.Types.ObjectId, ref: 'MatchResult' },
    matchScore: { type: Number, min: 0, max: 100 },
    matchCategory: String,
    recruiterNotes: { type: String, maxlength: 3000, default: '' },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ recruiter: 1, status: 1, createdAt: -1 });

export type IApplication = InferSchemaType<typeof applicationSchema>;
export const Application = model('Application', applicationSchema);
