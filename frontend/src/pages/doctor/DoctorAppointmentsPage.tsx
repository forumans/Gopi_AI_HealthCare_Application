import type { DoctorAppointmentRow } from "../../types";

interface DoctorAppointmentsPageProps {
  fromDate: string;
  appointments: DoctorAppointmentRow[];
  recordPatientId: string;
  recordDiagnosis: string;
  recordNotes: string;
  onFromDateChange: (value: string) => void;
  onLoad: () => void;
  onRecordPatientIdChange: (value: string) => void;
  onRecordDiagnosisChange: (value: string) => void;
  onRecordNotesChange: (value: string) => void;
  onSaveRecord: () => void;
}

export function DoctorAppointmentsPage(props: DoctorAppointmentsPageProps) {
  return (
    <section>
      <h2>Doctor Appointments</h2>
      <div className="inline-form">
        <input
          placeholder="from_date (YYYY-MM-DD)"
          value={props.fromDate}
          onChange={(event) => props.onFromDateChange(event.target.value)}
        />
        <button onClick={props.onLoad}>Load Weekly Appointments</button>
      </div>

      <pre>{JSON.stringify(props.appointments, null, 2)}</pre>

      <h3>Save Medical Record</h3>
      <div className="inline-form">
        <input
          placeholder="Patient ID"
          value={props.recordPatientId}
          onChange={(event) => props.onRecordPatientIdChange(event.target.value)}
        />
        <input
          placeholder="Diagnosis"
          value={props.recordDiagnosis}
          onChange={(event) => props.onRecordDiagnosisChange(event.target.value)}
        />
        <input placeholder="Notes" value={props.recordNotes} onChange={(event) => props.onRecordNotesChange(event.target.value)} />
        <button onClick={props.onSaveRecord}>Save Medical Record</button>
      </div>
    </section>
  );
}
