import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getSessionUser } from "@/lib/auth";

const displayFont = localFont({
  src: [
    { path: "../../public/fonts/SpaceGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/SpaceGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const sansFont = localFont({
  src: [
    { path: "../../public/fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = localFont({
  src: [
    { path: "../../public/fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

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
  const jar = await cookies();
  const theme = jar.get("dd_theme")?.value === "dark" ? "dark" : undefined;

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <head>
        {/* Apply theme from cookie before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=document.cookie.match(/dd_theme=(light|dark)/);if(t&&t[1]==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Nav user={user ? { name: user.name, role: user.role } : null} />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
