import { Schema, model } from 'mongoose';

const recruiterProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    jobTitle: { type: String, trim: true },
    phone: String,
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
    website: String,
    description: String,
    location: { type: String, trim: true },
    logoUrl: String,
  },
  { timestamps: true },
);

export const RecruiterProfile = model('RecruiterProfile', recruiterProfileSchema);
