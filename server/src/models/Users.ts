import { Schema, model } from 'mongoose';
import { ROLES,USER_STATUS,THEMES } from '../constants/enums';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: [...ROLES], required: true },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: [...USER_STATUS], default: 'active', index: true },
    preferences: {
    theme: { type: String, enum: [...THEMES], default: 'system' },
    notifications: {
    applicationUpdates: { type: Boolean, default: true },
    jobRecommendations: { type: Boolean, default: true },
    interviewReminders: { type: Boolean, default: true },
  },
},
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
