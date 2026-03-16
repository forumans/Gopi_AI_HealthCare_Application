interface DoctorSlotsPageProps {
  slot: string;
  available: boolean;
  onSlotChange: (value: string) => void;
  onAvailableChange: (value: boolean) => void;
  onUpdate: () => void;
}

export function DoctorSlotsPage(props: DoctorSlotsPageProps) {
  return (
    <section>
      <h2>Update Available Slots</h2>
      <div className="inline-form">
        <input placeholder="Slot ISO datetime" value={props.slot} onChange={(event) => props.onSlotChange(event.target.value)} />
        <label>
          Available
          <input type="checkbox" checked={props.available} onChange={(event) => props.onAvailableChange(event.target.checked)} />
        </label>
        <button onClick={props.onUpdate}>Update Slot</button>
      </div>
    </section>
  );
}
