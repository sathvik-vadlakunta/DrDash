import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 13 — Capstone: Create Your Own Economic Brief.
 * Lesson plan lesson 13. The student picks their own series, so `sources`
 * is intentionally empty. Submission follows Option B: the student pastes a
 * shareable dashboard link here and submits the written brief to their
 * instructor through the course's own submission process.
 */
export const LESSON_13: LessonSeed = {
  slug: "economic-brief",
  title: "Capstone: Create Your Own Economic Brief",
  summary:
    "The capstone: pick your own macro topic, build a dashboard of 2–4 series with at least one transformation, and outline a three-part economic brief — context, chart-driven analysis, conclusion — modeled on regional Fed briefs and the BLS Monthly Labor Review.",
  level: "INTRO",
  estimatedMinutes: 50,
  sortOrder: 130,
  planLesson: 13,
  capstone: true,
  content: {
    objectives: [
      "Structure an economic brief in three parts: context, data-supported analysis, and conclusion",
      "Choose 2–4 catalog series that together tell one coherent story about a macro topic",
      "Apply at least one transformation and explain what it reveals that the raw level does not",
      "Share a finished chart with a dashboard link and fact-check a claim before putting it in writing",
    ],
    sources: [],
    steps: [
      {
        id: "read-what-is-a-brief",
        type: "READ",
        title: "What an economic brief is",
        body:
          "An economic brief is a short, data-driven document — typically one or two pages — that answers a single economic question for a busy reader: a policymaker, an editor, a manager. It is not a research paper. It makes one claim, supports that claim with charts, and stops.\n\nThe structure has three parts. (1) Context: one paragraph explaining why the question matters and what the reader needs to know before looking at any data. (2) Analysis: the core of the brief, built on 2–4 charts, with a sentence or two per chart saying exactly what it shows and what that implies. A reliable sentence template is: \"Since <year>, <series> has <trend>, which suggests <interpretation>.\" For example: \"Since 1990, federal debt as a percent of GDP has more than doubled, which suggests interest costs will claim a growing share of the budget.\" Every sentence in the analysis should be checkable against a chart. (3) Conclusion: one paragraph that answers the opening question directly and notes what to watch next.\n\nProfessionals write these constantly. The regional Federal Reserve Banks publish short \"economic briefs\" in exactly this format, and the Bureau of Labor Statistics does the same at greater length in publications like the Monthly Labor Review. Skim one before you write — you will recognize the pattern: context, charts, conclusion.",
      },
      {
        id: "task-url-build-dashboard",
        type: "TASK_URL",
        points: 10,
        title: "Build the dashboard behind your brief",
        body:
          "Pick any macro topic from the Dr. Dash catalog — inflation and wages, the labor market, deficits and debt, trade, productivity, whatever you found most interesting this term. In the Chart Tool, build one chart with 2–4 series that together tell a single coherent story; a pile of unrelated lines is a chart, not an argument.\n\nApply at least one transformation (Growth Rate, Real, Per Capita, or Percent of GDP) where it sharpens the story — a raw nominal level rarely makes the point on its own. When the chart says what you want it to say, click \"Copy shareable link\" in the Chart Tool and paste the link here. The link is graded automatically: it must contain at least 2 series and at least 1 transformation.",
        hint: "Use \"Copy shareable link\" in the Chart Tool — the copied link looks like /dashboard?s=... — and paste it into the answer box.",
        requirement: {
          minSeries: 2,
          minTransforms: 1,
        },
      },
      {
        id: "q-text-explain-transform",
        type: "QUESTION_TEXT",
        points: 10,
        minWords: 15,
        title: "Explain your transformation",
        body:
          "In 1–2 sentences, explain what transformation you applied and what new information it revealed that the raw level did not.",
        placeholder:
          "I applied <transform> to <series>, which revealed <what the raw level hid>...",
      },
      {
        id: "q-text-outline-brief",
        type: "QUESTION_TEXT",
        points: 10,
        minWords: 30,
        title: "Outline your brief",
        body:
          "Draft the skeleton of your brief right here: one context sentence, one sentence per chart (use the template — \"Since <year>, <series> has <trend>, which suggests <interpretation>\"), and one conclusion sentence.\n\nThis outline is the backbone of the full brief you will write up. Include your dashboard link in the document you submit to your instructor, following the course's submission process.",
        placeholder:
          "Context: ...\nChart 1: Since <year>, <series> has <trend>, which suggests <interpretation>.\nChart 2: ...\nConclusion: ...",
      },
      {
        id: "q-extra-credit-gdp-decades",
        type: "QUESTION_MC",
        points: 5,
        tries: 2,
        title: "Extra credit: fact-check a brief",
        body:
          "Extra credit — this question is optional and worth bonus points. Part of writing a good brief is fact-checking claims before they go in, so end the course the way an editor would.\n\nA sample brief excerpt claims: \"Real GDP growth was faster in the 1980s than in the 1990s.\" Check it in Dr. Dash: plot Real GDP (GDPC1) with the Growth Rate transformation and compare the two decades. Is the claim supported?",
        options: [
          "Supported — the 1980s averaged clearly faster growth",
          "Not supported — the two decades averaged almost the same, with the 1990s slightly ahead",
          "Not supported — the 1980s had negative average growth",
          "The claim cannot be checked in Dr. Dash",
        ],
        correctIndex: 1,
        explanation:
          "Averaging year-over-year real GDP growth across each decade gives about 3.1% for 1980–89 and about 3.2% for 1990–99 — essentially a tie, with the 1990s a hair ahead. Both decades mix deep recessions (1981–82, 1990–91) with long booms, so neither was \"clearly faster\" — which is exactly why a brief should compute a comparison like this rather than assert it from memory.",
        sources: ["GDPC1"],
      },
    ],
  },
};
