import React from 'react';
import {
  CheckCircle2,
  Printer,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Building2,
  Share2,
  User,
  Phone,
  CreditCard,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Appointment } from '../../types/clinic';

interface AppointmentReceiptProps {
  appointment: Appointment;
  onClose: () => void;
}

export const AppointmentReceipt: React.FC<AppointmentReceiptProps> = ({
  appointment,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Success Banner (Hidden during print) */}
      <div className="text-center space-y-2 no-print">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Appointment Confirmed!
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Your slot has been secured in the clinic live queue. A confirmation SMS & WhatsApp token has also been issued.
        </p>
      </div>

      {/* Printable Clinical Voucher / Token Slip */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm print-shadow-none relative overflow-hidden font-mono text-slate-800">

        {/* Watermark badge */}
        <div className="absolute right-4 top-4 text-xs font-sans font-bold px-2.5 py-1 rounded-full border border-teal-200 bg-teal-50 text-teal-800 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          VERIFIED TOKEN
        </div>

        {/* Header */}
        <div className="border-b-2 border-dashed border-slate-300 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-sans font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-sans font-extrabold tracking-tight text-slate-900">
                MCA CLINIC (LAHORE)
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                50-A, Block D, New Muslim Town • Helpline: 042-34500888
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
            <div>
              <span className="text-slate-400">APPOINTMENT REF: </span>
              <span className="font-bold text-slate-900">{appointment.id}</span>
            </div>
            <div>
              <span className="text-slate-400">BOOKING DATE: </span>
              <span className="font-medium text-slate-700">
                {new Date(appointment.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Big Queue Token Highlight */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center mb-5 font-sans">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Patient Queue Token
          </span>
          <div className="text-3xl sm:text-4xl font-black text-teal-700 my-0.5">
            TOKEN #{appointment.tokenNumber}
          </div>
          <span className="text-[11px] text-slate-500">
            Show this number at reception upon entry
          </span>
        </div>

        {/* Doctor & Slot Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-200 font-sans text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">DOCTOR / SPECIALIST</span>
            <div className="font-bold text-sm text-slate-900 mt-0.5">
              {appointment.doctorName}
            </div>
            <div className="text-teal-700 font-medium">{appointment.doctorSpecialty}</div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px] block">SCHEDULED TIME</span>
            <div className="font-bold text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {appointment.date}
            </div>
            <div className="text-slate-700 font-semibold flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              {appointment.timeSlot}
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="py-4 border-b border-dashed border-slate-200 font-sans text-xs grid grid-cols-2 gap-3">
          <div>
            <span className="text-slate-400 text-[11px] block">PATIENT NAME</span>
            <span className="font-bold text-slate-800">{appointment.patientName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">AGE / GENDER</span>
            <span className="font-bold text-slate-800">
              {appointment.age} yrs • {appointment.gender}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">PHONE NUMBER</span>
            <span className="font-medium text-slate-800">{appointment.patientPhone}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">TYPE</span>
            <span className="font-bold text-slate-800">
              {appointment.isWalkIn ? 'Reception Walk-in' : 'Online Booking'}
            </span>
          </div>
        </div>

        {/* Payment & QR Code Footer */}
        <div className="pt-4 flex items-center justify-between font-sans">
          <div>
            <span className="text-slate-400 text-[11px] block">PAYMENT BREAKDOWN</span>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              Rs. {appointment.consultationFee.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${appointment.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
                }`}>
                {appointment.paymentStatus === 'Paid' ? 'PAID ONLINE' : 'PAY ON ARRIVAL'}
              </span>
              <span className="text-[11px] text-slate-500">
                Via {appointment.paymentMethod}
              </span>
            </div>
          </div>

          {/* QR Code Graphic Mock */}
          <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-800" />
            </div>
            <span className="text-[9px] font-mono text-slate-500 block mt-1">
              SCAN AT DESK
            </span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-sans text-center">
          * Please arrive 10-15 minutes before your scheduled slot. Present this digital slip or token at reception.
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4 text-teal-600" />
          <span>Print Slip / Receipt</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
        >
          Done / Book Another
        </button>
      </div>
    </div>
  );
};
