import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.query;

    const where: any = {};
    if (doctorId) {
      where.doctorId = String(doctorId);
    }

    const leaves = await prisma.leaveDate.findMany({
      where,
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, date, reason } = req.body;

    if (!doctorId || !date || !reason) {
      res.status(400).json({ success: false, error: 'Doctor ID, date, and reason are required' });
      return;
    }

    const leave = await prisma.leaveDate.create({
      data: {
        doctorId: String(doctorId),
        date: String(date),
        reason: String(reason),
      },
      include: {
        doctor: {
          select: { id: true, name: true, specialty: true },
        },
      },
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'This doctor already has leave on that date' });
      return;
    }
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    await prisma.leaveDate.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Leave block-out removed successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
