import type { FormEvent } from "react";

interface PasswordPageProps {
  forgotEmail: string;
  resetToken: string;
  newPassword: string;
  onForgotEmailChange: (value: string) => void;
  onResetTokenChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onForgotSubmit: (event: FormEvent) => void;
  onResetSubmit: (event: FormEvent) => void;
}

export function PasswordPage(props: PasswordPageProps) {
  return (
    <section>
      <h2>Forgot / Reset Password</h2>
      <form onSubmit={props.onForgotSubmit} className="inline-form">
        <input
          placeholder="Email for reset"
          value={props.forgotEmail}
          onChange={(event) => props.onForgotEmailChange(event.target.value)}
        />
        <button type="submit">Send Reset Link</button>
      </form>

      <form onSubmit={props.onResetSubmit} className="inline-form">
        <input placeholder="Reset Token" value={props.resetToken} onChange={(event) => props.onResetTokenChange(event.target.value)} />
        <input
          type="password"
          placeholder="New Password"
          value={props.newPassword}
          onChange={(event) => props.onNewPasswordChange(event.target.value)}
        />
        <button type="submit">Reset Password</button>
      </form>
    </section>
  );
}
