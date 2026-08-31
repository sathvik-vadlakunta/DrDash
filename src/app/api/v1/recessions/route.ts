import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { getRecessionBands } from "@/lib/chartData";

export async function GET(req: Request) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json({ bands: await getRecessionBands() });
}
