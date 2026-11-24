import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { isProd } from '../config/env';
import * as ctrl from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleSchema,
  linkedinSchema,
} from '../validators/auth.validators';

const router = Router();

// Stricter than the global limiter: slows down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 20 : 10000,
  skip: () => !isProd,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many attempts, please try again later' } },
});

// Anything that sends an email: stops email bombing
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: isProd ? 5 : 1000,
  skip: () => !isProd,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests, please try again later' } },
});



router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.patch('/me', authenticate, ctrl.updateMe);
router.post('/change-password', authenticate, authLimiter, ctrl.changePassword);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), ctrl.verifyEmail);
router.post('/resend-verification', authenticate, emailLimiter, ctrl.resendVerification);
router.post('/forgot-password', emailLimiter, validate(forgotPasswordSchema), ctrl.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);
router.get('/google/url', ctrl.googleUrl);
router.post('/google', authLimiter, validate(googleSchema), ctrl.google);
router.get('/linkedin/url', ctrl.linkedinUrl);
router.post('/linkedin', authLimiter, validate(linkedinSchema), ctrl.linkedin);

export default router;
