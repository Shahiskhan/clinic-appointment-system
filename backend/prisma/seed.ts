import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ENV } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MediCare+ Clinic Database...');

  await prisma.admin.upsert({
    where: { email: ENV.ADMIN_EMAIL.toLowerCase() },
    update: { name: 'Clinic Administrator', passwordHash: await bcrypt.hash(ENV.ADMIN_PASSWORD, 12), isActive: true },
    create: {
      email: ENV.ADMIN_EMAIL.toLowerCase(),
      name: 'Clinic Administrator',
      passwordHash: await bcrypt.hash(ENV.ADMIN_PASSWORD, 12),
      role: 'ADMIN',
    },
  });

  // Clean existing records in reverse dependency order
  await prisma.paymentTransaction.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.leaveDate.deleteMany();
  await prisma.doctor.deleteMany();

  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Seed Doctors
  const doc1 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Mon,Wed,Fri',
      shiftStart: '17:00',
      shiftEnd: '21:00',
      slotDuration: 20,
      isActive: true,
      bio: 'Renowned Cardiologist specializing in preventive cardiac care, hypertension management, and echocardiography.',
    },
  });

  const doc2 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Mon,Tue,Wed,Thu,Fri',
      shiftStart: '09:00',
      shiftEnd: '14:00',
      slotDuration: 15,
      isActive: true,
      bio: 'Senior Consultant Physician with extensive experience in diabetes management, endocrine issues, and adult primary care.',
    },
  });

  const doc3 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Tue,Thu,Sat',
      shiftStart: '15:00',
      shiftEnd: '19:30',
      slotDuration: 20,
      isActive: true,
      bio: 'Expert Dermatologist and cosmetologist offering medical skin treatments, allergy management, and clinical laser solutions.',
    },
  });

  const doc4 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
      shiftStart: '16:00',
      shiftEnd: '20:30',
      slotDuration: 15,
      isActive: true,
      bio: 'Compassionate Pediatrician focusing on neonatal care, developmental milestones, child immunization, and acute illnesses.',
    },
  });

  const doc5 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Mon,Wed,Sat',
      shiftStart: '11:00',
      shiftEnd: '16:00',
      slotDuration: 30,
      isActive: true,
      bio: 'Consultant Neurologist specializing in migraine treatment, stroke rehabilitation, seizures, and neurological diagnostics.',
    },
  });

  const doc6 = await prisma.doctor.create({
    data: {
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
      workingDays: 'Mon,Thu,Sat',
      shiftStart: '17:00',
      shiftEnd: '21:00',
      slotDuration: 20,
      isActive: true,
      bio: 'Orthopedic surgeon with expertise in sports injuries, joint preservation, arthritis care, and trauma management.',
    },
  });

  // 2. Seed Future Leave
  const futureLeave = new Date();
  futureLeave.setDate(futureLeave.getDate() + 4);
  const futureLeaveDateStr = futureLeave.toISOString().slice(0, 10);

  await prisma.leaveDate.create({
    data: {
      id: 'leave-1',
      doctorId: doc1.id,
      date: futureLeaveDateStr,
      reason: 'Attending International Cardiology Summit',
    },
  });

  // 3. Seed Appointments
  await prisma.appointment.createMany({
    data: [
      {
        id: 'APT-10021',
        tokenNumber: 1,
        doctorId: doc1.id,
        patientName: 'Muhammad Usman',
        patientPhone: '+92 300 4455661',
        age: 52,
        gender: 'MALE',
        notes: 'Hypertension checkup and recent chest discomfort review.',
        date: todayStr,
        timeSlot: '05:00 PM',
        consultationFee: 3000,
        paymentMethod: 'SAFEPAY',
        paymentStatus: 'PAID',
        isWalkIn: false,
      },
      {
        id: 'APT-10022',
        tokenNumber: 2,
        doctorId: doc1.id,
        patientName: 'Khadija Bibi',
        patientPhone: '+92 321 8899112',
        age: 46,
        gender: 'FEMALE',
        notes: 'Follow-up on ECG and lipid profile medications.',
        date: todayStr,
        timeSlot: '05:40 PM',
        consultationFee: 3000,
        paymentMethod: 'PAYFAST',
        paymentStatus: 'PAID',
        isWalkIn: false,
      },
      {
        id: 'APT-10023',
        tokenNumber: 3,
        doctorId: doc2.id,
        patientName: 'Ali Raza',
        patientPhone: '+92 333 1122334',
        age: 34,
        gender: 'MALE',
        notes: 'Severe seasonal flu and persistent fever for 3 days.',
        date: todayStr,
        timeSlot: '09:30 AM',
        consultationFee: 2000,
        paymentMethod: 'CASH_AT_CLINIC',
        paymentStatus: 'PAID',
        isWalkIn: true,
      },
      {
        id: 'APT-10024',
        tokenNumber: 4,
        doctorId: doc4.id,
        patientName: 'Hamza (Guardian: Rehan)',
        patientPhone: '+92 345 5566778',
        age: 4,
        gender: 'MALE',
        notes: 'Routine 4-year booster vaccinations and nutrition check.',
        date: todayStr,
        timeSlot: '04:15 PM',
        consultationFee: 2200,
        paymentMethod: 'SAFEPAY',
        paymentStatus: 'PAID',
        isWalkIn: false,
      },
    ],
  });

  console.log('✅ Seed completed successfully! 6 Doctors, 1 Leave, 4 Appointments created.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
