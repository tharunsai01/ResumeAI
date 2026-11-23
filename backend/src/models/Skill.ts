import { Schema, model } from 'mongoose';

export interface ISkill {
  name: string;
  category: string;
  level?: string;
  description?: string;
  synonyms: string[];
  status: 'approved' | 'pending_review' | 'rejected';
  isUnknown: boolean;
  source: 'system' | 'ai_extracted' | 'user_defined';
  jobDemand: number;
  trend: 'rising' | 'stable' | 'declining';
  reviewedBy?: Schema.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Technical',
      index: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    description: { type: String, trim: true },
    synonyms: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['approved', 'pending_review', 'rejected'],
      default: 'approved',
      index: true,
    },
    isUnknown: { type: Boolean, default: false, index: true },
    source: {
      type: String,
      enum: ['system', 'ai_extracted', 'user_defined'],
      default: 'system',
    },
    jobDemand: { type: Number, default: 50, min: 0, max: 100 },
    trend: {
      type: String,
      enum: ['rising', 'stable', 'declining'],
      default: 'stable',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true },
);

skillSchema.index({ name: 'text', category: 'text', synonyms: 'text' });

export const Skill = model('Skill', skillSchema);
