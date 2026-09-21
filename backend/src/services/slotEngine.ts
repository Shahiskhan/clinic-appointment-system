import { prisma } from '../lib/prisma.js';

export interface GeneratedTimeSlot {
  id: string;
  time: string; // e.g. "05:00 PM"
  rawTime: string; // "17:00"
  period: 'Morning' | 'Afternoon' | 'Evening';
  isBooked: boolean;
}

export interface SlotCalculationResult {
  slots: GeneratedTimeSlot[];
  isWorkingDay: boolean;
  isOnLeave: boolean;
  leaveReason?: string;
  doctor: {
    id: string;
    name: string;
    specialty: string;
    fee: number;
    room: string;
    workingDays: string[];
    shiftStart: string;
    shiftEnd: string;
    slotDuration: number;
    isActive: boolean;
  };
}

export const formatTime12h = (hours: number, minutes: number): string => {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${String(displayHours).padStart(2, '0')}:${displayMinutes} ${period}`;
};

export const calculateDoctorSlots = async (
  doctorId: string,
  dateStr: string
): Promise<SlotCalculationResult> => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      leaves: {
        where: { date: dateStr },
      },
      appointments: {
        where: {
          date: dateStr,
          paymentStatus: { in: ['PAID', 'PENDING'] },
        },
        select: {
          timeSlot: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new Error(`Doctor with ID ${doctorId} not found`);
  }

  const workingDaysArray = doctor.workingDays.split(',').map(d => d.trim());

  // Determine day of week for target date (e.g., 'Mon', 'Wed')
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeek = dayNames[dateObj.getDay()];

  const isWorkingDay = workingDaysArray.includes(dayOfWeek);
  const leave = doctor.leaves.find(l => l.date === dateStr);
  const isOnLeave = !!leave;

  const doctorMeta = {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    fee: doctor.fee,
    room: doctor.room,
    workingDays: workingDaysArray,
    shiftStart: doctor.shiftStart,
    shiftEnd: doctor.shiftEnd,
    slotDuration: doctor.slotDuration,
    isActive: doctor.isActive,
  };

  if (!isWorkingDay || isOnLeave || !doctor.isActive) {
    return {
      slots: [],
      isWorkingDay,
      isOnLeave,
      leaveReason: leave?.reason,
      doctor: doctorMeta,
    };
  }

  // Parse shiftStart & shiftEnd
  const [startH, startM] = doctor.shiftStart.split(':').map(Number);
  const [endH, endM] = doctor.shiftEnd.split(':').map(Number);
  const duration = doctor.slotDuration || 20;

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const bookedSlots = new Set(doctor.appointments.map(a => a.timeSlot));
  const slots: GeneratedTimeSlot[] = [];

  while (currentMinutes + duration <= endMinutes) {
    const slotH = Math.floor(currentMinutes / 60);
    const slotM = currentMinutes % 60;
    const formattedTime = formatTime12h(slotH, slotM);
    const rawTime = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

    let period: 'Morning' | 'Afternoon' | 'Evening' = 'Morning';
    if (slotH >= 12 && slotH < 17) {
      period = 'Afternoon';
    } else if (slotH >= 17) {
      period = 'Evening';
    }

    slots.push({
      id: `slot-${doctor.id}-${dateStr}-${rawTime}`,
      time: formattedTime,
      rawTime,
      period,
      isBooked: bookedSlots.has(formattedTime),
    });

    currentMinutes += duration;
  }

  return {
    slots,
    isWorkingDay: true,
    isOnLeave: false,
    doctor: doctorMeta,
  };
};
