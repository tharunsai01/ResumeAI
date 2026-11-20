import { Schema, model } from 'mongoose';
import { INTERVIEW_MODES, INTERVIEW_STATUS } from '../constants/enums';

const interviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 30 },
    mode: { type: String, enum: [...INTERVIEW_MODES], default: 'video' },
    meetingLink: String,
    location: String,
    status: { type: String, enum: [...INTERVIEW_STATUS], default: 'scheduled' },
    feedback: { rating: { type: Number, min: 1, max: 5 }, notes: String },
  },
  { timestamps: true },
);

interviewSchema.index({ recruiter: 1, scheduledAt: 1 });
interviewSchema.index({ candidate: 1, scheduledAt: 1 });

export const Interview = model('Interview', interviewSchema);
