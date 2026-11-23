import { Schema, model } from 'mongoose';

const shortlistSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
  },
  { timestamps: true },
);

shortlistSchema.index({ job: 1, candidate: 1 }, { unique: true });
shortlistSchema.index({ recruiter: 1, createdAt: -1 });

export const Shortlist = model('Shortlist', shortlistSchema);
