/**
 * The instructor QA flow from the task board: create a course, enroll the
 * test students, assign the new lessons (8–13), and verify the grade view —
 * including the score student1 earned in the Lesson 8 walkthrough spec.
 */
import { expect, test } from "@playwright/test";
import { login } from "./helpers";

const NEW_LESSON_SLUGS = [
  "inflation",
  "monetary-policy",
  "deficits-debt",
  "international-trade",
  "productivity",
  "economic-brief",
];

test("instructor creates a course, assigns lessons 8–13, and sees grades", async ({
  page,
}) => {
  await login(page, "instructor@drdash.test");

  await page.goto("/courses");
  await page.getByTestId("course-name").fill("Econ 101 E2E");
  await page.getByTestId("course-create").click();
  await expect(page.getByRole("link", { name: "Econ 101 E2E" })).toBeVisible();
  await page.getByRole("link", { name: "Econ 101 E2E" }).click();

  // Enroll both demo students by email.
  for (const email of ["student1@drdash.test", "student2@drdash.test"]) {
    await page.getByTestId("enroll-email").fill(email);
    await page.getByTestId("enroll-submit").click();
    await expect(page.locator(".success-text")).toContainText(email);
  }
  await expect(page.getByText("student1@drdash.test")).toBeVisible();

  // Assign the six new lessons.
  for (const slug of NEW_LESSON_SLUGS) {
    await page.getByTestId(`assign-${slug}`).check();
  }
  await page.getByTestId("assign-save").click();
  await expect(page.getByText("Saved")).toBeVisible();

  // Grades table: student1 completed Lesson 8 in the previous spec.
  await page.reload();
  const grades = page.getByTestId("grades-table");
  await expect(grades).toBeVisible();
  const student1Row = grades.locator("tr", { hasText: "Sam Student" });
  await expect(student1Row).toContainText("60/60 ✓");
  const student2Row = grades.locator("tr", { hasText: "Riley Learner" });
  await expect(student2Row).toContainText("—");

  // Student view: the assignment list shows up with progress tags.
  await page.getByTestId("logout").click();
  await login(page, "student1@drdash.test");
  await page.goto("/courses");
  const courseCard = page.locator(".card", { hasText: "Econ 101 E2E" });
  await expect(courseCard).toBeVisible();
  await expect(
    courseCard.locator("li", { hasText: "Inflation" }).first()
  ).toContainText("60/60 pts");
});
