"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) {
      const next = params.get("next");
      // Same-origin paths only: "//host" is protocol-relative (open redirect).
      const safe = next && next.startsWith("/") && !next.startsWith("//");
      router.push(safe ? next : "/");
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Login failed");
    }
  }

  return (
    <form onSubmit={submit} data-testid="login-form">
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          data-testid="login-email"
          required
        />
      </label>
      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          data-testid="login-password"
          required
        />
      </label>
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn-primary" disabled={busy} data-testid="login-submit">
        {busy ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
