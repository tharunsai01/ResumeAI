import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  adminUserQuerySchema,
  adminAuditQuerySchema,
  adminListQuerySchema,
  adminJobQuerySchema,
  adminUpdateUserStatusSchema,
  adminUpdateJobStatusSchema,
  adminIdParamSchema,
} from '../validators/admin.validators';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Strict Admin RBAC
router.use(authenticate, authorize('admin'));

// Stats & Health
router.get('/stats', adminController.getAdminStats);
router.get('/health', adminController.getSystemHealth);
router.get('/ai-evaluation', adminController.getLatestAiEvaluation);
router.post('/ai-evaluation', adminController.startAiEvaluation);

// Users
router.get('/users', validate(adminUserQuerySchema, 'query'), adminController.getAdminUsers);
router.get('/users/:id', validate(adminIdParamSchema, 'params'), adminController.getAdminUserById);
router.patch(
  '/users/:id/status',
  validate(adminIdParamSchema, 'params'),
  validate(adminUpdateUserStatusSchema, 'body'),
  adminController.updateAdminUserStatus,
);

// Jobs
router.get('/jobs', validate(adminJobQuerySchema, 'query'), adminController.getAdminJobs);
router.patch(
  '/jobs/:id/status',
  validate(adminIdParamSchema, 'params'),
  validate(adminUpdateJobStatusSchema, 'body'),
  adminController.updateAdminJobStatus,
);

// Complaints
router.get('/complaints', validate(adminListQuerySchema, 'query'), adminController.getComplaints);
router.get('/complaints/:id', adminController.getComplaintById);
router.patch('/complaints/:id', adminController.updateComplaint);

// Skills & Taxonomy
router.get('/skills', validate(adminListQuerySchema, 'query'), adminController.getSkills);
router.post('/skills', adminController.addSkill);
router.put('/skills/:id', adminController.updateSkill);
router.patch('/skills/:id/review', adminController.reviewUnknownSkill);
router.delete('/skills/:id', adminController.deleteSkill);

// Audit logs
router.get('/audit-logs', validate(adminAuditQuerySchema, 'query'), adminController.getAuditLogs);

// AI Evaluation
router.get('/ai-evaluations', adminController.getAiEvaluations);
router.post('/ai-evaluations/run', adminController.runAiEvaluation);

export default router;
