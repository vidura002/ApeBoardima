import { Router } from 'express';
import { getSaved, saveProperty, unsaveProperty, getSavedIds } from '../controllers/savedController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getSaved);
router.get('/ids', requireAuth, getSavedIds);
router.post('/', requireAuth, saveProperty);
router.delete('/:propertyId', requireAuth, unsaveProperty);

export default router;
