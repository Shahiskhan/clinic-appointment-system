import { Router } from 'express';
import { updateSchedule } from '../controllers/scheduleController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.put('/:doctorId', requireAdmin, updateSchedule);

export default router;
