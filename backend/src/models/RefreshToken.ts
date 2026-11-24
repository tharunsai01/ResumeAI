import { Schema, model, type InferSchemaType } from 'mongoose';

const refreshTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    replacedBy: String,
    userAgent: { type: String, maxlength: 300 },
    ip: { type: String, maxlength: 60 },
  },
  { timestamps: true },
);

// MongoDB removes expired tokens automatically
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type IRefreshToken = InferSchemaType<typeof refreshTokenSchema>;
export const RefreshToken = model('RefreshToken', refreshTokenSchema);
