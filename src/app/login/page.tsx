import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="container narrow" style={{ maxWidth: 420 }}>
      <div className="card" style={{ marginTop: "3rem" }}>
        <h1 style={{ fontSize: "1.3rem" }}>Log in to Dr. Dash</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Demo accounts: <code>student1@drdash.test</code>,{" "}
          <code>instructor@drdash.test</code> — password{" "}
          <code>drdash-demo</code>.
        </p>
      </div>
    </div>
  );
}
