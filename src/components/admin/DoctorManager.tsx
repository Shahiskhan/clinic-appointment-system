import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Edit3,
  Power,
  CheckCircle,
  XCircle,
  DollarSign,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Award,
  Trash2,
  Stethoscope
} from 'lucide-react';
import { Doctor, DayOfWeek, Specialty } from '../../types/clinic';
import { useClinic } from '../../context/ClinicContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export const DoctorManager: React.FC = () => {
  const { doctors, addDoctor, updateDoctor, toggleDoctorStatus } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form State
  const initialFormData = {
    name: '',
    specialty: 'Cardiology',
    qualification: '',
    experience: 5,
    fee: 2000,
    contact: '',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    room: 'Chamber 105',
    workingDays: ['Mon', 'Wed', 'Fri'] as DayOfWeek[],
    shiftStart: '17:00',
    shiftEnd: '21:00',
    slotDuration: 20,
    isActive: true,
    bio: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const daysList: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleOpenAdd = () => {
    setFormData(initialFormData);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      specialty: doc.specialty,
      qualification: doc.qualification,
      experience: doc.experience,
      fee: doc.fee,
      contact: doc.contact,
      photo: doc.photo,
      room: doc.room,
      workingDays: [...doc.workingDays],
      shiftStart: doc.shiftStart,
      shiftEnd: doc.shiftEnd,
      slotDuration: doc.slotDuration,
      isActive: doc.isActive,
      bio: doc.bio,
    });
    setIsAddModalOpen(true);
  };

  const toggleDay = (day: DayOfWeek) => {
    setFormData(prev => {
      const exists = prev.workingDays.includes(day);
      if (exists) {
        return { ...prev, workingDays: prev.workingDays.filter(d => d !== day) };
      } else {
        return { ...prev, workingDays: [...prev.workingDays, day] };
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) {
      alert('Doctor name and contact are required');
      return;
    }

    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, formData);
      } else {
        await addDoctor(formData);
      }
      setIsAddModalOpen(false);
      setEditingDoctor(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to save doctor');
    }
  };

  const filteredDoctors = doctors.filter(
    d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contact.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name, specialty or contact..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/60"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Doctor</th>
                <th className="py-3.5 px-4">Specialty & Chamber</th>
                <th className="py-3.5 px-4">Schedule & Slots</th>
                <th className="py-3.5 px-4">Fee (PKR)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(doctor => (
                <tr
                  key={doctor.id}
                  className={`hover:bg-slate-50/80 transition-colors ${!doctor.isActive ? 'bg-slate-50/40 opacity-75' : ''
                    }`}
                >
                  {/* Doctor Info */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {doctor.name}
                        </div>
                        <div className="text-xs text-slate-500 font-normal">
                          {doctor.qualification}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {doctor.contact}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Specialty */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <Badge variant="indigo" size="sm">
                        {doctor.specialty}
                      </Badge>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {doctor.room}
                      </div>
                    </div>
                  </td>

                  {/* Schedule */}
                  <td className="py-4 px-4">
                    <div className="text-xs text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {doctor.workingDays.join(', ') || 'No Days Set'}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {doctor.shiftStart} - {doctor.shiftEnd} ({doctor.slotDuration}m)
                      </div>
                    </div>
                  </td>

                  {/* Fee */}
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Rs. {doctor.fee.toLocaleString()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleDoctorStatus(doctor.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${doctor.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                        }`}
                      title="Click to toggle active status"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${doctor.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                      />
                      <span>{doctor.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(doctor)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Doctor Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleDoctorStatus(doctor.id)}
                        className={`p-2 rounded-lg transition-colors ${doctor.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        title={doctor.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Doctor Modal Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingDoctor ? `Edit ${editingDoctor.name}` : 'Add New Doctor to Clinic'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name with Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialty Department *
              </label>
              <select
                value={formData.specialty}
                onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
              >
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Dentistry">Dentistry</option>
              </select>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualifications & Degrees
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MBBS, FCPS, MRCP"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Fee (PKR) *
              </label>
              <input
                type="number"
                value={formData.fee}
                onChange={e => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                required
              />
            </div>

            {/* Chamber / Room */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinic Chamber / Room #
              </label>
              <input
                type="text"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                placeholder="Chamber 201 (2nd Floor)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Photo URL
              </label>
              <input
                type="text"
                value={formData.photo}
                onChange={e => setFormData({ ...formData, photo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Working Days Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Assigned Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysList.map(day => {
                const isChecked = formData.workingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift Time & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift Start (24h)
              </label>
              <input
                type="time"
                value={formData.shiftStart}
                onChange={e => setFormData({ ...formData, shiftStart: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shift End (24h)
              </label>
              <input
                type="time"
                value={formData.shiftEnd}
                onChange={e => setFormData({ ...formData, shiftEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slot Duration
              </label>
              <select
                value={formData.slotDuration}
                onChange={e => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Professional Bio
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Clinical interests, focus areas..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
            >
              {editingDoctor ? 'Update Doctor' : 'Save & Add Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
