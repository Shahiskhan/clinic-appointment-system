import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  FileText, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { Doctor, TimeSlot } from '../../types/clinic';

export interface PatientFormData {
  name: string;
  phone: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  notes: string;
}

interface PatientDetailsFormProps {
  doctor: Doctor;
  selectedDate: string;
  selectedSlot: TimeSlot;
  onSubmit: (data: PatientFormData) => void;
  onBack: () => void;
}

export const PatientDetailsForm: React.FC<PatientDetailsFormProps> = ({
  doctor,
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Patient full name is required.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone number is required.';
    } else if (formData.phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid 10-11 digit phone number.';
    }
    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 125) {
      newErrors.age = 'Please enter a valid age.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Appointment Snapshot Header */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={doctor.photo}
            alt={doctor.name}
            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
              Booking With
            </span>
            <h4 className="text-sm font-bold text-slate-800">{doctor.name}</h4>
            <p className="text-xs text-slate-500">{doctor.specialty} • {doctor.room}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white px-3 py-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">{selectedDate}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold">{selectedSlot.time}</span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-teal-600" />
          Patient Personal Information
        </h4>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Asad Ullah Khan"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone & Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phone Number */}
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mobile / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                placeholder="0300 1234567"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Age (Years) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => {
                setFormData({ ...formData, age: e.target.value });
                if (errors.age) setErrors({ ...errors, age: '' });
              }}
              placeholder="e.g. 32"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.age
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {errors.age && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.age}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Medical Notes / Symptoms */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Medical Reason / Symptoms (Optional)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Helps doctor prepare in advance
            </span>
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Describe brief symptoms (e.g. high blood pressure readings, chest tightness, rash on forearm since 3 days)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
          />
        </div>
      </div>

      {/* Fee Breakdown Card */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Doctor Consultation Fee</span>
          <span>Rs. {doctor.fee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Hospital Facility & Digital Token</span>
          <span className="text-emerald-600 font-medium">Free (Waived)</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-800">
          <span>Total Payable</span>
          <span className="text-teal-700">Rs. {doctor.fee.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Back to Slots
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all hover:scale-[1.01]"
        >
          <span>Proceed to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
