export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Specialty = 
  | 'Cardiology'
  | 'Dermatology'
  | 'Pediatrics'
  | 'General Medicine'
  | 'Neurology'
  | 'Orthopedics'
  | 'Gynecology'
  | 'Dentistry';

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty | string;
  qualification: string;
  experience: number; // in years
  fee: number; // in PKR / Currency
  contact: string;
  photo: string;
  room: string;
  rating: number;
  reviewCount: number;
  workingDays: DayOfWeek[];
  shiftStart: string; // e.g. "09:00"
  shiftEnd: string; // e.g. "17:00" or "21:00"
  slotDuration: number; // in minutes (15, 20, 30)
  isActive: boolean;
  bio: string;
}

export interface LeaveDate {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  reason: string;
}

export type PaymentMethod = 'Card' | 'JazzCash' | 'EasyPaisa' | 'Safepay' | 'PayFast' | 'CashAtClinic';
export type PaymentStatus = 'Paid' | 'Pending';

export interface Appointment {
  id: string; // e.g., "APT-48219"
  tokenNumber: number; // e.g., 12
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  notes?: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "05:15 PM"
  consultationFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isWalkIn: boolean;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  time: string; // "05:15 PM"
  rawTime: string; // "17:15"
  period: 'Morning' | 'Afternoon' | 'Evening';
  isBooked: boolean;
  isBlocked: boolean;
}
