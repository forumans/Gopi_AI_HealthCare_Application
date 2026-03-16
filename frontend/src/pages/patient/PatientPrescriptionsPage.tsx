import type { PatientSearchRow } from "../../types";

interface PatientPrescriptionsPageProps {
  rows: PatientSearchRow[];
  onLoad: () => void;
}

export function PatientPrescriptionsPage({ rows, onLoad }: PatientPrescriptionsPageProps) {
  return (
    <section>
      <h2>Prescriptions</h2>
      <button onClick={onLoad}>Load Last 10 Prescriptions</button>
      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </section>
  );
}
