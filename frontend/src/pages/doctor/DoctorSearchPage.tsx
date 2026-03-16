import type { PatientSearchRow } from "../../types";

interface DoctorSearchPageProps {
  query: string;
  rows: PatientSearchRow[];
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

export function DoctorSearchPage(props: DoctorSearchPageProps) {
  return (
    <section>
      <h2>Search Patients</h2>
      <div className="inline-form">
        <input placeholder="Patient Name" value={props.query} onChange={(event) => props.onQueryChange(event.target.value)} />
        <button onClick={props.onSearch}>Search</button>
      </div>
      <pre>{JSON.stringify(props.rows, null, 2)}</pre>
    </section>
  );
}
