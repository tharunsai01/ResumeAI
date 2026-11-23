import { Schema, model } from 'mongoose';
import { COMPLAINT_CATEGORIES } from '../constants/enums';

const complaintSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true },
    category: { type: String, enum: [...COMPLAINT_CATEGORIES], required: true },
    description: { type: String, required: true, maxlength: 2000 },
    attachments: [String],
    status: {
      type: String,
      enum: ['open', 'in_review', 'in_progress', 'resolved', 'closed', 'dismissed'],
      default: 'open',
      index: true,
    },
    adminResponse: { type: String, trim: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true },
);

complaintSchema.index({ status: 1, createdAt: -1 });

export const Complaint = model('Complaint', complaintSchema);
