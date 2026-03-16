import type { Role } from "../../types";

interface HeaderProps {
  role: Role;
  tenantId: string;
  onNav: (view: string) => void;
}

export function Header({ role, tenantId, onNav }: HeaderProps) {
  return (
    <>
      <h1>Healthcare SaaS</h1>
      <p className="subtitle">React + TypeScript frontend, FastAPI backend preserved.</p>

      <div className="chips">
        <span>Role: {role}</span>
        <span>Tenant: {tenantId || "-"}</span>
      </div>

      <div className="quick-nav">
        <button onClick={() => onNav("home")}>Home</button>
        <button onClick={() => onNav("register")}>Register</button>
        <button onClick={() => onNav("login")}>Login</button>
        <button onClick={() => onNav("password")}>Password</button>
        <button onClick={() => onNav("patient-schedule")}>Patient</button>
        <button onClick={() => onNav("doctor")}>Doctor</button>
        <button onClick={() => onNav("admin")}>Admin</button>
      </div>
    </>
  );
}
