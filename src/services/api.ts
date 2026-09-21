/**
 * MediCare+ Hybrid Clinic API Client
 * Communicates with backend Express/Prisma API (http://localhost:5000/api)
 * Supports Pakistani Gateways (Safepay & PayFast)
 */

export const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_TOKEN_KEY = 'medicare_admin_token';

const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY);

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `API request failed with status ${res.status}`);
  }

  return data;
};

export const ClinicApi = {
  login: async (email: string, password: string) => {
    const response = await request<{
      success: boolean;
      data: { token: string; admin: { id: string; email: string; name: string; role: string } };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
    return response;
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getCurrentAdmin: async () => request<{ success: boolean; data: any }>('/auth/me'),

  changePassword: async (currentPassword: string, newPassword: string) => {
    return request<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Check backend health
  checkHealth: async () => {
    return request<{ status: string; database: string }>('/health');
  },

  // Doctors
  getDoctors: async (params?: { specialty?: string; search?: string; day?: string }) => {
    const query = new URLSearchParams();
    if (params?.specialty && params.specialty !== 'All') query.append('specialty', params.specialty);
    if (params?.search) query.append('search', params.search);
    if (params?.day) query.append('day', params.day);
    return request<{ success: boolean; data: any[] }>(`/doctors?${query.toString()}`);
  },

  createDoctor: async (doctorData: any) => {
    return request<{ success: boolean; data: any }>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  },

  updateDoctor: async (id: string, updates: any) => {
    return request<{ success: boolean; data: any }>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  toggleDoctorStatus: async (id: string) => {
    return request<{ success: boolean; isActive: boolean }>(`/doctors/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // Schedules
  updateSchedule: async (doctorId: string, schedule: {
    workingDays: string[];
    shiftStart: string;
    shiftEnd: string;
    slotDuration: number;
  }) => {
    return request<{ success: boolean; data: any }>(`/schedules/${doctorId}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  // Leaves & Holidays
  getLeaves: async (doctorId?: string) => {
    const query = doctorId ? `?doctorId=${doctorId}` : '';
    return request<{ success: boolean; data: any[] }>(`/leaves${query}`);
  },

  createLeave: async (leaveData: { doctorId: string; date: string; reason: string }) => {
    return request<{ success: boolean; data: any }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  deleteLeave: async (id: string) => {
    return request<{ success: boolean }>(`/leaves/${id}`, {
      method: 'DELETE',
    });
  },

  // Appointments & Slot Generator
  getDoctorSlots: async (doctorId: string, date: string) => {
    return request<{
      success: boolean;
      data: {
        slots: any[];
        isWorkingDay: boolean;
        isOnLeave: boolean;
        leaveReason?: string;
      };
    }>(`/appointments/doctors/${doctorId}/slots?date=${date}`);
  },

  getAppointments: async (params?: { date?: string; isWalkIn?: boolean; search?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.date) query.append('date', params.date);
    if (params?.isWalkIn !== undefined) query.append('isWalkIn', String(params.isWalkIn));
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.pageSize) query.append('pageSize', String(params.pageSize));
    return request<{ success: boolean; data: any[] }>(`/appointments?${query.toString()}`);
  },

  bookAppointment: async (appointmentData: any) => {
    return request<{ success: boolean; data: any }>('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  bookWalkIn: async (walkInData: any) => {
    return request<{ success: boolean; data: any }>('/appointments/walkin', {
      method: 'POST',
      body: JSON.stringify(walkInData),
    });
  },

  updatePaymentStatus: async (appointmentId: string, status: 'PAID' | 'PENDING') => {
    return request<{ success: boolean; data: any }>(`/appointments/${appointmentId}/payment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Pakistani Payment Gateways
  initiateSafepay: async (appointmentId: string) => {
    return request<{
      success: boolean;
      gateway: 'SAFEPAY';
      data: { token: string; checkoutUrl: string; trackerId: string };
    }>('/payments/safepay/create', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    });
  },

  initiatePayFast: async (appointmentId: string) => {
    return request<{
      success: boolean;
      gateway: 'PAYFAST';
      data: any;
    }>('/payments/payfast/create', {
      method: 'POST',
      body: JSON.stringify({ appointmentId }),
    });
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    return request<{
      success: boolean;
      data: {
        todayAppointmentsCount: number;
        todayWalkInsCount: number;
        totalActiveDoctors: number;
        todayRevenue: number;
      };
    }>('/stats/dashboard');
  },
};
