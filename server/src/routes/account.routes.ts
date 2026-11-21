import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/account.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { imageUpload } from '../utils/imageUpload';
import {
  updateAccountSchema, preferencesSchema, changePasswordSchema, deleteAccountSchema,
} from '../validators/profile.validators';

const router = Router();

const limiter = (limit: number, windowMs: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests, please try again later' } },
  });

const sensitiveLimiter = limiter(10, 15 * 60 * 1000); // password checks
const uploadLimiter = limiter(20, 60 * 60 * 1000);

router.use(authenticate);

router.get('/settings', ctrl.getSettings);
router.patch('/me', validate(updateAccountSchema), ctrl.updateName);
router.patch('/preferences', validate(preferencesSchema), ctrl.updatePreferences);
router.post('/change-password', sensitiveLimiter, validate(changePasswordSchema), ctrl.changePassword);
router.delete('/', sensitiveLimiter, validate(deleteAccountSchema), ctrl.deleteAccount);

// authenticate and authorize run BEFORE multer, so strangers can't make the server buffer uploads
router.post(
  '/avatar',
  authorize('candidate', 'recruiter'),
  uploadLimiter,
  imageUpload.single('avatar'),
  ctrl.uploadAvatar,
);
router.delete('/avatar', authorize('candidate', 'recruiter'), ctrl.removeAvatar);

export default router;
