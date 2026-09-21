import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Doctor, Appointment, LeaveDate, TimeSlot, DayOfWeek } from '../types/clinic';
import { ClinicApi } from '../services/api';

interface ClinicContextType {
  doctors: Doctor[];
  appointments: Appointment[];
  leaveDates: LeaveDate[];
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
  refreshData: () => Promise<void>;
  addDoctor: (doctor: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>) => Promise<Doctor>;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Promise<Doctor>;
  toggleDoctorStatus: (id: string) => Promise<void>;
  updateSchedule: (
    doctorId: string,
    workingDays: DayOfWeek[],
    shiftStart: string,
    shiftEnd: string,
    slotDuration: number
  ) => Promise<void>;
  addLeave: (doctorId: string, date: string, reason: string) => Promise<void>;
  removeLeave: (id: string) => Promise<void>;
  generateSlotsForDoctor: (doctorId: string, dateStr: string) => {
    slots: TimeSlot[];
    isWorkingDay: boolean;
    isOnLeave: boolean;
    leaveReason?: string;
  };
  bookAppointment: (
    data: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt'>
  ) => Promise<Appointment>;
  bookWalkIn: (
    patient: {
      name: string;
      phone: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      notes?: string;
    },
    doctorId: string,
    slotTime: string,
    isPaidCash: boolean
  ) => Promise<Appointment>;
  updateAppointmentPaymentStatus: (id: string, status: 'Paid' | 'Pending') => Promise<void>;
  stats: {
    todayAppointmentsCount: number;
    todayWalkInsCount: number;
    totalActiveDoctors: number;
    todayRevenue: number;
  };
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

// Helper to format Date to YYYY-MM-DD
export const formatDateToISO = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial Seed Doctors
const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ayesha Khan',
    specialty: 'Cardiology',
    qualification: 'MBBS, FCPS (Cardiology), FACC',
    experience: 12,
    fee: 3000,
    contact: '+92 300 1234567',
    photo: 'https://images.unsplash.com/photo-1594824813629-659a5382b683?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 101 (1st Floor)',
    rating: 4.9,
    reviewCount: 142,
    workingDays: ['Mon', 'Wed', 'Fri'],
    shiftStart: '17:00',
    shiftEnd: '21:00',
    slotDuration: 20,
    isActive: true,
    bio: 'Renowned Cardiologist specializing in preventive cardiac care, hypertension management, and echocardiography.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Tariq Mahmood',
    specialty: 'General Medicine',
    qualification: 'MBBS, MRCP (UK), Internal Med',
    experience: 16,
    fee: 2000,
    contact: '+92 321 9876543',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 104 (Ground Floor)',
    rating: 4.8,
    reviewCount: 218,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    shiftStart: '09:00',
    shiftEnd: '14:00',
    slotDuration: 15,
    isActive: true,
    bio: 'Senior Consultant Physician with extensive experience in diabetes management, endocrine issues, and adult primary care.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Zainab Malik',
    specialty: 'Dermatology',
    qualification: 'MBBS, MCPS (Dermatology), Dip. Derm',
    experience: 9,
    fee: 2500,
    contact: '+92 333 4567890',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 202 (2nd Floor)',
    rating: 4.9,
    reviewCount: 96,
    workingDays: ['Tue', 'Thu', 'Sat'],
    shiftStart: '15:00',
    shiftEnd: '19:30',
    slotDuration: 20,
    isActive: true,
    bio: 'Expert Dermatologist and cosmetologist offering medical skin treatments, allergy management, and clinical laser solutions.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Bilal Ahmed',
    specialty: 'Pediatrics',
    qualification: 'MBBS, FCPS (Pediatrics), DCH',
    experience: 11,
    fee: 2200,
    contact: '+92 345 6789012',
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 103 (Pediatric Wing)',
    rating: 4.9,
    reviewCount: 180,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    shiftStart: '16:00',
    shiftEnd: '20:30',
    slotDuration: 15,
    isActive: true,
    bio: 'Compassionate Pediatrician focusing on neonatal care, developmental milestones, child immunization, and acute illnesses.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Sarah Hashmi',
    specialty: 'Neurology',
    qualification: 'MBBS, MD (Neurology), Fellow CNS',
    experience: 14,
    fee: 3500,
    contact: '+92 301 2345678',
    photo: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 205 (Neuro Center)',
    rating: 4.7,
    reviewCount: 79,
    workingDays: ['Mon', 'Wed', 'Sat'],
    shiftStart: '11:00',
    shiftEnd: '16:00',
    slotDuration: 30,
    isActive: true,
    bio: 'Consultant Neurologist specializing in migraine treatment, stroke rehabilitation, seizures, and neurological diagnostics.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Farhan Saeed',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics), AO Spine',
    experience: 13,
    fee: 2800,
    contact: '+92 312 3456789',
    photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 108 (Ground Floor)',
    rating: 4.8,
    reviewCount: 112,
    workingDays: ['Mon', 'Thu', 'Sat'],
    shiftStart: '17:00',
    shiftEnd: '21:00',
    slotDuration: 20,
    isActive: true,
    bio: 'Orthopedic surgeon with expertise in sports injuries, joint preservation, arthritis care, and trauma management.'
  }
];

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [leaveDates, setLeaveDates] = useState<LeaveDate[]>(() => {
    return [];
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => Boolean(localStorage.getItem('medicare_admin_token')));

  useEffect(() => {
    let cancelled = false;

    const syncFromBackend = async () => {
      try {
        const health = await ClinicApi.checkHealth();
        if (health.database !== 'connected') return;

        const [doctorResponse, appointmentResponse, leaveResponse] = await Promise.all([
          ClinicApi.getDoctors(),
          ClinicApi.getAppointments({ page: 1, pageSize: 100 }),
          ClinicApi.getLeaves(),
        ]);

        if (cancelled) return;

        setDoctors(doctorResponse.data as Doctor[]);
        setAppointments(
          appointmentResponse.data.map((appointment: any) => ({
            ...appointment,
            doctorName: appointment.doctor?.name || '',
            doctorSpecialty: appointment.doctor?.specialty || '',
            gender: String(appointment.gender).charAt(0) + String(appointment.gender).slice(1).toLowerCase(),
            paymentMethod: ({
              CARD: 'Card',
              JAZZCASH: 'JazzCash',
              EASYPAISA: 'EasyPaisa',
              SAFEPAY: 'Safepay',
              PAYFAST: 'PayFast',
              CASH_AT_CLINIC: 'CashAtClinic',
            } as Record<string, string>)[appointment.paymentMethod] || 'Card',
            paymentStatus: appointment.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
            createdAt: appointment.createdAt || new Date().toISOString(),
          }))
        );
        setLeaveDates(leaveResponse.data);
      } catch {
        // Local state remains the offline fallback when the API is unavailable.
      }
    };

    void syncFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshData = async (): Promise<void> => {
    const [doctorResponse, appointmentResponse, leaveResponse] = await Promise.all([
      ClinicApi.getDoctors(),
      ClinicApi.getAppointments({ page: 1, pageSize: 100 }),
      ClinicApi.getLeaves(),
    ]);

    setDoctors(doctorResponse.data as Doctor[]);
    setAppointments(appointmentResponse.data.map((appointment: any) => ({
      ...appointment,
      doctorName: appointment.doctor?.name || '',
      doctorSpecialty: appointment.doctor?.specialty || '',
      gender: String(appointment.gender).charAt(0) + String(appointment.gender).slice(1).toLowerCase(),
      paymentMethod: ({
        CARD: 'Card', JAZZCASH: 'JazzCash', EASYPAISA: 'EasyPaisa', SAFEPAY: 'Safepay', PAYFAST: 'PayFast', CASH_AT_CLINIC: 'CashAtClinic',
      } as Record<string, string>)[appointment.paymentMethod] || 'Card',
      paymentStatus: appointment.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
      createdAt: appointment.createdAt || new Date().toISOString(),
    })));
    setLeaveDates(leaveResponse.data);
  };

  const loginAdmin = async (email: string, password: string): Promise<void> => {
    await ClinicApi.login(email, password);
    setIsAdminAuthenticated(true);
    await refreshData();
  };

  const logoutAdmin = (): void => {
    ClinicApi.logout();
    setIsAdminAuthenticated(false);
  };

  // Doctor CRUD
  const addDoctor = async (doctorData: Omit<Doctor, 'id' | 'rating' | 'reviewCount'>): Promise<Doctor> => {
    const response = await ClinicApi.createDoctor(doctorData);
    const doctor = response.data as Doctor;
    setDoctors(prev => [doctor, ...prev]);
    return doctor;
  };

  const updateDoctor = async (id: string, updates: Partial<Doctor>): Promise<Doctor> => {
    const response = await ClinicApi.updateDoctor(id, updates);
    const doctor = response.data as Doctor;
    setDoctors(prev => prev.map(item => (item.id === id ? doctor : item)));
    return doctor;
  };

  const toggleDoctorStatus = async (id: string): Promise<void> => {
    const response = await ClinicApi.toggleDoctorStatus(id);
    setDoctors(prev => prev.map(item => (item.id === id ? { ...item, isActive: response.isActive } : item)));
  };

  const updateSchedule = async (
    doctorId: string,
    workingDays: DayOfWeek[],
    shiftStart: string,
    shiftEnd: string,
    slotDuration: number
  ): Promise<void> => {
    const response = await ClinicApi.updateSchedule(doctorId, { workingDays, shiftStart, shiftEnd, slotDuration });
    setDoctors(prev => prev.map(item => item.id === doctorId ? { ...item, ...response.data } : item));
  };

  const addLeave = async (doctorId: string, date: string, reason: string): Promise<void> => {
    const response = await ClinicApi.createLeave({ doctorId, date, reason });
    setLeaveDates(prev => [...prev, response.data]);
  };

  const removeLeave = async (id: string): Promise<void> => {
    await ClinicApi.deleteLeave(id);
    setLeaveDates(prev => prev.filter(item => item.id !== id));
  };

  // Convert "HH:MM" (24h) to "hh:mm AM/PM"
  const formatTime12h = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${String(displayHours).padStart(2, '0')}:${displayMinutes} ${period}`;
  };

  // Generate Slots dynamically for a Doctor on a specific Date
  const generateSlotsForDoctor = (doctorId: string, dateStr: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return { slots: [], isWorkingDay: false, isOnLeave: false };
    }

    // Determine Day of Week
    const targetDate = new Date(dateStr + 'T00:00:00');
    const dayMap: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayOfWeek = dayMap[targetDate.getDay()];

    const isWorkingDay = doctor.workingDays.includes(currentDayOfWeek);

    // Check if Doctor is on leave on this date
    const leave = leaveDates.find(l => l.doctorId === doctorId && l.date === dateStr);
    const isOnLeave = !!leave;

    if (!isWorkingDay || isOnLeave) {
      return {
        slots: [],
        isWorkingDay,
        isOnLeave,
        leaveReason: leave?.reason
      };
    }

    // Parse shiftStart & shiftEnd (e.g., "09:00" to "14:00")
    const [startH, startM] = doctor.shiftStart.split(':').map(Number);
    const [endH, endM] = doctor.shiftEnd.split(':').map(Number);
    const duration = doctor.slotDuration || 20;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // Get all booked appointment times for this doctor on this date
    const bookedSlotTimes = appointments
      .filter(a => a.doctorId === doctorId && a.date === dateStr)
      .map(a => a.timeSlot);

    const slots: TimeSlot[] = [];

    while (currentMinutes + duration <= endMinutes) {
      const slotH = Math.floor(currentMinutes / 60);
      const slotM = currentMinutes % 60;
      const formattedTime = formatTime12h(slotH, slotM);
      const rawTime = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

      // Period determination
      let period: 'Morning' | 'Afternoon' | 'Evening' = 'Morning';
      if (slotH >= 12 && slotH < 17) {
        period = 'Afternoon';
      } else if (slotH >= 17) {
        period = 'Evening';
      }

      const isBooked = bookedSlotTimes.includes(formattedTime);

      slots.push({
        id: `slot-${doctorId}-${dateStr}-${rawTime}`,
        time: formattedTime,
        rawTime,
        period,
        isBooked,
        isBlocked: false,
      });

      currentMinutes += duration;
    }

    return {
      slots,
      isWorkingDay: true,
      isOnLeave: false,
    };
  };

  // Booking action (Patient Web App)
  const bookAppointment = async (
    data: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt'>
  ): Promise<Appointment> => {
    const response = await ClinicApi.bookAppointment({
      doctorId: data.doctorId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      age: data.age,
      gender: data.gender.toUpperCase(),
      notes: data.notes,
      date: data.date,
      timeSlot: data.timeSlot,
      paymentMethod: data.paymentMethod === 'CashAtClinic' ? 'CASH_AT_CLINIC' : data.paymentMethod.toUpperCase(),
      paymentStatus: data.paymentStatus === 'Paid' ? 'PAID' : 'PENDING',
    });
    const appointment = response.data as Appointment;
    setAppointments(prev => [appointment, ...prev]);
    return appointment;
  };

  // Walk-in booking (Receptionist Panel)
  const bookWalkIn = async (
    patient: {
      name: string;
      phone: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      notes?: string;
    },
    doctorId: string,
    slotTime: string,
    isPaidCash: boolean
  ): Promise<Appointment> => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const todayDate = formatDateToISO(new Date());
    const response = await ClinicApi.bookWalkIn({
      doctorId,
      patientName: patient.name,
      patientPhone: patient.phone,
      age: patient.age,
      gender: patient.gender.toUpperCase(),
      notes: patient.notes,
      slotTime,
      isPaidCash,
    });
    const appointment = response.data as Appointment;
    setAppointments(prev => [appointment, ...prev]);
    return appointment;
  };

  const updateAppointmentPaymentStatus = async (id: string, status: 'Paid' | 'Pending'): Promise<void> => {
    const response = await ClinicApi.updatePaymentStatus(id, status === 'Paid' ? 'PAID' : 'PENDING');
    setAppointments(prev => prev.map(item => item.id === id ? {
      ...item,
      paymentStatus: response.data.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
    } : item));
  };

  // Compute Dashboard KPIs
  const stats = useMemo(() => {
    const today = formatDateToISO(new Date());
    const todayApps = appointments.filter(a => a.date === today);
    const todayWalkIns = todayApps.filter(a => a.isWalkIn);
    const totalActiveDoctors = doctors.filter(d => d.isActive).length;
    const todayRevenue = todayApps
      .filter(a => a.paymentStatus === 'Paid')
      .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

    return {
      todayAppointmentsCount: todayApps.length,
      todayWalkInsCount: todayWalkIns.length,
      totalActiveDoctors,
      todayRevenue,
    };
  }, [appointments, doctors]);

  return (
    <ClinicContext.Provider
      value={{
        doctors,
        appointments,
        leaveDates,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        refreshData,
        addDoctor,
        updateDoctor,
        toggleDoctorStatus,
        updateSchedule,
        addLeave,
        removeLeave,
        generateSlotsForDoctor,
        bookAppointment,
        bookWalkIn,
        updateAppointmentPaymentStatus,
        stats,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
