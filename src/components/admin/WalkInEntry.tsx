import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Printer,
  DollarSign,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  PlusCircle,
  Tag,
  Phone,
  User,
  ShieldCheck,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { useClinic, formatDateToISO } from '../../context/ClinicContext';
import { Appointment, Doctor } from '../../types/clinic';
import { Modal } from '../common/Modal';
import { AppointmentReceipt } from '../patient/AppointmentReceipt';

export const WalkInEntry: React.FC = () => {
  const {
    doctors,
    appointments,
    generateSlotsForDoctor,
    bookWalkIn,
    updateAppointmentPaymentStatus
  } = useClinic();

  const todayStr = formatDateToISO(new Date());

  // Walk-in form states
  const activeDoctors = useMemo(() => doctors.filter(d => d.isActive), [doctors]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(activeDoctors[0]?.id || '');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | string>('30');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [notes, setNotes] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [isCashCollected, setIsCashCollected] = useState(true);

  // Queue table filter & search
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<'All' | 'WalkIn' | 'Online'>('All');
  const [queueDoctorId, setQueueDoctorId] = useState('all');
  const [queuePage, setQueuePage] = useState(1);
  const queuePageSize = 10;

  // Slip Print Modal
  const [printAppointment, setPrintAppointment] = useState<Appointment | null>(null);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  React.useEffect(() => {
    if (!selectedDoctorId && activeDoctors.length > 0) {
      setSelectedDoctorId(activeDoctors[0].id);
    }
  }, [activeDoctors, selectedDoctorId]);

  // Calculate available slots for today for the selected doctor
  const todaySlotsData = useMemo(() => {
    if (!selectedDoctorId) return { slots: [], isWorkingDay: false, isOnLeave: false };
    return generateSlotsForDoctor(selectedDoctorId, todayStr);
  }, [selectedDoctorId, todayStr, generateSlotsForDoctor]);

  // Set default slot to next available slot whenever doctor changes
  const availableSlots = useMemo(() => {
    return todaySlotsData.slots.filter(s => !s.isBooked);
  }, [todaySlotsData]);

  // Auto-pick first available slot if current selectedSlot is not in list
  React.useEffect(() => {
    if (availableSlots.length > 0 && (!selectedSlotTime || !availableSlots.some(s => s.time === selectedSlotTime))) {
      setSelectedSlotTime(availableSlots[0].time);
    }
  }, [availableSlots, selectedSlotTime]);

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !selectedDoctorId) {
      alert('Please provide patient name, contact number, and doctor.');
      return;
    }

    const slotToUse = selectedSlotTime || (availableSlots[0]?.time || 'Immediate Walk-in');

    let created: Appointment;
    try {
      created = await bookWalkIn(
        {
          name: patientName.trim(),
          phone: patientPhone.trim(),
          age: Number(patientAge) || 25,
          gender: patientGender,
          notes: notes.trim() || 'Desk Walk-in consultation',
        },
        selectedDoctorId,
        slotToUse,
        isCashCollected
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to create walk-in appointment');
      return;
    }

    // Reset Form
    setPatientName('');
    setPatientPhone('');
    setNotes('');

    // Open Printable Slip modal for reception to hand over to patient
    setPrintAppointment(created);
  };

  // Filter Today's appointments for Queue Table
  const todayQueue = useMemo(() => {
    const filtered = appointments
      .filter(a => a.date === todayStr)
      .filter(a => {
        const matchesSearch =
          a.patientName.toLowerCase().includes(queueSearch.toLowerCase()) ||
          a.patientPhone.includes(queueSearch) ||
          a.doctorName.toLowerCase().includes(queueSearch.toLowerCase()) ||
          `#${a.tokenNumber}`.includes(queueSearch);

        const matchesType =
          queueFilter === 'All' ||
          (queueFilter === 'WalkIn' && a.isWalkIn) ||
          (queueFilter === 'Online' && !a.isWalkIn);

        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    return queueDoctorId === 'all' ? filtered : filtered.filter(item => item.doctorId === queueDoctorId);
  }, [appointments, todayStr, queueSearch, queueFilter, queueDoctorId]);

  const queueDoctors = useMemo(() => {
    const doctorIds = new Set(appointments.filter(item => item.date === todayStr).map(item => item.doctorId));
    return doctors.filter(doctor => doctorIds.has(doctor.id));
  }, [appointments, doctors, todayStr]);

  const queueTotalPages = Math.max(1, Math.ceil(todayQueue.length / queuePageSize));
  const visibleQueue = todayQueue.slice((queuePage - 1) * queuePageSize, queuePage * queuePageSize);

  React.useEffect(() => {
    setQueuePage(1);
  }, [queueDoctorId, queueFilter, queueSearch]);

  React.useEffect(() => {
    if (queuePage > queueTotalPages) setQueuePage(queueTotalPages);
  }, [queuePage, queueTotalPages]);

  return (
    <div className="space-y-8">
      {/* 2-Column High Productivity Reception Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Rapid Walk-in Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Walk-in Quick Registration
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Front-Desk Instant Token & Cash Entry
                </span>
              </div>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
              Today: {todayStr}
            </span>
          </div>

          <form onSubmit={handleWalkInSubmit} className="space-y-4">
            {/* 1. Doctor Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Consulting Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/60"
                required
              >
                {activeDoctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} (Rs. {d.fee.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Today Status Alert */}
            {selectedDoctor && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-700">Chamber: </span>
                  <span className="text-slate-600">{selectedDoctor.room}</span>
                </div>
                <div className="font-bold text-indigo-700">
                  Fee: Rs. {selectedDoctor.fee.toLocaleString()}
                </div>
              </div>
            )}

            {/* 2. Slot Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Available Today Slots ({availableSlots.length})</span>
                {todaySlotsData.isOnLeave && (
                  <span className="text-rose-600 text-[10px] font-bold">
                    Doctor on Leave Today
                  </span>
                )}
              </label>

              {availableSlots.length > 0 ? (
                <select
                  value={selectedSlotTime}
                  onChange={e => setSelectedSlotTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  {availableSlots.map(s => (
                    <option key={s.id} value={s.time}>
                      {s.time} ({s.period})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No predefined slots left today. An emergency token will be assigned.
                </div>
              )}
            </div>

            {/* 3. Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  placeholder="0300 1234567"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* 4. Instant Payment Marking */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCashCollected}
                  onChange={e => setIsCashCollected(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Instant Cash Collected</span>
              </label>
              <span className="text-xs font-extrabold text-emerald-800">
                Rs. {selectedDoctor?.fee.toLocaleString() || '0'}
              </span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <FileCheck className="w-5 h-5" />
              <span>Register Walk-in & Issue Token</span>
            </button>
          </form>
        </div>

        {/* Right Side: Live Today's Queue & Patient Feed */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Clinic Queue (Today)
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {todayQueue.length} Checked In
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time feed of online appointments and front-desk walk-in patients.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setQueueFilter('All')}
                className={`px-3 py-1 rounded-lg transition-all ${queueFilter === 'All'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setQueueFilter('WalkIn')}
                className={`px-3 py-1 rounded-lg transition-all ${queueFilter === 'WalkIn'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Walk-ins
              </button>
              <button
                onClick={() => setQueueFilter('Online')}
                className={`px-3 py-1 rounded-lg transition-all ${queueFilter === 'Online'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Online
              </button>
              <button
                onClick={() => setQueueDoctorId('all')}
                className={`px-3 py-1 rounded-lg transition-all ${queueDoctorId === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Doctors
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {queueDoctors.map(doctor => (
              <button
                key={doctor.id}
                onClick={() => setQueueDoctorId(doctor.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${queueDoctorId === doctor.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
              >
                {doctor.name}
              </button>
            ))}
          </div>

          {/* Search bar inside queue */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search today's queue by patient name, token #, doctor, or phone..."
              value={queueSearch}
              onChange={e => setQueueSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
            />
          </div>

          {/* Queue List Table */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Token #</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor & Slot</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleQueue.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Token */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 font-extrabold text-indigo-700 text-xs">
                        #{item.tokenNumber}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {item.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.age}y • {item.gender} • {item.patientPhone}
                      </div>
                      <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded ${item.isWalkIn
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-teal-100 text-teal-800'
                        }`}>
                        {item.isWalkIn ? 'Walk-in Desk' : 'Online Booked'}
                      </span>
                    </td>

                    {/* Doctor & Slot */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {item.doctorName}
                      </div>
                      <div className="text-teal-700 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timeSlot}
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900">
                        Rs. {item.consultationFee.toLocaleString()}
                      </div>
                      <button
                        onClick={() =>
                          updateAppointmentPaymentStatus(
                            item.id,
                            item.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
                          )
                        }
                        className={`mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${item.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        title="Click to toggle Paid/Pending"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                        <span>{item.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid (Collect)'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setPrintAppointment(item)}
                        className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                        title="Print Token Slip"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {visibleQueue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No patients in queue for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {todayQueue.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500">
                Showing {(queuePage - 1) * queuePageSize + 1}-{Math.min(queuePage * queuePageSize, todayQueue.length)} of {todayQueue.length} tokens
              </span>
              <div className="flex items-center gap-2">
                <button disabled={queuePage === 1} onClick={() => setQueuePage(page => Math.max(1, page - 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40">Previous</button>
                <span className="font-bold text-slate-700">Page {queuePage} / {queueTotalPages}</span>
                <button disabled={queuePage === queueTotalPages} onClick={() => setQueuePage(page => Math.min(queueTotalPages, page + 1))} className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Slip Modal */}
      {printAppointment && (
        <Modal
          isOpen={!!printAppointment}
          onClose={() => setPrintAppointment(null)}
          title={`Patient Token Slip — #${printAppointment.tokenNumber}`}
          maxWidth="lg"
        >
          <AppointmentReceipt
            appointment={printAppointment}
            onClose={() => setPrintAppointment(null)}
          />
        </Modal>
      )}
    </div>
  );
};
