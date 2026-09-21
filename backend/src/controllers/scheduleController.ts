import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = String(req.params.doctorId);
    const { workingDays, shiftStart, shiftEnd, slotDuration } = req.body;

    const daysString = Array.isArray(workingDays) ? workingDays.join(',') : String(workingDays);

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        workingDays: daysString,
        shiftStart: String(shiftStart),
        shiftEnd: String(shiftEnd),
        slotDuration: Number(slotDuration),
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedDoctor.id,
        name: updatedDoctor.name,
        workingDays: updatedDoctor.workingDays.split(',').map(s => s.trim()),
        shiftStart: updatedDoctor.shiftStart,
        shiftEnd: updatedDoctor.shiftEnd,
        slotDuration: updatedDoctor.slotDuration,
      },
      message: 'Schedule updated successfully',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
