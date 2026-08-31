"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  decodeChartState,
  encodeChartState,
  dashboardHref,
  type ChartState,
} from "@/lib/dashboard/urlState";
import { ChartToolCore } from "@/components/chart/ChartToolCore";

export function DashboardTool() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ChartState>(() =>
    decodeChartState(searchParams.toString())
  );
  const [copied, setCopied] = useState(false);
  const selfNavigation = useRef(false);

  // Keep the URL in sync with the chart so the address bar is always a
  // shareable dashboard link.
  const onChange = useCallback(
    (next: ChartState) => {
      setState(next);
      selfNavigation.current = true;
      router.replace(dashboardHref(next), { scroll: false });
    },
    [router]
  );

  // Adopt external navigation (e.g. an "Open in Chart Tool" link clicked
  // while already on the dashboard). Skip when the URL already matches the
  // current state so the initial mount doesn't churn state identity.
  useEffect(() => {
    if (selfNavigation.current) {
      selfNavigation.current = false;
      return;
    }
    const incoming = decodeChartState(searchParams.toString());
    setState((prev) =>
      encodeChartState(incoming) === encodeChartState(prev) ? prev : incoming
    );
  }, [searchParams]);

  async function copyLink() {
    const url = `${window.location.origin}${pathname}?${searchParams.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be unavailable (e.g. headless); the URL bar still works.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ChartToolCore
      value={state}
      onChange={onChange}
      testIdPrefix="dash"
      extraControls={
        <button
          type="button"
          className="btn btn-small"
          onClick={copyLink}
          data-testid="copy-link"
        >
          {copied ? "Copied!" : "Copy shareable link"}
        </button>
      }
    />
  );
}
