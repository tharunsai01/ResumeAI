import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { ROLES } from '../constants';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ROLES, required: true, index: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
    suspendedReason: { type: String, maxlength: 500 },
    authProvider: { type: String, enum: ['local', 'google', 'linkedin'], default: 'local' },
    providerId: { type: String, index: true, sparse: true },
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userSchema.index({ createdAt: -1 });
userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.passwordHash;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  },
});

export type IUser = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<IUser>;
export const User = model('User', userSchema);
