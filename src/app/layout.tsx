import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Dr. Dash", template: "%s · Dr. Dash" },
  description:
    "An interactive macroeconomic data dashboard and lesson platform for intro economics courses, built on FRED data.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Nav
          user={user ? { name: user.name, role: user.role } : null}
        />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
