import { Schema, model } from 'mongoose';
import { ROLES } from '../constants/enums';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    linkedinId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    role: { type: String, enum: [...ROLES], required: true },
    authProvider: { type: String, enum: ['local', 'google', 'linkedin'], default: 'local' },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended', 'inactive'], default: 'active' },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
