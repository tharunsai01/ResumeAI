import { Schema, model, type InferSchemaType } from 'mongoose';

const recruiterProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    company: { type: String, maxlength: 120, default: '' },
    title: { type: String, maxlength: 120, default: '' },
    companyWebsite: { type: String, maxlength: 300, default: '' },
    companySize: { type: String, enum: ['', '1-10', '11-50', '51-200', '201-1000', '1000+'], default: '' },
    industry: { type: String, maxlength: 120, default: '' },
    location: { type: String, maxlength: 120, default: '' },
    about: { type: String, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

export type IRecruiterProfile = InferSchemaType<typeof recruiterProfileSchema>;
export const RecruiterProfile = model('RecruiterProfile', recruiterProfileSchema);
