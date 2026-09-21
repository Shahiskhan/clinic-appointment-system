import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [todayAppointments, todayWalkIns, totalActiveDoctors, paidAppointments] = await Promise.all([
      prisma.appointment.count({
        where: { date: today },
      }),
      prisma.appointment.count({
        where: { date: today, isWalkIn: true },
      }),
      prisma.doctor.count({
        where: { isActive: true },
      }),
      prisma.appointment.findMany({
        where: { date: today, paymentStatus: 'PAID' },
        select: { consultationFee: true },
      }),
    ]);

    const todayRevenue = paidAppointments.reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    res.json({
      success: true,
      data: {
        todayAppointmentsCount: todayAppointments,
        todayWalkInsCount: todayWalkIns,
        totalActiveDoctors,
        todayRevenue,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
