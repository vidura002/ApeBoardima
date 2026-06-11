import { Router } from 'express';
import {
  createEnquiry, getLandlordEnquiries, getTenantEnquiries, updateEnquiryStatus,
} from '../controllers/enquiryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, requireRole('TENANT'), createEnquiry);
router.get('/landlord', requireAuth, requireRole('LANDLORD', 'ADMIN'), getLandlordEnquiries);
router.get('/tenant', requireAuth, requireRole('TENANT'), getTenantEnquiries);
router.patch('/:id/status', requireAuth, requireRole('LANDLORD', 'ADMIN'), updateEnquiryStatus);

export default router;
