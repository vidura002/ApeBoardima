import { Router } from 'express';
import {
  getProperties, getPropertyById, createProperty,
  updateProperty, deleteProperty, getMyProperties,
  getAdminProperties, moderateProperty,
} from '../controllers/propertyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getProperties);
router.get('/mine', requireAuth, requireRole('LANDLORD', 'ADMIN'), getMyProperties);
router.get('/admin/all', requireAuth, requireRole('ADMIN'), getAdminProperties);
router.patch('/admin/:id/moderation', requireAuth, requireRole('ADMIN'), moderateProperty);
router.get('/:id', getPropertyById);
router.post('/', requireAuth, requireRole('LANDLORD', 'ADMIN'), createProperty);
router.put('/:id', requireAuth, requireRole('LANDLORD', 'ADMIN'), updateProperty);
router.delete('/:id', requireAuth, requireRole('LANDLORD', 'ADMIN'), deleteProperty);

export default router;
