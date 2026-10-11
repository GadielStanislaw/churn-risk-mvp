import { useState, type FormEvent } from "react";
import "./LoginForm.css";

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export function LoginForm({ onLogin, loading, error }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onLogin(username, password);
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>Churn Risk Dashboard</h1>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="login-form__error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
