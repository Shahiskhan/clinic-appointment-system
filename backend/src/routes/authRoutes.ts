import { Router } from 'express';
import { changePassword, login, me } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireAdmin, me);
router.post('/change-password', requireAdmin, changePassword);

export default router;