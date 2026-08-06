/* ======================================================
   INCOME STACK — PROJECTION ENGINE

   This file contains financial projection logic only.

   It should contain:
   - inflation calculations
   - salary growth
   - Armed Forces pension milestone handling
   - workplace pension accumulation
   - investment accumulation
   - drawdown calculations
   - today's-money conversions

   It should NOT contain React, JSX or UI logic.
====================================================== */


/* ======================================================
   GENERAL NUMBER HELPERS
====================================================== */

export function clampNumber(
  value,
  min = 0,
  max = Infinity,
) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(
    Math.max(number, min),
    max,
  );
}


/* ======================================================
   INFLATION
====================================================== */

export function inflationFactor(
  annualInflationRate,
  years,
) {
  const rate =
    clampNumber(
      annualInflationRate,
      0,
      20,
    ) / 100;

  return Math.pow(
    1 + rate,
    Math.max(0, years),
  );
}


export function inflateValue(
  value,
  annualInflationRate,
  years,
) {
  return (
    Number(value || 0) *
    inflationFactor(
      annualInflationRate,
      years,
    )
  );
}


export function deflateValue(
  value,
  annualInflationRate,
  years,
) {
  return (
    Number(value || 0) /
    inflationFactor(
      annualInflationRate,
      years,
    )
  );
}


/* ======================================================
   DISPLAY VALUE

   Converts a projected nominal future amount into either:

   FUTURE:
   actual nominal future pounds.

   TODAY:
   equivalent purchasing power in today's money.
====================================================== */

export function convertProjectedValue({
  value,
  age,
  baseAge,
  inflationRate,
  displayMode,
}) {
  if (displayMode === "future") {
    return value;
  }

  return deflateValue(
    value,
    inflationRate,
    Math.max(0, age - baseAge),
  );
}


/* ======================================================
   SALARY
====================================================== */

export function salaryAtAge({
  startingSalary,
  startAge,
  age,
  annualGrowthRate,
}) {
  if (age < startAge) {
    return 0;
  }

  return (
    Number(startingSalary || 0) *
    Math.pow(
      1 +
        Number(annualGrowthRate || 0) /
          100,
      age - startAge,
    )
  );
}


/* ======================================================
   ARMED FORCES PENSION — OFFICIAL MILESTONES

   Income Stack does NOT currently recreate AFPS rules.

   Instead, the official forecast is treated as the
   source of truth.

   Each event contains an age and an annualIncome.

   The latest milestone reached at the selected age is
   therefore used as the relevant official forecast value.
====================================================== */

export function getOfficialPensionAtAge(
  pension,
  age,
) {
  if (!pension?.events?.length) {
    return 0;
  }

  const eligibleEvents = pension.events
    .filter(
      (event) =>
        typeof event.annualIncome ===
          "number" &&
        event.age <= age,
    )
    .sort((a, b) => a.age - b.age);

  if (!eligibleEvents.length) {
    return 0;
  }

  return eligibleEvents[
    eligibleEvents.length - 1
  ].annualIncome;
}


/* ======================================================
   ARMED FORCES PENSION DISPLAY VALUE

   Official forecast figures are currently treated as
   today's-money figures.

   Before age 55:
   AFPS 15 EDP is treated as flat in nominal terms.

   Age 55 onward:
   The forecast milestone is converted into illustrative
   future pounds using the user's CPI assumption.

   IMPORTANT:
   This remains an illustration.

   Later we can replace this with individual benefit
   streams carrying their own indexation rule.
====================================================== */

export function armedForcesPensionAtAge({
  pension,
  age,
  inflationRate,
  displayMode,
}) {
  const officialAmount =
    getOfficialPensionAtAge(
      pension,
      age,
    );

  if (!officialAmount) {
    return 0;
  }

  if (displayMode === "today") {
    return officialAmount;
  }

  const leavingAge =
    pension?.leavingAge ?? 40;

  if (age < 55) {
    return officialAmount;
  }

  return inflateValue(
    officialAmount,
    inflationRate,
    age - leavingAge,
  );
}


/* ======================================================
   WORKPLACE PENSION ACCUMULATION

   Defined-contribution pension.

   Salary grows monthly.

   Employee and employer pension contributions therefore
   rise as salary grows.

   Investments then grow at the selected annual return.
====================================================== */

export function projectWorkplacePension({
  startingSalary,
  salaryStartAge,
  targetAge,
  salaryGrowthRate,
  employeeContributionPercent,
  employerContributionPercent,
  investmentReturn,
}) {
  if (targetAge <= salaryStartAge) {
    return 0;
  }

  const months = Math.max(
    0,
    Math.round(
      (targetAge - salaryStartAge) *
        12,
    ),
  );

  const monthlyInvestmentRate =
    Number(investmentReturn || 0) /
    100 /
    12;

  const monthlySalaryGrowthRate =
    Number(salaryGrowthRate || 0) /
    100 /
    12;

  const contributionRate =
    (Number(
      employeeContributionPercent || 0,
    ) +
      Number(
        employerContributionPercent || 0,
      )) /
    100;

  let balance = 0;

  let monthlySalary =
    Number(startingSalary || 0) / 12;

  for (
    let month = 0;
    month < months;
    month += 1
  ) {
    /*
      Existing pension pot grows first.
    */

    balance *=
      1 + monthlyInvestmentRate;

    /*
      Pension contribution is based on
      salary at this point in time.
    */

    balance +=
      monthlySalary * contributionRate;

    /*
      Salary then grows for the next month.
    */

    monthlySalary *=
      1 + monthlySalaryGrowthRate;
  }

  return balance;
}


/* ======================================================
   ACCESSIBLE INVESTMENTS

   Used for:
   - ISA
   - general investments
   - accessible savings invested for growth

   Monthly contributions are added and the pot compounds.
====================================================== */

export function projectInvestments({
  startingBalance,
  monthlyContribution,
  fromAge,
  targetAge,
  investmentReturn,
}) {
  const months = Math.max(
    0,
    Math.round(
      (targetAge - fromAge) * 12,
    ),
  );

  const monthlyRate =
    Number(investmentReturn || 0) /
    100 /
    12;

  let balance =
    Number(startingBalance || 0);

  for (
    let month = 0;
    month < months;
    month += 1
  ) {
    balance *= 1 + monthlyRate;

    balance +=
      Number(
        monthlyContribution || 0,
      );
  }

  return balance;
}


/* ======================================================
   SIMPLE DRAWDOWN

   Returns the illustrative annual income generated by
   withdrawing the selected percentage of a pot.

   Example:

   £500,000 × 4% = £20,000 per year.
====================================================== */

export function annualDrawdownIncome(
  pot,
  drawdownRate,
) {
  return (
    Number(pot || 0) *
    (Number(drawdownRate || 0) /
      100)
  );
}


/* ======================================================
   POT DURING RETIREMENT / DRAWDOWN

   The pot remains invested after retirement.

   Each year:

   1. Investment growth is applied.
   2. A percentage of the resulting pot is withdrawn.
   3. The remaining balance carries forward.

   This is an illustration — NOT a safe withdrawal
   recommendation.
====================================================== */

export function projectPotWithDrawdown({
  startingPot,
  startingAge,
  targetAge,
  annualGrowthRate,
  drawdownRate,
}) {
  let balance = Math.max(
    0,
    Number(startingPot || 0),
  );

  if (targetAge <= startingAge) {
    return {
      balance,

      annualIncome:
        annualDrawdownIncome(
          balance,
          drawdownRate,
        ),
    };
  }

  const years =
    targetAge - startingAge;

  for (
    let year = 0;
    year < years;
    year += 1
  ) {
    /*
      Investment growth.
    */

    balance *=
      1 +
      Number(
        annualGrowthRate || 0,
      ) /
        100;

    /*
      Withdrawal.
    */

    const withdrawal =
      annualDrawdownIncome(
        balance,
        drawdownRate,
      );

    balance = Math.max(
      0,
      balance - withdrawal,
    );
  }

  return {
    balance,

    annualIncome:
      annualDrawdownIncome(
        balance,
        drawdownRate,
      ),
  };
}


/* ======================================================
   PENSION ACCESS

   Utility for deciding whether a DC pension can be used
   at the user's selected work-optional age.
====================================================== */

export function canAccessPension({
  selectedAge,
  accessAge,
}) {
  return selectedAge >= accessAge;
}


/* ======================================================
   STATE PENSION

   User enters State Pension in today's money.

   When future-pound mode is selected, convert it to a
   nominal value at State Pension age using the inflation
   assumption.
====================================================== */

export function statePensionAtAge({
  annualAmountToday,
  startAge,
  baseAge,
  inflationRate,
  displayMode,
  enabled = true,
}) {
  if (!enabled) {
    return 0;
  }

  if (displayMode === "today") {
    return Number(
      annualAmountToday || 0,
    );
  }

  return inflateValue(
    annualAmountToday,
    inflationRate,
    Math.max(
      0,
      startAge - baseAge,
    ),
  );
}


/* ======================================================
   TOTAL INCOME

   Simple helper so the UI never needs to manually sum a
   collection of income streams.
====================================================== */

export function totalIncome(...values) {
  return values.reduce(
    (total, value) =>
      total + Number(value || 0),
    0,
  );
}
