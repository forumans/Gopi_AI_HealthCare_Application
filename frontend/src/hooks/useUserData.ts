/**
 * User Data Hook
 * Manages user profile data, patient details, doctor details, and admin data
 * Provides centralized user data management logic
 */

import { useState, useEffect } from "react";
import { api } from "../api";
import { parseErrorMessage } from "../utils";
import type { 
  AdminUserRow, 
  SessionState,
  Role 
} from "../types/app";

export function useUserData(session: SessionState) {
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  const [adminDetails, setAdminDetails] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [adminReports, setAdminReports] = useState<Record<string, string | number>>({});

  // Load patient details when patient logs in
  useEffect(() => {
    if (session.role === "PATIENT" && session.accessToken) {
      loadPatientDetails();
    }
  }, [session.role, session.accessToken]);

  // Load doctor details when doctor logs in
  useEffect(() => {
    if (session.role === "DOCTOR" && session.accessToken) {
      loadDoctorDetails();
    }
  }, [session.role, session.accessToken]);

  // Load admin details when admin logs in
  useEffect(() => {
    if (session.role === "ADMIN" && session.accessToken) {
      loadAdminDetails();
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

  /**
   * Loads current patient details
   */
  async function loadPatientDetails() {
    try {
      const details = await api.getCurrentPatient(session.accessToken);
      setPatientDetails(details);
    } catch (error) {
      console.error("Failed to load patient details:", error);
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Loads current doctor details
   */
  async function loadDoctorDetails() {
    try {
      const response = await fetch('http://127.0.0.1:8000/doctors/me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      });
      const data = await response.json();
      setDoctorDetails(data);
    } catch (error) {
      console.error("Failed to load doctor details:", error);
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Loads admin details (uses session data)
   */
  async function loadAdminDetails() {
    setAdminDetails({
      name: session.userName || 'Admin',
      email: 'admin@healthsphere.com',
      role: session.role
    });
  }

  /**
   * Loads admin dashboard data
   */
  async function loadAdminDashboard() {
    try {
      console.log("Loading admin dashboard with token:", session.accessToken ? "Present" : "Missing");
      const [users, reports] = await Promise.all([
        api.listAdminUsers(session.accessToken, 1, 25),
        api.reports(session.accessToken),
      ]);
      setAdminUsers(users);
      setAdminReports(reports);
      
      const patientCount = typeof reports.monthly_patient_count === 'string' 
        ? parseInt(reports.monthly_patient_count, 10) 
        : reports.monthly_patient_count || 0;
      const diagnosisCount = typeof reports.diagnosis_frequency === 'string' 
        ? parseInt(reports.diagnosis_frequency, 10) 
        : reports.diagnosis_frequency || 0;
      const utilization = typeof reports.doctor_utilization_rate === 'string' 
        ? parseFloat(reports.doctor_utilization_rate) 
        : reports.doctor_utilization_rate || 0;
      
      return {
        usersCount: users.length,
        patientCount,
        diagnosisCount,
        utilization
      };
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
      throw new Error(`Failed to load dashboard: ${parseErrorMessage(error)}`);
    }
  }

  /**
   * Registers a new user (admin function)
   */
  async function registerByAdmin(role: "DOCTOR" | "PATIENT" | "ADMIN", payload: any) {
    try {
      // Special case: Allow first admin registration without authentication
      if (role === "ADMIN" && session.role === "GUEST") {
        await api.registerAdmin({
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
        });
        return "Admin registration successful! Please login.";
      }
      
      const result = await api.adminCreateUser(session.accessToken, payload);
      await loadAdminDashboard();
      return "Registration successful";
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Gets doctor profile
   */
  async function getDoctorProfile() {
    try {
      return await api.getDoctorProfile(session.accessToken);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Updates doctor profile
   */
  async function updateDoctorProfile(payload: any) {
    try {
      const result = await api.updateDoctorProfile(session.accessToken, payload);
      await loadDoctorDetails(); // Refresh details after update
      return result;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Gets patient profile
   */
  async function getPatientProfile() {
    try {
      return await api.getPatientProfile(session.accessToken);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Updates patient profile
   */
  async function updatePatientProfile(payload: any) {
    try {
      const result = await api.updatePatientProfile(session.accessToken, payload);
      await loadPatientDetails(); // Refresh details after update
      return result;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  }

  /**
   * Clears all user data
   */
  function clearUserData() {
    setPatientDetails(null);
    setDoctorDetails(null);
    setAdminDetails(null);
    setAdminUsers([]);
    setAdminReports({});
  }

  return {
    // State
    patientDetails,
    doctorDetails,
    adminDetails,
    adminUsers,
    adminReports,
    
    // Actions
    setPatientDetails,
    setDoctorDetails,
    setAdminDetails,
    setAdminUsers,
    setAdminReports,
    
    // API functions
    loadPatientDetails,
    loadDoctorDetails,
    loadAdminDetails,
    loadAdminDashboard,
    registerByAdmin,
    getDoctorProfile,
    updateDoctorProfile,
    getPatientProfile,
    updatePatientProfile,
    clearUserData,
  };
}
