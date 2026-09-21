import { Request, Response } from 'express';
import { SafepayService } from '../services/safepayService.js';
import { PayFastService } from '../services/payfastService.js';
import { prisma } from '../lib/prisma.js';
import { ENV } from '../config/env.js';

export const createSafepayCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (ENV.ACTIVE_PAYMENT_METHOD !== 'SAFEPAY') {
      res.status(503).json({ success: false, error: 'Safepay is not active yet' });
      return;
    }
    const { appointmentId } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id: String(appointmentId) } });
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    const checkout = await SafepayService.createCheckout({
      appointmentId: appointment.id,
      amount: appointment.consultationFee,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
    });

    res.json({
      success: true,
      gateway: 'SAFEPAY',
      data: checkout,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const handleSafepayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = (req.headers['x-sfpy-signature'] || req.headers['x-safepay-signature']) as string;
    const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);

    const isValid = SafepayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Invalid Safepay signature' });
      return;
    }

    const result = await SafepayService.handleWebhook(req.body);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const createPayFastCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (ENV.ACTIVE_PAYMENT_METHOD !== 'PAYFAST') {
      res.status(503).json({ success: false, error: 'PayFast is not active yet' });
      return;
    }
    const { appointmentId } = req.body;

    const appointment = await prisma.appointment.findUnique({ where: { id: String(appointmentId) } });
    if (!appointment) {
      res.status(404).json({ success: false, error: 'Appointment not found' });
      return;
    }

    const checkoutPayload = await PayFastService.initiateCheckout({
      appointmentId: appointment.id,
      amount: appointment.consultationFee,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
    });

    res.json({
      success: true,
      gateway: 'PAYFAST',
      data: checkoutPayload,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const handlePayFastIPN = async (req: Request, res: Response): Promise<void> => {
  try {
    const ipnData = req.body;
    const result = await PayFastService.handleIPN(ipnData);

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
