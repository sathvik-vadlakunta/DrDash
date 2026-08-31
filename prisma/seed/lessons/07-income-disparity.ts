import type { LessonSeed } from "../../../src/lib/lessons/schema";

/**
 * Lesson 7 — Income Disparity.
 * Lesson plan lesson 6. First lesson to use the income-distribution category
 * (median incomes, the Gini index, and the SAIPE poverty measures).
 */
export const LESSON_07: LessonSeed = {
  slug: "income-disparity",
  title: "Income Disparity",
  summary:
    "How economists measure who gets what: median versus mean income, the Gini index as a one-number summary of inequality, and the poverty rate — including the long stagnation of median household income after 2000 and the rise in U.S. inequality since the 1970s.",
  level: "INTRO",
  estimatedMinutes: 30,
  sortOrder: 60,
  planLesson: 6,
  content: {
    objectives: [
      "Distinguish the median from the mean and explain why the median tracks the typical household",
      "Read the history of real median household income, including the post-2000 stagnation and the recent record",
      "Interpret the Gini index's 0–100 scale and state the direction of U.S. income inequality since the 1970s",
      "Define the poverty rate and describe its range over the past three decades",
    ],
    sources: [
      "MEHOINUSA672N",
      "MEFAINUSA672N",
      "SIPOVGINIUSA",
      "PPAAUS00000A156NCEN",
      "PEAAUS00000A647NCEN",
      "USREC",
    ],
    steps: [
      {
        id: "read-measuring-the-distribution",
        type: "READ",
        title: "Three ways to measure who gets what",
        body:
          "GDP tells you how much income the economy generates in total; it says nothing about how that income is divided. For that, economists start with median income: line up every household from poorest to richest, and the median is the one exactly in the middle — half earn more, half earn less. The mean (total income divided by the number of households) sounds similar but behaves very differently, because income distributions are heavily skewed toward the top. A handful of extremely high incomes pulls the mean well above what the household in the middle actually earns, which is why \"typical\" income statistics use the median.\n\nThe second tool is the Gini index, a single number that summarizes inequality across the entire distribution on a 0-to-100 scale: 0 means every household receives exactly the same income, and 100 means one household receives everything. Real economies fall in between, and because the index compresses the whole distribution into one number, a movement of even a point or two signals a substantial shift in how income is shared.\n\nThe third is the poverty rate: the share of people whose family income falls below the official poverty line, a threshold that varies with family size and is updated for inflation each year. Statsbook Table 16 collects these distribution measures side by side; note that it is stated in family terms — median family income (two or more related people living together, MEFAINUSA672N) runs well above median household income, which also counts people living alone: about $105,800 versus $83,730 in 2024. In this lesson you will plot the household median, the Gini index, and the poverty rate.",
      },
      {
        id: "task-median-household-income",
        type: "TASK",
        points: 10,
        title: "Plot real median household income",
        body:
          "Plot Real Median Household Income (MEHOINUSA672N) as a level. The series is already inflation-adjusted by the Census Bureau, so what you see is purchasing power, not rising prices. It begins in 1984 at about $60,400 and climbs through the long 1990s boom to roughly $72,000 by 1999–2000.\n\nThen comes the striking part: fifteen years of nothing. From that 2000 plateau the median slips through two recessions — briefly touching $73,000 in 2007 before falling to about $67,400 by 2011–12 — and does not durably surpass its 2000 level until 2015. The household in the middle of the distribution saw essentially no net gain in real income from the late 1990s to the mid-2010s, even as total GDP kept growing.\n\nAfter 2014 the line finally breaks upward: a jump to $83,260 by 2019, a dip during the pandemic and the 2021–22 inflation surge (down to $79,500 in 2022), and then a recovery to a record $83,730 in 2024. Whether the typical household is gaining ground is exactly the question this one line answers.",
        hint: "Open Income Distribution → Real Median Household Income; leave its transform set to Level.",
        target: {
          series: [{ id: "MEHOINUSA672N", transform: "LEVEL" }],
        },
      },
      {
        id: "q-median-vs-mean",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Why the median, not the mean?",
        body:
          "Census reports on the income of the \"typical\" American household use median income rather than mean (average) income. Why is the median the better measure of the typical household?",
        options: [
          "Very high incomes at the top pull the mean upward, while the median stays anchored to the household in the middle",
          "The median is measured more accurately than the mean in survey data",
          "The mean cannot be adjusted for inflation, but the median can",
          "The median includes non-cash benefits that the mean leaves out",
        ],
        correctIndex: 0,
        explanation:
          "Income distributions are skewed to the right: there is no lower bound pulling incomes down, but a small number of extremely high earners pulls the mean far above the middle. If one billionaire moves to town, mean income jumps while the median household's situation is unchanged — so the median is the honest measure of the typical household.",
        sources: ["MEHOINUSA672N"],
      },
      {
        id: "task-gini-index",
        type: "TASK",
        points: 10,
        title: "Plot the Gini index of income inequality",
        body:
          "Plot the Gini Index of Income Inequality (SIPOVGINIUSA) as a level. Remember the scale: 0 is perfect equality, 100 is one household receiving everything, so higher means more unequal.\n\nThrough the 1970s the U.S. Gini hovered in the mid-30s and was actually drifting down, bottoming at 34.7 in 1980 — the least unequal reading in the series. Then the trend reversed: the index climbed through the 1980s and 1990s, passing 38 by 1989 and 40 by the mid-1990s, and it has fluctuated between roughly 40 and 42 ever since, touching 41.9 in 2019 and standing at 41.8 in 2024.\n\nA seven-point rise on this scale is a big move — it means the U.S. income distribution today is substantially more concentrated than it was two generations ago. Notice also the shape of the rise: most of it happened between 1980 and the mid-1990s, with a high plateau (not a decline) since.",
        hint: "Open Income Distribution → Gini Index of Income Inequality; leave its transform set to Level.",
        target: {
          series: [{ id: "SIPOVGINIUSA", transform: "LEVEL" }],
        },
      },
      {
        id: "q-inequality-direction",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "The direction of U.S. inequality",
        body:
          "Based on the Gini index you just plotted, what has happened to U.S. income inequality since the 1970s?",
        options: [
          "It has risen substantially, with most of the increase between 1980 and the mid-1990s",
          "It has fallen substantially as the economy grew",
          "It has been essentially flat for fifty years",
          "It rose in the 1980s but has since returned to its 1970s level",
        ],
        correctIndex: 0,
        explanation:
          "The Gini index climbed from a low of 34.7 in 1980 to around 40 by the mid-1990s and has stayed in the 40–42 range since, reaching 41.8 in 2024. That is a substantial, sustained increase in inequality — and the plateau since 2000 means the rise has persisted, not reversed.",
        sources: ["SIPOVGINIUSA"],
      },
      {
        id: "task-poverty-rate",
        type: "TASK",
        points: 10,
        title: "Plot the poverty rate",
        body:
          "Plot the Poverty Rate: All Ages (PPAAUS00000A156NCEN) as a level. This is the Census Bureau's SAIPE estimate of the share of all people living below the poverty line, and the series begins in 1989.\n\nOver those three and a half decades the rate has stayed within a band of roughly 11% to 16%. The late-1990s boom pushed it down to its low of 11.3% in 2000; the Great Recession and its slow recovery drove it up to a peak of 15.9% in 2011–12; and the long expansion of the 2010s brought it back down, to 12.1% by 2024. In headcount terms (People in Poverty: All Ages, PEAAUS00000A647NCEN), that is about 40 million people today, down from nearly 49 million at the 2013 peak.\n\nTwo things are worth noticing. First, the poverty rate moves with the business cycle — recessions push it up with a lag, expansions grind it down. Second, even at its best the U.S. rate never falls much below 11%: poverty responds to growth, but growth alone has not eliminated it.",
        hint: "Open Income Distribution → Poverty Rate: All Ages; leave its transform set to Level.",
        target: {
          series: [{ id: "PPAAUS00000A156NCEN", transform: "LEVEL" }],
        },
      },
      {
        id: "q-gini-zero",
        type: "QUESTION_MC",
        points: 10,
        tries: 2,
        title: "Interpreting the Gini scale",
        body: "On the Gini index's 0-to-100 scale, what would a value of 0 mean?",
        options: [
          "Every household receives exactly the same income",
          "One household receives all of the income",
          "No household falls below the poverty line",
          "Average income in the country is zero",
        ],
        correctIndex: 0,
        explanation:
          "The Gini index measures how income is distributed, not how much there is or how many people are poor: 0 is perfect equality (everyone identical), and 100 is maximal inequality (one household gets everything). Actual economies fall in between — the U.S. currently sits at about 42.",
        sources: ["SIPOVGINIUSA"],
      },
    ],
  },
};
