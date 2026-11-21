import { Schema, model } from 'mongoose';
import { COMPANY_SIZES } from '../constants/enums'
const recruiterProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    jobTitle: { type: String, trim: true },
    phone: String,
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    companySize: { type: String, enum: [...COMPANY_SIZES] },
    website: String,
    description: String,
    location: { type: String, trim: true },
    logoUrl: String,
  },
  { timestamps: true },
);

export const RecruiterProfile = model('RecruiterProfile', recruiterProfileSchema);
