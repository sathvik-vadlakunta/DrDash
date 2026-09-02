import { describe, expect, it } from "vitest";
import {
  encodeChartState,
  decodeChartState,
  decodeChartStateFromUrl,
  dashboardHref,
  type ChartState,
} from "@/lib/dashboard/urlState";

describe("encode/decode round trip", () => {
  it("preserves series, transforms, denominators, shading, and range", () => {
    const state: ChartState = {
      series: [
        { id: "CPIAUCSL", transform: "YOY_GROWTH" },
        { id: "GDP", transform: "LEVEL" },
        { id: "FGEXPND", transform: "PCT_OF", denominatorId: "GDP" },
        { id: "AHETPI", transform: "REAL" },
        { id: "GDPC1", transform: "PER_CAPITA" },
      ],
      recessions: true,
      logScale: false,
      from: "1960",
      to: "2024",
    };
    const decoded = decodeChartState(encodeChartState(state));
    expect(decoded).toEqual(state);
  });

  it("encodes LEVEL series compactly", () => {
    const qs = encodeChartState({
      series: [{ id: "GDP", transform: "LEVEL" }],
      recessions: false,
      logScale: false,
    });
    expect(qs).toBe("s=GDP");
  });
});

describe("decode robustness", () => {
  it("drops unknown series and transform codes", () => {
    const decoded = decodeChartState("s=NOTREAL:yoy,GDP:banana,CPIAUCSL:yoy");
    expect(decoded.series).toEqual([{ id: "CPIAUCSL", transform: "YOY_GROWTH" }]);
  });

  it("drops disallowed series/transform combinations", () => {
    // NETEXP crosses zero → growth disabled; AHETPI is not an aggregate → pctof disabled.
    const decoded = decodeChartState("s=NETEXP:yoy,AHETPI:pctof,UNRATE");
    expect(decoded.series).toEqual([{ id: "UNRATE", transform: "LEVEL" }]);
  });

  it("defaults the PCT_OF denominator to GDP and rejects non-aggregate denominators", () => {
    const decoded = decodeChartState("s=FGEXPND:pctof,PCEC:pctof:UNRATE");
    expect(decoded.series).toEqual([
      { id: "FGEXPND", transform: "PCT_OF", denominatorId: "GDP" },
    ]);
  });

  it("dedupes exact id+transform repeats and caps at 8 series", () => {
    const many = Array.from({ length: 12 }, () => "GDP").join(",");
    expect(decodeChartState(`s=${many}`).series).toHaveLength(1);
    const ids = [
      "GDP",
      "GDPC1",
      "CPIAUCSL",
      "UNRATE",
      "PAYEMS",
      "M2SL",
      "FEDFUNDS",
      "GS10",
      "AAA",
      "BAA",
    ].join(",");
    expect(decodeChartState(`s=${ids}`).series).toHaveLength(8);
  });

  it("validates year bounds", () => {
    const decoded = decodeChartState("s=GDP&from=196&to=20244");
    expect(decoded.from).toBeUndefined();
    expect(decoded.to).toBeUndefined();
  });
});

describe("decodeChartStateFromUrl", () => {
  it("accepts full URLs, paths, and bare query strings", () => {
    const href = dashboardHref({
      series: [{ id: "GDPC1", transform: "YOY_GROWTH" }],
      recessions: true,
      logScale: false,
    });
    for (const url of [
      `https://drdash.example.com${href}`,
      `http://localhost:3000${href}`,
      href,
      href.slice(href.indexOf("?") + 1),
    ]) {
      const state = decodeChartStateFromUrl(url);
      expect(state?.series).toEqual([{ id: "GDPC1", transform: "YOY_GROWTH" }]);
      expect(state?.recessions).toBe(true);
    }
  });

  it("returns null for links with no chartable content", () => {
    expect(decodeChartStateFromUrl("https://example.com/")).toBeNull();
    expect(decodeChartStateFromUrl("not a url")).toBeNull();
    expect(decodeChartStateFromUrl("https://example.com/dashboard?s=FAKEID")).toBeNull();
    expect(decodeChartStateFromUrl("")).toBeNull();
  });
});
