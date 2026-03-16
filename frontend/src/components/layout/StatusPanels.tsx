interface StatusPanelsProps {
  breadcrumb: string;
  status: string;
}

export function StatusPanels({ breadcrumb, status }: StatusPanelsProps) {
  return (
    <>
      <div className="breadcrumb">{breadcrumb}</div>
      <div className="status">{status}</div>
    </>
  );
}
