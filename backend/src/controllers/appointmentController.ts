import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { calculateDoctorSlots } from '../services/slotEngine.js';
import { ENV } from '../config/env.js';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, isWalkIn, doctorId, paymentStatus, search, page = '1', pageSize = '50' } = req.query;
    const currentPage = Math.max(1, Number(page) || 1);
    const limit = Math.min(100, Math.max(1, Number(pageSize) || 50));

    const where: any = {};

    if (date) {
      where.date = String(date);
    }
    if (isWalkIn !== undefined) {
      where.isWalkIn = isWalkIn === 'true';
    }
    if (doctorId) {
      where.doctorId = String(doctorId);
    }
    if (paymentStatus) {
      where.paymentStatus = String(paymentStatus);
    }
    if (search) {
      const q = String(search);
      where.OR = [
        { patientName: { contains: q } },
        { patientPhone: { contains: q } },
        { id: { contains: q } },
      ];
    }

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            select: { id: true, name: true, specialty: true, room: true },
          },
        },
        orderBy: [{ date: 'asc' }, { tokenNumber: 'asc' }],
        skip: (currentPage - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
      pagination: { page: currentPage, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDoctorSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = String(req.params.doctorId);
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ success: false, error: 'Query parameter "date" (YYYY-MM-DD) is required' });
      return;
    }

    const result = await calculateDoctorSlots(doctorId, String(date));
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const bookAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      doctorId,
      patientName,
      patientPhone,
      age,
      gender = 'MALE',
      notes,
      date,
      timeSlot,
      paymentMethod = 'CARD',
      paymentStatus = 'PENDING',
    } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
    });

    if (!doctor || !doctor.isActive) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }

    if (!date || !timeSlot || !patientName || !patientPhone) {
      res.status(400).json({ success: false, error: 'Doctor, patient, date, and time slot are required' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) {
      res.status(400).json({ success: false, error: 'Date must use YYYY-MM-DD format' });
      return;
    }
    if (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 130) {
      res.status(400).json({ success: false, error: 'Age must be a valid number between 0 and 130' });
      return;
    }
    if (!['MALE', 'FEMALE', 'OTHER'].includes(String(gender).toUpperCase())) {
      res.status(400).json({ success: false, error: 'Invalid gender' });
      return;
    }

    const normalizedPaymentMethod = String(paymentMethod).toUpperCase();
    if (normalizedPaymentMethod !== ENV.ACTIVE_PAYMENT_METHOD) {
      res.status(503).json({ success: false, error: `${normalizedPaymentMethod} is not active yet. Please use ${ENV.ACTIVE_PAYMENT_METHOD}.` });
      return;
    }

    // Check if slot already reserved
    const existingSlot = await prisma.appointment.findFirst({
      where: {
        doctorId: String(doctorId),
        date: String(date),
        timeSlot: String(timeSlot),
        paymentStatus: { in: ['PAID', 'PENDING'] },
      },
    });

    if (existingSlot) {
      res.status(409).json({ success: false, error: `Time slot ${timeSlot} on ${date} is already reserved.` });
      return;
    }

    const appointmentId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;

    const appointment = await prisma.$transaction(async tx => {
      const latest = await tx.appointment.aggregate({
        where: { doctorId: String(doctorId), date: String(date) },
        _max: { tokenNumber: true },
      });
      return tx.appointment.create({
        data: {
          id: appointmentId,
          tokenNumber: (latest._max.tokenNumber || 0) + 1,
          doctorId: String(doctorId),
          patientName: String(patientName),
          patientPhone: String(patientPhone),
          age: Number(age),
          gender: String(gender).toUpperCase() as any,
          notes: notes ? String(notes) : '',
          date: String(date),
          timeSlot: String(timeSlot),
          consultationFee: doctor.fee,
          paymentMethod: normalizedPaymentMethod as any,
          paymentStatus: String(paymentStatus).toUpperCase() as any,
          isWalkIn: false,
        },
        include: {
          doctor: {
            select: { id: true, name: true, specialty: true, room: true },
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({ success: true, data: appointment });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'That time slot was just booked by another patient.' });
      return;
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

export const bookWalkIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      doctorId,
      patientName,
      patientPhone,
      age,
      gender = 'MALE',
      notes,
      slotTime,
      isPaidCash = true,
    } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { id: String(doctorId) },
    });

    if (!doctor) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);

    const walkInId = `WLK-${Math.floor(10000 + Math.random() * 90000)}`;

    const appointment = await prisma.$transaction(async tx => {
      const latest = await tx.appointment.aggregate({
        where: { doctorId: String(doctorId), date: todayDate },
        _max: { tokenNumber: true },
      });
      const tokenNumber = (latest._max.tokenNumber || 0) + 1;
      return tx.appointment.create({
        data: {
          id: walkInId,
          tokenNumber,
          doctorId: String(doctorId),
          patientName: String(patientName),
          patientPhone: String(patientPhone),
          age: Number(age) || 25,
          gender: String(gender).toUpperCase() as any,
          notes: notes ? String(notes) : 'Front-Desk Walk-in Consultation',
          date: todayDate,
          timeSlot: slotTime ? String(slotTime) : `Walk-in-${tokenNumber}`,
          consultationFee: doctor.fee,
          paymentMethod: 'CASH_AT_CLINIC',
          paymentStatus: isPaidCash ? 'PAID' : 'PENDING',
          isWalkIn: true,
        },
        include: {
          doctor: {
            select: { id: true, name: true, specialty: true, room: true },
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    res.status(201).json({ success: true, data: appointment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const status = String(req.body.status || '').toUpperCase();
    if (!['PAID', 'PENDING', 'FAILED', 'REFUNDED'].includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid payment status' });
      return;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { paymentStatus: status as any },
    });

    res.json({ success: true, data: appointment });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
