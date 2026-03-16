import type { AppointmentRow } from "../../types";

interface PatientSchedulePageProps {
  fromDate: string;
  doctorId: string;
  slot: string;
  reason: string;
  cancelAppointmentId: string;
  appointments: AppointmentRow[];
  onFromDateChange: (value: string) => void;
  onDoctorIdChange: (value: string) => void;
  onSlotChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onCancelAppointmentIdChange: (value: string) => void;
  onLoadWeeklySchedule: () => void;
  onBookSlot: () => void;
  onCancelAppointment: () => void;
}

export function PatientSchedulePage(props: PatientSchedulePageProps) {
  return (
    <section>
      <h2>Schedule / Cancel Appointment</h2>
      <div className="inline-form">
        <input
          placeholder="from_date (YYYY-MM-DD)"
          value={props.fromDate}
          onChange={(event) => props.onFromDateChange(event.target.value)}
        />
        <button onClick={props.onLoadWeeklySchedule}>Load Weekly Schedule</button>
      </div>

      <div className="inline-form">
        <input placeholder="Doctor ID" value={props.doctorId} onChange={(event) => props.onDoctorIdChange(event.target.value)} />
        <input placeholder="Slot ISO datetime" value={props.slot} onChange={(event) => props.onSlotChange(event.target.value)} />
        <input placeholder="Reason" value={props.reason} onChange={(event) => props.onReasonChange(event.target.value)} />
        <button onClick={props.onBookSlot}>Book Slot</button>
      </div>

      <div className="inline-form">
        <input
          placeholder="Appointment ID"
          value={props.cancelAppointmentId}
          onChange={(event) => props.onCancelAppointmentIdChange(event.target.value)}
        />
        <button onClick={props.onCancelAppointment}>Cancel Appointment</button>
      </div>

      <pre>{JSON.stringify(props.appointments, null, 2)}</pre>
    </section>
  );
}
