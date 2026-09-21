import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialty, search, day } = req.query;

    const where: any = {};

    if (specialty && specialty !== 'All') {
      where.specialty = String(specialty);
    }

    if (search) {
      const q = String(search);
      where.OR = [
        { name: { contains: q } },
        { specialty: { contains: q } },
        { qualification: { contains: q } },
        { bio: { contains: q } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    let result = doctors;
    if (day) {
      result = doctors.filter(d => d.workingDays.split(',').map(s => s.trim()).includes(String(day)));
    }

    res.json({
      success: true,
      count: result.length,
      data: result.map(d => ({
        ...d,
        workingDays: d.workingDays.split(',').map(s => s.trim()),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        leaves: true,
      },
    });

    if (!doctor) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...doctor,
        workingDays: doctor.workingDays.split(',').map(s => s.trim()),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      specialty,
      qualification,
      experience,
      fee,
      contact,
      photo,
      room,
      workingDays,
      shiftStart,
      shiftEnd,
      slotDuration,
      bio,
    } = req.body;

    const daysString = Array.isArray(workingDays) ? workingDays.join(',') : (workingDays || 'Mon,Wed,Fri');

    const newDoctor = await prisma.doctor.create({
      data: {
        name: String(name),
        specialty: String(specialty),
        qualification: qualification ? String(qualification) : 'MBBS',
        experience: Number(experience) || 1,
        fee: Number(fee) || 2000,
        contact: String(contact),
        photo: photo ? String(photo) : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        room: room ? String(room) : 'Chamber 101',
        workingDays: daysString,
        shiftStart: shiftStart ? String(shiftStart) : '09:00',
        shiftEnd: shiftEnd ? String(shiftEnd) : '17:00',
        slotDuration: Number(slotDuration) || 20,
        isActive: true,
        bio: bio ? String(bio) : '',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...newDoctor,
        workingDays: newDoctor.workingDays.split(',').map(s => s.trim()),
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const body = { ...req.body };

    if (Array.isArray(body.workingDays)) {
      body.workingDays = body.workingDays.join(',');
    }
    if (body.experience !== undefined) body.experience = Number(body.experience);
    if (body.fee !== undefined) body.fee = Number(body.fee);
    if (body.slotDuration !== undefined) body.slotDuration = Number(body.slotDuration);

    const updated = await prisma.doctor.update({
      where: { id },
      data: body,
    });

    res.json({
      success: true,
      data: {
        ...updated,
        workingDays: updated.workingDays.split(',').map(s => s.trim()),
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const toggleDoctorStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const current = await prisma.doctor.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ success: false, error: 'Doctor not found' });
      return;
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: { isActive: !current.isActive },
    });

    res.json({
      success: true,
      isActive: updated.isActive,
      message: `Doctor ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
