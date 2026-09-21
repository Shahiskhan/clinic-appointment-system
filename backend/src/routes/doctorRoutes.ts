import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
} from '../controllers/doctorController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', requireAdmin, createDoctor);
router.put('/:id', requireAdmin, updateDoctor);
router.patch('/:id/toggle', requireAdmin, toggleDoctorStatus);

export default router;
