import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import * as ctrl from '../controllers/resume.controller';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Memory storage keeps file in buffer for magic byte validation and text extraction
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB upper limit
    files: 1,
  },
});

function handleUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File size exceeds maximum limit of 10 MB'));
      }
      return next(ApiError.badRequest(`File upload error: ${err.message}`));
    }
    return next(err);
  });
}

// All resume routes require authentication
router.use(authenticate);

// Candidate upload & management routes
router.post('/', authorize('candidate'), handleUploadMiddleware, ctrl.uploadResume);
router.post('/upload', authorize('candidate'), handleUploadMiddleware, ctrl.uploadResume);
router.get('/', authorize('candidate'), ctrl.listResumes);
router.get('/active', authorize('candidate'), ctrl.getActiveResume);
router.patch('/:id/active', authorize('candidate'), ctrl.setActiveResume);
router.post('/:id/activate', authorize('candidate'), ctrl.setActiveResume);
router.delete('/:id', authorize('candidate'), ctrl.deleteResume);

// Accessible by candidate owner or authorized recruiter or admin
router.get('/:id', ctrl.getResume);
router.get('/:id/status', ctrl.getResumeStatus);
router.get('/:id/download', ctrl.downloadResume);

export default router;
