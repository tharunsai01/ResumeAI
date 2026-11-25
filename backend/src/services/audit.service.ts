import mongoose from 'mongoose';
import { AuditLog } from '../models';

export interface CreateAuditLogParams {
  action: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status?: 'success' | 'failure';
  errorMessage?: string;
}

export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;
  try {
    // Sanitize details: strictly strip sensitive keys
    const sanitizedDetails = params.details ? sanitizePayload(params.details) : undefined;

    await AuditLog.create({
      action: params.action,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      targetType: params.targetType,
      targetId: params.targetId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      details: sanitizedDetails,
      status: params.status || 'success',
      errorMessage: params.errorMessage,
    });
  } catch (err) {
    // Audit logging should never bring down the primary application flow
    console.error('[AuditLog] Failed to record audit log:', err);
  }
}

function sanitizePayload(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret', 'rawText'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeValue(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return sanitizePayload(value as Record<string, unknown>);
  return value;
}
