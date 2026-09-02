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
    <Suspense>
      <DashboardTool />
    </Suspense>
  );
}
