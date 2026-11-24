import { Complaint } from '../models';
import { ApiError } from '../utils/ApiError';
import { recordAuditLog } from './audit.service';
import { createNotification } from './notification.service';

export async function createComplaint(
  userId: string,
  data: {
    category: any;
    description: string;
    title?: string;
    attachments?: string[];
  },
) {
  const complaint = await Complaint.create({
    user: userId,
    title: data.title || `${data.category} issue`,
    category: data.category,
    description: data.description,
    attachments: data.attachments || [],
    status: 'open',
  });

  void recordAuditLog({
    action: 'COMPLAINT_FILED',
    actorId: userId,
    targetType: 'Complaint',
    targetId: complaint._id.toString(),
    status: 'success',
    details: { category: data.category },
  });

  return complaint;
}

export async function getUserComplaints(userId: string) {
  return Complaint.find({ user: userId }).sort({ createdAt: -1 });
}

export async function getComplaintById(userId: string, role: string, complaintId: string) {
  const complaint = await Complaint.findById(complaintId).populate('user', 'fullName email role');
  if (!complaint) throw ApiError.notFound('Complaint not found');

  const ownerId = (complaint.user as any)?._id?.toString() || complaint.user?.toString();
  if (role !== 'admin' && ownerId !== userId) {
    throw ApiError.forbidden('Unauthorized access to complaint');
  }

  return complaint;
}

export async function listComplaintsForAdmin(query: { category?: string; status?: string; search?: string }) {
  const filter: any = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const s = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ title: s }, { description: s }];
  }

  return Complaint.find(filter)
    .populate('user', 'fullName email role')
    .sort({ createdAt: -1 });
}

export async function updateComplaintStatus(
  adminId: string,
  complaintId: string,
  updates: { status: any; adminResponse?: string },
) {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  complaint.status = updates.status;
  if (updates.adminResponse) {
    complaint.adminResponse = updates.adminResponse;
  }
  if (updates.status === 'resolved' || updates.status === 'closed') {
    complaint.resolvedAt = new Date();
    complaint.resolvedBy = adminId as any;
  }

  await complaint.save();

  void recordAuditLog({
    action: 'COMPLAINT_RESOLVED',
    actorId: adminId,
    actorRole: 'admin',
    targetType: 'Complaint',
    targetId: complaintId,
    status: 'success',
    details: { newStatus: updates.status },
  });

  // Notify user
  createNotification(complaint.user.toString(), {
    type: 'system',
    title: 'Complaint Update',
    message: `Your complaint regarding "${complaint.category}" has been updated to "${updates.status}"`,
    link: '/complaints',
    entityId: complaint._id.toString(),
    entityType: 'Complaint',
  }).catch(() => {});

  return complaint;
}
