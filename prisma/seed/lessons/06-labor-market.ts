import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 6 — Labor Force, Employment, and Unemployment.
 * Lesson plan lesson 4. Sources are all pre-existing catalog series.
 */
export const LESSON_06: LessonSeed = {
  slug: "labor-market",
  title: "Labor Force, Employment, and Unemployment",
  summary:
    "How the BLS counts the employed and unemployed, what the unemployment rate and participation rate actually divide, and how to read the big labor-market series — unemployment spikes in recessions, the rise and drift-down of participation, and payroll growth turning negative in every downturn.",
  level: "INTRO",
  estimatedMinutes: 35,
  sortOrder: 40,
  planLesson: 4,
  content: {
    objectives: [
      "Define the labor force, employment, and unemployment as the BLS counts them",
      "Compute the unemployment rate (unemployed ÷ labor force) and the participation rate (labor force ÷ population) from their components",
      "Read the participation rate and employment-population ratio over the postwar era",
      "Use payroll growth with recession shading to spot downturns in the job market",
    ],
    sources: [
      "UNRATE",
      "PAYEMS",
      "CIVPART",
      "EMRATIO",
      "CLF16OV",
      "UNEMPLOY",
      "CNP16OV",
      "JTSJOL",
      "USREC",
    ],
    steps: [
      {
        id: "read-counting-the-labor-force",
        type: "READ",
        title: "Who counts as unemployed? The labor-force accounting",
        body:
          "Every month the BLS sorts the civilian noninstitutional population — everyone 16 and over who isn't in the military or an institution, about 275 million people today (CNP16OV) — into three boxes. The employed did any paid work in the survey week. The unemployed had no job but actively looked for one in the past four weeks and were available to start. Everyone else — students, retirees, full-time caregivers, and people who have given up searching — is not in the labor force. The labor force (CLF16OV) is just the first two boxes combined: employed plus unemployed, about 169 million people.\n\nTwo ratios summarize the whole picture. The labor force participation rate is the labor force divided by the population — the share of working-age people in the game at all, about 169 ÷ 275 ≈ 61%. The unemployment rate is the unemployed divided by the labor force — not the population — so with roughly 6.9 million unemployed (UNEMPLOY), it's 6.9 ÷ 169 ≈ 4.1%.\n\nThe fine print in the definition matters. You must be searching to count as unemployed: a laid-off worker sending out applications is unemployed, but the same person after giving up the search drops out of the labor force entirely and vanishes from the unemployment rate. Keep that in mind whenever the rate moves — it can change because jobs appeared, or because people stopped (or started) looking.",
      },
      {
        id: "task-unemployment-rate",
        type: "TASK",
        points: 10,
        title: "Plot the unemployment rate with recession shading",
        body:
          "Plot the Unemployment Rate (UNRATE) and turn on recession shading. This is the single most watched labor-market number, and the shading shows why: it jumps in every shaded band. Across nearly eighty years of monthly data it has ranged from 2.5% in 1953 to 14.8% in April 2020, with recession peaks of 10.8% in late 1982 and 10% in October 2009 along the way.\n\nBetween recessions the rate grinds slowly back down — today it sits near 4.1%, close to the lows that were reached in 2019 and again in 2022–23. There is no single \"normal\" level, but readings around 4% are historically tight, and anything with a 7 or 8 handle has meant serious slack.",
        hint: "Open Labor Market & Population → Unemployment Rate, keep its transform on Level, and turn on recession shading.",
        target: {
          series: [{ id: "UNRATE", transform: "LEVEL" }],
          recessions: true,
        },
      },
      {
        id: "q-discouraged-worker",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The discouraged-worker effect",
        body:
          "A worker has been job hunting for a year with no luck and gives up searching entirely. Holding everything else constant, what happens to the measured unemployment rate?",
        options: [
          "It falls — they leave the labor force, so they no longer count as unemployed",
          "It rises — they are still without a job",
          "It stays the same — they are jobless either way",
          "It rises — a smaller labor force always pushes the rate up",
        ],
        correctIndex: 0,
        explanation:
          "Counting as unemployed requires an active job search in the past four weeks, so a discouraged worker who stops looking drops out of both the unemployed count and the labor force — the numerator falls by a full person while the denominator barely shrinks, so the rate falls. This is why the unemployment rate can \"improve\" for a bad reason, and why economists check the participation rate alongside it.",
        sources: ["UNRATE", "UNEMPLOY", "CLF16OV"],
      },
      {
        id: "task-participation-employment",
        type: "TASK",
        points: 10,
        title: "Participation and the employment-population ratio",
        body:
          "Plot the Labor Force Participation Rate (CIVPART) and add the Employment-Population Ratio (EMRATIO), both as levels. Participation tells one of the great stories in postwar data: it sat near 59% from the late 1940s through the mid-1960s, then climbed for three and a half decades — driven above all by women entering paid work — reaching 66.8% by 1990 and peaking at 67.3% in early 2000. Since then it has drifted down to about 61.4% today, as the baby-boom generation ages into retirement.\n\nThe employment-population ratio is the stricter cousin: employed people only, divided by the same population. It peaked at 64.7% in April 2000 and, unlike the participation rate, it drops hard in every recession — in April 2020 it cratered to 51.2%, meaning barely half of working-age America was employed. Today it stands near 58.9%. The gap between the two lines is the unemployed share of the population: when the lines pinch together, nearly everyone in the labor force has a job.",
        hint: "Open Labor Market & Population → Labor Force Participation Rate, then add Employment-Population Ratio — keep both transforms on Level.",
        target: {
          series: [
            { id: "CIVPART", transform: "LEVEL" },
            { id: "EMRATIO", transform: "LEVEL" },
          ],
        },
      },
      {
        id: "q-participation-climb",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "What drove participation from 59% to 67%?",
        body:
          "Between the early 1960s and 2000, the labor force participation rate climbed from about 59% to a peak of 67.3%. What was the main driver of that rise?",
        options: [
          "Women entering the labor force in large numbers",
          "Men working to older ages",
          "Overall population growth",
          "A falling unemployment rate",
        ],
        correctIndex: 0,
        explanation:
          "The climb was overwhelmingly a story of women moving into paid work — men's participation actually declined gradually over the same decades. Population growth can't move the rate by itself (it raises the numerator and denominator together), and the unemployed already count as labor-force participants, so a falling unemployment rate doesn't raise participation.",
        sources: ["CIVPART", "CLF16OV", "CNP16OV"],
      },
      {
        id: "task-payroll-growth",
        type: "TASK",
        points: 10,
        title: "Payroll growth turns negative in recessions",
        body:
          "Plot Total Nonfarm Payrolls (PAYEMS), apply the Growth Rate transformation, and turn on recession shading. Payrolls come from a separate survey — the BLS asks employers how many jobs are on their books, rather than asking households whether they're working — and the monthly change in this series is the \"jobs number\" that leads the news on the first Friday of every month.\n\nIn expansions, payrolls grow steadily, around 1–2% per year in recent decades. In every shaded band the line dives below zero — the economy destroying jobs outright: about −2.3% at the end of 1982, −5% in mid-2009, and an off-the-chart −13.4% in April 2020, when 20.5 million jobs disappeared in a single month. The rebound was just as extreme: by March 2022 employers were advertising a record 12.3 million unfilled openings (JTSJOL), roughly two for every unemployed worker.",
        hint: "Open Labor Market & Population → Total Nonfarm Payrolls, then set its transform to Growth Rate and turn on recession shading.",
        target: {
          series: [{ id: "PAYEMS", transform: "YOY_GROWTH" }],
          recessions: true,
        },
      },
      {
        id: "q-payroll-count",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "How big is the U.S. job market?",
        body:
          "Switch PAYEMS back to a level for a moment. Roughly how many nonfarm payroll jobs does the U.S. economy have today?",
        options: [
          "About 16 million",
          "About 60 million",
          "About 160 million",
          "About 330 million",
        ],
        correctIndex: 2,
        explanation:
          "PAYEMS is stated in thousands, so the latest reading of about 158,900 means roughly 159 million jobs — call it 160 million. 330 million is the total U.S. population, which includes children, retirees, and everyone else outside the workforce; a useful sanity check is that the labor force is about 169 million people.",
        sources: ["PAYEMS", "CLF16OV"],
      },
    ],
  },
};
