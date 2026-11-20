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
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
});

function handleUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  // Support both 'file' and 'resume' field names for frontend compatibility
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

// All resume routes are strictly restricted to authenticated candidates
router.use(authenticate, authorize('candidate'));

router.post('/', handleUploadMiddleware, ctrl.uploadResume);
router.post('/upload', handleUploadMiddleware, ctrl.uploadResume);
router.get('/', ctrl.listResumes);
router.get('/:id', ctrl.getResume);
router.get('/:id/status', ctrl.getResumeStatus);
router.patch('/:id/active', ctrl.setActiveResume);
router.post('/:id/activate', ctrl.setActiveResume);
router.delete('/:id', ctrl.deleteResume);
router.get('/:id/download', ctrl.downloadResume);

export default router;
