import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { Bell, Eye, EyeOff, Search, UserCircle2 } from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";

import { api } from "./api";
import { requireRole } from "./app/access";
import { getRouteBreadcrumb } from "./app/routeBreadcrumbs";
import infoIcon from "./assets/info-icon.svg";
import { useMedicalNewsAgent } from "./hooks/useMedicalNewsAgent";
import type { AdminUserRow, AppointmentRow, DoctorAppointmentRow, PatientSearchRow, Role, SessionState } from "./types";

const initialSession: SessionState = { accessToken: "", role: "GUEST", tenantId: "" };
type FieldErrors = Record<string, string>;
type MainMenu = "Home" | "Doctors" | "Patients" | "Admin";

// List of countries for dropdown
const COUNTRIES = [
  "United States",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  specialty?: string; // Optional for doctor registration
  licenseNumber?: string; // Optional for doctor registration
  insuranceProvider?: string; // Optional for patient registration
  insurancePolicyNumber?: string; // Optional for patient registration
  dateOfBirth?: string; // Optional for patient registration
  gender?: string; // Optional for patient registration
  addressLine1?: string; // Optional for patient registration
  addressLine2?: string; // Optional for patient registration
  city?: string; // Optional for patient registration
  state?: string; // Optional for patient registration
  postalCode?: string; // Optional for patient registration
  country?: string; // Optional for patient registration
}

const submenuMap: Record<MainMenu, Array<{ to: string; label: string; requiresAuth?: boolean; role?: Role; hideWhenAuth?: boolean }>> = {
  Home: [
    { to: "/patients/login", label: "Patient Login" },
    { to: "/doctors/login", label: "Doctor Login" },
  ],
  Doctors: [
    { to: "/doctors/login", label: "Login", hideWhenAuth: true },
    { to: "/doctors/register", label: "Register", hideWhenAuth: true },
    { to: "/doctors/appointments", label: "Weekly Appointments", requiresAuth: true, role: "DOCTOR" },
    { to: "/doctors/today-appointments", label: "Today's Appointments", requiresAuth: true, role: "DOCTOR" },
    { to: "/doctors/search-patients", label: "Search Patients", requiresAuth: true, role: "DOCTOR" },
    { to: "/doctors/manage-availability", label: "Manage Availability", requiresAuth: true, role: "DOCTOR" },
    { to: "/doctors/profile", label: "Update Profile", requiresAuth: true, role: "DOCTOR" },
  ],
  Patients: [
    { to: "/patients/login", label: "Login", hideWhenAuth: true },
    { to: "/patients/register", label: "Register", hideWhenAuth: true },
    { to: "/patients/appointments", label: "Schedule Appointment", requiresAuth: true, role: "PATIENT" },
    { to: "/patients/prescriptions", label: "Prescriptions", requiresAuth: true, role: "PATIENT" },
    { to: "/patients/billing", label: "Billing", requiresAuth: true, role: "PATIENT" },
    { to: "/patients/profile", label: "Update Profile", requiresAuth: true, role: "PATIENT" },
  ],
  Admin: [
    { to: "/admin/login", label: "Login Admin", hideWhenAuth: true },
    { to: "/admin/register-doctor", label: "Register Doctor", requiresAuth: true, role: "ADMIN" },
    { to: "/admin/register-patient", label: "Register Patient", requiresAuth: true, role: "ADMIN" },
    { to: "/admin/register-admin", label: "Register Admin", requiresAuth: true, role: "ADMIN" },
    { to: "/admin/system-dashboard", label: "System Dashboard", requiresAuth: true, role: "ADMIN" },
  ],
};

function getMainMenuFromPath(pathname: string): MainMenu {
  if (pathname.startsWith("/doctors")) {
    return "Doctors";
  }
  if (pathname.startsWith("/patients")) {
    return "Patients";
  }
  if (pathname.startsWith("/admin")) {
    return "Admin";
  }
  return "Home";
}

function ProtectedRoute(props: { allowed: Role[]; role: Role; children: JSX.Element }) {
  if (!props.allowed.includes(props.role)) {
    return <Navigate to="/" replace />;
  }
  return props.children;
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function LabeledField(props: {
  id: string;
  label: string;
  helpText: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string; // New prop to control autocomplete
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === "password";
  
  return (
    <div className="form-field">
      <div className="label-row">
        <label htmlFor={props.id}>{props.label}</label>
        <button className="info-icon" type="button" tabIndex={-1} aria-label={`${props.label} input rules`} data-tip={props.helpText}>
          <img src={infoIcon} alt="info" className="info-icon-img" />
        </button>
      </div>
      {props.error && <p className="field-error">{props.error}</p>}
      <div className="input-wrapper">
        <input
          id={props.id}
          type={isPassword && !showPassword ? "password" : isPassword && showPassword ? "text" : props.type ?? "text"}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(event) => props.onChange(event.target.value)}
          autoComplete={props.autoComplete || "off"}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function App() {
  const [session, setSession] = useState<SessionState>(initialSession);
  const [status, setStatus] = useState("Ready.");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [patientName, setPatientName] = useState("");
  
  // Auto-clear status message after 5 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  // Clear initial "Ready." message after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  const [patientPhone, setPatientPhone] = useState("");
  const [patientInsurance, setPatientInsurance] = useState("");
  const [patientPolicy, setPatientPolicy] = useState("");
  const [patientDateOfBirth, setPatientDateOfBirth] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientAddressLine1, setPatientAddressLine1] = useState("");
  const [patientAddressLine2, setPatientAddressLine2] = useState("");
  const [patientCity, setPatientCity] = useState("");
  const [patientState, setPatientState] = useState("");
  const [patientPostalCode, setPatientPostalCode] = useState("");
  const [patientCountry, setPatientCountry] = useState("USA");
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${month}/${day}/${year}`;
  });
  const [doctorId, setDoctorId] = useState("");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  const [adminDetails, setAdminDetails] = useState<any>(null);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointmentRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<Array<{ date: string; medication: string; dosage: string; status: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRows, setSearchRows] = useState<PatientSearchRow[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [adminReports, setAdminReports] = useState<Record<string, string | number>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const breadcrumb = getRouteBreadcrumb(location.pathname);
  const [activeMainMenu, setActiveMainMenu] = useState<MainMenu>(getMainMenuFromPath(location.pathname));
  const [openMainMenu, setOpenMainMenu] = useState<MainMenu | null>(null);

  // Clear search results when navigating away from search page
  useEffect(() => {
    if (!location.pathname.includes("/doctors/search-patients")) {
      setSearchRows([]);
      setSearchQuery("");
    }
  }, [location.pathname]);

  const submenuItems = useMemo(() => {
    const items = submenuMap[openMainMenu ?? activeMainMenu];
    return items.filter(item => {
      if (item.requiresAuth && !session.accessToken) return false;
      if (item.role && session.role !== item.role) return false;
      if (item.hideWhenAuth && session.accessToken) return false;
      return true;
    });
  }, [openMainMenu, activeMainMenu, session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMainMenu && !(event.target as Element).closest('.menu-item-container')) {
        setOpenMainMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMainMenu]);

// Load patient details when patient logs in
  useEffect(() => {
    if (session.role === "PATIENT" && session.accessToken) {
      api.getCurrentPatient(session.accessToken)
        .then((data) => {
          setPatientDetails(data);
        })
        .catch((err) => {
          console.error("Failed to load patient details:", err);
        });
    }
  }, [session.role, session.accessToken]);

  // Load doctor details when doctor logs in
  useEffect(() => {
    if (session.role === "DOCTOR" && session.accessToken) {
      fetch('http://127.0.0.1:8000/doctors/me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          setDoctorDetails(data);
        })
        .catch((err) => {
          console.error("Failed to load doctor details:", err);
        });
    }
  }, [session.role, session.accessToken]);

  // Load admin details when admin logs in
  useEffect(() => {
    if (session.role === "ADMIN" && session.accessToken) {
      // For now, use session data for admin. Can be enhanced with admin/me endpoint if available
      setAdminDetails({
        name: session.userName || 'Admin',
        email: 'admin@healthsphere.com', // Default email since not available in session
        role: session.role
      });
    }
  }, [session.role, session.accessToken, session.userName]);

  // Listen for patient details refresh events
  useEffect(() => {
    const handlePatientDetailsRefresh = (event: any) => {
      if (event.detail) {
        setPatientDetails(event.detail);
      }
    };

    window.addEventListener('patientDetailsRefresh', handlePatientDetailsRefresh);
    return () => {
      window.removeEventListener('patientDetailsRefresh', handlePatientDetailsRefresh);
    };
  }, []);

  // Clear login form fields and logout when navigating to any login screen
  useEffect(() => {
    if (location.pathname.includes("/login")) {
      // Logout any existing user first
      if (session.role !== "GUEST") {
        setSession(initialSession);
        setStatus("Logged out successfully.");
        // Clear all user-specific data
        setPatientDetails(null);
        setDoctorDetails(null);
        setAdminDetails(null);
        setDoctorAppointments([]);
        setAppointments([]);
        setSearchRows([]);
        setSearchQuery("");
        setAdminUsers([]);
        setAdminReports({});
        // Clear all form fields
        setEmail("");
        setPassword("");
        setPatientName("");
        setPatientPhone("");
        setPatientInsurance("");
        setPatientPolicy("");
        setPatientDateOfBirth("");
        setPatientGender("");
        setPatientAddressLine1("");
        setPatientAddressLine2("");
        setPatientCity("");
        setPatientState("");
        setPatientPostalCode("");
        setPatientCountry("USA");
      }
      // Clear login form fields
      setEmail("");
      setPassword("");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes("/register")) {
      setEmail("");
      setPassword("");
      setPatientName("");
      setPatientPhone("");
      setPatientInsurance("");
      setPatientPolicy("");
      setPatientDateOfBirth("");
      setPatientGender("");
      setPatientAddressLine1("");
      setPatientAddressLine2("");
      setPatientCity("");
      setPatientState("");
      setPatientPostalCode("");
      setPatientCountry("USA");
    }
  }, [location.pathname]);

  useEffect(() => {
    setActiveMainMenu(getMainMenuFromPath(location.pathname));
  }, [location.pathname]);

  async function handleLogin(target: "PATIENT" | "DOCTOR" | "ADMIN") {
    try {
      const result = await api.login({ email, password, remember_me: false });
      setSession({
        accessToken: result.access_token,
        role: result.role,
        tenantId: result.tenant_id,
        userName: result.user_name,
        insuranceProvider: result.insurance_provider,
        insurancePolicyId: result.insurance_policy_id,
      });
      
      if (target === "PATIENT") {
        navigate("/patients/appointments");
      } else if (target === "DOCTOR") {
        navigate("/doctors/appointments");
      } else {
        setActiveMainMenu("Admin");
        setOpenMainMenu("Admin");
        navigate("/admin/system-dashboard");
      }
    } catch (error) {
      // Ensure we display a clean error message
      let errorMessage = "Authentication failed";
      if (error instanceof Error) {
        errorMessage = error.message;
        // If it's still in JSON format, extract the detail
        if (errorMessage.startsWith("{")) {
          try {
            const errorData = JSON.parse(errorMessage);
            errorMessage = errorData.detail || errorMessage;
          } catch {
            // Keep original message if parsing fails
          }
        }
      }
      setStatus(errorMessage);
    }
  }

  async function registerPatient() {
    try {
      const result = await api.registerPatient({
        full_name: patientName,
        email,
        phone: patientPhone,
        password,
        insurance_provider: patientInsurance,
        insurance_policy_number: patientPolicy,
        date_of_birth: patientDateOfBirth || null,
        gender: patientGender || null,
        address_line1: patientAddressLine1 || null,
        address_line2: patientAddressLine2 || null,
        city: patientCity || null,
        state: patientState || null,
        postal_code: patientPostalCode || null,
        country: patientCountry || null,
      });
      setStatus(result.message);
      navigate("/patients/login");
      setEmail("");  // Clear email after registration
      setPassword(""); // Clear password after registration
      setPatientName(""); // Clear patient name
      setPatientPhone(""); // Clear patient phone
      setPatientInsurance(""); // Clear patient insurance
      setPatientPolicy(""); // Clear patient policy
      setPatientDateOfBirth(""); // Clear date of birth
      setPatientGender(""); // Clear gender
      setPatientAddressLine1(""); // Clear address line 1
      setPatientAddressLine2(""); // Clear address line 2
      setPatientCity(""); // Clear city
      setPatientState(""); // Clear state
      setPatientPostalCode(""); // Clear postal code
      setPatientCountry("USA"); // Reset country to default
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function loadPatientDetails() {
    const denied = requireRole(session.role, ["PATIENT"]);
    if (denied) {
      return;
    }
    try {
      const details = await api.getCurrentPatient(session.accessToken);
      setPatientDetails(details);
    } catch (error) {
      console.error("Failed to load patient details:", error);
    }
  }

  async function loadPatientAppointments() {
    const denied = requireRole(session.role, ["PATIENT"]);
    if (denied) {
      setStatus(denied);
      return;
    }
    try {
      const rows = await api.listAllAppointments(session.accessToken);
      setAppointments(rows);
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function bookAppointment() {
    try {
      await api.bookAppointment(session.accessToken, { doctor_id: doctorId, slot, reason });
      await loadPatientAppointments();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function cancelAppointment() {
    try {
      const result = await api.cancelAppointment(session.accessToken, appointmentId);
      await loadPatientAppointments();
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function loadDoctorDataWithDate(dateString: string) {
    try {
      // Convert date format from MM/DD/YYYY to YYYY-MM-DD
      let formattedDate = undefined;
      if (dateString) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          // MM/DD/YYYY -> YYYY-MM-DD
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          formattedDate = `${year}-${month}-${day}`;
        }
      }
      // Use the new endpoint that doesn't have date restrictions
      const rows = await api.doctorAllAppointments(session.accessToken, formattedDate);
      setDoctorAppointments(rows);
    } catch (error) {
      setStatus((error as Error).message);
    }
  }

  async function loadDoctorData(dateString?: string) {
    // If no date provided, use the fromDate state
    const dateToUse = dateString || fromDate;
    return loadDoctorDataWithDate(dateToUse);
  }

  async function searchPatients() {
    if (searchQuery.trim().length < 2) {
      setSearchRows([]);
      return;
    }
    try {
      const rows = await api.searchPatients(session.accessToken, searchQuery);
      setSearchRows(rows);
    } catch (error) {
      setStatus((error as Error).message);
      setSearchRows([]);
    }
  }

  async function loadAdminDashboard() {
    try {
      console.log("Loading admin dashboard with token:", session.accessToken ? "Present" : "Missing");
      const [users, reports] = await Promise.all([
        api.listAdminUsers(session.accessToken, 1, 25),
        api.reports(session.accessToken),
      ]);
      setAdminUsers(users);
      setAdminReports(reports);
      const patientCount = typeof reports.monthly_patient_count === 'string' ? parseInt(reports.monthly_patient_count, 10) : reports.monthly_patient_count || 0;
      const diagnosisCount = typeof reports.diagnosis_frequency === 'string' ? parseInt(reports.diagnosis_frequency, 10) : reports.diagnosis_frequency || 0;
      const utilization = typeof reports.doctor_utilization_rate === 'string' ? parseFloat(reports.doctor_utilization_rate) : reports.doctor_utilization_rate || 0;
      
      if (users.length > 0 || patientCount > 0) {
        setStatus(`System dashboard loaded: ${users.length} users, ${patientCount} patients, ${diagnosisCount} diagnoses, ${utilization} utilization`);
      } else {
        setStatus("System dashboard loaded.");
      }
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      setStatus(`Failed to load dashboard: ${(error as Error).message}`);
    }
  }

  async function registerByAdmin(role: "DOCTOR" | "PATIENT" | "ADMIN", payload: RegisterPayload) {
    try {
      // Special case: Allow first admin registration without authentication
      if (role === "ADMIN" && session.role === "GUEST") {
        await api.registerAdmin({
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
        });
        setStatus("Admin registration successful! Please login.");
        return;
      }
      
      const denied = requireRole(session.role, ["ADMIN"]);
      if (denied) {
        setStatus(denied);
        return;
      }
      
      // Debug: Check if we have a token
      console.log("Session token:", session.accessToken);
      console.log("Session role:", session.role);
      
      await api.adminCreateUser(session.accessToken, {
        role,
        full_name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        specialty: payload.specialty,
        license_number: payload.licenseNumber,
        insurance_provider: payload.insuranceProvider,
        insurance_policy_number: payload.insurancePolicyNumber,
        date_of_birth: payload.dateOfBirth,
        gender: payload.gender,
        address_line1: payload.addressLine1,
        address_line2: payload.addressLine2,
        city: payload.city,
        state: payload.state,
        postal_code: payload.postalCode,
        country: payload.country,
      });
      setStatus("Registration successful");
      // Load dashboard data and navigate
      await loadAdminDashboard();
      navigate("/admin/system-dashboard");
    } catch (error) {
      // Parse error to show user-friendly message
      let errorMessage = "Registration failed";
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.detail || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      setStatus(errorMessage);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">HealthSphere</div>
        <nav className="top-nav-links">
          {(["Home", "Doctors", "Patients", "Admin"] as MainMenu[]).map((menuName) => (
            <div key={menuName} className="menu-item-container">
              <button
                type="button"
                className={menuName === activeMainMenu ? "top-menu-button active-main" : "top-menu-button"}
                onClick={() => {
                  if (menuName === "Home") {
                    navigate("/");
                    setStatus("");
                  }
                  setActiveMainMenu(menuName);
                  setOpenMainMenu((current) => (current === menuName ? null : menuName));
                }}
              >
                {menuName}
              </button>
              {openMainMenu === menuName && (
                <div className="floating-dropdown">
                  {submenuItems
                    .filter(item => submenuMap[menuName].some(mi => mi.to === item.to))
                    .map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={location.pathname === item.to ? "submenu-link active-submenu" : "submenu-link"}
                        onClick={() => setOpenMainMenu(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="top-actions">
          <div className="search-pill">
            <Search size={14} /> Search
          </div>
          <Bell size={16} />
          <UserCircle2 size={18} />
          {session.role !== "GUEST" && (
            <button type="button" onClick={() => {
              setSession(initialSession);
              navigate("/");
            }}>Sign Out</button>
          )}
        </div>
      </header>

      <main className="content content-full">
        {location.pathname !== "/" && <div className="breadcrumbs">{breadcrumb}</div>}
        {location.pathname !== "/" && status && (
          <div className={`status fade-out`}>
            {status}
            {session.role === "PATIENT" && session.userName && (
              <div className="session-details">
                {session.insuranceProvider && (
                  <div className="session-line">Insurance: {session.insuranceProvider}</div>
                )}
                {session.insurancePolicyId && (
                  <div className="session-line">Ins Id: {session.insurancePolicyId}</div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Patient Details Frame - displayed for logged-in patients except on Update Profile screen */}
        {session.role === "PATIENT" && patientDetails && location.pathname !== "/" && location.pathname !== "/patients/profile" && (
          <div className="card" style={{ marginBottom: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#eaf5ff' }}>Patient Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Name</label>
                <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.name}</p>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Email</label>
                <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.email}</p>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Phone</label>
                <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.phone}</p>
              </div>
              {patientDetails.date_of_birth && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{new Date(patientDetails.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
              {patientDetails.insurance_provider && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Insurance Provider</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.insurance_provider}</p>
                </div>
              )}
              {patientDetails.insurance_policy_number && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Policy Number</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.insurance_policy_number}</p>
                </div>
              )}
              {patientDetails.address && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Address</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.address}</p>
                </div>
              )}
              {patientDetails.emergency_contact && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Emergency Contact</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.emergency_contact}</p>
                </div>
              )}
              {patientDetails.emergency_phone && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Emergency Phone</label>
                  <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.emergency_phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* User Details Frame - displayed for logged-in users on Home page */}
        {session.role !== "GUEST" && location.pathname === "/" && (
          <div className="card" style={{ marginBottom: '16px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#eaf5ff' }}>
              {session.role === "PATIENT" && "Patient Details"}
              {session.role === "DOCTOR" && "Doctor Details"}
              {session.role === "ADMIN" && "Admin Details"}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {/* Patient Details */}
              {session.role === "PATIENT" && patientDetails && (
                <>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Name</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.name}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.email}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Phone</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.phone}</p>
                  </div>
                  {patientDetails.date_of_birth && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{new Date(patientDetails.date_of_birth).toLocaleDateString()}</p>
                    </div>
                  )}
                  {patientDetails.insurance_provider && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Insurance Provider</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.insurance_provider}</p>
                    </div>
                  )}
                  {patientDetails.insurance_policy_number && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Policy Number</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.insurance_policy_number}</p>
                    </div>
                  )}
                  {patientDetails.address && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Address</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{patientDetails.address}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Doctor Details */}
              {session.role === "DOCTOR" && doctorDetails && (
                <>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Name</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{doctorDetails.full_name}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{doctorDetails.email}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Phone</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{doctorDetails.phone}</p>
                  </div>
                  {doctorDetails.specialty && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Specialty</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{doctorDetails.specialty}</p>
                    </div>
                  )}
                  {doctorDetails.license_number && (
                    <div>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>License Number</label>
                      <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{doctorDetails.license_number}</p>
                    </div>
                  )}
                </>
              )}
              
              {/* Admin Details */}
              {session.role === "ADMIN" && adminDetails && (
                <>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Name</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{adminDetails.name}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Email</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{adminDetails.email}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Role</label>
                    <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{adminDetails.role}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={<HomePanel session={session} onPatientLogin={() => navigate("/patients/login")} onDoctorLogin={() => navigate("/doctors/login")} />} />
          <Route path="/patients/login" element={<AuthPanel title="Patient Login" email={email} password={password} onEmail={setEmail} onPassword={setPassword} onSubmit={() => handleLogin("PATIENT")} />} />
          <Route path="/doctors/login" element={<AuthPanel title="Doctor Login" email={email} password={password} onEmail={setEmail} onPassword={setPassword} onSubmit={() => handleLogin("DOCTOR")} />} />
          <Route path="/admin/login" element={<AuthPanel title="Admin Login" email={email} password={password} onEmail={setEmail} onPassword={setPassword} onSubmit={() => handleLogin("ADMIN")} />} />
          // ... (rest of the code remains the same)
          <Route path="/doctors/register" element={<SimpleRegisterPanel title="Doctor Registration" onSubmit={async (payload) => {
            try {
              const result = await api.registerDoctor({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                specialty: payload.specialty || undefined,
                licenseNumber: payload.licenseNumber || undefined,
                phone: payload.phone || undefined,
              });
              setStatus(result.message);
              navigate("/doctors/login");
              setEmail("");  // Clear email after registration
              setPassword(""); // Clear password after registration
            } catch (error) {
              setStatus((error as Error).message);
            }
          }} />} />
          <Route path="/patients/register" element={<PatientRegisterPanel 
            name={patientName} 
            phone={patientPhone} 
            insurance={patientInsurance} 
            policy={patientPolicy} 
            email={email} 
            password={password}
            dateOfBirth={patientDateOfBirth}
            gender={patientGender}
            addressLine1={patientAddressLine1}
            addressLine2={patientAddressLine2}
            city={patientCity}
            state={patientState}
            postalCode={patientPostalCode}
            country={patientCountry}
            onName={setPatientName} 
            onPhone={setPatientPhone} 
            onInsurance={setPatientInsurance} 
            onPolicy={setPatientPolicy} 
            onEmail={setEmail} 
            onPassword={setPassword}
            onDateOfBirth={setPatientDateOfBirth}
            onGender={setPatientGender}
            onAddressLine1={setPatientAddressLine1}
            onAddressLine2={setPatientAddressLine2}
            onCity={setPatientCity}
            onState={setPatientState}
            onPostalCode={setPatientPostalCode}
            onCountry={setPatientCountry}
            onSubmit={registerPatient} />} />

          <Route path="/patients/appointments" element={<ProtectedRoute allowed={["PATIENT"]} role={session.role}><PatientAppointmentsPanel fromDate={fromDate} onDate={setFromDate} doctorId={doctorId} slot={slot} reason={reason} appointmentId={appointmentId} rows={appointments} onDoctorId={setDoctorId} onSlot={setSlot} onReason={setReason} onAppointmentId={setAppointmentId} onLoad={loadPatientAppointments} onBook={bookAppointment} onCancel={cancelAppointment} session={session} patientDetails={patientDetails} /></ProtectedRoute>} />
          <Route path="/patients/prescriptions" element={<ProtectedRoute allowed={["PATIENT"]} role={session.role}><PatientPrescriptionsPanel session={session} /></ProtectedRoute>} />
          <Route path="/patients/billing" element={<ProtectedRoute allowed={["PATIENT"]} role={session.role}><BillingPanel /></ProtectedRoute>} />
          <Route path="/patients/profile" element={<ProtectedRoute allowed={["PATIENT"]} role={session.role}><PatientProfilePanel session={session} /></ProtectedRoute>} />

          <Route path="/doctors/appointments" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><DoctorAppointmentsPanel fromDate={fromDate} onDate={setFromDate} rows={doctorAppointments} onLoad={loadDoctorData} session={session} /></ProtectedRoute>} />
          <Route path="/doctors/today-appointments" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><TodayAppointmentsPanel session={session} /></ProtectedRoute>} />
          <Route path="/doctors/consultation/:appointmentId" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><ConsultationPanelWrapper session={session} /></ProtectedRoute>} />
          <Route path="/doctors/search-patients" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><DoctorSearchPanel query={searchQuery} rows={searchRows} onQuery={setSearchQuery} onSearch={searchPatients} session={session} /></ProtectedRoute>} />
          <Route path="/doctors/availability" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><AvailabilityPanel /></ProtectedRoute>} />
          <Route path="/doctors/manage-availability" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><DoctorManageAvailabilityPanel session={session} /></ProtectedRoute>} />
          <Route path="/doctors/profile" element={<ProtectedRoute allowed={["DOCTOR"]} role={session.role}><DoctorProfilePanel session={session} /></ProtectedRoute>} />

          <Route path="/admin/register-doctor" element={<ProtectedRoute allowed={["ADMIN"]} role={session.role}><AdminDoctorRegisterPanel session={session} /></ProtectedRoute>} />
          <Route path="/admin/register-patient" element={<ProtectedRoute allowed={["ADMIN"]} role={session.role}><AdminPatientRegisterPanel session={session} /></ProtectedRoute>} />
          <Route path="/admin/register-admin" element={<ProtectedRoute allowed={["ADMIN"]} role={session.role}><SimpleRegisterPanel title="Register Admin" onSubmit={(payload) => registerByAdmin("ADMIN", payload)} /></ProtectedRoute>} />
          <Route path="/admin/system-dashboard" element={<ProtectedRoute allowed={["ADMIN"]} role={session.role}><AdminDashboardPanel users={adminUsers} reports={adminReports} onLoad={loadAdminDashboard} setStatus={setStatus} session={session} /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

// Reusable Doctor Details Component
function DoctorDetails({ session, style }: { session: SessionState; style?: React.CSSProperties }) {
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  
  React.useEffect(() => {
    if (session.accessToken) {
      fetch('http://127.0.0.1:8000/doctors/me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      })
      .then(response => response.json())
      .then(doctor => {
        setCurrentDoctor(doctor);
      })
      .catch(error => {
        console.error("Failed to fetch current doctor:", error);
      });
    }
  }, [session.accessToken]);

  if (!currentDoctor) {
    return null;
  }

  return (
    <div className="card" style={{ 
      marginBottom: '20px', 
      padding: '16px', 
      backgroundColor: 'rgba(9, 35, 55, 0.82)',
      ...style 
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#dff2ff' }}>Doctor Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Name</label>
          <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{currentDoctor.name}</p>
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>Specialty</label>
          <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{currentDoctor.specialty || 'Not specified'}</p>
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>License Number</label>
          <p style={{ margin: '0', fontSize: '14px', color: '#e8f6ff' }}>{currentDoctor.license_number || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable Doctor Selection Component (for patient-facing screens)
function DoctorSelection({ doctors, selectedDoctorId, onDoctorSelect }: { 
  doctors: Array<{ id: string; name: string; specialty?: string; license_number?: string }>; 
  selectedDoctorId: string | null; 
  onDoctorSelect: (doctor: { id: string; name: string; specialty?: string; license_number?: string } | null) => void;
}) {
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  // Show loading or no doctors message
  if (doctors.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(9, 35, 55, 0.82)' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (!selectedDoctor) {
    return (
      <div className="card" style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(9, 35, 55, 0.82)' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <p>No doctor selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(9, 35, 55, 0.82)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: '#1e40af', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {selectedDoctor.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#eef8ff', fontSize: '18px' }}>
            Dr. {selectedDoctor.name}
          </h3>
          {selectedDoctor.specialty && (
            <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '14px' }}>
              <strong>Specialty:</strong> {selectedDoctor.specialty}
            </p>
          )}
          {selectedDoctor.license_number && (
            <p style={{ margin: '0', color: '#94a3b8', fontSize: '14px' }}>
              <strong>License:</strong> {selectedDoctor.license_number}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function HomePanel(props: { session: SessionState; onPatientLogin: () => void; onDoctorLogin: () => void }) {
  const newsQuery = useMedicalNewsAgent();
  return (
    <section>
      <h1>Smart Healthcare Management Platform</h1>
      <p className="lead-text">Manage doctors, patients, appointments, prescriptions, and billing from a single unified platform.</p>
      <div className="hero-actions">
        {props.session.role !== "PATIENT" && (
          <button onClick={props.onPatientLogin}>Patient Login</button>
        )}
        <button onClick={props.onDoctorLogin}>Doctor Login</button>
      </div>
      <h2>Latest Medical Breakthroughs</h2>
      <div className="card-grid">
        {newsQuery.isLoading
          ? Array.from({ length: 5 }).map((_, index) => <article className="skeleton-card" key={index} />)
          : newsQuery.data?.map((item) => (
              <article className="card" key={item.id}>
                <h3>{item.headline}</h3>
                <p className="muted">{item.source}</p>
                <p>{item.summary}</p>
                <a href={item.href}>Read more</a>
              </article>
            ))}
      </div>
    </section>
  );
}

function AuthPanel(props: {
  title: string;
  email: string;
  password: string;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onSubmit: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!validateEmail(props.email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (props.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      props.onSubmit();
    }
  }

  // Generate unique IDs based on the title to prevent credential sharing
  const emailId = `${props.title.toLowerCase().replace(/\s+/g, '-')}-email`;
  const passwordId = `${props.title.toLowerCase().replace(/\s+/g, '-')}-password`;

  return (
    <section>
      <h2>{props.title}</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        <LabeledField id={emailId} label="Email" helpText="Use a valid email format, e.g., name@example.com." value={props.email} onChange={props.onEmail} error={errors.email} placeholder="name@example.com" autoComplete="off" />
        <LabeledField id={passwordId} label="Password" helpText="Minimum 8 characters. Include upper/lowercase, number, and symbol when possible." value={props.password} onChange={props.onPassword} type="password" error={errors.password} placeholder="••••••••" autoComplete="current-password" />
        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}

function PatientRegisterPanel(props: {
  name: string;
  phone: string;
  insurance: string;
  policy: string;
  email: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  onName: (value: string) => void;
  onPhone: (value: string) => void;
  onInsurance: (value: string) => void;
  onPolicy: (value: string) => void;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onDateOfBirth: (value: string) => void;
  onGender: (value: string) => void;
  onAddressLine1: (value: string) => void;
  onAddressLine2: (value: string) => void;
  onCity: (value: string) => void;
  onState: (value: string) => void;
  onPostalCode: (value: string) => void;
  onCountry: (value: string) => void;
  onSubmit: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (props.name.trim().length < 3) {
      nextErrors.name = "Name must be at least 3 characters.";
    }
    if (!validateEmail(props.email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(props.phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    if (props.password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters.";
    }
    
    // Validate date of birth if provided
    if (props.dateOfBirth) {
      const dob = new Date(props.dateOfBirth);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 120);
      
      if (dob > today) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      } else if (dob < maxDate) {
        nextErrors.dateOfBirth = "Date of birth cannot be more than 120 years ago.";
      }
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      props.onSubmit();
    }
  }

  return (
    <section>
      <h2>Patient Registration</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        <LabeledField id="register-name" label="Full Name" helpText="Name must be 3-80 characters." value={props.name} onChange={props.onName} error={errors.name} autoComplete="off" />
        <LabeledField id="register-email" label="Email" helpText="Use a valid email format, e.g., name@example.com." value={props.email} onChange={props.onEmail} error={errors.email} autoComplete="off" />
        <LabeledField id="register-phone" label="Phone" helpText="Use 10-15 digits. Country code allowed." value={props.phone} onChange={props.onPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id="register-password" label="Password" helpText="Minimum 5 characters." value={props.password} onChange={props.onPassword} type="password" error={errors.password} autoComplete="new-password" />
        <LabeledField id="register-date-of-birth" label="Date of Birth" helpText="Format: MM/DD/YYYY (optional, max age 120 years)." value={props.dateOfBirth} onChange={props.onDateOfBirth} type="date" autoComplete="off" error={errors.dateOfBirth} />
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="register-gender">Gender</label>
          </div>
          <select 
            id="register-gender"
            value={props.gender}
            onChange={(e) => props.onGender(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            <option value="">Select Gender (Optional)</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <LabeledField id="register-address-line1" label="Address Line 1" helpText="Street address (optional)." value={props.addressLine1} onChange={props.onAddressLine1} autoComplete="off" />
        <LabeledField id="register-address-line2" label="Address Line 2" helpText="Apartment, suite, unit, building, floor, etc. (optional)." value={props.addressLine2} onChange={props.onAddressLine2} autoComplete="off" />
        <LabeledField id="register-city" label="City" helpText="City name (optional)." value={props.city} onChange={props.onCity} autoComplete="off" />
        <LabeledField id="register-state" label="State/Province" helpText="State or province (optional)." value={props.state} onChange={props.onState} autoComplete="off" />
        <LabeledField id="register-postal-code" label="Postal Code" helpText="ZIP or postal code (optional)." value={props.postalCode} onChange={props.onPostalCode} autoComplete="off" />
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="register-country">Country</label>
          </div>
          <select 
            id="register-country"
            value={props.country}
            onChange={(e) => props.onCountry(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <LabeledField id="register-insurance" label="Insurance Provider" helpText="Insurance company name (optional)." value={props.insurance} onChange={props.onInsurance} autoComplete="off" />
        <LabeledField id="register-policy" label="Policy Number" helpText="Insurance policy number (optional)." value={props.policy} onChange={props.onPolicy} autoComplete="off" />
        <button type="submit">Create Account</button>
      </form>
    </section>
  );
}

function PatientAppointmentsPanel(props: {
  fromDate: string;
  onDate: (value: string) => void;
  doctorId: string;
  slot: string;
  reason: string;
  appointmentId: string;
  rows: AppointmentRow[];
  onDoctorId: (value: string) => void;
  onSlot: (value: string) => void;
  onReason: (value: string) => void;
  onAppointmentId: (value: string) => void;
  onLoad: () => void;
  onBook: () => void;
  onCancel: () => void;
  session: SessionState;
  patientDetails?: any;
}) {
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialty?: string; license_number?: string }>>([]);
  const [doctorsError, setDoctorsError] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string; specialty?: string; license_number?: string } | null>(null);
  const [doctorAvailability, setDoctorAvailability] = useState<Array<{ slot_time: string; status: "AVAILABLE" | "BOOKED" | "BLOCKED" }>>([]);
  const [bookedAppointments, setBookedAppointments] = useState<Array<{ slot_time: string }>>([]);
  const [patientAppointments, setPatientAppointments] = useState<Array<any>>([]);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [patientDetails, setPatientDetails] = useState<any>(null);
  
  // Auto-clear doctors error after 5 seconds
  useEffect(() => {
    if (doctorsError) {
      const timer = setTimeout(() => {
        setDoctorsError("");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [doctorsError]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch doctors without auth; endpoint is now public
    api.listDoctors()
      .then(data => {
        setDoctors(data);
        // Auto-select first doctor if none is selected
        if (data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(data[0].id);
        }
      })
      .catch(() => setDoctorsError("Failed to load doctors."));
  }, []);

  // Update selected doctor details when selection changes
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      setSelectedDoctor(doctor || null);
    }
  }, [selectedDoctorId, doctors]);

  useEffect(() => {
    if (selectedDoctorId && props.session.accessToken) {
      api.listAllDoctorAvailability(selectedDoctorId, props.session.accessToken)
        .then(data => {
          setDoctorAvailability(data);
        })
        .catch((err) => {
          console.error("Failed to load doctor availability:", err);
          setDoctorAvailability([]);
        });
    } else {
      console.log("No doctor selected, clearing availability");
      setDoctorAvailability([]);
    }
  }, [selectedDoctorId]);

  useEffect(() => {
    // Fetch patient appointments
    if (props.session.accessToken) {
      console.log("Fetching patient appointments...");
      api.listAllAppointments(props.session.accessToken)
        .then(data => {
          console.log("Patient appointments loaded:", data);
          console.log("Appointment details:", data.map(d => ({
            id: d.id,
            doctor_id: d.doctor_id,
            appointment_time: d.appointment_time,
            status: d.status
          })));
          setPatientAppointments(data);
        })
        .catch((err) => {
          console.error("Failed to load patient appointments:", err);
        });
    } else {
      console.log("No access token, cannot fetch patient appointments");
      setPatientAppointments([]);
    }
  }, [props.session.accessToken]);
  
  // Update patient details when prop changes
  useEffect(() => {
    setPatientDetails(props.patientDetails);
  }, [props.patientDetails]);
  
  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }
    
    setCancellingId(appointmentId);
    try {
      await api.cancelAppointment(props.session.accessToken, appointmentId);
      
      // Refresh both patient appointments and doctor availability
      const [appointmentsData, availabilityData] = await Promise.all([
        api.listAllAppointments(props.session.accessToken),
        selectedDoctorId ? api.listAllDoctorAvailability(selectedDoctorId, props.session.accessToken) : Promise.resolve([])
      ]);
      
      setPatientAppointments(appointmentsData);
      if (selectedDoctorId) {
        setDoctorAvailability(availabilityData);
      }
      
      alert("Appointment cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };
  
  // Generate a simple week calendar starting from today
  const today = new Date();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendar: Array<{ day: string; date: number; month: number; year: number; isWeekend: boolean; isPast: boolean }> = [];
  let offset = weekOffset * 7; // Each week moves by 7 days
  // Start from today
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayName = weekDays[date.getDay()];
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isPast = date.getTime() < todayMidnight.getTime();
    calendar.push({ day: dayName, date: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear(), isWeekend: date.getDay() === 0 || date.getDay() === 6, isPast });
  }

  const handlePrevWeek = () => setWeekOffset(o => Math.max(0, o - 1));
  const handleNextWeek = () => setWeekOffset(o => Math.min(4, o + 1)); // 5 weeks max = 35 days ~ 30 days
  const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  const currentHour = today.getHours();
  
  const isBefore4pmToday = today.toDateString() === new Date().toDateString() && currentHour < 16;

  return (
    <section>
      <h2>Schedule / Cancel Appointment</h2>
      
      <div className="calendar-and-doctors">
        <div className="calendar-container">
          <div className="form-field" style={{ marginBottom: '16px' }}>
            <label className="label-row">
              Appointment Reason <span style={{ color: '#ff90ab' }}>*</span>
            </label>
            <textarea
              value={appointmentReason}
              onChange={(e) => setAppointmentReason(e.target.value)}
              placeholder="Please describe the reason for your appointment..."
              rows={3}
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                backgroundColor: 'rgba(9, 35, 55, 0.82)',
                color: '#eef8ff',
                resize: 'vertical',
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
              }}
            />
          </div>
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={handlePrevWeek} disabled={weekOffset === 0}>Previous Week</button>
            <span className="calendar-nav-title">Week of {calendar[0]?.month}/{calendar[0]?.date} - {calendar[6]?.month}/{calendar[6]?.date}</span>
            <button className="calendar-nav-btn" onClick={handleNextWeek} disabled={weekOffset === 4}>Next Week</button>
          </div>
          <table className="week-calendar">
            <thead>
              <tr>
                {calendar.map(col => (
                  <th key={col.day} className={`${col.isPast ? "past-th" : ""}`}>
                    <div className="calendar-th-day">{col.day}</div>
                    <div className="calendar-th-date">
                      {String(col.month).padStart(2, '0')}/{String(col.date).padStart(2, '0')}/{col.year}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {calendar.map(col => (
                  <td key={col.day} className={`calendar-day-cell ${col.isPast ? "past-cell" : ""}`}>
                    <div className="calendar-day-content">
                      {timeSlots.map(slot => {
                        const hour = parseInt(slot.split(":")[0]);
                        const isAm = slot.includes("AM");
                        const slotHour24 = isAm ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
                        const colDate = new Date(col.year, col.month - 1, col.date);
                        const isToday = colDate.toDateString() === today.toDateString();
                        const isSlotPast = col.isPast || (isToday && (slotHour24 <= currentHour));

                        // Check availability for this slot
                        const slotDateTime = new Date(col.year, col.month - 1, col.date, slotHour24, 0, 0);
                        // Create ISO string without timezone (YYYY-MM-DDTHH:mm:ss) to match API format
                        const isoString = `${col.year.toString().padStart(4, '0')}-${(col.month).toString().padStart(2, '0')}-${col.date.toString().padStart(2, '0')}T${slotHour24.toString().padStart(2, '0')}:00:00`;
                        
                        // FIRST: Check if this slot is already booked by the patient (regardless of which doctor)
                        const isPatientBooked = patientAppointments.some(apt => {
                          // Convert both to same format for comparison
                          const aptTime = new Date(apt.appointment_time);
                          const slotTime = new Date(isoString);
                          
                          // Simple timestamp comparison
                          const isSameTime = Math.abs(aptTime.getTime() - slotTime.getTime()) < 60000; // Within 1 minute
                          
                          const isBooked = isSameTime && 
                            (apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED');  // Changed from apt.appointment_status
                          
                          // Debug for any slot that might be booked
                          if (isBooked) {
                            console.log(`Found booked slot: ${col.day} ${slot}`, {
                              isoString,
                              apt: {
                                appointment_time: apt.appointment_time,
                                status: apt.status,  // Changed from apt.appointment_status
                                doctor_name: apt.doctor_name
                              },
                              aptTime: aptTime.toISOString(),
                              slotTime: slotTime.toISOString(),
                              timeDiff: Math.abs(new Date(apt.appointment_time).getTime() - slotTime.getTime())
                            });
                          }
                          
                          return isBooked;
                        });
                        
                        // SECOND: Check if this slot is available for the selected doctor (only if not already booked by patient)
                        const slotAvailability = doctorAvailability.find(a => a.slot_time === isoString);
                        const isAvailable = !isPatientBooked && selectedDoctorId && slotAvailability && slotAvailability.status === "AVAILABLE";
                        
                        // Check if slot is booked (either by current click or previously)
                        const isBooked = bookedAppointments.some(a => a.slot_time === isoString);
                        
                        /*
                        if (selectedDoctorId && col.day === "Fri" && slot === "12:00 PM") {
                          console.log("Debug -> isoString:", isoString);
                          console.log("Debug -> doctorAvailability:", doctorAvailability);
                          console.log("Debug -> isAvailable:", isAvailable, "isBooked:", isBooked, "isSlotPast:", isSlotPast);
                        }
                          */

                        return (
                          <div
                            key={slot}
                            className={`time-slot ${
                              isSlotPast ? "past-slot" : 
                              isPatientBooked ? "booked-slot" :  // Patient bookings take priority
                              isBooked ? "booked-slot" : 
                              isAvailable ? "available-slot" : ""
                            }`}
                            onClick={async () => {
                              if (isAvailable && !isSlotPast && selectedDoctorId && !isBooked && !isPatientBooked) {
                                // Validate appointment reason
                                if (!appointmentReason.trim()) {
                                  alert("Please provide a reason for the appointment.");
                                  return;
                                }
                                
                                try {
                                  // Book the appointment
                                  if (!props.session.accessToken) {
                                    alert("Authentication required. Please log in again.");
                                    return;
                                  }
                                  const result = await api.bookAppointment(props.session.accessToken, {
                                    doctor_id: selectedDoctorId,
                                    slot: isoString,
                                    reason: appointmentReason.trim()
                                  });
                                  
                                  // Add to booked appointments state
                                  setBookedAppointments(prev => [...prev, { slot_time: isoString }]);
                                  // Clear the reason after successful booking
                                  setAppointmentReason("");
                                  // Refresh the availability to show the slot as booked
                                  api.listAllDoctorAvailability(selectedDoctorId, props.session.accessToken)
                                    .then(data => {
                                      setDoctorAvailability(data);
                                    })
                                    .catch((err) => {
                                      console.error("Failed to refresh availability:", err);
                                    });
                                  // Refresh patient appointments
                                  api.listAllAppointments(props.session.accessToken)
                                    .then(data => {
                                      setPatientAppointments(data);
                                    })
                                    .catch((err) => {
                                      console.error("Failed to refresh appointments:", err);
                                    });
                                } catch (error) {
                                  console.error("Failed to book appointment:", error);
                                  // Show more detailed error to user
                                  let errorMessage = "Failed to book appointment";
                                  if (error instanceof Error) {
                                    errorMessage = error.message;
                                    // Check for specific error patterns
                                    if (error.message.includes('Failed to fetch')) {
                                      errorMessage = "Network error - please check if the server is running and you're connected to the internet";
                                    }
                                  }
                                  alert(`Booking failed: ${errorMessage}`);
                                }
                              } else if (isPatientBooked) {
                                alert("You already have an appointment booked for this time slot.");
                              }
                            }}
                            style={{ cursor: (isAvailable && !isSlotPast && !isBooked && !isPatientBooked) ? "pointer" : "not-allowed" }}
                          >
                            {isBooked || isPatientBooked ? "BOOKED" : slot}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="doctors-list" style={{ 
  flex: '1', 
  minWidth: '300px',
  maxWidth: '400px'
}}>
          <h3>Doctors</h3>
          {doctorsError ? (
            <div className={`error-message ${doctorsError ? "fade-out" : ""}`}>{doctorsError}</div>
          ) : (
            <div className="doctor-links">
              {doctors.map(doc => (
                <a
                  key={doc.id}
                  href="#"
                  className={`doctor-link ${selectedDoctorId === doc.id ? "selected" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedDoctorId(doc.id === selectedDoctorId ? null : doc.id);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 16px',
                    width: '100%',
                    minHeight: '60px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontWeight: '500', 
                      color: '#3b82f6', 
                      fontSize: '14px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}>
                      {doc.name}
                    </span>
                    {doc.specialty && (
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#94a3b8',
                        fontStyle: 'italic'
                      }}>
                        - {doc.specialty}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
          {props.slot && (
            <div className="booking-info" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
              <h4>Selected Slot</h4>
              <p>Date/Time: {new Date(props.slot).toLocaleString()}</p>
              <LabeledField 
                id="appointment-reason" 
                label="Reason for Visit" 
                helpText="Please describe the reason for your appointment."
                value={props.reason} 
                onChange={props.onReason} 
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="button" 
                  onClick={props.onBook}
                >
                  Book Appointment
                </button>
                <button 
                  className="button" 
                  onClick={() => {
                    props.onSlot("");
                    props.onDoctorId("");
                    props.onReason("");
                  }}
                  style={{ backgroundColor: '#dc3545' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Patient Appointments Report */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Your Appointments</h3>
        {patientAppointments.length === 0 ? (
          <p className="muted">You have no scheduled appointments.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patientAppointments.map((apt) => {
                  const appointmentDate = new Date(apt.appointment_time);
                  const isFuture = appointmentDate > new Date();
                  
                  console.log("DEBUG: Appointment data:", apt);
                  console.log("DEBUG: Appointment date:", appointmentDate);
                  console.log("DEBUG: Is future:", isFuture);
                  console.log("DEBUG: Status:", apt.status);
                  console.log("DEBUG: Show cancel button:", isFuture && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED');
                  
                  return (
                    <tr key={apt.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: '500', color: '#eef8ff', fontSize: '14px' }}>
                            {appointmentDate.toLocaleDateString()}
                          </div>
                          <div style={{ fontWeight: '500', color: '#eef8ff', fontSize: '14px' }}>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td>{apt.doctor_name || 'N/A'}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: apt.status === 'CONFIRMED' ? 'rgba(73, 215, 194, 0.2)' :
                                         apt.status === 'SCHEDULED' ? 'rgba(66, 181, 245, 0.2)' :
                                         apt.status === 'COMPLETED' ? 'rgba(40, 167, 69, 0.2)' :
                                         apt.status === 'CANCELLED' ? 'rgba(220, 53, 69, 0.2)' :
                                         'rgba(108, 117, 125, 0.2)',
                          color: apt.status === 'CONFIRMED' ? '#49d7c2' :
                                 apt.status === 'SCHEDULED' ? '#42b5f5' :
                                 apt.status === 'COMPLETED' ? '#28a745' :
                                 apt.status === 'CANCELLED' ? '#dc3545' :
                                 '#6c757d'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td>{apt.notes || 'N/A'}</td>
                      <td>
                        {isFuture && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' ? (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            disabled={cancellingId === apt.id}
                            style={{
                              padding: '4px 12px',
                              fontSize: '12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: cancellingId === apt.id ? 'not-allowed' : 'pointer',
                              opacity: cancellingId === apt.id ? 0.6 : 1
                            }}
                          >
                            {cancellingId === apt.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: '12px' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function BillingPanel() {
  const [appointment, setAppointment] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!appointment.trim()) {
      nextErrors.appointment = "Appointment reference is required.";
    }
    if (!/^\d+(\.\d{1,2})?$/.test(feeAmount)) {
      nextErrors.feeAmount = "Fee should be a valid amount (e.g., 120.00).";
    }
    if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
      nextErrors.cardNumber = "Card number must contain 16 digits.";
    }
    if (cardName.trim().length < 3) {
      nextErrors.cardName = "Card holder name must be at least 3 characters.";
    }
    if (!/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      nextErrors.expiry = "Expiry must be in MM/YY format.";
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      nextErrors.cvv = "CVV should be 3 or 4 digits.";
    }
    setErrors(nextErrors);
  }

  return (
    <section>
      <h2>Bill Pay</h2>
      <form className="card form-stack" onSubmit={onSubmit}>
        <LabeledField id="bill-appointment" label="Appointment" helpText="Provide appointment reference number." value={appointment} onChange={setAppointment} error={errors.appointment} />
        <LabeledField id="bill-fee" label="Fee Amount" helpText="Numeric amount, optional decimals up to 2 places." value={feeAmount} onChange={setFeeAmount} error={errors.feeAmount} placeholder="120.00" />
        <LabeledField id="bill-card" label="Card Number" helpText="Enter 16-digit card number without separators." value={cardNumber} onChange={setCardNumber} error={errors.cardNumber} />
        <LabeledField id="bill-name" label="Card Holder Name" helpText="Use card owner name as printed on card." value={cardName} onChange={setCardName} error={errors.cardName} />
        <LabeledField id="bill-expiry" label="Expiry" helpText="Format MM/YY." value={expiry} onChange={setExpiry} error={errors.expiry} placeholder="08/28" />
        <LabeledField id="bill-cvv" label="CVV" helpText="3 or 4 digit security code on card." value={cvv} onChange={setCvv} error={errors.cvv} type="password" />
        <button type="submit">Pay Now</button>
      </form>
    </section>
  );
}

function PatientPrescriptionsPanel(props: { session: SessionState }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prescriptions, setPrescriptions] = useState<Array<{
    appointment_time: string;
    patient_name: string;
    doctor_name: string;
    appointment_status: string;
    appointment_note: string;
    symptoms: string;
  }>>([]);

  useEffect(() => {
    const loadPrescriptions = async () => {
      console.log('PatientPrescriptionsPanel: Starting to load prescriptions');
      setLoading(true);
      try {
        console.log('PatientPrescriptionsPanel: Making API call to /patient/prescriptions');
        const data = await api.patientPrescriptions(props.session.accessToken);
        console.log('PatientPrescriptionsPanel: API response:', data);
        setPrescriptions(data);
        console.log('PatientPrescriptionsPanel: Prescriptions loaded successfully:', data.length);
      } catch (err) {
        console.error('PatientPrescriptionsPanel: Error loading prescriptions:', err);
        setError("Failed to load prescriptions");
        console.error("Error loading prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (props.session.accessToken) {
      console.log('PatientPrescriptionsPanel: Access token available, loading prescriptions');
      loadPrescriptions();
    } else {
      console.log('PatientPrescriptionsPanel: No access token available');
    }
  }, [props.session.accessToken]);

  if (loading) {
    return (
      <section>
        <h2>Prescriptions</h2>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          Loading prescriptions...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2>Prescriptions</h2>
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ff90ab' }}>
          {error}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Prescriptions</h2>
      <div className="card">
        {prescriptions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            No prescriptions found. You haven't received any prescriptions yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {prescriptions.map((prescription, index) => (
              <div key={index} style={{ 
                marginBottom: '24px', 
                padding: '20px', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <strong>Appointment Date:</strong><br />
                    {prescription.appointment_time}
                  </div>
                  <div>
                    <strong>Doctor:</strong><br />
                    {prescription.doctor_name}
                  </div>
                  <div>
                    <strong>Status:</strong><br />
                    <span style={{
                      backgroundColor: prescription.appointment_status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                      color: prescription.appointment_status === 'ACTIVE' ? '#155724' : '#721c24',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {prescription.appointment_status}
                    </span>
                  </div>
                </div>

                {prescription.appointment_note && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Appointment Note:</strong><br />
                    {prescription.appointment_note}
                  </div>
                )}

                {prescription.symptoms && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Symptoms:</strong><br />
                    {prescription.symptoms}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DoctorAppointmentsPanel(props: { fromDate: string; onDate: (value: string) => void; rows: DoctorAppointmentRow[]; onLoad: (date?: string) => void; session: SessionState }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday=0, Monday=1
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });

  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prevWeek);
    props.onLoad(prevWeek.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(nextWeek);
    props.onLoad(nextWeek.toISOString().split('T')[0]);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentWeekDays = weekDays.map((day, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return {
      dayName: day,
      date: date,
      isToday: date.toDateString() === new Date().toDateString()
    };
  });

  return (
    <section>
      <h2>Appointments</h2>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={handlePrevWeek}>← Previous Week</button>
          <h3>Week of {currentWeekStart.toLocaleDateString()}</h3>
          <button onClick={handleNextWeek}>Next Week →</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {currentWeekDays.map((dayInfo, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '10px',
              backgroundColor: dayInfo.isToday ? '#007bff' : '#f8f9fa',
              color: dayInfo.isToday ? 'white' : 'black',
              borderRadius: '4px'
            }}>
              <div style={{ fontWeight: 'bold' }}>{dayInfo.dayName}</div>
              <div>{dayInfo.date.getDate()}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading appointments...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>{error}</div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {props.rows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                No appointments found for this week.
              </div>
            ) : (
              props.rows.map((row) => (
                <div key={row.id} style={{
                  padding: '15px',
                  margin: '10px 0',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{row.patient_name}</strong>
                      <div style={{ color: '#6c757d', fontSize: '0.9em' }}>{row.time}</div>
                      <div style={{ color: '#6c757d', fontSize: '0.9em' }}>{row.symptoms}</div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8em',
                      fontWeight: 'bold',
                      backgroundColor: row.status === 'SCHEDULED' ? '#28a745' : '#ffc107',
                      color: 'white'
                    }}>
                      {row.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Main App Component
function SaaSApp() {
  const [session, setSession] = useState<SessionState>({ accessToken: "", role: null, email: "", userId: "" });
  const [activeView, setActiveView] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointmentRow[]>([]);
  const [doctorFromDate, setDoctorFromDate] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split('T')[0];
  });

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setLoginError("");
    try {
      const res = await api.login({ email, password });
      setSession({ accessToken: res.access_token, role: res.role, email: res.email, userId: res.user_id });
      setActiveView(res.role.toLowerCase() === "doctor" ? "doctor-dashboard" : "patient-dashboard");
    } catch (err) {
      setLoginError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setSession({ accessToken: "", role: null, email: "", userId: "" });
    setActiveView("login");
  };

  const loadDoctorAppointments = useCallback(async (fromDate?: string) => {
    if (session.role !== "doctor") return;
    try {
      const data = await api.doctorAllAppointments(session.accessToken, fromDate || doctorFromDate);
      setDoctorAppointments(data);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  }, [session.accessToken, session.role, doctorFromDate]);

  useEffect(() => {
    if (session.role === "doctor") {
      loadDoctorAppointments();
    }
  }, [session.role, loadDoctorAppointments]);

  if (activeView === "login") {
    return <LoginPanel onLogin={handleLogin} loading={loading} error={loginError} />;
  }

  if (session.role === "doctor") {
    return (
      <div className="app">
        <header>
          <h1>Doctor Portal</h1>
          <div>
            <span>Dr. {session.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main>
          <DoctorAppointmentsPanel
            fromDate={doctorFromDate}
            onDate={setDoctorFromDate}
            rows={doctorAppointments}
            onLoad={loadDoctorAppointments}
            session={session}
          />
        </main>
      </div>
    );
  }

  if (session.role === "patient") {
    return (
      <div className="app">
        <header>
          <h1>Patient Portal</h1>
          <div>
            <span>{session.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main>
          <PatientPrescriptionsPanel session={session} />
        </main>
      </div>
    );
  }

  return <div>Loading...</div>;
}

export default SaaSApp;
                      backgroundColor: prescription.status === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                      color: prescription.status === 'ACTIVE' ? '#155724' : '#721c24',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {prescription.status}
                    </span>
                  </div>
                </div>
}

function DoctorAppointmentsPanel(props: { fromDate: string; onDate: (value: string) => void; rows: DoctorAppointmentRow[]; onLoad: (date?: string) => void; session: SessionState }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday=0, Monday=1
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });
  const [selectedPatient, setSelectedPatient] = useState<DoctorAppointmentRow | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  // Load appointments when component mounts or week changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Format the Monday as MM/DD/YYYY for display
      const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
      const day = String(currentWeekStart.getDate()).padStart(2, '0');
      const year = currentWeekStart.getFullYear();
      const displayDate = `${month}/${day}/${year}`;
      
      props.onDate(displayDate);
      
      // Load the appointments with the specific date
      await props.onLoad(displayDate);
      setLoading(false);
    };
    
    loadData();
  }, [currentWeekStart]);
  
  // Generate calendar days (Sunday to Saturday)
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    
    setCurrentWeekStart(newStart);
    setSelectedPatient(null);
  };
  
  // Group appointments by date and time
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return props.rows.filter(apt => {
      const aptDate = new Date(apt.time).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };
  
  // Format time for display
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  
  // Handle patient click
  const handlePatientClick = (appointment: DoctorAppointmentRow) => {
    setSelectedPatient(appointment);
  };

  // Handle confirm appointment
  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to confirm this appointment?")) {
      return;
    }
    
    setConfirmingId(appointmentId);
    try {
      await api.confirmAppointment(appointmentId, props.session.accessToken);
      
      // Refresh the appointments list
      const month = String(currentWeekStart.getMonth() + 1).padStart(2, '0');
      const day = String(currentWeekStart.getDate()).padStart(2, '0');
      const year = currentWeekStart.getFullYear();
      const displayDate = `${month}/${day}/${year}`;
      
      await props.onLoad(displayDate);
      
      alert("Appointment confirmed successfully");
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      alert("Failed to confirm appointment. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };
  
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Weekly Appointments</h2>
      
      <DoctorDetails session={props.session} />
      
      {/* Patient Details Section - Above Calendar Header */}
      {selectedPatient && (
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: '#eaf5ff' }}>Patient Details</h3>
            <button
              onClick={() => setSelectedPatient(null)}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#42b5f5', fontSize: '12px', textTransform: 'uppercase' }}>Patient Name:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff', fontSize: '14px' }}>{selectedPatient.patient_name}</p>
            </div>
            <div>
              <strong style={{ color: '#42b5f5', fontSize: '12px', textTransform: 'uppercase' }}>Date/Time:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff', fontSize: '14px' }}>
                {(() => {
                  // Debug: log the raw date value
                  console.log('Raw appointment time:', selectedPatient.time);
                  
                  // Parse the date and handle timezone properly
                  const date = new Date(selectedPatient.time);
                  console.log('Parsed date:', date);
                  console.log('Date UTC:', date.toISOString());
                  console.log('Date local:', date.toString());
                  
                  // Get UTC components to avoid timezone issues
                  const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
                  const utcDay = String(date.getUTCDate()).padStart(2, '0');
                  const utcYear = date.getUTCFullYear();
                  const utcHours = String(date.getUTCHours()).padStart(2, '0');
                  const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
                  
                  // Convert UTC to local time for display
                  const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
                  const localHours = String(localDate.getHours()).padStart(2, '0');
                  const localMinutes = String(localDate.getMinutes()).padStart(2, '0');
                  
                  const formattedTime = `${parseInt(localHours) > 12 ? parseInt(localHours) - 12 : parseInt(localHours)}:${localMinutes} ${parseInt(localHours) >= 12 ? 'PM' : 'AM'}`;
                  
                  return `${utcMonth}/${utcDay}/${utcYear} ${formattedTime}`;
                })()}
              </p>
            </div>
            <div>
              <strong style={{ color: '#42b5f5', fontSize: '12px', textTransform: 'uppercase' }}>Status:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff', fontSize: '14px' }}>{selectedPatient.status}</p>
            </div>
            {selectedPatient.symptoms && (
              <div style={{ flex: '1' }}>
                <strong style={{ color: '#42b5f5', fontSize: '12px', textTransform: 'uppercase' }}>Symptoms:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#eef8ff', fontSize: '14px' }}>{selectedPatient.symptoms}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Week Navigation */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigateWeek('prev')}
            style={{
              padding: '8px 16px',
              background: '#42b5f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Previous Week
          </button>
          <h3 style={{ margin: 0, color: '#eaf5ff' }}>
            {calendarDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
            {calendarDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
          <button 
            onClick={() => navigateWeek('next')}
            style={{
              padding: '8px 16px',
              background: '#42b5f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Next Week →
          </button>
        </div>
      </div>
      
      {/* Calendar Grid - Full Width */}
      <div className="card" style={{ padding: '16px', flex: '1' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#b4cce2' }}>
            Loading appointments...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', minHeight: '400px' }}>
            {calendarDays.map((date, index) => {
              const appointments = getAppointmentsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={index}
                  style={{
                    border: `1px solid ${isToday ? '#42b5f5' : 'rgba(136, 194, 227, 0.36)'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    background: isToday ? 'rgba(66, 181, 245, 0.1)' : 'rgba(9, 32, 52, 0.82)',
                    minHeight: '200px'
                  }}
                >
                  <h4 style={{ 
                    margin: '0 0 10px 0', 
                    color: isToday ? '#42b5f5' : '#eaf5ff',
                    fontSize: '14px'
                  }}>
                    {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h4>
                  <div style={{ fontSize: '12px' }}>
                    {appointments.length === 0 ? (
                      <span style={{ color: '#b4cce2' }}>No appointments</span>
                    ) : (
                      appointments.map((apt, aptIndex) => (
                        <div key={aptIndex} style={{ marginBottom: '10px' }}>
                          <div style={{ color: '#b4cce2', fontSize: '13px', fontWeight: '500' }}>
                            {formatTime(apt.time)}
                          </div>
                          <button
                            onClick={() => handlePatientClick(apt)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#42b5f5',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              padding: '0',
                              fontSize: '14px',
                              textAlign: 'left',
                              fontWeight: '500'
                            }}
                          >
                            {apt.patient_name}
                          </button>
                          {apt.status && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: apt.status === 'CANCELLED' ? '#ff90ab' : '#49d7c2',
                              marginTop: '3px',
                              fontWeight: '500'
                            }}>
                              {apt.status}
                            </div>
                          )}
                          {apt.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleConfirmAppointment(apt.id)}
                              disabled={confirmingId === apt.id}
                              style={{
                                background: confirmingId === apt.id ? '#94a3b8' : '#42b5f5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '3px 10px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                marginTop: '5px',
                                marginLeft: '0',
                                fontWeight: '500'
                              }}
                            >
                              {confirmingId === apt.id ? 'Confirming...' : 'Confirm'}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function TodayAppointmentsPanel(props: { session: SessionState }) {
  const [appointments, setAppointments] = useState<Array<{ id: string; time: string; patient_name: string; reason: string; status: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    const loadTodayAppointments = async () => {
      setLoading(true);
      try {
        const data = await api.getTodayAppointments(props.session.accessToken);
        // Filter both confirmed and scheduled appointments
        const validAppointments = data.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED');
        // Sort by time
        validAppointments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setAppointments(validAppointments);
      } catch (err) {
        setError("Failed to load today's appointments");
        console.error("Error loading appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTodayAppointments();
  }, [props.session.accessToken]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to confirm this appointment?")) {
      return;
    }
    
    setConfirmingId(appointmentId);
    try {
      await api.confirmAppointment(appointmentId, props.session.accessToken);
      
      // Refresh the appointments list
      const data = await api.getTodayAppointments(props.session.accessToken);
      const validAppointments = data.filter(apt => apt.status === 'CONFIRMED' || apt.status === 'SCHEDULED');
      validAppointments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      setAppointments(validAppointments);
      
      alert("Appointment confirmed successfully");
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      alert("Failed to confirm appointment. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <section>
      <h2>Today's Appointments</h2>
      
      <DoctorDetails session={props.session} />
      
      <div className="card" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#b4cce2' }}>
            Loading today's appointments...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff90ab' }}>
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#b4cce2' }}>
            No appointments for today
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map((appointment) => (
              <div key={appointment.id} style={{ 
                border: `1px solid ${appointment.status === 'CONFIRMED' ? 'rgba(73, 215, 194, 0.36)' : 'rgba(66, 181, 245, 0.36)'}`, 
                borderRadius: '8px', 
                padding: '16px',
                backgroundColor: 'rgba(9, 32, 52, 0.82)'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    backgroundColor: appointment.status === 'CONFIRMED' ? '#49d7c2' : '#42b5f5', 
                    color: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    minWidth: '100px'
                  }}>
                    {formatTime(appointment.time)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#eef8ff', fontSize: '16px' }}>
                      {appointment.patient_name}
                    </h4>
                    {appointment.reason && (
                      <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '14px' }}>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}
                    <div style={{ 
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: appointment.status === 'CONFIRMED' ? 'rgba(73, 215, 194, 0.2)' : 'rgba(66, 181, 245, 0.2)',
                      color: appointment.status === 'CONFIRMED' ? '#49d7c2' : '#42b5f5'
                    }}>
                      {appointment.status}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {appointment.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        disabled={confirmingId === appointment.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: confirmingId === appointment.id ? '#94a3b8' : '#42b5f5',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: confirmingId === appointment.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {confirmingId === appointment.id ? 'Confirming...' : 'Confirm'}
                      </button>
                    )}
                    <Link 
                      to={`/doctors/consultation/${appointment.id}`}
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: appointment.status === 'CONFIRMED' ? '#49d7c2' : '#94a3b8',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: appointment.status === 'CONFIRMED' ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s ease',
                        opacity: appointment.status === 'CONFIRMED' ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => {
                        if (appointment.status === 'CONFIRMED') {
                          e.currentTarget.style.backgroundColor = '#3bc4a8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (appointment.status === 'CONFIRMED') {
                          e.currentTarget.style.backgroundColor = '#49d7c2';
                        }
                      }}
                      onClick={(e) => {
                        if (appointment.status !== 'CONFIRMED') {
                          e.preventDefault();
                          alert("Please confirm this appointment first before starting consultation");
                        }
                      }}
                    >
                      Start Consultation
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ConsultationPanelWrapper(props: { session: SessionState }) {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const location = useLocation();
  
  // Debug: log detailed information
  console.log('=== ConsultationPanelWrapper Debug ===');
  console.log('Current URL:', location.pathname);
  console.log('AppointmentId from params:', appointmentId);
  console.log('Full location object:', location);
  
  if (!appointmentId) {
    console.log('ERROR: No appointmentId found in URL params');
    return (
      <section>
        <h2>Consultation</h2>
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ff90ab' }}>
          Invalid appointment ID - No appointment ID found in URL
        </div>
      </section>
    );
  }
  
  // Check if appointmentId is 'all' which indicates an issue
  if (appointmentId === 'all') {
    console.log('ERROR: appointmentId is "all" - this should not happen');
    return (
      <section>
        <h2>Consultation</h2>
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ff90ab' }}>
          Error: Invalid appointment ID 'all'. Please navigate from the appointments list.
          <br /><br />
          Current URL: {location.pathname}
        </div>
      </section>
    );
  }
  
  console.log('Proceeding with valid appointmentId:', appointmentId);
  return <ConsultationPanel appointmentId={appointmentId} session={props.session} />;
}

function ConsultationPanel(props: { appointmentId: string; session: SessionState }) {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [labResults, setLabResults] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Don't load appointment details if appointmentId is 'all' or empty
    if (!props.appointmentId || props.appointmentId === 'all') {
      setError("Invalid appointment ID. Please navigate from the appointments list.");
      return;
    }

    const loadAppointmentDetails = async () => {
      setLoading(true);
      try {
        const appointmentDetails = await api.getAppointmentDetails(props.appointmentId, props.session.accessToken);
        setAppointment(appointmentDetails);
      } catch (err) {
        setError("Failed to load appointment details");
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentDetails();
  }, [props.appointmentId, props.session.accessToken]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms || !diagnosis) {
      setError("Please fill in at least symptoms and diagnosis fields");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let medicalRecordId = null;
      
      // Try to create medical record first
      try {
        const medicalRecordResponse = await api.createMedicalRecord({
          patient_id: appointment.patient_id,
          diagnosis: diagnosis,
          notes: symptoms || "No specific symptoms noted"
        }, props.session.accessToken);
        console.log("Medical record created successfully");
        medicalRecordId = medicalRecordResponse.id;
      } catch (medicalRecordError: any) {
        // If medical record already exists (409), we need to get the existing record ID
        if (medicalRecordError.message?.includes("Medical record already exists for appointment")) {
          console.log("Medical record already exists, fetching existing record");
          setSuccess("Medical record already exists. Fetching existing record...");
          
          // Get the existing medical record for this appointment
          try {
            const existingRecords = await api.getMedicalRecordByAppointment(props.appointmentId, props.session.accessToken);
            if (existingRecords && existingRecords.length > 0) {
              medicalRecordId = existingRecords[0].id;
              console.log("Found existing medical record ID:", medicalRecordId);
            }
          } catch (fetchError) {
            console.error("Failed to fetch existing medical record:", fetchError);
          }
        } else {
          // For other errors, re-throw
          throw medicalRecordError;
        }
      }

      // Create prescription if medication is provided and we have a medical record ID
      if (medication && dosage && medicalRecordId) {
        console.log("Creating prescription with medical record ID:", medicalRecordId);
        await api.createPrescription({
          medical_record_id: medicalRecordId,
          medication_details: `${medication} - ${dosage}. ${instructions || "Take as prescribed"}`,
          pharmacy_id: null
        }, props.session.accessToken);
        console.log("Prescription created successfully");
      } else if (medication && dosage) {
        console.log("Cannot create prescription - no medical record ID available");
      }

      // Mark appointment as completed
      await api.completeAppointment(props.appointmentId, props.session.accessToken);

      setSuccess("Consultation completed successfully!");
      
      // Redirect after a delay
      setTimeout(() => {
        navigate("/doctors/today-appointments");
      }, 2000);

    } catch (err) {
      setError("Failed to save consultation details");
      console.error("Error saving consultation:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h2>Consultation</h2>
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#b4cce2' }}>
          Loading appointment details...
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2>Patient Consultation</h2>
      
      <DoctorDetails session={props.session} />
      
      {appointment && (
        <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#eaf5ff' }}>Appointment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <strong style={{ color: '#42b5f5' }}>Patient:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff' }}>{appointment.patient_name}</p>
            </div>
            <div>
              <strong style={{ color: '#42b5f5' }}>Date & Time:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff' }}>{formatTime(appointment.time)}</p>
            </div>
            <div>
              <strong style={{ color: '#42b5f5' }}>Reason for Visit:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#eef8ff' }}>{appointment.notes || 'No reason provided'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#eaf5ff' }}>Consultation Details</h3>
        
        {error && (
          <div style={{ 
            padding: '12px', 
            margin: '0 0 16px 0', 
            backgroundColor: '#ff90ab20', 
            color: '#ff90ab', 
            borderRadius: '6px',
            border: '1px solid #ff90ab'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            padding: '12px', 
            margin: '0 0 16px 0', 
            backgroundColor: '#49d7c220', 
            color: '#49d7c2', 
            borderRadius: '6px',
            border: '1px solid #49d7c2'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmitConsultation} className="form-stack">
          <div className="form-field">
            <label className="label-row">
              Symptoms <span style={{ color: '#ff90ab' }}>*</span>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Enter patient symptoms..."
              rows={4}
              required
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                backgroundColor: 'rgba(9, 35, 55, 0.82)',
                color: '#eef8ff',
                resize: 'vertical',
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
              }}
            />
          </div>

          <div className="form-field">
            <label className="label-row">
              Diagnosis <span style={{ color: '#ff90ab' }}>*</span>
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              rows={3}
              required
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                backgroundColor: 'rgba(9, 35, 55, 0.82)',
                color: '#eef8ff',
                resize: 'vertical',
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
              }}
            />
          </div>

          <div className="form-field">
            <label className="label-row">
              Lab Results
            </label>
            <textarea
              value={labResults}
              onChange={(e) => setLabResults(e.target.value)}
              placeholder="Enter lab results (if any)..."
              rows={3}
              style={{
                width: '100%',
                padding: '11px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                backgroundColor: 'rgba(9, 35, 55, 0.82)',
                color: '#eef8ff',
                resize: 'vertical',
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
              }}
            />
          </div>

          <div style={{ 
            border: '1px solid rgba(136, 194, 227, 0.36)', 
            borderRadius: '8px', 
            padding: '16px', 
            margin: '20px 0' 
          }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#eaf5ff' }}>Prescription (Optional)</h4>
            
            <div className="form-field">
              <label className="label-row">
                Medication
              </label>
              <input
                type="text"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Enter medication name..."
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  backgroundColor: 'rgba(9, 35, 55, 0.82)',
                  color: '#eef8ff',
                  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
                }}
              />
            </div>

            <div className="form-field">
              <label className="label-row">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg, 1 tablet, 5ml..."
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  backgroundColor: 'rgba(9, 35, 55, 0.82)',
                  color: '#eef8ff',
                  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
                }}
              />
            </div>

            <div className="form-field">
              <label className="label-row">
                Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Take twice daily with food..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  backgroundColor: 'rgba(9, 35, 55, 0.82)',
                  color: '#eef8ff',
                  resize: 'vertical',
                  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #94a3b8',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 24px',
                backgroundColor: submitting ? '#94a3b8' : '#49d7c2',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Saving...' : 'Complete Consultation'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function PatientSearchResults(props: { rows: PatientSearchRow[]; onPatientSelect: (patient: PatientSearchRow) => void; session: SessionState }) {
  // Debug: Log the first row to see what data we're getting
  React.useEffect(() => {
    if (props.rows.length > 0) {
      console.log("DEBUG - Frontend received first patient:", props.rows[0]);
      console.log("DEBUG - DOB:", props.rows[0].dob, "Gender:", props.rows[0].gender);
    }
  }, [props.rows]);

  function calculateAge(dob: string): number {
    if (!dob) return 0; // Return 0 if no DOB
    
    try {
      const birthDate = new Date(dob);
      // Check if the date is valid
      if (isNaN(birthDate.getTime())) return 0;
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return 0;
    }
  }

  function formatPhoneNumber(phone: string): string {
    if (!phone) return 'N/A';
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length > 10) {
      // Handle country code
      return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }
    return phone; // Return original if can't format
  }

  // Extract unique patients
  const uniquePatients = props.rows.reduce((acc: any[], row) => {
    const existing = acc.find(p => p.id === row.id);
    if (!existing) {
      acc.push({
        id: row.id,
        name: row.name,
        phone: row.phone,
        dob: row.dob,
        gender: row.gender || 'N/A',
        address: row.address || ''
      });
    }
    return acc;
  }, []);

  // State to track which patient's prescriptions are currently displayed
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(
    uniquePatients.length > 0 ? uniquePatients[0].id : null
  );

  // State for additional prescriptions
  const [additionalPrescriptions, setAdditionalPrescriptions] = React.useState<PatientSearchRow[]>([]);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);

  // Filter rows to show only the selected patient's prescriptions
  const allFilteredRows = selectedPatientId 
    ? props.rows
        .filter(row => row.id === selectedPatientId)
        .sort((a, b) => {
          // Sort by prescription date descending (newest first)
          if (!a.prescription_date) return 1;
          if (!b.prescription_date) return -1;
          return new Date(b.prescription_date).getTime() - new Date(a.prescription_date).getTime();
        })
    : [];

  // Combine original rows with additional prescriptions if "View More" was clicked
  const combinedRows = showMore && additionalPrescriptions.length > 0
    ? [...allFilteredRows, ...additionalPrescriptions]
    : allFilteredRows;

  // Show only first 5 initially, or all if "View More" was clicked
  const displayRows = showMore 
    ? combinedRows 
    : combinedRows.slice(0, 5);

  // Check if patient has more than 5 prescriptions
  const hasMorePrescriptions = selectedPatientId 
    ? allFilteredRows.length > 5
    : false;

  // Auto-select first patient when results change
  React.useEffect(() => {
    if (uniquePatients.length > 0 && (!selectedPatientId || !uniquePatients.find(p => p.id === selectedPatientId))) {
      setSelectedPatientId(uniquePatients[0].id);
      setShowMore(false);
      setAdditionalPrescriptions([]);
    }
  }, [uniquePatients, selectedPatientId]);

  // Handle loading more prescriptions
  const handleLoadMorePrescriptions = async () => {
    if (!selectedPatientId || !props.session.accessToken) return;
    
    setLoadingMore(true);
    try {
      const allPrescriptions = await api.getAllPatientPrescriptions(props.session.accessToken, selectedPatientId);
      // Get prescriptions beyond the first 5
      const morePrescriptions = allPrescriptions.slice(5);
      setAdditionalPrescriptions(morePrescriptions);
      setShowMore(true);
    } catch (error) {
      console.error("Error loading more prescriptions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Get selected patient name
  const selectedPatient = uniquePatients.find(p => p.id === selectedPatientId);

  return (
    <div className="card">
      <h3>PATIENT DETAILS</h3>
      
      {/* Patient Summary Section */}
      {uniquePatients.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(66, 181, 245, 0.05)', borderRadius: '8px' }}>
          {uniquePatients.map((patient) => (
            <div key={patient.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
              <span>
                <button 
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setShowMore(false);
                    setAdditionalPrescriptions([]);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: selectedPatientId === patient.id ? '#2793d3' : '#42b5f5',
                    textDecoration: selectedPatientId === patient.id ? 'underline' : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    font: 'inherit',
                    fontWeight: selectedPatientId === patient.id ? 'bold' : 'normal',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPatientId !== patient.id) {
                      e.currentTarget.style.color = '#2793d3';
                      e.currentTarget.style.textDecoration = 'underline';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPatientId !== patient.id) {
                      e.currentTarget.style.color = '#42b5f5';
                      e.currentTarget.style.textDecoration = 'none';
                    }
                  }}
                >
                  {patient.name}
                </button>
              </span>
              <span style={{ color: '#e8f6ff', fontSize: '13px' }}>
                Age: {calculateAge(patient.dob)}
              </span>
              <span style={{ color: '#e8f6ff', fontSize: '13px' }}>
                Gender: {patient.gender}
              </span>
              <span style={{ color: '#e8f6ff', fontSize: '13px' }}>
                Phone: {formatPhoneNumber(patient.phone)}
              </span>
              {patient.address && (
                <span style={{ color: '#e8f6ff', fontSize: '13px' }}>
                  Address: {patient.address}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {props.rows.length === 0 ? (
        <p className="muted">No records found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PRESCRIPTION DATE</th>
                <th>SYMPTOMS</th>
                <th>DIAGNOSIS</th>
                <th>LAB RESULTS</th>
                <th>MEDICATION</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={`${row.id}-${row.prescription_date}`}>
                  <td>{row.prescription_date ? new Date(row.prescription_date).toLocaleDateString() : '-'}</td>
                  <td>{row.symptoms || '-'}</td>
                  <td>{row.diagnosis || '-'}</td>
                  <td>{row.lab_results || '-'}</td>
                  <td>{row.medication || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View More Prescriptions Link */}
      {hasMorePrescriptions && !showMore && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            onClick={handleLoadMorePrescriptions}
            disabled={loadingMore}
            style={{
              background: loadingMore ? '#ccc' : '#42b5f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
            onMouseEnter={(e) => {
              if (!loadingMore) {
                e.currentTarget.style.background = '#2793d3';
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingMore) {
                e.currentTarget.style.background = '#42b5f5';
              }
            }}
          >
            {loadingMore ? 'Loading...' : `View More Prescriptions for ${selectedPatient?.name || 'Patient'}`}
          </button>
        </div>
      )}
    </div>
  );
}

function PatientDetailsPanel(props: { patient: PatientSearchRow; onClose: () => void }) {
  function formatPhoneNumber(phone: string): string {
    if (!phone) return 'N/A';
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length > 10) {
      // Handle country code
      return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
    }
    return phone; // Return original if can't format
  }

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3>PATIENT DETAILS - {props.patient.name.toUpperCase()}</h3>
        <button 
          onClick={props.onClose}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>NAME</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.name}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>PHONE</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{formatPhoneNumber(props.patient.phone)}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>DATE OF BIRTH</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>
            {(() => {
              if (!props.patient.dob) return 'N/A';
              try {
                const date = new Date(props.patient.dob);
                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
              } catch {
                return 'N/A';
              }
            })()}
          </p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>GENDER</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.gender || 'N/A'}</p>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>ADDRESS</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.address || 'N/A'}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>PRESCRIPTION DATE</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>
            {(() => {
              if (!props.patient.prescription_date) return 'N/A';
              try {
                const date = new Date(props.patient.prescription_date);
                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
              } catch {
                return 'N/A';
              }
            })()}
          </p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>SYMPTOMS</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.symptoms || 'N/A'}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>DIAGNOSIS</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.diagnosis || 'N/A'}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>LAB RESULTS</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.lab_results || 'N/A'}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>MEDICATION</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{props.patient.medication || 'N/A'}</p>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#d6ebfb', display: 'block', marginBottom: '4px' }}>PRESCRIPTION DATE</label>
          <p style={{ margin: '0', color: '#e8f6ff' }}>{new Date(props.patient.prescription_date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function DoctorSearchPanel(props: { query: string; rows: PatientSearchRow[]; onQuery: (value: string) => void; onSearch: () => void; session: SessionState }) {
  const [error, setError] = useState("");
  const [previousQuery, setPreviousQuery] = useState("");
  
  // Clear search results when query changes
  React.useEffect(() => {
    if (previousQuery && props.query !== previousQuery) {
      // Clear the rows when query changes
      props.onSearch();
    }
    setPreviousQuery(props.query);
  }, [props.query, previousQuery, props.onSearch]);
  
  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (props.query.trim().length < 2) {
      setError("Please enter at least 2 characters to search.");
      return;
    }
    setError("");
    props.onSearch();
  }
  
  return (
    <section>
      <h2>Search Patients</h2>
      
      <DoctorDetails session={props.session} />
      
      <form className="card form-stack" onSubmit={onSubmit}>
        <LabeledField id="doctor-search" label="Search Patient by Name" helpText="Use at least first 2 letters of patient name." value={props.query} onChange={props.onQuery} error={error} />
        <button type="submit">Search</button>
      </form>
      <PatientSearchResults rows={props.rows} onPatientSelect={() => {}} session={props.session} />
    </section>
  );
}

function AvailabilityPanel() {
  return (
    <section>
      <h2>Update Available Slots</h2>
      <div className="card">
        <p>Weekly availability grid is available in this panel. Booked slots remain read-only.</p>
      </div>
    </section>
  );
}

function DoctorManageAvailabilityPanel(props: { session: SessionState }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [availability, setAvailability] = useState<Array<{ slot_time: string; status: "AVAILABLE" | "BOOKED" | "BLOCKED" }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (message && messageType === "success") {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);

  useEffect(() => {
    if (props.session.accessToken) {
      loadAvailability();
    }
  }, [weekOffset, props.session.accessToken]);

  async function loadAvailability() {
    if (!props.session.accessToken) {
      setMessage("Authentication required");
      setMessageType("error");
      return;
    }
    
    setLoading(true);
    try {
      // Get current doctor's information
      const response = await fetch('http://127.0.0.1:8000/doctors/me', {
        headers: {
          'Authorization': `Bearer ${props.session.accessToken}`
        }
      });
      
      if (!response.ok) {
        console.error("Failed to fetch current doctor:", response.status, response.statusText);
        setMessage("Failed to load doctor information");
        setMessageType("error");
        return;
      }
      
      const doctor = await response.json();
      setCurrentDoctor(doctor);
      
      // Fetch all availability for the current doctor
      const availabilityResponse = await api.listAllDoctorAvailability(doctor.id, props.session.accessToken);
      setAvailability(availabilityResponse);
    } catch (error) {
      console.error("Failed to load availability:", error);
      setMessage("Failed to load availability");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  // Generate calendar similar to PatientAppointmentsPanel
  const today = new Date();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const calendar: Array<{ day: string; date: number; month: number; year: number; isWeekend: boolean; isPast: boolean }> = [];
  let offset = weekOffset * 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + offset);

  for (let i = 0; i < 7; i++) {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + i);
    calendar.push({
      day: weekDays[i],
      date: current.getDate(),
      month: current.getMonth() + 1,
      year: current.getFullYear(),
      isWeekend: i >= 5,  // Saturday=5, Sunday=6
      isPast: current < today && current.toDateString() !== today.toDateString()
    });
  }

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  async function toggleSlot(date: number, month: number, year: number, timeSlot: string) {
    // Convert to 24-hour format
    const [time, period] = timeSlot.split(" ");
    let hour = parseInt(time);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    
    // Create local datetime and convert to UTC
    const localDateTime = new Date(year, month - 1, date, hour, 0, 0);
    const utcISOString = localDateTime.toISOString();
    const localTimeString = `${year.toString().padStart(4, '0')}-${(month).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:00:00`;
    
    // Try to find the slot in different formats
    const existingSlot = availability.find(a => a.slot_time === utcISOString) || 
                         availability.find(a => a.slot_time === localTimeString);
    
    try {
      if (existingSlot?.status === "BLOCKED") {
        // Unblock the slot
        const blockReason = window.prompt("Enter reason for unblocking this slot:");
        if (blockReason === null) {
          // User cancelled
          return;
        }
        const response = await api.upsertDoctorAvailability(currentDoctor.id, utcISOString, true, props.session.accessToken, blockReason);
        setMessage("Slot unblocked successfully");
        setMessageType("success");
      } else if (existingSlot?.status === "AVAILABLE") {
        // Block the available slot
        const blockReason = window.prompt("Enter reason for blocking this slot:");
        if (blockReason === null) {
          // User cancelled
          return;
        }
        const response = await api.upsertDoctorAvailability(currentDoctor.id, utcISOString, false, props.session.accessToken, blockReason);
        setMessage("Slot blocked successfully");
        setMessageType("success");
      } else {
        // Add the slot as available
        const response = await api.upsertDoctorAvailability(currentDoctor.id, utcISOString, true, props.session.accessToken);
        setMessage("Slot added successfully");
        setMessageType("success");
      }
      
      // Refresh availability
      await loadAvailability();
    } catch (error) {
      console.error("Failed to update slot:", error);
      setMessage("Failed to update slot: " + (error.response?.data?.detail || error.message));
      setMessageType("error");
    }
  }

  return (
    <section>
      <h2>Manage Availability</h2>
      
      <DoctorDetails session={props.session} />
      
      <div className="card">
        <div className="calendar-nav">
          <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0}>
            Previous Week
          </button>
          <span>Week of {calendar[0]?.month}/{calendar[0]?.date} - {calendar[6]?.month}/{calendar[6]?.date}</span>
          <button onClick={() => setWeekOffset(weekOffset + 1)}>
            Next Week
          </button>
        </div>
        
        {message && (
          <div style={{ 
            padding: '12px', 
            margin: '16px 0', 
            backgroundColor: messageType === "error" ? '#ff90ab20' : '#1e40af', 
            color: messageType === "error" ? '#ff90ab' : 'white', 
            borderRadius: '8px',
            textAlign: 'center',
            border: messageType === "error" ? '1px solid #ff90ab' : 'none'
          }}>
            {message}
          </div>
        )}
        
        <table className="week-calendar" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'center', minWidth: '80px' }}>Time</th>
              {calendar.map(col => (
                <th key={col.day} style={{ padding: '8px', textAlign: 'center', minWidth: '120px' }}>
                  <div className="calendar-th-day">{col.day}</div>
                  <div className="calendar-th-date">
                    {String(col.month).padStart(2, '0')}/{String(col.date).padStart(2, '0')}/{col.year}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot}>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', minWidth: '80px' }}>{slot}</td>
                {calendar.map((col, colIdx) => {
                  const isSlotPast = col.isPast || (col.date === today.getDate() && col.month === today.getMonth() + 1 && col.year === today.getFullYear() && (() => {
                    const [time, period] = slot.split(" ");
                    let hour = parseInt(time);
                    if (period === "PM" && hour !== 12) hour += 12;
                    if (period === "AM" && hour === 12) hour = 0;
                    return hour < today.getHours();
                  })());
                  
                  const isoString = `${col.year.toString().padStart(4, '0')}-${(col.month).toString().padStart(2, '0')}-${col.date.toString().padStart(2, '0')}T${(() => {
                    const [time, period] = slot.split(" ");
                    let hour = parseInt(time);
                    if (period === "PM" && hour !== 12) hour += 12;
                    if (period === "AM" && hour === 12) hour = 0;
                    return hour.toString().padStart(2, '0');
                  })()}:00:00`;
                  
                  const slotAvailability = availability.find(a => a.slot_time === isoString);
                  const status = slotAvailability?.status || "EMPTY";
                  
                  return (
                    <td key={colIdx} style={{ padding: '8px', textAlign: 'center', minWidth: '120px', verticalAlign: 'top' }}>
                      {!isSlotPast && (
                        <button
                          className={`time-slot ${
                            status === "BOOKED" ? "patient-booked-slot" : 
                            status === "BLOCKED" ? "booked-slot" : 
                            status === "EMPTY" ? "empty-slot" :
                            "available-slot"
                          }`}
                          onClick={() => status !== "BOOKED" && toggleSlot(col.date, col.month, col.year, slot)}
                          disabled={status === "BOOKED"}
                          style={{
                            // Enhanced styling for empty slots to make them more visible
                            ...(status === "EMPTY" && {
                              border: '2px dashed #42b5f5',
                              backgroundColor: 'rgba(66, 181, 245, 0.1)',
                              color: '#42b5f5',
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '8px 4px',
                              minHeight: '40px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              borderRadius: '4px'
                            }),
                            // Enhanced styling for available slots
                            ...(status === "AVAILABLE" && {
                              backgroundColor: 'rgba(73, 215, 194, 0.2)',
                              border: '2px solid #49d7c2',
                              color: '#49d7c2',
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '8px 4px',
                              minHeight: '40px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              borderRadius: '4px'
                            })
                          }}
                          onMouseEnter={(e) => {
                            if (status === "EMPTY") {
                              e.currentTarget.style.backgroundColor = 'rgba(66, 181, 245, 0.2)';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (status === "EMPTY") {
                              e.currentTarget.style.backgroundColor = 'rgba(66, 181, 245, 0.1)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }
                          }}
                        >
                          {status === "BOOKED" ? "Patient Booked" : 
                           status === "BLOCKED" ? "Blocked" : 
                           status === "EMPTY" ? "Click to Add" : 
                           "Available"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AdminPatientRegisterPanel(props: { session: SessionState }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("USA");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    
    if (fullName.trim().length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    }
    if (!validateEmail(email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    if (password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters.";
    }
    
    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 120);
      
      if (dob > today) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      } else if (dob < maxDate) {
        nextErrors.dateOfBirth = "Date of birth cannot be more than 120 years ago.";
      }
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await api.registerPatient({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country || undefined,
        insuranceProvider: insuranceProvider.trim() || undefined,
        insurancePolicyNumber: insurancePolicyNumber.trim() || undefined
      });
      
      alert("Patient registered successfully!");
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setDateOfBirth("");
      setGender("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("USA");
      setInsuranceProvider("");
      setInsurancePolicyNumber("");
    } catch (error) {
      console.error("Failed to register patient:", error);
      alert("Failed to register patient. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Register Patient</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        <LabeledField id="admin-register-patient-name" label="Full Name" helpText="Name must be 3-80 characters." value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="off" />
        <LabeledField id="admin-register-patient-email" label="Email" helpText="Use a valid email format, e.g., name@example.com." value={email} onChange={setEmail} error={errors.email} autoComplete="off" />
        <LabeledField id="admin-register-patient-phone" label="Phone" helpText="Use 10-15 digits. Country code allowed." value={phone} onChange={setPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id="admin-register-patient-password" label="Password" helpText="Minimum 5 characters." value={password} onChange={setPassword} type="password" error={errors.password} autoComplete="new-password" />
        <LabeledField id="admin-register-patient-date-of-birth" label="Date of Birth" helpText="Format: MM/DD/YYYY (optional, max age 120 years)." value={dateOfBirth} onChange={setDateOfBirth} type="date" autoComplete="off" error={errors.dateOfBirth} />
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="admin-register-patient-gender">Gender</label>
          </div>
          <select 
            id="admin-register-patient-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            <option value="">Select Gender (Optional)</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <LabeledField id="admin-register-patient-address-line1" label="Address Line 1" helpText="Street address (optional)." value={addressLine1} onChange={setAddressLine1} autoComplete="off" />
        <LabeledField id="admin-register-patient-address-line2" label="Address Line 2" helpText="Apartment, suite, unit, building, floor, etc. (optional)." value={addressLine2} onChange={setAddressLine2} autoComplete="off" />
        <LabeledField id="admin-register-patient-city" label="City" helpText="City name (optional)." value={city} onChange={setCity} autoComplete="off" />
        <LabeledField id="admin-register-patient-state" label="State/Province" helpText="State or province (optional)." value={state} onChange={setState} autoComplete="off" />
        <LabeledField id="admin-register-patient-postal-code" label="Postal Code" helpText="ZIP or postal code (optional)." value={postalCode} onChange={setPostalCode} autoComplete="off" />
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="admin-register-patient-country">Country</label>
          </div>
          <select 
            id="admin-register-patient-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <LabeledField id="admin-register-patient-insurance" label="Insurance Provider" helpText="Insurance company name (optional)." value={insuranceProvider} onChange={setInsuranceProvider} autoComplete="off" />
        <LabeledField id="admin-register-patient-policy" label="Policy Number" helpText="Insurance policy number (optional)." value={insurancePolicyNumber} onChange={setInsurancePolicyNumber} autoComplete="off" />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register Patient"}</button>
      </form>
    </section>
  );
}

function AdminDoctorRegisterPanel(props: { session: SessionState }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    
    if (fullName.trim().length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    }
    if (!validateEmail(email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    if (password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters.";
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await api.registerDoctor({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        specialty: specialty.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined
      });
      
      alert("Doctor registered successfully!");
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSpecialty("");
      setLicenseNumber("");
    } catch (error) {
      console.error("Failed to register doctor:", error);
      alert("Failed to register doctor. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Register Doctor</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        <LabeledField id="admin-register-doctor-name" label="Full Name" helpText="Name must be 3-80 characters." value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="off" />
        <LabeledField id="admin-register-doctor-email" label="Email" helpText="Use a valid email format, e.g., name@example.com." value={email} onChange={setEmail} error={errors.email} autoComplete="off" />
        <LabeledField id="admin-register-doctor-phone" label="Phone" helpText="Use 10-15 digits. Country code allowed." value={phone} onChange={setPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id="admin-register-doctor-password" label="Password" helpText="Minimum 5 characters." value={password} onChange={setPassword} type="password" error={errors.password} autoComplete="new-password" />
        <LabeledField id="admin-register-doctor-specialty" label="Specialty" helpText="Medical specialty (optional)." value={specialty} onChange={setSpecialty} autoComplete="off" />
        <LabeledField id="admin-register-doctor-license-number" label="License Number" helpText="Medical license number (optional)." value={licenseNumber} onChange={setLicenseNumber} autoComplete="off" />
        <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register Doctor"}</button>
      </form>
    </section>
  );
}

function SimpleRegisterPanel(props: { title: string; onSubmit: (payload: any) => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (fullName.trim().length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    }
    if (!validateEmail(email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    if (password.length < 5) {
      nextErrors.password = "Password must be at least 5 characters.";
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    await props.onSubmit({ 
      fullName, 
      email, 
      phone, 
      password, 
      specialty: specialty.trim() || undefined, 
      licenseNumber: licenseNumber.trim() || undefined
    });
  }

  return (
    <section>
      <h2>{props.title}</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        <LabeledField id={`${props.title}-full-name`} label="Full Name" helpText="Name must be 3-80 characters." value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="off" />
        <LabeledField id={`${props.title}-email`} label="Email" helpText="Use a valid email format, e.g., name@example.com." value={email} onChange={setEmail} error={errors.email} autoComplete="off" />
        <LabeledField id={`${props.title}-phone`} label="Phone" helpText="Use 10-15 digits. Country code allowed." value={phone} onChange={setPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id={`${props.title}-password`} label="Password" helpText="Minimum 5 characters." value={password} onChange={setPassword} error={errors.password} type="password" autoComplete="new-password" />
        {props.title.includes("Doctor") && (
          <>
            <LabeledField id={`${props.title}-specialty`} label="Specialty" helpText="Medical specialty (optional)." value={specialty} onChange={setSpecialty} autoComplete="off" />
            <LabeledField id={`${props.title}-license-number`} label="License Number" helpText="Medical license number (optional)." value={licenseNumber} onChange={setLicenseNumber} autoComplete="off" />
          </>
        )}
        <button type="submit">Register</button>
      </form>
    </section>
  );
}

function AdminDashboardPanel(props: { users: AdminUserRow[]; reports: Record<string, string | number>; onLoad: () => void; setStatus: (message: string) => void; session: SessionState }) {
  // Auto-load dashboard data on component mount
  useEffect(() => {
    if (props.session.accessToken && props.users.length === 0 && Object.keys(props.reports).length === 0) {
      props.onLoad();
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}/soft-delete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${props.session.accessToken}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        props.setStatus(result.message);
        props.onLoad(); // Reload the dashboard
      } else {
        props.setStatus(result.detail || "Failed to delete user");
      }
    } catch (error) {
      props.setStatus("Failed to delete user");
    }
  };

  // Sort users: Patients first, then Doctors, then Admins, all alphabetically by name
  const sortedUsers = [...props.users].sort((a, b) => {
    // Role priority: PATIENT (1), DOCTOR (2), ADMIN (3)
    const rolePriority = { PATIENT: 1, DOCTOR: 2, ADMIN: 3 };
    const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 4;
    const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 4;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Same role, sort by name alphabetically
    return a.name.localeCompare(b.name);
  });

  return (
    <section>
      <h2>System Dashboard</h2>
      <div className="card">
        <h3>System Reports</h3>
        <div className="report-grid">
          <div className="report-item">
            <h4>Monthly Patient Count</h4>
            <p className="report-value">{props.reports.monthly_patient_count || 0}</p>
          </div>
          <div className="report-item">
            <h4>Total Diagnoses</h4>
            <p className="report-value">{props.reports.diagnosis_frequency || 0}</p>
          </div>
          <div className="report-item">
            <h4>Doctor Utilization Rate</h4>
            <p className="report-value">{props.reports.doctor_utilization_rate || 0}</p>
          </div>
        </div>
      </div>
      <div className="card">
        <h3>Users</h3>
        {sortedUsers.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.role !== "ADMIN" && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ 
                            padding: "4px 8px", 
                            fontSize: "12px", 
                            backgroundColor: "#dc3545", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "4px", 
                            cursor: "pointer" 
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function DataTableCard(props: { title: string; rows: Array<Record<string, unknown>> }) {
  const columns = props.rows.length ? Object.keys(props.rows[0]) : [];

  return (
    <div className="card">
      <h3>{props.title}</h3>
      {props.rows.length === 0 ? (
        <p className="muted">No records found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column}`}>{String(row[column] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DoctorProfilePanel(props: { session: SessionState }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load current doctor data on component mount
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        const data = await api.getDoctorProfile(props.session.accessToken);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setSpecialty(data.specialty || "");
        setLicenseNumber(data.license_number || "");
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
        alert("Failed to load your profile. Please try again.");
      }
    };

    if (props.session.accessToken) {
      loadDoctorData();
    }
  }, [props.session.accessToken]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    
    if (fullName.trim().length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await api.updateDoctorProfile(props.session.accessToken, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        specialty: specialty.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined
      });
      
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
        // Navigate to Today's Appointments page after successful update
        navigate("/doctors/today-appointments");
      }, 1500);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Update Profile</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        {successMessage && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#1e40af',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        
        <LabeledField id="profile-full-name" label="Full Name" helpText="Name must be 3-80 characters." value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="off" />
        <LabeledField id="profile-phone" label="Phone" helpText="Use 10-15 digits. Country code allowed." value={phone} onChange={setPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id="profile-specialty" label="Specialty" helpText="Medical specialty (optional)." value={specialty} onChange={setSpecialty} autoComplete="off" />
        <LabeledField id="profile-license-number" label="License Number" helpText="Medical license number (optional)." value={licenseNumber} onChange={setLicenseNumber} autoComplete="off" />
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            type="submit" 
            className="button" 
            disabled={loading}
            style={{
              flex: '1',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PatientProfilePanel(props: { session: SessionState }) {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("USA");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Function to refresh patient details in the parent component
  const refreshPatientDetails = async () => {
    try {
      const data = await api.getCurrentPatient(props.session.accessToken);
      // Update the global patientDetails state by triggering a re-render
      window.dispatchEvent(new CustomEvent('patientDetailsRefresh', { detail: data }));
    } catch (error) {
      console.error("Failed to refresh patient details:", error);
    }
  };

  // Load current patient data on component mount
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        const data = await api.getPatientProfile(props.session.accessToken);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setDateOfBirth(data.date_of_birth || "");
        setGender(data.gender || "");
        setAddressLine1(data.address_line1 || "");
        setAddressLine2(data.address_line2 || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPostalCode(data.postal_code || "");
        setCountry(data.country || "USA");
        setInsuranceProvider(data.insurance_provider || "");
        setInsurancePolicyNumber(data.insurance_policy_number || "");
      } catch (error) {
        console.error("Failed to load patient profile:", error);
        alert("Failed to load your profile. Please try again.");
      }
    };

    if (props.session.accessToken) {
      loadPatientData();
    }
  }, [props.session.accessToken]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    
    if (fullName.trim().length < 3) {
      nextErrors.fullName = "Name must be at least 3 characters.";
    }
    if (!/^\+?[0-9\-\s]{10,15}$/.test(phone)) {
      nextErrors.phone = "Phone should be 10-15 digits.";
    }
    
    // Validate date of birth if provided
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 120);
      
      if (dob > today) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      } else if (dob < maxDate) {
        nextErrors.dateOfBirth = "Date of birth cannot be more than 120 years ago.";
      }
    }
    
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await api.updatePatientProfile(props.session.accessToken, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        addressLine1: addressLine1.trim() || undefined,
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        country: country || undefined,
        insuranceProvider: insuranceProvider.trim() || undefined,
        insurancePolicyNumber: insurancePolicyNumber.trim() || undefined
      });
      
      setSuccessMessage("Profile updated successfully!");
      refreshPatientDetails(); // Refresh patient details without logout
      setTimeout(() => {
        setSuccessMessage("");
        // Navigate to Schedule Appointments page after successful update
        navigate("/patients/appointments");
      }, 1500);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Update Profile</h2>
      <form className="card form-stack" onSubmit={handleSubmit}>
        {successMessage && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#1e40af',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        
        <LabeledField id="profile-full-name" label="Full Name" helpText="Name must be 3-80 characters." value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="off" />
        <LabeledField id="profile-phone" label="Phone" helpText="Use 10-15 digits. Country code allowed." value={phone} onChange={setPhone} error={errors.phone} autoComplete="off" />
        <LabeledField id="profile-date-of-birth" label="Date of Birth" helpText="Format: MM/DD/YYYY (optional, max age 120 years)." value={dateOfBirth} onChange={setDateOfBirth} type="date" autoComplete="off" error={errors.dateOfBirth} />
        
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="profile-gender">Gender</label>
          </div>
          <select 
            id="profile-gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            <option value="">Select Gender (Optional)</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        
        <LabeledField id="profile-address-line1" label="Address Line 1" helpText="Street address (optional)." value={addressLine1} onChange={setAddressLine1} autoComplete="off" />
        <LabeledField id="profile-address-line2" label="Address Line 2" helpText="Apartment, suite, unit, building, floor, etc. (optional)." value={addressLine2} onChange={setAddressLine2} autoComplete="off" />
        <LabeledField id="profile-city" label="City" helpText="City name (optional)." value={city} onChange={setCity} autoComplete="off" />
        <LabeledField id="profile-state" label="State/Province" helpText="State or province (optional)." value={state} onChange={setState} autoComplete="off" />
        <LabeledField id="profile-postal-code" label="Postal Code" helpText="ZIP or postal code (optional)." value={postalCode} onChange={setPostalCode} autoComplete="off" />
        
        <div className="form-field">
          <div className="label-row">
            <label htmlFor="profile-country">Country</label>
          </div>
          <select 
            id="profile-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              padding: '11px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              fontSize: '14px',
              background: 'rgba(9, 35, 55, 0.82)',
              color: '#eef8ff',
              width: '100%'
            }}
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <LabeledField id="profile-insurance-provider" label="Insurance Provider" helpText="Insurance company name (optional)." value={insuranceProvider} onChange={setInsuranceProvider} autoComplete="off" />
        <LabeledField id="profile-insurance-policy" label="Policy Number" helpText="Insurance policy number (optional)." value={insurancePolicyNumber} onChange={setInsurancePolicyNumber} autoComplete="off" />
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            type="submit" 
            className="button" 
            disabled={loading}
            style={{
              flex: '1',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </section>
  );
}
