import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { getSeriesDef } from "@/lib/catalog/series";
import { getTransformedSeries } from "@/lib/chartData";
import { TRANSFORM_TYPES, type TransformType } from "@/lib/transforms";
import { TRANSFORM_CODES } from "@/lib/dashboard/urlState";

const CODE_TO_TRANSFORM = new Map(
  Object.entries(TRANSFORM_CODES).map(([t, code]) => [code, t as TransformType])
);

function parseTransform(raw: string | null): TransformType | null {
  if (!raw) return "LEVEL";
  if ((TRANSFORM_TYPES as readonly string[]).includes(raw)) {
    return raw as TransformType;
  }
  return CODE_TO_TRANSFORM.get(raw) ?? null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const { id } = await params;
  const def = getSeriesDef(id);
  if (!def) {
    return NextResponse.json({ error: `Unknown series ${id}` }, { status: 404 });
  }
  const url = new URL(req.url);
  const transform = parseTransform(url.searchParams.get("t"));
  if (!transform) {
    return NextResponse.json({ error: "Unknown transform" }, { status: 400 });
  }
  const denominatorId = url.searchParams.get("denom") ?? undefined;
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;

  try {
    const payload = await getTransformedSeries(
      id,
      { type: transform, denominatorId },
      { from, to }
    );
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transform failed" },
      { status: 400 }
    );
  }
}
