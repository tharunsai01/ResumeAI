import type { Request } from 'express';
import { AuditLog, Notification, User } from '../models';
import { logger } from '../utils/logger';
import type { AUDIT_CATEGORIES } from '../constants';

type Category = (typeof AUDIT_CATEGORIES)[number];

interface AuditInput {
  action: string;
  category: Category;
  severity?: 'info' | 'warning' | 'critical';
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  actor?: { id: string; role?: string; email?: string };
}

/** Audit writes never break the request that triggered them. */
export async function audit(req: Request | null, input: AuditInput): Promise<void> {
  const actor = input.actor ?? (req?.user ? { id: req.user.id, role: req.user.role, email: req.user.email } : undefined);
  try {
    await AuditLog.create({
      actor: actor?.id,
      actorRole: actor?.role,
      actorEmail: actor?.email,
      action: input.action,
      category: input.category,
      severity: input.severity ?? 'info',
      targetType: input.targetType,
      targetId: input.targetId,
      ip: req?.ip,
      userAgent: req?.get('user-agent')?.slice(0, 300),
      metadata: input.metadata,
    });
  } catch (err) {
    logger.error({ err, action: input.action }, 'Failed to write audit log');
  }
}

export async function notify(userId: string, data: { type: string; title: string; message?: string; link?: string }) {
  try {
    await Notification.create({ user: userId, ...data });
  } catch (err) {
    logger.error({ err }, 'Failed to create notification');
  }
}

export async function notifyAdmins(data: { type: string; title: string; message?: string; link?: string }) {
  const admins = await User.find({ role: 'admin', status: 'active' }).select('_id').lean();
  await Promise.all(admins.map((a) => notify(String(a._id), data)));
}
