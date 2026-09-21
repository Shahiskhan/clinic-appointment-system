import React from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  Calendar, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Doctor } from '../../types/clinic';
import { Badge } from '../common/Badge';

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onSelect }) => {
  // Format working hours (shiftStart to shiftEnd)
  const formatTimeStr = (t: string) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  const shiftLabel = `${formatTimeStr(doctor.shiftStart)} - ${formatTimeStr(doctor.shiftEnd)}`;

  const getSpecialtyBadgeColor = (specialty: string): 'teal' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate' => {
    switch (specialty.toLowerCase()) {
      case 'cardiology':
        return 'rose';
      case 'pediatrics':
        return 'amber';
      case 'dermatology':
        return 'teal';
      case 'neurology':
        return 'indigo';
      case 'orthopedics':
        return 'emerald';
      default:
        return 'teal';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Header Card */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Doctor Photo */}
            <div className="relative shrink-0">
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  // Fallback avatar
                  (e.target as HTMLElement).setAttribute(
                    'src',
                    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
                  );
                }}
              />
              {doctor.isActive ? (
                <span
                  title="Verified & Active"
                  className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span className="absolute -bottom-1.5 -right-1.5 bg-slate-400 text-white p-1 rounded-full ring-2 ring-white">
                  <span className="w-3.5 h-3.5 block rounded-full" />
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <Badge variant={getSpecialtyBadgeColor(doctor.specialty)} size="sm">
                  {doctor.specialty}
                </Badge>
                <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {doctor.rating.toFixed(1)}
                  <span className="text-slate-400 font-normal">({doctor.reviewCount})</span>
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                {doctor.name}
              </h3>
              <p className="text-xs text-slate-500 truncate font-medium">
                {doctor.qualification}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  {doctor.experience}+ Years Exp.
                </span>
                <span className="flex items-center gap-1 text-slate-500 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.room}
                </span>
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2 rounded-lg border border-slate-100">
            {doctor.bio}
          </p>
        </div>

        {/* Schedule & Days Overview */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50/60 border-t border-slate-100">
          <div className="flex items-start gap-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Working Days: </span>
              <span className="text-slate-600">
                {doctor.workingDays.join(', ')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs mt-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Hours: </span>
              <span className="text-slate-600">{shiftLabel}</span>
              <span className="bg-teal-100/80 text-teal-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                {doctor.slotDuration} min slots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Booking Action */}
      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase block">
            Consultation Fee
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-teal-700 tracking-tight">
            Rs. {doctor.fee.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => onSelect(doctor)}
          disabled={!doctor.isActive}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 ${
            doctor.isActive
              ? 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md hover:shadow-teal-500/20 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <span>{doctor.isActive ? 'Book Slot' : 'Not Available'}</span>
          {doctor.isActive && <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </div>
    </div>
  );
};
