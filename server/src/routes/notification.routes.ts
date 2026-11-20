import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  notificationQuerySchema,
  notificationIdParamSchema,
} from '../validators/notification.validators';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', validate(notificationQuerySchema, 'query'), notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), notificationController.markAsRead);
router.delete('/:id', validate(notificationIdParamSchema, 'params'), notificationController.deleteNotification);

export default router;
