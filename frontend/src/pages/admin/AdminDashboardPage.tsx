import type { FormEvent } from "react";

import type { AdminUserRow, AppointmentRow } from "../../types";

interface AdminDashboardPageProps {
  page: number;
  pageSize: number;
  users: AdminUserRow[];
  appointments: AppointmentRow[];
  reports: Record<string, string | number>;
  createRole: "DOCTOR" | "PATIENT" | "ADMIN";
  createName: string;
  createEmail: string;
  createPhone: string;
  createPassword: string;
  createSpecialty: string;
  createLicense: string;
  createInsuranceProvider: string;
  createInsurancePolicy: string;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
  onLoadOverview: () => void;
  onLoadReports: () => void;
  onCreateRoleChange: (value: "DOCTOR" | "PATIENT" | "ADMIN") => void;
  onCreateNameChange: (value: string) => void;
  onCreateEmailChange: (value: string) => void;
  onCreatePhoneChange: (value: string) => void;
  onCreatePasswordChange: (value: string) => void;
  onCreateSpecialtyChange: (value: string) => void;
  onCreateLicenseChange: (value: string) => void;
  onCreateInsuranceProviderChange: (value: string) => void;
  onCreateInsurancePolicyChange: (value: string) => void;
  onCreateUser: (event: FormEvent) => void;
}

export function AdminDashboardPage(props: AdminDashboardPageProps) {
  return (
    <section>
      <h2>Admin Dashboard</h2>
      <div className="inline-form">
        <input
          type="number"
          value={props.page}
          onChange={(event) => props.onPageChange(Number(event.target.value))}
          placeholder="Page"
        />
        <input
          type="number"
          value={props.pageSize}
          onChange={(event) => props.onPageSizeChange(Number(event.target.value))}
          placeholder="Page Size"
        />
        <button onClick={props.onLoadOverview}>Load Admin Data</button>
        <button onClick={props.onLoadReports}>Load Reports</button>
      </div>

      <h3>Users</h3>
      <pre>{JSON.stringify(props.users, null, 2)}</pre>
      <h3>Appointments</h3>
      <pre>{JSON.stringify(props.appointments, null, 2)}</pre>
      <h3>Reports</h3>
      <pre>{JSON.stringify(props.reports, null, 2)}</pre>

      <h3>Register User (Admin)</h3>
      <form onSubmit={props.onCreateUser} className="grid-form">
        <select value={props.createRole} onChange={(event) => props.onCreateRoleChange(event.target.value as "DOCTOR" | "PATIENT" | "ADMIN")}>
          <option value="DOCTOR">DOCTOR</option>
          <option value="PATIENT">PATIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <input placeholder="Full Name" value={props.createName} onChange={(event) => props.onCreateNameChange(event.target.value)} />
        <input placeholder="Email" value={props.createEmail} onChange={(event) => props.onCreateEmailChange(event.target.value)} />
        <input placeholder="Phone" value={props.createPhone} onChange={(event) => props.onCreatePhoneChange(event.target.value)} />
        <input type="password" placeholder="Password" value={props.createPassword} onChange={(event) => props.onCreatePasswordChange(event.target.value)} />
        <input placeholder="Specialty" value={props.createSpecialty} onChange={(event) => props.onCreateSpecialtyChange(event.target.value)} />
        <input placeholder="License Number" value={props.createLicense} onChange={(event) => props.onCreateLicenseChange(event.target.value)} />
        <input
          placeholder="Insurance Provider"
          value={props.createInsuranceProvider}
          onChange={(event) => props.onCreateInsuranceProviderChange(event.target.value)}
        />
        <input
          placeholder="Insurance Policy"
          value={props.createInsurancePolicy}
          onChange={(event) => props.onCreateInsurancePolicyChange(event.target.value)}
        />
        <button type="submit">Register User</button>
      </form>
    </section>
  );
}
