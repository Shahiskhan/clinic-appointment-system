import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Sun, 
  Sunset, 
  Moon, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { Doctor, TimeSlot } from '../../types/clinic';
import { useClinic, formatDateToISO } from '../../context/ClinicContext';

interface SlotPickerProps {
  doctor: Doctor;
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  doctor,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}) => {
  const { generateSlotsForDoctor } = useClinic();
  const [dayOffset, setDayOffset] = useState(0);

  // Generate 14 days starting from today + dayOffset
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + dayOffset + i);
      const iso = formatDateToISO(d);
      const dayName = dayNames[d.getDay()];
      const isWorkingDay = doctor.workingDays.includes(dayName as any);

      dates.push({
        iso,
        dateObj: d,
        dayName,
        dayNumber: d.getDate(),
        month: monthNames[d.getMonth()],
        isToday: i === 0 && dayOffset === 0,
        isWorkingDay,
      });
    }
    return dates;
  }, [doctor.workingDays, dayOffset]);

  // Generate slots for currently selected date
  const slotData = useMemo(() => {
    return generateSlotsForDoctor(doctor.id, selectedDate);
  }, [doctor.id, selectedDate, generateSlotsForDoctor]);

  // Categorize slots
  const morningSlots = slotData.slots.filter(s => s.period === 'Morning');
  const afternoonSlots = slotData.slots.filter(s => s.period === 'Afternoon');
  const eveningSlots = slotData.slots.filter(s => s.period === 'Evening');

  return (
    <div className="space-y-6">
      {/* Doctor Schedule Summary Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-teal-800 font-bold uppercase tracking-wider">
              Doctor's Practice Hours
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {doctor.workingDays.join(', ')} • {doctor.shiftStart} to {doctor.shiftEnd}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Consultation Slot</span>
          <span className="text-xs font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
            {doctor.slotDuration} Minutes per Patient
          </span>
        </div>
      </div>

      {/* Date Picker Ribbon */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            Select Consultation Date
          </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDayOffset(prev => Math.max(0, prev - 7))}
              disabled={dayOffset === 0}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Days"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(prev => prev + 7)}
              className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Next Days"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Strip */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {dateOptions.slice(0, 7).map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <button
                key={item.iso}
                onClick={() => onSelectDate(item.iso)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30'
                    : item.isWorkingDay
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40'
                    : 'bg-slate-50 text-slate-400 border-slate-200/60 opacity-60'
                }`}
              >
                {item.isToday && (
                  <span className={`text-[9px] font-extrabold uppercase px-1 rounded absolute -top-2 ${
                    isSelected ? 'bg-amber-400 text-slate-900' : 'bg-teal-100 text-teal-800'
                  }`}>
                    Today
                  </span>
                )}
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {item.dayName}
                </span>
                <span className="text-lg font-bold leading-tight my-0.5">
                  {item.dayNumber}
                </span>
                <span className="text-[10px] opacity-80">
                  {item.month}
                </span>

                {/* Duty indicator dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    item.isWorkingDay
                      ? isSelected
                        ? 'bg-white'
                        : 'bg-emerald-500'
                      : 'bg-slate-300'
                  }`}
                  title={item.isWorkingDay ? 'Working Day' : 'Day Off'}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-600" />
            Available Time Slots
          </label>
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-teal-500" />
              Available
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
              Booked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              Selected
            </span>
          </div>
        </div>

        {/* Doctor is on leave */}
        {slotData.isOnLeave && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-rose-800">
              Doctor Not Available On This Date
            </h4>
            <p className="text-xs text-rose-600 max-w-md mx-auto">
              {doctor.name} is on official leave: <span className="font-semibold">{slotData.leaveReason || 'Doctor Holiday'}</span>. Please pick another date above.
            </p>
          </div>
        )}

        {/* Doctor off-duty on this day */}
        {!slotData.isOnLeave && !slotData.isWorkingDay && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
            <Info className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="text-sm font-bold text-amber-800">
              No Consultations on this Day of the Week
            </h4>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              {doctor.name} conducts clinic visits on: <strong>{doctor.workingDays.join(', ')}</strong>. Please select an available green dot day from the calendar ribbon above.
            </p>
          </div>
        )}

        {/* Slots Available */}
        {!slotData.isOnLeave && slotData.isWorkingDay && (
          <div className="space-y-4">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Morning Session</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {morningSlots.map(slot => (
                    <SlotButton
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onSelect={onSelectSlot}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sunset className="w-3.5 h-3.5 text-orange-500" />
                  <span>Afternoon Session</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {afternoonSlots.map(slot => (
                    <SlotButton
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onSelect={onSelectSlot}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {eveningSlots.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Evening Session</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {eveningSlots.map(slot => (
                    <SlotButton
                      key={slot.id}
                      slot={slot}
                      isSelected={selectedSlot?.id === slot.id}
                      onSelect={onSelectSlot}
                    />
                  ))}
                </div>
              </div>
            )}

            {slotData.slots.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">
                No slots configured for this time range.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Selected slot preview confirmation */}
      {selectedSlot && (
        <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span className="text-xs text-teal-900 font-medium">
              Selected Slot: <strong>{selectedDate}</strong> at <strong>{selectedSlot.time}</strong>
            </span>
          </div>
          <span className="text-xs font-bold text-teal-700">Ready for Patient Info</span>
        </div>
      )}
    </div>
  );
};

// Helper button for individual slot
const SlotButton: React.FC<{
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
}> = ({ slot, isSelected, onSelect }) => {
  if (slot.isBooked) {
    return (
      <button
        disabled
        className="py-2 px-2.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed line-through opacity-70 flex items-center justify-center gap-1"
        title="Slot already reserved"
      >
        <span>{slot.time}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(slot)}
      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center justify-center gap-1 ${
        isSelected
          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 scale-[1.02]'
          : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50/50'
      }`}
    >
      <span>{slot.time}</span>
    </button>
  );
};
