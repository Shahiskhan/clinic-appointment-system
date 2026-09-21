import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  ChevronRight,
  AlertCircle,
  Eye
} from 'lucide-react';
import { DayOfWeek, Doctor } from '../../types/clinic';
import { useClinic } from '../../context/ClinicContext';

export const ScheduleManager: React.FC = () => {
  const { doctors, updateSchedule } = useClinic();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  // Form states
  const [workingDays, setWorkingDays] = useState<DayOfWeek[]>([]);
  const [shiftStart, setShiftStart] = useState('16:00');
  const [shiftEnd, setShiftEnd] = useState('20:00');
  const [slotDuration, setSlotDuration] = useState(15);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when selected doctor changes
  useEffect(() => {
    if (selectedDoctor) {
      setWorkingDays(selectedDoctor.workingDays);
      setShiftStart(selectedDoctor.shiftStart);
      setShiftEnd(selectedDoctor.shiftEnd);
      setSlotDuration(selectedDoctor.slotDuration);
      setSaveSuccess(false);
    }
  }, [selectedDoctorId, selectedDoctor]);

  const daysList: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: DayOfWeek) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Live slot preview calculations
  const previewSlots = useMemo(() => {
    if (!shiftStart || !shiftEnd || slotDuration <= 0) return [];

    const [sh, sm] = shiftStart.split(':').map(Number);
    const [eh, em] = shiftEnd.split(':').map(Number);

    let curr = sh * 60 + sm;
    const end = eh * 60 + em;
    const slots: string[] = [];

    const formatTime = (totalMin: number) => {
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
    };

    while (curr + slotDuration <= end) {
      slots.push(formatTime(curr));
      curr += slotDuration;
    }

    return slots;
  }, [shiftStart, shiftEnd, slotDuration]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;

    try {
      await updateSchedule(selectedDoctorId, workingDays, shiftStart, shiftEnd, slotDuration);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update schedule');
    }
  };

  if (!selectedDoctor) {
    return <div className="p-4 text-center text-slate-500">No doctors available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Doctor Duty Hours & Slot Granularity</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Configure working shifts and appointment slot intervals. The booking engine automatically computes patient time slots based on these parameters.
          </p>
        </div>

        {/* Doctor Selector dropdown */}
        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
            Select Doctor to Configure
          </label>
          <select
            value={selectedDoctorId}
            onChange={e => setSelectedDoctorId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                {d.name} ({d.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <img
              src={selectedDoctor.photo}
              alt={selectedDoctor.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedDoctor.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedDoctor.specialty} • {selectedDoctor.qualification}
              </p>
              <span className="text-[11px] text-teal-700 font-semibold mt-0.5 inline-block">
                Fee: Rs. {selectedDoctor.fee.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Working Days Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Working Days
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysList.map(day => {
                  const isChecked = workingDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold text-xs transition-all ${isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      <span className="uppercase">{day}</span>
                      <span className={`text-[10px] font-normal mt-1 ${isChecked ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {isChecked ? 'On Duty' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Shift Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Shift Time Range (Start to End)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Shift Starts At
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftStart}
                      onChange={e => setShiftStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Shift Ends At
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={shiftEnd}
                      onChange={e => setShiftEnd(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Slot Duration Granularity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Consultation Slot Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[10, 15, 20, 30].map(duration => (
                  <button
                    type="button"
                    key={duration}
                    onClick={() => setSlotDuration(duration)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${slotDuration === duration
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {duration} Minutes
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <Check className="w-4 h-4" />
                  <span>Schedule Updated Successfully!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  Applies instantly across Patient Booking Portal
                </span>
              )}

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
              >
                <Save className="w-4 h-4" />
                <span>Save Schedule</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Dynamic Slot Calculation Preview */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-teal-600" />
                Live Slot Generation Preview
              </div>
              <span className="text-xs font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                {previewSlots.length} Slots per day
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Active Days:</span>
                <span className="font-bold text-slate-800">
                  {workingDays.join(', ') || 'None selected'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Session Timings:</span>
                <span className="font-bold text-slate-800">
                  {shiftStart} to {shiftEnd}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Potential Patients/Day:</span>
                <span className="font-extrabold text-teal-700">
                  {previewSlots.length} Patients Max
                </span>
              </div>
            </div>

            {/* Slot chips visualization */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Simulated Time Slots:
              </label>
              <div className="max-h-60 overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {previewSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="text-center py-1.5 px-2 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
                {previewSlots.length === 0 && (
                  <p className="text-xs text-rose-500 text-center py-4 font-medium">
                    Shift end time must be later than start time.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Patients booking online or walk-ins at reception will immediately see these updated intervals in real-time.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
