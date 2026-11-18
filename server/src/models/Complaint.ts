import { Schema, model } from 'mongoose';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS } from '../constants/enums';

const complaintSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: [...COMPLAINT_CATEGORIES], required: true },
    description: { type: String, required: true, maxlength: 2000 },
    attachments: [String],
    status: { type: String, enum: [...COMPLAINT_STATUS], default: 'open' },
  },
  { timestamps: true },
);

export const Complaint = model('Complaint', complaintSchema);
