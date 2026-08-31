import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestUser, isStaff } from "@/lib/auth";
import { syncAllSeries, type SyncMode } from "@/lib/sync";

// A full FRED sync takes a while; give the route room on serverless hosts.
export const maxDuration = 300;

export async function GET(req: Request) {
  const user = await getRequestUser(req);
  if (!user || !isStaff(user)) {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }
  const [series, counts, runs] = await Promise.all([
    prisma.series.findMany({ orderBy: { id: "asc" } }),
    prisma.observation.groupBy({
      by: ["seriesId"],
      _count: { _all: true },
      _max: { date: true },
    }),
    prisma.syncRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
  ]);
  const countBy = new Map(counts.map((c) => [c.seriesId, c]));
  return NextResponse.json({
    series: series.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      frequency: s.frequency,
      lastSyncedAt: s.lastSyncedAt,
      lastSource: s.lastSource,
      observations: countBy.get(s.id)?._count._all ?? 0,
      latestDate: countBy.get(s.id)?._max.date?.toISOString().slice(0, 10) ?? null,
    })),
    runs,
  });
}

export async function POST(req: Request) {
  const user = await getRequestUser(req);
  if (!user || !isStaff(user)) {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }
  let mode: SyncMode = "auto";
  try {
    const body = await req.json();
    if (body?.mode === "offline" || body?.mode === "fred") mode = body.mode;
  } catch {
    // empty body → auto
  }
  const summary = await syncAllSeries(prisma, mode);
  return NextResponse.json(summary, { status: summary.status === "SUCCEEDED" ? 200 : 502 });
}
