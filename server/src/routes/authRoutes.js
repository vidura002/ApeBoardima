import { Router } from 'express';
import {
  register, login, googleConfig, googleLogin, getMe, updateMe, changePassword,
  getAdminUsers, updateAdminUser, deleteAdminUser,
} from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google/config', googleConfig);
router.post('/google', googleLogin);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/password', requireAuth, changePassword);
router.get('/admin/users', requireAuth, requireRole('ADMIN'), getAdminUsers);
router.patch('/admin/users/:id', requireAuth, requireRole('ADMIN'), updateAdminUser);
router.delete('/admin/users/:id', requireAuth, requireRole('ADMIN'), deleteAdminUser);

export default router;
