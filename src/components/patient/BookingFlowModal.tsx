import React, { useState } from 'react';
import {
  Calendar,
  User,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Doctor, TimeSlot, Appointment, PaymentMethod, PaymentStatus } from '../../types/clinic';
import { useClinic, formatDateToISO } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { SlotPicker } from './SlotPicker';
import { PatientDetailsForm, PatientFormData } from './PatientDetailsForm';
import { PaymentGateway } from './PaymentGateway';
import { AppointmentReceipt } from './AppointmentReceipt';

interface BookingFlowModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'slot' | 'details' | 'payment' | 'receipt';

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  doctor,
  isOpen,
  onClose,
}) => {
  const { bookAppointment } = useClinic();

  // Booking sequence states
  const [step, setStep] = useState<Step>('slot');
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToISO(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [patientData, setPatientData] = useState<PatientFormData | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  if (!doctor) return null;

  const handleResetAndClose = () => {
    setStep('slot');
    setSelectedSlot(null);
    setPatientData(null);
    setConfirmedAppointment(null);
    onClose();
  };

  const handleSlotNext = () => {
    if (selectedSlot) {
      setStep('details');
    }
  };

  const handleDetailsSubmit = (data: PatientFormData) => {
    setPatientData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = async (method: PaymentMethod, status: PaymentStatus) => {
    if (!selectedSlot || !patientData) return;

    try {
      const newAppointment = await bookAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        patientName: patientData.name,
        patientPhone: patientData.phone,
        age: Number(patientData.age),
        gender: patientData.gender,
        notes: patientData.notes,
        date: selectedDate,
        timeSlot: selectedSlot.time,
        consultationFee: doctor.fee,
        paymentMethod: method,
        paymentStatus: status,
        isWalkIn: false,
      });
      setConfirmedAppointment(newAppointment);
      setStep('receipt');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to book appointment');
    }
  };

  // Progress Bar Steps Definition
  const stepsConfig = [
    { id: 'slot', label: '1. Choose Slot', icon: Calendar },
    { id: 'details', label: '2. Patient Info', icon: User },
    { id: 'payment', label: '3. Payment', icon: CreditCard },
    { id: 'receipt', label: '4. Confirmed', icon: CheckCircle2 },
  ];

  const getStepIndex = (s: Step) => {
    switch (s) {
      case 'slot': return 0;
      case 'details': return 1;
      case 'payment': return 2;
      case 'receipt': return 3;
    }
  };

  const currentStepIndex = getStepIndex(step);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      maxWidth={step === 'receipt' ? 'xl' : '2xl'}
      showCloseButton={step !== 'payment'}
      title={
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900">
            Book Appointment
          </span>
          <span className="text-slate-400 font-normal">|</span>
          <span className="text-sm font-semibold text-teal-700">
            {doctor.name} ({doctor.specialty})
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step Indicator Wizard (Hidden during receipt print) */}
        {step !== 'receipt' && (
          <div className="border-b border-slate-100 pb-4 no-print">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-600 transition-all duration-300 -z-0"
                style={{
                  width: `${(currentStepIndex / (stepsConfig.length - 1)) * 100}%`,
                }}
              />

              {stepsConfig.map((item, idx) => {
                const Icon = item.icon;
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${isCurrent
                          ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                          : isPassed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-slate-400 border-2 border-slate-200'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${isCurrent
                          ? 'text-teal-800'
                          : isPassed
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: Slot Selection */}
        {step === 'slot' && (
          <div className="space-y-6">
            <SlotPicker
              doctor={doctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null); // Reset slot when date changes
              }}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSlotNext}
                disabled={!selectedSlot}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Continue to Patient Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Patient Details Form */}
        {step === 'details' && selectedSlot && (
          <PatientDetailsForm
            doctor={doctor}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSubmit={handleDetailsSubmit}
            onBack={() => setStep('slot')}
          />
        )}

        {/* STEP 3: Payment Gateway & OTP */}
        {step === 'payment' && patientData && (
          <PaymentGateway
            amount={doctor.fee}
            doctorName={doctor.name}
            patientName={patientData.name}
            onPaymentSuccess={handlePaymentSuccess}
            onBack={() => setStep('details')}
          />
        )}

        {/* STEP 4: Success Receipt & Printable Token */}
        {step === 'receipt' && confirmedAppointment && (
          <AppointmentReceipt
            appointment={confirmedAppointment}
            onClose={handleResetAndClose}
          />
        )}
      </div>
    </Modal>
  );
};
