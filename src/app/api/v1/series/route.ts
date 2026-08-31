import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getRequestUser } from "@/lib/auth";
import {
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
  SERIES_CATALOG,
} from "@/lib/catalog/series";
import { allowedTransforms } from "@/lib/transforms";

export async function GET(req: Request) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const counts = await prisma.observation.groupBy({
    by: ["seriesId"],
    _count: { _all: true },
    _min: { date: true },
    _max: { date: true },
  });
  const byId = new Map(counts.map((c) => [c.seriesId, c]));

  const categories = CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: CATEGORY_LABELS[slug],
    series: SERIES_CATALOG.filter((s) => s.category === slug && !s.hidden).map(
      (s) => {
        const c = byId.get(s.id);
        return {
          id: s.id,
          name: s.name,
          kind: s.kind,
          frequency: s.frequency,
          units: s.units,
          description: s.description,
          transforms: allowedTransforms(s),
          observations: c?._count._all ?? 0,
          firstDate: c?._min.date?.toISOString().slice(0, 10) ?? null,
          lastDate: c?._max.date?.toISOString().slice(0, 10) ?? null,
        };
      }
    ),
  }));

  return NextResponse.json({ categories });
}
