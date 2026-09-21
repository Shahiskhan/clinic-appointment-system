import { Router } from 'express';
import {
  getLeaves,
  createLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getLeaves);
router.post('/', requireAdmin, createLeave);
router.delete('/:id', requireAdmin, deleteLeave);

export default router;
