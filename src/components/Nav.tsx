"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Chart Tool" },
  { href: "/statsbook", label: "Statsbook" },
  { href: "/lessons", label: "Lessons" },
  { href: "/courses", label: "Courses" },
];

const SHORTCUTS = [
  { key: "/", desc: "Focus series search" },
  { key: "g d", desc: "Go to Dashboard" },
  { key: "g l", desc: "Go to Lessons" },
  { key: "g s", desc: "Go to Statsbook" },
  { key: "g c", desc: "Go to Courses" },
  { key: "?", desc: "Open this dialog" },
  { key: "←  →", desc: "Move chart cursor" },
  { key: "PgUp  PgDn", desc: "Chart cursor ± 1 year" },
  { key: "Home  End", desc: "Chart first / last period" },
];

export function Nav({
  user,
}: {
  user: { name: string; role: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDark, setIsDark] = useState(false);

  // Sync isDark state to current data-theme on mount
  useEffect(() => {
    setIsDark(document.documentElement.dataset.theme === "dark");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    let gPending = false;
    let gTimer: ReturnType<typeof setTimeout>;

    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // ? opens shortcut dialog
      if (e.key === "?" && !inInput) {
        e.preventDefault();
        dialogRef.current?.showModal();
        return;
      }

      // Escape closes dialog
      if (e.key === "Escape") {
        dialogRef.current?.close();
        gPending = false;
        clearTimeout(gTimer);
        return;
      }

      // / focuses search in catalog
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>(".catalog-search");
        search?.focus();
        return;
      }

      // g + <key> navigation
      if (!inInput) {
        if (e.key === "g" && !gPending) {
          gPending = true;
          clearTimeout(gTimer);
          gTimer = setTimeout(() => { gPending = false; }, 1500);
          return;
        }
        if (gPending) {
          gPending = false;
          clearTimeout(gTimer);
          const navMap: Record<string, string> = {
            d: "/dashboard",
            l: "/lessons",
            s: "/statsbook",
            c: "/courses",
          };
          if (navMap[e.key]) {
            e.preventDefault();
            router.push(navMap[e.key]);
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next === "dark" ? "dark" : "");
    document.cookie = `dd_theme=${next};path=/;max-age=31536000;samesite=lax`;
    setIsDark(next === "dark");
  }

  const isStaff = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");
  const isHome = pathname === "/";

  return (
    <>
      <nav className="site-nav" aria-label="Main">
        <div className="nav-inner">
          <Link href="/" className="brand">
            Dr. Dash
          </Link>
          {!isHome && LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${pathname.startsWith(l.href) ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {!isHome && isStaff && (
            <Link
              href="/admin/sync"
              className={`nav-link${pathname.startsWith("/admin") ? " active" : ""}`}
            >
              Admin
            </Link>
          )}
          <div className="nav-spacer" />
          <button
            type="button"
            className="btn btn-small nav-theme-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? "☀︎" : "☾"}
          </button>
          {!isHome && (
            <button
              type="button"
              className="btn btn-small nav-shortcuts-btn"
              onClick={() => dialogRef.current?.showModal()}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              ?
            </button>
          )}
          {user ? (
            <>
              <span className="nav-user" data-testid="nav-user">
                {user.name}
              </span>
              <button className="btn btn-small" onClick={logout} data-testid="logout">
                Log out
              </button>
            </>
          ) : isHome ? (
            <>
              <Link href="/login" className="nav-link">
                Sign in
              </Link>
              <Link href="/login" className="btn btn-primary btn-small">
                Create an account
              </Link>
            </>
          ) : (
            <Link href="/login" className="nav-link">
              Log in
            </Link>
          )}
        </div>
      </nav>

      {/* Keyboard shortcuts dialog */}
      <dialog
        ref={dialogRef}
        className="shortcuts-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontFamily: "var(--display)" }}>Keyboard shortcuts</strong>
          <button
            type="button"
            className="btn btn-small"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="shortcuts-grid" role="list">
          {SHORTCUTS.map((s) => (
            <div key={s.key} style={{ display: "contents" }} role="listitem">
              <kbd>{s.key}</kbd>
              <span>{s.desc}</span>
            </div>
          ))}
        </div>
        <p className="muted small" style={{ margin: 0 }}>
          Shortcuts are disabled while typing in inputs.
        </p>
      </dialog>
    </>
  );
}
