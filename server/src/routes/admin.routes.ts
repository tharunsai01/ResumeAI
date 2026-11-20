import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  adminUserQuerySchema,
  adminJobQuerySchema,
  adminUpdateUserStatusSchema,
  adminUpdateJobStatusSchema,
  adminIdParamSchema,
} from '../validators/admin.validators';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Strict Admin RBAC
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getAdminStats);

router.get('/users', validate(adminUserQuerySchema, 'query'), adminController.getAdminUsers);
router.get('/users/:id', validate(adminIdParamSchema, 'params'), adminController.getAdminUserById);
router.patch(
  '/users/:id/status',
  validate(adminIdParamSchema, 'params'),
  validate(adminUpdateUserStatusSchema, 'body'),
  adminController.updateAdminUserStatus,
);

router.get('/jobs', validate(adminJobQuerySchema, 'query'), adminController.getAdminJobs);
router.patch(
  '/jobs/:id/status',
  validate(adminIdParamSchema, 'params'),
  validate(adminUpdateJobStatusSchema, 'body'),
  adminController.updateAdminJobStatus,
);

export default router;
