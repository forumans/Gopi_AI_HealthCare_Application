import type { FormEvent } from "react";

interface LoginPageProps {
  loginEmail: string;
  loginPassword: string;
  onLoginEmailChange: (value: string) => void;
  onLoginPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onSignOut: () => void;
}

export function LoginPage(props: LoginPageProps) {
  const { loginEmail, loginPassword, onLoginEmailChange, onLoginPasswordChange, onSubmit, onSignOut } = props;
  return (
    <section>
      <h2>Login</h2>
      <form onSubmit={onSubmit} className="grid-form">
        <input placeholder="Email" value={loginEmail} onChange={(event) => onLoginEmailChange(event.target.value)} />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(event) => onLoginPasswordChange(event.target.value)}
        />
        <button type="submit">Sign In</button>
        <button type="button" onClick={onSignOut}>
          Sign Out
        </button>
      </form>
    </section>
  );
}
