import { Schema, model } from 'mongoose';
import { INTERVIEW_MODES, INTERVIEW_STATUS } from '../constants/enums';

const interviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recruiter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: 'Technical Interview' },
    scheduledAt: { type: Date, required: true },
    durationMins: { type: Number, default: 45 },
    mode: { type: String, enum: [...INTERVIEW_MODES], default: 'video' },
    meetingLink: String,
    location: String,
    status: {
      type: String,
      enum: [...INTERVIEW_STATUS, 'rescheduled'],
      default: 'scheduled',
      index: true,
    },
    notes: String,
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String,
      technicalSkillsScore: Number,
      communicationScore: Number,
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'no_hire', 'pending'],
        default: 'pending',
      },
    },
  },
  { timestamps: true },
);

interviewSchema.index({ recruiter: 1, scheduledAt: 1 });
interviewSchema.index({ candidate: 1, scheduledAt: 1 });
interviewSchema.index({ job: 1, status: 1 });

export const Interview = model('Interview', interviewSchema);
