import { Router } from 'express';
import {
  getAppointments,
  bookAppointment,
  bookWalkIn,
  updatePaymentStatus,
  getDoctorSlots,
} from '../controllers/appointmentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAppointments);
router.post('/book', bookAppointment);
router.post('/walkin', requireAdmin, bookWalkIn);
router.patch('/:id/payment-status', requireAdmin, updatePaymentStatus);
router.get('/doctors/:doctorId/slots', getDoctorSlots);

export default router;
