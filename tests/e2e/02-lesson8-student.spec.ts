/**
 * The Lesson 8 QA walkthrough from the task board: log in as
 * student1@drdash.test, complete every step through the real UI, confirm the
 * TASK targets validate, and confirm wrong answers do not pass while correct
 * answers do.
 */
import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers";

test.describe.configure({ mode: "serial" });

async function completeChartTask(
  page: Page,
  stepId: string,
  series: { id: string; transform: string }[]
) {
  const card = page.getByTestId(`step-${stepId}`);
  await card.scrollIntoViewIfNeeded();
  await card.getByText("Add series").click();
  for (const s of series) {
    await card.getByTestId(`task-${stepId}-add-${s.id}`).click();
    if (s.transform !== "LEVEL") {
      await card
        .getByTestId(`task-${stepId}-transform-${s.id}`)
        .selectOption(s.transform);
    }
  }
  await card.getByTestId(`step-${stepId}-check`).click();
  await expect(card.getByTestId(`step-${stepId}-done`)).toBeVisible();
}

async function answerMc(
  page: Page,
  stepId: string,
  option: number,
  expectCorrect: boolean
) {
  const card = page.getByTestId(`step-${stepId}`);
  await card.scrollIntoViewIfNeeded();
  await card.getByTestId(`step-${stepId}-option-${option}`).check();
  await card.getByTestId(`step-${stepId}-submit`).click();
  if (expectCorrect) {
    await expect(card.getByTestId(`step-${stepId}-feedback`)).toContainText(/correct/i);
  } else {
    await expect(card.getByTestId(`step-${stepId}-feedback`)).toContainText(/not quite/i);
  }
}

test("student completes Lesson 8 (Inflation) end-to-end in the UI", async ({ page }) => {
  await login(page, "student1@drdash.test");

  await page.goto("/lessons");
  await expect(page.getByTestId("lesson-inflation")).toBeVisible();
  await page.getByTestId("lesson-inflation").getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Inflation");

  // Step 1 — READ
  await page.getByTestId("step-read-what-is-inflation-read-done").click();
  await expect(
    page.getByTestId("step-read-what-is-inflation-done")
  ).toBeVisible();

  // Step 2 — TASK: CPI growth rate. First prove a wrong chart is rejected.
  const task1 = page.getByTestId("step-task-cpi-growth");
  await task1.getByText("Add series").click();
  await task1.getByTestId("task-task-cpi-growth-add-CPIAUCSL").click();
  await task1.getByTestId("step-task-cpi-growth-check").click(); // still LEVEL → should fail
  await expect(task1.getByTestId("step-task-cpi-growth-feedback")).toContainText(
    /not quite/i
  );
  await task1
    .getByTestId("task-task-cpi-growth-transform-CPIAUCSL")
    .selectOption("YOY_GROWTH");
  await task1.getByTestId("step-task-cpi-growth-check").click();
  await expect(task1.getByTestId("step-task-cpi-growth-done")).toBeVisible();

  // Step 3 — MC: wrong answer first ("Faster"), then correct ("Slower").
  await answerMc(page, "q-wages-vs-inflation", 0, false);
  await answerMc(page, "q-wages-vs-inflation", 1, true);

  // Step 4 — TASK: headline + core CPI growth.
  await completeChartTask(page, "task-core-cpi", [
    { id: "CPIAUCSL", transform: "YOY_GROWTH" },
    { id: "CPILFESL", transform: "YOY_GROWTH" },
  ]);

  // Step 5 — MC: oil price shocks (correct on first try).
  await answerMc(page, "q-headline-vs-core", 0, true);

  // Step 6 — TASK: PCE vs CPI growth.
  await completeChartTask(page, "task-pce-vs-cpi", [
    { id: "PCEPI", transform: "YOY_GROWTH" },
    { id: "CPIAUCSL", transform: "YOY_GROWTH" },
  ]);

  // Step 7 — MC: the Fed targets PCE.
  await answerMc(page, "q-fed-target-index", 2, true);

  // Lesson complete with full points (wrong tries within limits keep full credit).
  await expect(page.getByTestId("lesson-completed")).toBeVisible();
  await expect(page.getByTestId("lesson-score")).toHaveText("60/60 pts");

  // The lessons list reflects completion.
  await page.goto("/lessons");
  await expect(page.getByTestId("lesson-inflation")).toContainText("Completed");
});
