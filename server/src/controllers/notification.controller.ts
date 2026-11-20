import type { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import * as notificationService from '../services/notification.service';

export async function getUserNotifications(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await notificationService.getUserNotifications(req.user.id, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    unreadOnly: req.query.unreadOnly === 'true',
  });
  sendSuccess(res, result);
}

export async function getUnreadCount(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await notificationService.getUnreadCount(req.user.id);
  sendSuccess(res, result);
}

export async function markAsRead(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await notificationService.markNotificationAsRead(
    req.user.id,
    req.params.id as string,
  );
  sendSuccess(res, result);
}

export async function markAllAsRead(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await notificationService.markAllNotificationsAsRead(req.user.id);
  sendSuccess(res, result);
}

export async function deleteNotification(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await notificationService.deleteNotification(
    req.user.id,
    req.params.id as string,
  );
  sendSuccess(res, result);
}
