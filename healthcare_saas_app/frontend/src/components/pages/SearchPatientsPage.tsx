/**
 * Search Patients Page Component
 * Allows doctors to search for patients by name and view their medical history
 * Follows the same patterns as the original DoctorSearchPanel and PatientSearchResults
 */

import React, { useState, useEffect } from "react";
import { api } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import { parseErrorMessage } from "../../utils";
import { LabeledField } from "../common/LabeledField";
import type { SessionState, PatientSearchRow } from "../../types";

interface SearchPatientsPageProps {
  auth: any;
  appointments: any;
}

// DoctorDetails component (same as in other pages)
function DoctorDetails({ session, auth }: { session: SessionState; auth: any }) {
  const [doctorData, setDoctorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        // Use /doctor/profile endpoint to get complete doctor data (includes phone)
        const data = await api.getDoctorProfile(session.accessToken);
        console.log('🔍 DEBUG: Doctor data from /doctor/profile:', data);
        setDoctorData(data);
      } catch (err) {
        console.error("Failed to load doctor data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session.accessToken) {
      loadDoctorData();
    }
  }, [session.accessToken]);

  if (loading) {
    return <div>Loading doctor information...</div>;
  }

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3>Doctor Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div>
          <strong>Name:</strong> {doctorData?.full_name || doctorData?.name || 'N/A'}
        </div>
        <div>
          <strong>Phone:</strong> {doctorData?.phone || 'N/A'}
        </div>
        <div>
          <strong>Specialization:</strong> {doctorData?.specialty || 'N/A'}
        </div>
        <div>
          <strong>License Number:</strong> {doctorData?.license_number || 'N/A'}
        </div>
      </div>
    </div>
  );
}

// PatientSearchResults component
function PatientSearchResults({ rows, session }: { rows: PatientSearchRow[]; session: SessionState }) {
  // Debug: Log the first row to see what data we're getting
  useEffect(() => {
    if (rows.length > 0) {
      console.log("DEBUG - Frontend received first patient:", rows[0]);
      console.log("DEBUG - DOB:", rows[0].dob, "Gender:", rows[0].gender);
    }
  }, [rows]);

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
  const uniquePatients = rows.reduce((acc: any[], row) => {
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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    uniquePatients.length > 0 ? uniquePatients[0].id : null
  );

  // State for additional prescriptions
  const [additionalPrescriptions, setAdditionalPrescriptions] = useState<PatientSearchRow[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Filter rows to show only the selected patient's prescriptions
  const allFilteredRows = selectedPatientId 
    ? rows
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
  useEffect(() => {
    if (uniquePatients.length > 0 && (!selectedPatientId || !uniquePatients.find(p => p.id === selectedPatientId))) {
      setSelectedPatientId(uniquePatients[0].id);
      setShowMore(false);
      setAdditionalPrescriptions([]);
    }
  }, [uniquePatients, selectedPatientId]);

  // Handle loading more prescriptions
  const handleLoadMorePrescriptions = async () => {
    if (!selectedPatientId || !session.accessToken) return;
    
    setLoadingMore(true);
    try {
      const allPrescriptions = await api.getAllPatientPrescriptions(session.accessToken, selectedPatientId);
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
    <div className="card" style={{ padding: '20px' }}>
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
      
      {rows.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No records found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#1e293b', color: '#eef8ff', borderBottom: '1px solid #334155' }}>PRESCRIPTION DATE</th>
                <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#1e293b', color: '#eef8ff', borderBottom: '1px solid #334155' }}>SYMPTOMS</th>
                <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#1e293b', color: '#eef8ff', borderBottom: '1px solid #334155' }}>DIAGNOSIS</th>
                <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#1e293b', color: '#eef8ff', borderBottom: '1px solid #334155' }}>LAB RESULTS</th>
                <th style={{ padding: '12px', textAlign: 'left', backgroundColor: '#1e293b', color: '#eef8ff', borderBottom: '1px solid #334155' }}>MEDICATION</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => (
                <tr key={`${row.id}-${row.prescription_date}-${index}`} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.5)' }}>
                  <td style={{ padding: '12px', color: '#eef8ff', borderBottom: '1px solid #334155' }}>
                    {row.prescription_date ? new Date(row.prescription_date).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#eef8ff', borderBottom: '1px solid #334155' }}>
                    {row.symptoms || '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#eef8ff', borderBottom: '1px solid #334155' }}>
                    {row.diagnosis || '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#eef8ff', borderBottom: '1px solid #334155' }}>
                    {row.lab_results || '-'}
                  </td>
                  <td style={{ padding: '12px', color: '#eef8ff', borderBottom: '1px solid #334155' }}>
                    {row.medication || '-'}
                  </td>
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
              background: loadingMore ? '#94a3b8' : '#42b5f5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontSize: '13px'
            }}
          >
            {loadingMore ? 'Loading...' : `View More Prescriptions for ${selectedPatient?.name || 'Patient'}`}
          </button>
        </div>
      )}
    </div>
  );
}

export function SearchPatientsPage({ auth, appointments }: SearchPatientsPageProps) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<PatientSearchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previousQuery, setPreviousQuery] = useState("");

  // Clear search results when query changes
  useEffect(() => {
    if (previousQuery && query !== previousQuery) {
      // Clear the rows when query changes
      setRows([]);
    }
    setPreviousQuery(query);
  }, [query, previousQuery]);

  async function searchPatients() {
    if (!auth.session.accessToken) {
      setError("Authentication required");
      return;
    }

    if (query.trim().length < 2) {
      setError("Please enter at least 2 characters to search.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const results = await api.searchPatients(auth.session.accessToken, query);
      setRows(results);
    } catch (error) {
      console.error("Search failed:", error);
      setError(parseErrorMessage(error));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    searchPatients();
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2>Search Patients</h2>
      
      <DoctorDetails session={auth.session} auth={auth} />
      
      <form className="card" style={{ padding: '20px' }} onSubmit={onSubmit}>
        <LabeledField 
          id="doctor-search" 
          label="Search Patient by Name" 
          helpText="Use at least first 2 letters of patient name." 
          value={query} 
          onChange={setQuery} 
          error={error} 
        />
        <button 
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            backgroundColor: loading ? '#94a3b8' : '#42b5f5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '16px'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      <PatientSearchResults rows={rows} session={auth.session} />
    </section>
  );
}
