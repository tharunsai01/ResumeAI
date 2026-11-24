/** Notifications, complaints / support tickets, and the skill taxonomy. */
import type { Request, Response } from 'express';
import { Complaint, Notification, Skill } from '../models';
import { audit, notify, notifyAdmins } from '../services/audit';
import { ApiError } from '../utils/ApiError';
import { created, escapeRegex, ok, pageMeta } from '../utils/response';

// --- notifications -------------------------------------------------------------
export async function listNotifications(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 20);
  const filter: Record<string, unknown> = { user: req.user!.id };
  if (req.query.unread === 'true') filter.readAt = null;
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user!.id, readAt: null }),
  ]);
  return ok(res, items, { ...pageMeta(page, limit, total), unread });
}

export async function unreadCount(req: Request, res: Response) {
  return ok(res, { unread: await Notification.countDocuments({ user: req.user!.id, readAt: null }) });
}

export async function markRead(req: Request, res: Response) {
  const n = await Notification.findOneAndUpdate({ _id: req.valid.params.id, user: req.user!.id }, { readAt: new Date() }, { new: true });
  if (!n) throw ApiError.notFound('Notification');
  return ok(res, n);
}

export async function markAllRead(req: Request, res: Response) {
  const r = await Notification.updateMany({ user: req.user!.id, readAt: null }, { readAt: new Date() });
  return ok(res, { updated: r.modifiedCount });
}

// --- complaints / support -------------------------------------------------------
export async function createComplaint(req: Request, res: Response) {
  const complaint = await Complaint.create({ ...req.valid.body, user: req.user!.id });
  await notifyAdmins({ type: 'support', title: 'New support ticket', message: complaint.subject, link: '/admin/complaints' });
  return created(res, complaint);
}

export async function myComplaints(req: Request, res: Response) {
  return ok(res, await Complaint.find({ user: req.user!.id }).sort({ createdAt: -1 }).populate('responses.author', 'name role').lean());
}

export async function getComplaint(req: Request, res: Response) {
  const c = await Complaint.findById(req.valid.params.id).populate('user', 'name email role').populate('responses.author', 'name role').lean();
  if (!c) throw ApiError.notFound('Ticket');
  if (req.user!.role !== 'admin' && String((c.user as any)._id) !== req.user!.id) throw ApiError.forbidden();
  return ok(res, c);
}

export async function respondComplaint(req: Request, res: Response) {
  const c = await Complaint.findById(req.valid.params.id);
  if (!c) throw ApiError.notFound('Ticket');
  const isAdmin = req.user!.role === 'admin';
  if (!isAdmin && String(c.user) !== req.user!.id) throw ApiError.forbidden();
  if (c.status === 'closed') throw ApiError.badRequest('This ticket is closed');
  c.responses.push({ author: req.user!.id as any, role: req.user!.role, message: req.valid.body.message, at: new Date() });
  if (isAdmin && c.status === 'open') {
    c.history.push({ field: 'status', from: c.status, to: 'in_progress', by: req.user!.id as any, at: new Date() });
    c.status = 'in_progress';
  }
  await c.save();
  if (isAdmin) await notify(String(c.user), { type: 'support', title: 'Support replied to your ticket', message: c.subject, link: '/support' });
  else await notifyAdmins({ type: 'support', title: 'Customer replied', message: c.subject, link: '/admin/complaints' });
  return ok(res, c);
}

export async function adminListComplaints(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.category) filter.category = q.category;
  if (q.q) filter.subject = { $regex: escapeRegex(q.q), $options: 'i' };
  const [items, total] = await Promise.all([
    Complaint.find(filter).populate('user', 'name email role').sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    Complaint.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta(q.page, q.limit, total));
}

export async function adminUpdateComplaint(req: Request, res: Response) {
  const c = await Complaint.findById(req.valid.params.id);
  if (!c) throw ApiError.notFound('Ticket');
  for (const field of ['status', 'priority'] as const) {
    const value = req.valid.body[field];
    if (value && value !== c[field]) {
      c.history.push({ field, from: c[field], to: value, by: req.user!.id as any, at: new Date() });
      (c as any)[field] = value;
    }
  }
  if (c.status === 'resolved' && !c.resolvedAt) c.resolvedAt = new Date();
  await c.save();
  await audit(req, { action: 'complaint.updated', category: 'admin', targetType: 'Complaint', targetId: String(c._id), metadata: req.valid.body });
  if (req.valid.body.status) await notify(String(c.user), { type: 'support', title: `Ticket ${c.status.replace('_', ' ')}`, message: c.subject, link: '/support' });
  return ok(res, c);
}

// --- skills taxonomy -----------------------------------------------------------------
export async function listSkills(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  else if (req.user?.role !== 'admin') filter.status = 'approved';
  if (q.category) filter.category = q.category;
  if (q.q) filter.$or = [{ name: { $regex: escapeRegex(q.q), $options: 'i' } }, { aliases: { $regex: escapeRegex(q.q), $options: 'i' } }];
  const [items, total, categories] = await Promise.all([
    Skill.find(filter).sort({ status: 1, name: 1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    Skill.countDocuments(filter),
    Skill.distinct('category', { status: 'approved' }),
  ]);
  return ok(res, items, { ...pageMeta(q.page, q.limit, total), categories: categories.sort() });
}

export async function createSkill(req: Request, res: Response) {
  if (await Skill.exists({ name: new RegExp(`^${escapeRegex(req.valid.body.name)}$`, 'i') })) throw ApiError.conflict('Skill already exists');
  const skill = await Skill.create({ ...req.valid.body, source: 'admin' });
  await audit(req, { action: 'skill.created', category: 'admin', targetType: 'Skill', targetId: String(skill._id) });
  return created(res, skill);
}

export async function updateSkill(req: Request, res: Response) {
  const skill = await Skill.findById(req.valid.params.id);
  if (!skill) throw ApiError.notFound('Skill');
  skill.set(req.valid.body);
  // Editing a seed skill makes it a custom override that is sent to the AI service.
  if (skill.source !== 'admin') skill.source = 'admin';
  await skill.save();
  await audit(req, { action: 'skill.updated', category: 'admin', targetType: 'Skill', targetId: String(skill._id) });
  return ok(res, skill);
}

export async function deleteSkill(req: Request, res: Response) {
  const skill = await Skill.findByIdAndDelete(req.valid.params.id);
  if (!skill) throw ApiError.notFound('Skill');
  await audit(req, { action: 'skill.deleted', category: 'admin', targetType: 'Skill', targetId: String(skill._id), metadata: { name: skill.name } });
  return ok(res, { deleted: true });
}
