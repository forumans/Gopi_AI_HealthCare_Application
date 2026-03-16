interface MenuSelectorsProps {
  patientMenu: string;
  doctorMenu: string;
  adminMenu: string;
  moreMenu: string;
  onPatientChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onAdminChange: (value: string) => void;
  onMoreChange: (value: string) => void;
}

export function MenuSelectors(props: MenuSelectorsProps) {
  const {
    patientMenu,
    doctorMenu,
    adminMenu,
    moreMenu,
    onPatientChange,
    onDoctorChange,
    onAdminChange,
    onMoreChange,
  } = props;

  return (
    <div className="menus">
      <label>
        Patients
        <select value={patientMenu} onChange={(event) => onPatientChange(event.target.value)}>
          <option>Login</option>
          <option>Register</option>
          <option>Schedule / Cancel Appointment</option>
          <option>Prescriptions</option>
          <option>Bill Pay</option>
        </select>
      </label>

      <label>
        Doctors
        <select value={doctorMenu} onChange={(event) => onDoctorChange(event.target.value)}>
          <option>Login</option>
          <option>Register</option>
          <option>Appointments</option>
          <option>Search Patients</option>
          <option>Update Available Slots</option>
        </select>
      </label>

      <label>
        Admin
        <select value={adminMenu} onChange={(event) => onAdminChange(event.target.value)}>
          <option>Register Doctor</option>
          <option>Register Patient</option>
          <option>Register Admin</option>
        </select>
      </label>

      <label>
        More
        <select value={moreMenu} onChange={(event) => onMoreChange(event.target.value)}>
          <option>Home</option>
          <option>Password</option>
        </select>
      </label>
    </div>
  );
}
