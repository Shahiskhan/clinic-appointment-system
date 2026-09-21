import React, { useEffect, useState } from 'react';
import {
  CalendarOff,
  Trash2,
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  Building,
  User
} from 'lucide-react';
import { useClinic, formatDateToISO } from '../../context/ClinicContext';

export const LeaveManager: React.FC = () => {
  const { doctors, leaveDates, addLeave, removeLeave } = useClinic();

  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [leaveDate, setLeaveDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return formatDateToISO(d);
  });
  const [reason, setReason] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !leaveDate || !reason.trim()) {
      alert('Please fill out all fields');
      return;
    }

    try {
      await addLeave(selectedDoctorId, leaveDate, reason.trim());
      setReason('');
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to block date');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-rose-950 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">
              <CalendarOff className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black">Doctor Holidays & Block-Out Dates</h2>
          </div>
          <p className="text-xs text-rose-100/80 max-w-xl">
            Block specific calendar dates for scheduled doctor vacations, conferences, or emergencies. Blocked dates will be grayed out and disabled for online patients and front-desk walk-ins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form: Add New Block Out Date */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-100">
            <Plus className="w-4 h-4 text-rose-600" />
            Block Out a Date
          </h3>

          <form onSubmit={handleAddLeave} className="space-y-4">
            {/* Doctor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Doctor *
              </label>
              <select
                value={selectedDoctorId}
                onChange={e => setSelectedDoctorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                required
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date to Block *
              </label>
              <input
                type="date"
                value={leaveDate}
                min={formatDateToISO(new Date())}
                onChange={e => setLeaveDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Absence / Block-Out *
              </label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Annual Medical Conference, Personal Leave"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
            </div>

            {successNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Date blocked out successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-rose-600/20 transition-all"
            >
              Block Out Date Now
            </button>
          </form>
        </div>

        {/* List of Active Blocked Dates */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Blocked Out Dates ({leaveDates.length})
            </h3>
            <span className="text-xs text-slate-400">
              Auto-syncs with Public Slot Picker
            </span>
          </div>

          {leaveDates.length > 0 ? (
            <div className="space-y-3">
              {leaveDates.map(item => {
                const doc = doctors.find(d => d.id === item.doctorId);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-rose-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                        <CalendarOff className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {doc ? doc.name : 'Unknown Doctor'}
                        </div>
                        <div className="text-xs font-semibold text-rose-700 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Date: {item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Reason: <span className="italic">{item.reason}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeLeave(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Remove Blocked Date / Re-open slots"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No block-out dates recorded.</p>
              <span className="text-[11px] text-slate-400 block">
                All doctors are currently on regular duty schedule.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
