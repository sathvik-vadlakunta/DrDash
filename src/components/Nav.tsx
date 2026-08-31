"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Chart Tool" },
  { href: "/statsbook", label: "Statsbook" },
  { href: "/lessons", label: "Lessons" },
  { href: "/courses", label: "Courses" },
];

export function Nav({
  user,
}: {
  user: { name: string; role: string } | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isStaff = user && (user.role === "INSTRUCTOR" || user.role === "ADMIN");

  return (
    <nav className="site-nav" aria-label="Main">
      <div className="nav-inner">
        <Link href="/" className="brand">
          Dr.<span>Dash</span>
        </Link>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link${pathname.startsWith(l.href) ? " active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
        {isStaff && (
          <Link
            href="/admin/sync"
            className={`nav-link${pathname.startsWith("/admin") ? " active" : ""}`}
          >
            Admin
          </Link>
        )}
        <div className="nav-spacer" />
        {user ? (
          <>
            <span className="nav-user" data-testid="nav-user">
              {user.name}
            </span>
            <button className="btn btn-small" onClick={logout} data-testid="logout">
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="nav-link">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
