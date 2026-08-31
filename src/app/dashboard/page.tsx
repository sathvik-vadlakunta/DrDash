import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DashboardTool } from "./DashboardTool";

export const metadata = { title: "Chart Tool" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="container">
      <div className="page-head">
        <h1>Chart Tool</h1>
        <p>
          Pick series from the catalog, apply transformations, toggle recession
          shading, and copy a shareable link — the URL <em>is</em> your saved
          dashboard.
        </p>
      </div>
      <Suspense>
        <DashboardTool />
      </Suspense>
    </div>
  );
}
