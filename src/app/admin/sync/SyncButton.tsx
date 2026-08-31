"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <>
      <button
        className="btn btn-primary"
        disabled={busy}
        data-testid="run-sync"
        onClick={async () => {
          setBusy(true);
          setResult(null);
          try {
            const res = await fetch("/api/v1/admin/sync", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ mode: "auto" }),
            });
            const body = await res.json();
            setResult(
              body.status
                ? `${body.status}: ${body.seriesCount} series, ${body.observationCount?.toLocaleString?.() ?? body.observationCount} observations`
                : (body.error ?? "Sync failed")
            );
            router.refresh();
          } catch {
            setResult("Sync request failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Syncing… (this can take a few minutes)" : "Run sync now"}
      </button>
      {result && (
        <span className="muted small" data-testid="sync-result">
          {result}
        </span>
      )}
    </>
  );
}
