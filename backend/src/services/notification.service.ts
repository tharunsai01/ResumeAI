import { Notification } from '../models';
import { ApiError } from '../utils/ApiError';

export interface CreateNotificationInput {
  type: 'application_received' | 'status_changed' | 'shortlisted' | 'interview_scheduled' | 'system' | 'screening_completed' | 'application_withdrawn';
  title?: string;
  message: string;
  link?: string;
  entityId?: string;
  entityType?: string;
}

export async function createNotification(
  userId: string | any,
  input: CreateNotificationInput,
) {
  try {
    const targetUserId = typeof userId === 'object' && userId !== null ? (userId._id || userId.id) : userId;
    const notification = await Notification.create({
      user: targetUserId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      entityId: input.entityId,
      entityType: input.entityType,
      isRead: false,
    });
    return notification;
  } catch (error) {
    // Non-blocking: Notification failures should never crash primary user operations
    console.error(`[Notification] Failed to create notification for user ${userId}:`, error);
    return null;
  }
}

export async function getUserNotifications(
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = { user: userId };
  if (options.unreadOnly) {
    query.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUnreadCount(userId: string) {
  const count = await Notification.countDocuments({ user: userId, isRead: false });
  return { unreadCount: count };
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound('Notification not found or unauthorized');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllNotificationsAsRead(userId: string) {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } },
  );
  return { modifiedCount: result.modifiedCount };
}

export async function deleteNotification(userId: string, notificationId: string) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound('Notification not found or unauthorized');
  }

  await Notification.deleteOne({ _id: notificationId });
  return { success: true };
}
