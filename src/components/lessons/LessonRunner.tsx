"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  McStep,
  ReadStep,
  TaskStep,
  TaskUrlStep,
  TextStep,
} from "@/lib/lessons/schema";
import { validateChartTarget } from "@/lib/lessons/grader";
import { dashboardHref, type ChartState } from "@/lib/dashboard/urlState";
import { ChartToolCore } from "@/components/chart/ChartToolCore";

export type ClientStep =
  | ReadStep
  | TaskStep
  | TaskUrlStep
  | Omit<McStep, "correctIndex" | "explanation">
  | TextStep;

export interface StepStatus {
  done: boolean;
  correct?: boolean | null;
  pointsAwarded: number;
  tries: number;
  finalized: boolean;
  explanation?: string;
  textResponse?: string;
}

interface SubmitResponse {
  ok?: boolean;
  correct?: boolean;
  finalized?: boolean;
  triesUsed?: number;
  triesLeft?: number;
  pointsAwarded?: number;
  explanation?: string;
  missing?: string[];
  message?: string;
  score?: number;
  completed?: boolean;
  error?: string;
}

export function LessonRunner({
  slug,
  title,
  summary,
  objectives,
  sources,
  steps,
  initialStatuses,
  initialScore,
  maxScore,
  completed: initiallyCompleted,
}: {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  sources: string[];
  steps: ClientStep[];
  initialStatuses: Record<string, StepStatus>;
  initialScore: number;
  maxScore: number;
  completed: boolean;
}) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [score, setScore] = useState(initialScore);
  const [completed, setCompleted] = useState(initiallyCompleted);

  // Shared chart state — lives here so the right-panel chart persists across steps
  const [chart, setChart] = useState<ChartState>({
    series: [],
    recessions: false,
    logScale: false,
  });

  // Union of all series IDs from lesson sources + every TASK target
  const allowedSeriesIds = useMemo(() => {
    const ids = new Set<string>(sources);
    for (const step of steps) {
      if (step.type === "TASK") {
        for (const t of step.target.series) {
          ids.add(t.id);
          if (t.denominatorId) ids.add(t.denominatorId);
        }
      }
    }
    ids.delete("USREC"); // recession shading is a toggle, not a plottable series
    return [...ids];
  }, [steps, sources]);

  async function submitStep(
    stepId: string,
    payload: Record<string, unknown>
  ): Promise<SubmitResponse> {
    let body: SubmitResponse;
    try {
      const res = await fetch(`/api/v1/lessons/${slug}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId, ...payload }),
      });
      body = await res.json();
    } catch {
      return { error: "Network error — check your connection and try again." };
    }
    if (typeof body.score === "number") setScore(body.score);
    if (body.completed) setCompleted(true);
    return body;
  }

  const doneCount = steps.filter((s) => statuses[s.id]?.done).length;

  return (
    <div className="lesson-layout">
      {/* ── Left sidebar: progress + step cards ── */}
      <div className="lesson-sidebar">
        <div className="lesson-sidebar-head">
          <h1 className="lesson-title">{title}</h1>
          <p className="lesson-summary muted small">{summary}</p>

          <div className="progress-banner" style={{ marginTop: "0.6rem" }}>
            <strong data-testid="lesson-score" style={{ fontSize: "0.88rem" }}>
              {score}/{maxScore} pts
            </strong>
            <div className="progress-track" aria-hidden>
              <div
                className="progress-fill"
                style={{
                  width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="muted small">{doneCount}/{steps.length}</span>
            {completed && (
              <span className="tag tag-green" data-testid="lesson-completed">
                Done
              </span>
            )}
          </div>

          {objectives.length > 0 && (
            <details style={{ marginTop: "0.5rem" }}>
              <summary className="muted small" style={{ cursor: "pointer" }}>
                Objectives &amp; series
              </summary>
              <ul className="small" style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem" }}>
                {objectives.map((o) => <li key={o}>{o}</li>)}
              </ul>
              {sources.length > 0 && (
                <p className="small muted" style={{ margin: "0.3rem 0 0" }}>
                  Series:{" "}
                  {sources.map((s, i) => (
                    <span key={s}>{i > 0 && ", "}<code>{s}</code></span>
                  ))}
                </p>
              )}
            </details>
          )}
        </div>

        <div className="lesson-steps">
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              index={i + 1}
              step={step}
              status={statuses[step.id]}
              chart={chart}
              onStatus={(s) => setStatuses((prev) => ({ ...prev, [step.id]: s }))}
              submit={(payload) => submitStep(step.id, payload)}
            />
          ))}
        </div>
      </div>

      {/* ── Right main: persistent chart ── */}
      <div className="lesson-main">
        <ChartToolCore
          value={chart}
          onChange={setChart}
          compact
          allowedSeriesIds={allowedSeriesIds}
          testIdPrefix="lesson-chart"
          chartHeight={500}
        />
      </div>
    </div>
  );
}

// ── Step cards ─────────────────────────────────────────────────────────────

function StepCard({
  index,
  step,
  status,
  chart,
  onStatus,
  submit,
}: {
  index: number;
  step: ClientStep;
  status: StepStatus | undefined;
  chart: ChartState;
  onStatus: (s: StepStatus) => void;
  submit: (payload: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const done = status?.done ?? false;
  const typeLabel =
    step.type === "READ" ? "Read"
    : step.type === "TASK" ? "Chart task"
    : step.type === "TASK_URL" ? "Dashboard link"
    : step.type === "QUESTION_MC" ? "Question"
    : "Written response";

  return (
    <section
      className={`step-card ${done ? "done" : "pending"}`}
      data-testid={`step-${step.id}`}
      aria-label={`Step ${index}: ${step.title}`}
    >
      <div className="step-head">
        <span className="tag tag-blue">{typeLabel}</span>
        <h3>{index}. {step.title}</h3>
        {done && (
          <span className="tag tag-green" data-testid={`step-${step.id}-done`}>
            {"points" in step && step.type === "QUESTION_MC" && status?.correct === false
              ? `0/${step.points} pts`
              : "points" in step
              ? `${status?.pointsAwarded ?? 0}/${step.points} pts`
              : "Done"}
          </span>
        )}
      </div>
      <div className="step-body">{step.body}</div>
      {"hint" in step && step.hint && (
        <div className="step-hint">💡 {step.hint}</div>
      )}

      {step.type === "READ" && (
        <ReadControls step={step} status={status} onStatus={onStatus} submit={submit} />
      )}
      {step.type === "TASK" && (
        <TaskControls step={step} status={status} chart={chart} onStatus={onStatus} submit={submit} />
      )}
      {step.type === "TASK_URL" && (
        <UrlControls step={step} status={status} onStatus={onStatus} submit={submit} />
      )}
      {step.type === "QUESTION_MC" && (
        <McControls step={step} status={status} onStatus={onStatus} submit={submit} />
      )}
      {step.type === "QUESTION_TEXT" && (
        <TextControls step={step} status={status} onStatus={onStatus} submit={submit} />
      )}
    </section>
  );
}

// ── READ ───────────────────────────────────────────────────────────────────

function ReadControls({
  step,
  status,
  onStatus,
  submit,
}: {
  step: ReadStep;
  status?: StepStatus;
  onStatus: (s: StepStatus) => void;
  submit: (p: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const [busy, setBusy] = useState(false);
  if (status?.done) return null;
  return (
    <button
      className="btn"
      disabled={busy}
      data-testid={`step-${step.id}-read-done`}
      onClick={async () => {
        setBusy(true);
        const res = await submit({});
        setBusy(false);
        if (!res.error)
          onStatus({ done: true, pointsAwarded: 0, tries: 1, finalized: true });
      }}
    >
      Mark as read
    </button>
  );
}

// ── TASK — uses the shared chart in the right panel ────────────────────────

function TaskControls({
  step,
  status,
  chart,
  onStatus,
  submit,
}: {
  step: TaskStep;
  status?: StepStatus;
  chart: ChartState;
  onStatus: (s: StepStatus) => void;
  submit: (p: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  if (status?.done) {
    return (
      <p className="feedback good" data-testid={`step-${step.id}-feedback`}>
        Chart target met. Keep exploring in the{" "}
        <Link href={dashboardHref({ series: step.target.series, recessions: !!step.target.recessions, logScale: false })}>
          full Chart Tool
        </Link>
        .
      </p>
    );
  }

  return (
    <div>
      <p className="muted small" style={{ margin: "0.4rem 0 0.5rem" }}>
        Build the chart in the panel on the right, then check it here.
      </p>
      <button
        className="btn btn-primary"
        disabled={busy}
        data-testid={`step-${step.id}-check`}
        onClick={async () => {
          const local = validateChartTarget(step.target, {
            series: chart.series,
            recessions: chart.recessions,
          });
          if (!local.ok) { setFeedback(local.missing); return; }
          setBusy(true);
          const res = await submit({ state: { series: chart.series, recessions: chart.recessions } });
          setBusy(false);
          if (res.ok) {
            onStatus({ done: true, pointsAwarded: res.pointsAwarded ?? step.points, tries: 1, finalized: true });
          } else {
            setFeedback(res.missing ?? [res.error ?? "Check failed"]);
          }
        }}
      >
        Check my chart
      </button>
      {feedback && (
        <div className="feedback bad" data-testid={`step-${step.id}-feedback`}>
          Not quite yet:
          <ul style={{ margin: "0.3rem 0 0 1.2rem" }}>
            {feedback.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── TASK_URL ───────────────────────────────────────────────────────────────

function UrlControls({
  step,
  status,
  onStatus,
  submit,
}: {
  step: TaskUrlStep;
  status?: StepStatus;
  onStatus: (s: StepStatus) => void;
  submit: (p: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const [url, setUrl] = useState("");
  const [feedback, setFeedback] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  if (status?.done) {
    return (
      <p className="feedback good" data-testid={`step-${step.id}-feedback`}>
        Dashboard link accepted.
      </p>
    );
  }
  return (
    <div>
      <label className="field">
        <span>Paste your shareable dashboard link</span>
        <input
          type="url"
          value={url}
          placeholder="https://…/dashboard?s=…"
          onChange={(e) => setUrl(e.target.value)}
          data-testid={`step-${step.id}-url`}
        />
      </label>
      <button
        className="btn btn-primary"
        disabled={busy || !url.trim()}
        data-testid={`step-${step.id}-submit`}
        onClick={async () => {
          setBusy(true);
          const res = await submit({ url });
          setBusy(false);
          if (res.ok) {
            onStatus({ done: true, pointsAwarded: res.pointsAwarded ?? step.points, tries: 1, finalized: true });
          } else {
            setFeedback(res.missing ?? [res.error ?? "Submission failed"]);
          }
        }}
      >
        Submit link
      </button>
      {feedback && (
        <div className="feedback bad" data-testid={`step-${step.id}-feedback`}>
          <ul style={{ margin: "0 0 0 1.2rem" }}>
            {feedback.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── QUESTION_MC ────────────────────────────────────────────────────────────

function McControls({
  step,
  status,
  onStatus,
  submit,
}: {
  step: Omit<McStep, "correctIndex" | "explanation">;
  status?: StepStatus;
  onStatus: (s: StepStatus) => void;
  submit: (p: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastWrong, setLastWrong] = useState<number | null>(null);
  const [triesLeft, setTriesLeft] = useState(step.tries - (status?.tries ?? 0));

  if (status?.finalized) {
    return (
      <div>
        <div className={`feedback ${status.correct ? "good" : "bad"}`} data-testid={`step-${step.id}-feedback`}>
          {status.correct ? "Correct!" : "Out of tries — see the explanation below."}
        </div>
        {status.explanation && (
          <div className="feedback info" data-testid={`step-${step.id}-explanation`}>
            {status.explanation}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mc-options" role="radiogroup" aria-label={step.title}>
        {step.options.map((opt, i) => (
          <label key={i} className={choice === i ? "chosen" : ""}>
            <input
              type="radio"
              name={`mc-${step.id}`}
              checked={choice === i}
              onChange={() => setChoice(i)}
              data-testid={`step-${step.id}-option-${i}`}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {lastWrong !== null && (
        <div className="feedback bad" data-testid={`step-${step.id}-feedback`}>
          Not quite — {triesLeft} {triesLeft === 1 ? "try" : "tries"} left.
        </div>
      )}
      <button
        className="btn btn-primary"
        disabled={busy || choice === null}
        data-testid={`step-${step.id}-submit`}
        onClick={async () => {
          if (choice === null) return;
          setBusy(true);
          const res = await submit({ choiceIndex: choice });
          setBusy(false);
          if (res.error) return;
          if (res.correct || res.finalized) {
            onStatus({
              done: true,
              correct: res.correct ?? false,
              pointsAwarded: res.pointsAwarded ?? 0,
              tries: res.triesUsed ?? 1,
              finalized: true,
              explanation: res.explanation,
            });
          } else {
            setLastWrong(choice);
            setTriesLeft(res.triesLeft ?? 0);
            setChoice(null);
          }
        }}
      >
        Submit answer
      </button>
    </div>
  );
}

// ── QUESTION_TEXT ──────────────────────────────────────────────────────────

function TextControls({
  step,
  status,
  onStatus,
  submit,
}: {
  step: TextStep;
  status?: StepStatus;
  onStatus: (s: StepStatus) => void;
  submit: (p: Record<string, unknown>) => Promise<SubmitResponse>;
}) {
  const [text, setText] = useState(status?.textResponse ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status?.done) {
    return (
      <div>
        <div className="feedback good" data-testid={`step-${step.id}-feedback`}>
          Response recorded for instructor review.
        </div>
        {status.textResponse && (
          <blockquote className="muted small" style={{ whiteSpace: "pre-line", margin: "0.4rem 0 0" }}>
            {status.textResponse}
          </blockquote>
        )}
      </div>
    );
  }
  return (
    <div>
      <textarea
        value={text}
        placeholder={step.placeholder ?? `At least ${step.minWords} words…`}
        onChange={(e) => setText(e.target.value)}
        aria-label={step.title}
        data-testid={`step-${step.id}-text`}
      />
      <div style={{ marginTop: "0.5rem" }}>
        <button
          className="btn btn-primary"
          disabled={busy || !text.trim()}
          data-testid={`step-${step.id}-submit`}
          onClick={async () => {
            setBusy(true);
            const res = await submit({ text });
            setBusy(false);
            if (res.ok) {
              onStatus({ done: true, pointsAwarded: res.pointsAwarded ?? step.points, tries: 1, finalized: true, textResponse: text });
            } else {
              setMessage(res.message ?? res.error ?? "Submission failed");
            }
          }}
        >
          Submit response
        </button>
      </div>
      {message && (
        <div className="feedback bad" data-testid={`step-${step.id}-feedback`}>
          {message}
        </div>
      )}
    </div>
  );
}
