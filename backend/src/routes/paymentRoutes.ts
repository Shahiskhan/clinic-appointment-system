import { Router } from 'express';
import {
  createSafepayCheckout,
  handleSafepayWebhook,
  createPayFastCheckout,
  handlePayFastIPN,
} from '../controllers/paymentController.js';

const router = Router();

// Safepay Pakistan
router.post('/safepay/create', createSafepayCheckout);
router.post('/safepay/webhook', handleSafepayWebhook);

// PayFast Pakistan
router.post('/payfast/create', createPayFastCheckout);
router.post('/payfast/webhook', handlePayFastIPN);

export default router;
