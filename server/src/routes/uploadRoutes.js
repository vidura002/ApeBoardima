import { Router } from 'express';
import { uploadImages } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = Router();

router.post('/images', requireAuth, upload.array('images', 10), handleUploadError, uploadImages);

export default router;
