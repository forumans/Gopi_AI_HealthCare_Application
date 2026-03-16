import type {
  AdminUserRow,
  AppointmentRow,
  DoctorAppointmentRow,
  LoginResponse,
  PatientSearchRow,
} from "./types";

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://127.0.0.1:8000";

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    // Debug: Log the request details
    if (options?.headers && 'Authorization' in options.headers) {
      const authHeader = options.headers.Authorization as string;
      console.log("Making authenticated request to:", `${baseUrl}${url}`);
      console.log("Auth header present:", authHeader ? "Yes" : "No");
      console.log("Auth header starts with Bearer:", authHeader.startsWith("Bearer ") ? "Yes" : "No");
    } else {
      console.log("Making unauthenticated request to:", `${baseUrl}${url}`);
    }
    
    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response body:`, errorText);
      
      // Try to parse JSON error to get the detail field
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          throw new Error(errorJson.detail);
        }
      } catch {
        // If it's not JSON or doesn't have detail, throw the original error
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }
    }

    if (response.status === 204) {
      return undefined as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error("Network error detected - checking CORS and server status");
      throw new Error('Failed to fetch - please check your internet connection and ensure the server is running');
    }
    
    // Check if it's a CORS error
    if (error.message.includes('CORS')) {
      console.error("CORS error detected");
      throw new Error('CORS error - the server may not allow requests from this origin');
    }
    
    throw error;
  }
}

export function withAuth(token: string): Record<string, string> {
  if (!token) {
    console.error("No token provided to withAuth!");
  }
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  registerPatient: (payload: Record<string, unknown>) =>
    request<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string; remember_me: boolean }) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),

  listWeeklyAppointments: (token: string, fromDate?: string) =>
    request<AppointmentRow[]>(`/appointments/week${fromDate ? `?from_date=${fromDate}` : ""}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  listAllAppointments: (token: string) =>
    request<AppointmentRow[]>("/appointments/all", {
      method: "GET",
      headers: withAuth(token),
    }),

  getCurrentPatient: (token: string) =>
    request<{ id: string; name: string; email: string; phone: string; date_of_birth?: string; insurance_provider?: string; insurance_policy_number?: string; address?: string; emergency_contact?: string; emergency_phone?: string }>("/patient/me", {
      method: "GET",
      headers: withAuth(token),
    }),

  bookAppointment: (token: string, payload: { doctor_id: string; slot: string; reason: string }) =>
    request<{ id: string; status: string }>("/appointments", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    }),

  cancelAppointment: (token: string, appointmentId: string) =>
    request<{ message: string }>(`/appointments/${appointmentId}`, {
      method: "DELETE",
      headers: withAuth(token),
    }),

  doctorWeeklyAppointments: (token: string, fromDate?: string) =>
    request<DoctorAppointmentRow[]>(`/doctor/appointments${fromDate ? `?from_date=${fromDate}` : ""}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  doctorAllAppointments: (token: string, fromDate?: string) =>
    request<DoctorAppointmentRow[]>(`/doctor/appointments/all${fromDate ? `?from_date=${fromDate}` : ""}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  updateDoctorSlot: (token: string, payload: { slot: string; is_available: boolean }) =>
    request<{ message: string }>("/doctor/availability", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    }),

  searchPatients: (token: string, q: string) =>
    request<PatientSearchRow[]>(`/patients/search?q=${encodeURIComponent(q)}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  patientPrescriptions: (token?: string) => {
    console.log('API: Making patientPrescriptions call to /patient/prescriptions');
    console.log('API: Token available:', !!token);
    return request<Array<{
      appointment_time: string;
      patient_name: string;
      doctor_name: string;
      appointment_status: string;
      appointment_note: string;
      symptoms: string;
      diagnosis: string;
      lab_results: string;
      medication_details: string;
      pharmacy_name: string;
      appointment_created_at: string;
      status: string;
    }>>('/patient/prescriptions', {
      method: "GET",
      headers: withAuth(token || ''),
    }).then(response => {
      console.log('API: patientPrescriptions response:', response);
      return response;
    }).catch(error => {
      console.error('API: patientPrescriptions error:', error);
      throw error;
    });
  },

  getAllPatientPrescriptions: (token: string, patientId: string) =>
    request<PatientSearchRow[]>(`/patients/${patientId}/prescriptions`, {
      method: "GET",
      headers: withAuth(token),
    }),

  listAdminUsers: (token: string, page: number, pageSize: number) =>
    request<AdminUserRow[]>(`/admin/users?page=${page}&page_size=${pageSize}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  listAdminAppointments: (token: string, page: number, pageSize: number) =>
    request<AppointmentRow[]>(`/admin/appointments?page=${page}&page_size=${pageSize}`, {
      method: "GET",
      headers: withAuth(token),
    }),

  reports: (token: string) =>
    request<Record<string, string | number>>("/admin/reports", {
      method: "GET",
      headers: withAuth(token),
    }),

  adminCreateUser: (
    token: string,
    payload: {
      role: "DOCTOR" | "PATIENT" | "ADMIN";
      full_name?: string;
      email: string;
      phone?: string;
      password: string;
      specialty?: string;
      license_number?: string;
      insurance_provider?: string;
      insurance_policy_number?: string;
      date_of_birth?: string;
      gender?: string;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    },
  ) =>
    request<{ id: string }>("/admin/users", {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    }),

  listDoctors: (token?: string) =>
    request<Array<{ id: string; name: string; specialty: string | null }>>("/doctors", {
      method: "GET",
      ...(token && { headers: withAuth(token) }),
    }),

  registerDoctor: (payload: { fullName: string; email: string; password: string; specialty?: string; licenseNumber?: string; phone?: string }) =>
    request<{ message: string }>("/doctors/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
        specialty: payload.specialty,
        license_number: payload.licenseNumber,
        phone: payload.phone,
      }),
    }),

  registerAdmin: (payload: { fullName: string; email: string; password: string }) =>
    request<{ message: string }>("/admin/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        password: payload.password,
      }),
    }),

  listDoctorAvailabilityNext30Days: (doctorId: string, token?: string) =>
    request<Array<{ slot_time: string }>>(`/doctor/availability/${doctorId}/ndays`, {
      method: "GET",
      ...(token && { headers: withAuth(token) }),
    }),

  listAllDoctorAvailability: (doctorId: string, token?: string) =>
    request<Array<{ slot_time: string; status: "AVAILABLE" | "BOOKED" | "BLOCKED" }>>(`/doctor/availability/${doctorId}/all?days=${30}`, {
      method: "GET",
      ...(token && { headers: withAuth(token) }),
    }),

  confirmAppointment: (appointmentId: string, token?: string) =>
    request<{ message: string }>(`/appointments/${appointmentId}/confirm`, {
      method: "POST",
      ...(token && { headers: withAuth(token) }),
    }),

  getTodayAppointments: (token?: string) =>
    request<Array<{ id: string; time: string; patient_name: string; reason: string; status: string }>>('/doctor/appointments/today', {
      method: "GET",
      ...(token && { headers: withAuth(token) }),
    }),

  getAppointmentDetails: (appointmentId: string, token?: string) =>
    request<{ id: string; time: string; patient_id: string; patient_name: string; status: string; notes?: string }>(`/doctor/appointments/${appointmentId}`, {
      method: "GET",
      ...(token && { headers: withAuth(token) }),
    }),

  createMedicalRecord: (record: {
    patient_id: string;
    diagnosis: string;
    notes: string;
  }, token?: string) =>
    request<{ id: string; message: string }>('/medical-records', {
      method: "POST",
      headers: withAuth(token || ''),
      body: JSON.stringify(record),
    }),

  getMedicalRecordByAppointment: (appointmentId: string, token?: string) =>
    request<Array<{ id: string; diagnosis: string; notes: string }>>(`/medical-records/${appointmentId}`, {
      method: "GET",
      headers: withAuth(token || ''),
    }),

  createPrescription: (prescription: {
    medical_record_id: string;
    medication_details: string;
    pharmacy_id?: string;
  }, token?: string) =>
    request<{ message: string }>('/prescriptions', {
      method: "POST",
      headers: withAuth(token || ''),
      body: JSON.stringify(prescription),
    }),

  completeAppointment: (appointmentId: string, token?: string) =>
    request<{ message: string }>(`/appointments/${appointmentId}/status`, {
      method: "PATCH",
      headers: {
        ...(token && { ...withAuth(token) }),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "COMPLETED" }),
    }),

  upsertDoctorAvailability: (doctorId: string, slotTime: string, isAvailable: boolean, token: string, blockReason?: string) => {
    const payload = {
      slot: slotTime,
      is_available: isAvailable,
      block_reason: blockReason,
    };
    return request<{ message: string }>(`/doctor/availability`, {
      method: "POST",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    });
  },

  deleteDoctorAvailability: (doctorId: string, slotTime: string, token: string) =>
    request<{ message: string }>(`/doctor/availability/${doctorId}`, {
      method: "DELETE",
      headers: withAuth(token),
      body: JSON.stringify({
        slot_time: slotTime,
      }),
    }),

  getDoctorProfile: (token: string) =>
    request<any>(`/doctor/profile`, {
      method: "GET",
      headers: withAuth(token),
    }),

  updateDoctorProfile: (token: string, payload: any) =>
    request<{ message: string }>(`/doctor/profile`, {
      method: "PUT",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    }),

  getPatientProfile: (token: string) =>
    request<any>(`/patient/patient/profile`, {
      method: "GET",
      headers: withAuth(token),
    }),

  updatePatientProfile: (token: string, payload: any) =>
    request<{ message: string }>(`/patient/patient/profile`, {
      method: "PUT",
      headers: withAuth(token),
      body: JSON.stringify(payload),
    }),
};
