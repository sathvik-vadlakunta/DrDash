"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateCourseForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/v1/courses", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name }),
          });
          if (res.ok) {
            setName("");
            router.refresh();
          } else {
            const body = await res.json().catch(() => null);
            setError(body?.error ?? "Failed to create course");
          }
        } catch {
          setError("Network error — try again.");
        } finally {
          setBusy(false);
        }
      }}
      style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", flexWrap: "wrap" }}
    >
      <label className="field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
        <span>Course name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Econ 101 — Fall 2026"
          data-testid="course-name"
          required
        />
      </label>
      <button className="btn btn-primary" disabled={busy} data-testid="course-create">
        Create
      </button>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export function EnrollForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
          const res = await fetch(`/api/v1/courses/${courseId}/enroll`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            setMessage(`Enrolled ${email}`);
            setEmail("");
            router.refresh();
          } else {
            const body = await res.json().catch(() => null);
            setError(body?.error ?? "Enrollment failed");
          }
        } catch {
          setError("Network error — try again.");
        } finally {
          setBusy(false);
        }
      }}
      style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end", flexWrap: "wrap" }}
    >
      <label className="field" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
        <span>Student email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student1@drdash.test"
          data-testid="enroll-email"
          required
        />
      </label>
      <button className="btn" disabled={busy} data-testid="enroll-submit">
        Enroll student
      </button>
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}

export function AssignmentsForm({
  courseId,
  lessons,
  assignedSlugs,
}: {
  courseId: string;
  lessons: { slug: string; title: string }[];
  assignedSlugs: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedSlugs));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div style={{ display: "grid", gap: "0.3rem", marginBottom: "0.7rem" }}>
        {lessons.map((l) => (
          <label key={l.slug} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selected.has(l.slug)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(l.slug);
                else next.delete(l.slug);
                setSelected(next);
                setSaved(false);
              }}
              data-testid={`assign-${l.slug}`}
            />
            <span>{l.title}</span>
          </label>
        ))}
      </div>
      <button
        className="btn btn-primary"
        disabled={busy}
        data-testid="assign-save"
        onClick={async () => {
          setBusy(true);
          try {
            const res = await fetch(`/api/v1/courses/${courseId}/assignments`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ lessonSlugs: [...selected] }),
            });
            if (res.ok) {
              setSaved(true);
              router.refresh();
            }
          } catch {
            // network hiccup — leave saved=false so the instructor retries
          } finally {
            setBusy(false);
          }
        }}
      >
        Save assignments
      </button>
      {saved && <span className="success-text" style={{ marginLeft: "0.6rem" }}>Saved</span>}
    </div>
  );
}
