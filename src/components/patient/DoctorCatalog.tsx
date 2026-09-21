import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Stethoscope, 
  Heart, 
  Sparkles, 
  Baby, 
  Activity, 
  Brain, 
  Bone,
  CheckCircle,
  CalendarCheck,
  CreditCard,
  Building
} from 'lucide-react';
import { Doctor } from '../../types/clinic';
import { DoctorCard } from './DoctorCard';

interface DoctorCatalogProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

const SPECIALTY_OPTIONS = [
  { label: 'All Specialties', value: 'All', icon: Stethoscope },
  { label: 'Cardiology', value: 'Cardiology', icon: Heart },
  { label: 'General Medicine', value: 'General Medicine', icon: Activity },
  { label: 'Dermatology', value: 'Dermatology', icon: Sparkles },
  { label: 'Pediatrics', value: 'Pediatrics', icon: Baby },
  { label: 'Neurology', value: 'Neurology', icon: Brain },
  { label: 'Orthopedics', value: 'Orthopedics', icon: Bone },
];

export const DoctorCatalog: React.FC<DoctorCatalogProps> = ({
  doctors,
  onSelectDoctor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);

  // Day of today e.g. "Sat", "Mon"
  const todayDayMap: Record<number, string> = {
    0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'
  };
  const todayDay = todayDayMap[new Date().getDay()];

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.bio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' ||
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();

      const matchesToday =
        !onlyAvailableToday || doctor.workingDays.includes(todayDay as any);

      return matchesSearch && matchesSpecialty && matchesToday;
    });
  }, [doctors, searchTerm, selectedSpecialty, onlyAvailableToday, todayDay]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold backdrop-blur-md">
            <CheckCircle className="w-3.5 h-3.5 text-teal-300" />
            Instant Online & Walk-in Slot Confirmation
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Find the Right Specialist, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
              Book Your Appointment
            </span> in Minutes.
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Choose your preferred doctor, select real-time available consultation slots, and pay securely via JazzCash, EasyPaisa, Card, or at the Clinic.
          </p>

          {/* Quick Value Props */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-teal-200 font-medium">
              <CalendarCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Zero Waiting Queue</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-200 font-medium">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>4+ Flexible Payment Modes</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-teal-200 font-medium col-span-2 sm:col-span-1">
              <Building className="w-4 h-4 text-indigo-300 shrink-0" />
              <span>Central On-Premise Clinic</span>
            </div>
          </div>
        </div>

        {/* Decorative background radial gradients */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Search Bar Section */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name, specialty, or condition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400 text-slate-800 transition-all bg-slate-50/50 hover:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Toggle: Available Today */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailableToday}
                onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <span>Available Today ({todayDay})</span>
            </label>

            <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">
              Showing <strong className="text-slate-700">{filteredDoctors.length}</strong> doctors
            </span>
          </div>
        </div>

        {/* Specialty Filter Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SPECIALTY_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedSpecialty === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setSelectedSpecialty(item.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/20 ring-2 ring-teal-600/30'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section>
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onSelect={onSelectDoctor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No doctors found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              We couldn't find any specialist matching "{searchTerm || selectedSpecialty}". Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('All');
                setOnlyAvailableToday(false);
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
