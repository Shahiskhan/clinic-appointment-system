import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { DoctorCatalog } from './components/patient/DoctorCatalog';
import { BookingFlowModal } from './components/patient/BookingFlowModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Doctor } from './types/clinic';
import {
  ArrowRight,
  Baby,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { doctors } = useClinic();
  const [currentView, setCurrentView] = useState<'patient' | 'admin'>('patient');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Universal Top Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentView === 'patient' ? (
          <div>
            <section className="relative overflow-hidden rounded-[2rem] bg-[#123b3a] text-white shadow-2xl shadow-teal-950/15">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.2) 100%)' }} />
              <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] items-stretch">
                <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Trusted care, close to home
                  </div>
                  <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                    Welcome to <span className="text-emerald-300">MCA Clinic</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-teal-50/80 sm:text-lg">
                    Expert medical specialists and compassionate pediatric care in New Muslim Town, Lahore, near UHS.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a href="#doctors" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-[#123b3a] transition hover:bg-white">
                      Book an appointment <ArrowRight className="h-4 w-4" />
                    </a>
                    <a href="tel:04234500888" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                      <Phone className="h-4 w-4" /> Call helpline
                    </a>
                  </div>
                  <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-teal-100/75">
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Verified clinic information</span>
                    <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-300" /> 24/7 emergency support</span>
                  </div>
                </div>
                <div className="relative min-h-[280px] overflow-hidden lg:min-h-[460px]">
                  <img src="https://images.unsplash.com/photo-1638202993928-7d113b8a6b1d?auto=format&fit=crop&q=85&w=1200" alt="Doctor consulting a patient" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123b3a] via-transparent to-[#123b3a]/10 lg:bg-gradient-to-r lg:from-[#123b3a]/20 lg:to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-[#123b3a]/80 p-4 backdrop-blur-md sm:left-auto sm:max-w-xs">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">MCA Clinic Lahore</p>
                    <p className="mt-1 text-sm font-semibold text-white">House No. 50-A, Block D, New Muslim Town</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 py-10 sm:grid-cols-3">
              {[
                { icon: Baby, title: 'Pediatric care', text: 'Gentle, expert care for children at every stage.' },
                { icon: Stethoscope, title: 'General medicine', text: 'Thoughtful consultations for everyday health.' },
                { icon: HeartPulse, title: 'Diagnostics & OPD', text: 'Convenient support from consultation to diagnosis.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 border-l-2 border-emerald-400 bg-white px-5 py-4 shadow-sm">
                  <Icon className="mt-1 h-6 w-6 shrink-0 text-teal-700" />
                  <div><h2 className="font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500">{text}</p></div>
                </div>
              ))}
            </section>

            <div id="doctors" className="scroll-mt-24">
              <DoctorCatalog
                doctors={doctors}
                onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
              />
            </div>

            <section className="mb-8 grid gap-6 overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Find us in Lahore</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Care that is easy to reach.</h2>
                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <p className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" /><span>House No. 50-A, Block D, New Muslim Town, near University of Health Sciences (UHS), Lahore.</span></p>
                  <p className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 text-teal-600" /><span>(042) 35947950 &middot; Helpline: 042-34500888</span></p>
                  <p className="flex items-center gap-3"><Clock3 className="h-5 w-5 shrink-0 text-teal-600" /><span>24/7 emergency &amp; OPD consultation slots</span></p>
                </div>
              </div>
              <iframe title="MCA Clinic location map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.5!2d74.321!3d31.518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDMxJzA0LjgiTiA3NMKwMTknMTUuNiJF!5e0!3m2!1sen!2spk!4v1600000000000!5m2!1sen!2spk" className="h-[280px] w-full rounded-2xl border-0 sm:h-[350px]" loading="lazy" allowFullScreen />
            </section>

            {/* Interactive Booking Modal */}
            <BookingFlowModal
              doctor={selectedDoctorForBooking}
              isOpen={!!selectedDoctorForBooking}
              onClose={() => setSelectedDoctorForBooking(null)}
            />
          </div>
        ) : (
          <div>
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Modern Healthcare Footer (Hidden during slip printing) */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 mt-16 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 font-black text-[#123b3a]">M</div>
                <span className="text-lg font-black tracking-tight">MCA Clinic</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Specialist consultations, pediatric care and dependable outpatient services for families in Lahore.
              </p>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Patient-first care, every day</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Specialist Clinics
              </h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>Pediatrics & Child Health</li>
                <li>General Medicine & OPD</li>
                <li>Consultation Services</li>
                <li>Diagnostic Support</li>
                <li>24/7 Emergency Care</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Clinic Location & Hours
              </h4>
              <div className="space-y-2 text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>50-A, Block D, New Muslim Town, near UHS, Lahore</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>24/7 Emergency &amp; OPD consultation</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>(042) 35947950</span>
                </p>
              </div>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                Switch View
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('patient')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${currentView === 'patient'
                    ? 'bg-teal-900/60 border-teal-500 text-teal-200'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                >
                  Patient Booking View
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${currentView === 'admin'
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                >
                  Receptionist & Admin Control Panel
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              &copy; 2026 MCA Clinic (Lahore). All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Patient Charter</span>
              <span>HIPAA Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ClinicProvider>
      <MainContent />
    </ClinicProvider>
  );
}

export default App;
