import React from 'react';
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  PhoneCall,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface HeaderProps {
  currentView: 'patient' | 'admin';
  onViewChange: (view: 'patient' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const { stats } = useClinic();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span className="font-medium text-teal-100">MCA Clinic Lahore &middot; Patient-first care</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-teal-200">
              <Clock className="w-3 h-3" />
              24/7 Emergency &amp; OPD Consultation
            </span>
          </div>

          <div className="flex items-center gap-4 text-teal-100">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-teal-300" />
              Helpline: <strong className="text-white">042-34500888</strong>
            </span>
            <span className="hidden sm:inline-block bg-teal-600/60 px-2 py-0.5 rounded text-[11px] font-semibold text-teal-100">
              Live Clinic Sync ON
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* Logo & Clinic Branding */}
          <div
            onClick={() => onViewChange('patient')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  MCA <span className="text-teal-600">Clinic</span>
                </span>
                <span className="hidden md:inline-block text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 px-2 py-0.5 rounded-full">
                  Lahore
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Specialist care • Online appointments • 24/7 support
              </p>
            </div>
          </div>

          {/* Dual Module Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewChange('patient')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${currentView === 'patient'
                ? 'bg-white text-teal-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <CalendarDays className={`w-4 h-4 ${currentView === 'patient' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Patient Booking</span>
              <span className="hidden lg:inline-block text-[11px] font-normal text-slate-500 ml-1">
                (Public Web)
              </span>
            </button>

            <button
              onClick={() => onViewChange('admin')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all relative ${currentView === 'admin'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${currentView === 'admin' ? 'text-indigo-200' : 'text-slate-400'}`} />
              <span>Admin & Desk</span>
              <span className="hidden lg:inline-block text-[11px] font-normal opacity-80 ml-1">
                (Dashboard)
              </span>
              {stats.todayWalkInsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400 text-slate-900">
                  {stats.todayAppointmentsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
