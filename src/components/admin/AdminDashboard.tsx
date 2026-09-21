import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  CalendarDays,
  DollarSign,
  Stethoscope,
  Clock,
  CalendarOff,
  FileText,
  Activity,
  Sparkles,
  TrendingUp
  , LogIn
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ClinicApi } from '../../services/api';
import { DoctorManager } from './DoctorManager';
import { ScheduleManager } from './ScheduleManager';
import { LeaveManager } from './LeaveManager';
import { WalkInEntry } from './WalkInEntry';

type AdminTab = 'walkin' | 'doctors' | 'schedules' | 'leaves';

export const AdminDashboard: React.FC = () => {
  const { stats, isAdminAuthenticated, loginAdmin } = useClinic();
  const [activeTab, setActiveTab] = useState<AdminTab>('walkin');
  const [email, setEmail] = useState('admin@medicare.local');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await loginAdmin(email, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Unable to sign in');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    setIsChangingPassword(true);
    try {
      await ClinicApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMessage('Password changed successfully.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Admin Sign In</h2>
            <p className="text-xs text-slate-500">Sign in to manage live clinic data.</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="Admin email" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <input value={password} onChange={event => setPassword(event.target.value)} type="password" placeholder="Password" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          {loginError && <p className="text-xs text-rose-600">{loginError}</p>}
          <button disabled={isLoggingIn} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold">
            {isLoggingIn ? 'Signing in...' : 'Sign in to Admin Panel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Appointments Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Today's Patients
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats.todayAppointmentsCount}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Live Queue Tracking
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Walk-In Entries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Walk-in Tokens
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-900 mt-1">
              {stats.todayWalkInsCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Front-Desk Issued
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Active Doctors on Duty */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Active Doctors
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats.totalActiveDoctors}
            </div>
            <span className="text-[11px] text-teal-600 font-semibold block mt-1">
              Practicing Today
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Revenue Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Today's Collections
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              Rs. {stats.todayRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              Cash & Digital Settled
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Panel Tabs Navigation */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('walkin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'walkin'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Receptionist Walk-in & Live Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'doctors'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Management</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'schedules'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>Schedule & Slot Manager</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'leaves'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
          <CalendarOff className="w-4 h-4" />
          <span>Leave & Block Out Dates</span>
        </button>
      </div>

      <form onSubmit={handleChangePassword} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 max-w-xl">
        <h2 className="text-base font-black text-slate-900">Change Admin Password</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} type="password" placeholder="Current password" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
          <input value={newPassword} onChange={event => setNewPassword(event.target.value)} type="password" minLength={8} placeholder="New password (8+ characters)" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
        </div>
        {passwordError && <p className="text-xs text-rose-600">{passwordError}</p>}
        {passwordMessage && <p className="text-xs text-emerald-600">{passwordMessage}</p>}
        <button disabled={isChangingPassword} className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold">
          {isChangingPassword ? 'Changing...' : 'Change password'}
        </button>
      </form>

      {/* Tab Panels */}
      <div>
        {activeTab === 'walkin' && <WalkInEntry />}
        {activeTab === 'doctors' && <DoctorManager />}
        {activeTab === 'schedules' && <ScheduleManager />}
        {activeTab === 'leaves' && <LeaveManager />}
      </div>
    </div>
  );
};
