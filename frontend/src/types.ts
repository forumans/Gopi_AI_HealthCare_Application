export type Role = "GUEST" | "PATIENT" | "DOCTOR" | "ADMIN";

export interface SessionState {
  accessToken: string;
  role: Role;
  tenantId: string;
  userName?: string;
  insuranceProvider?: string;
  insurancePolicyId?: string;
}

export interface LoginResponse {
  access_token: string;
  role: Role;
  tenant_id: string;
  user_name?: string;
  insurance_provider?: string;
  insurance_policy_id?: string;
}

export interface AppointmentRow {
  id: string;
  doctor_id: string;
  patient_id: string;
  slot_id?: string;
  appointment_time: string;
  status: string;
  doctor_name?: string;
  notes?: string;
}

export interface DoctorAppointmentRow {
  id: string;
  time: string;
  patient_name: string;
  symptoms?: string;
  status?: string;
}

export interface PatientSearchRow {
  id: string;
  name: string;
  phone: string;
  dob: string;
  gender?: string;
  address?: string;
  symptoms: string;
  diagnosis: string;
  lab_results: string;
  medication: string;
  prescription_date: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  is_deleted: boolean;
}
