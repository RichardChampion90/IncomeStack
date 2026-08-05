import { useMemo, useState } from "react";

/* ======================================================
   FORMATTING
====================================================== */

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function clampNumber(value, min = 0, max = Infinity) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.min(Math.max(number, min), max);
}

function inflationFactor(rate, years) {
  return Math.pow(
    1 + clampNumber(rate, 0, 20) / 100,
    Math.max(0, years),
  );
}

function inflate(value, rate, years) {
  return value * inflationFactor(rate, years);
}

function deflate(value, rate, years) {
  return value / inflationFactor(rate, years);
}

/* ======================================================
   ARMED FORCES PENSION

   The uploaded/mock forecast is treated as the official
   source for pension milestone values.

   "Today's money":
   return the official milestone amount.

   "Future pounds":
   express that official today's-money amount in nominal
   pounds at the selected future age using the user's CPI
   assumption.

   This deliberately remains an illustration rather than
   attempting to recreate the AFPS calculator.
====================================================== */

function officialPensionAtAge(pension, age) {
  if (!pension?.events?.length) {
    return 0;
  }

  const eligibleEvents = pension.events
    .filter(
      (event) =>
        typeof event.annualIncome === "number" &&
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

function armedForcesPensionAtAge({
  pension,
  age,
  inflationRate,
  displayMode,
}) {
  const officialAmount =
    officialPensionAtAge(pension, age);

  if (!officialAmount) {
    return 0;
  }

  if (displayMode === "today") {
    return officialAmount;
  }

  const leavingAge = pension?.leavingAge ?? 40;

  /*
    The forecast figures are being treated as today's-money
    values.

    Before age 55, an AFPS15 EDP is nominally flat, so the
    leaving amount is not inflated.

    From 55 onwards, the official milestone value is shown
    in future nominal pounds using accumulated CPI from exit.

    This is an illustration only. When real PDF parsing is
    implemented we should attach scheme-specific inflation
    rules to each benefit stream.
  */

  if (age < 55) {
    return officialAmount;
  }

  return inflate(
    officialAmount,
    inflationRate,
    age - leavingAge,
  );
}

/* ======================================================
   SALARY
====================================================== */

function salaryAtAge({
  startingSalary,
  startAge,
  age,
  salaryGrowthRate,
}) {
  if (age < startAge) {
    return 0;
  }

  return inflate(
    startingSalary,
    salaryGrowthRate,
    age - startAge,
  );
}

/* ======================================================
   DC WORKPLACE PENSION

   Contributions rise as salary rises.

   Monthly simulation avoids assuming every contribution
   is based on the starting salary.
====================================================== */

function projectWorkplacePensionToAge({
  startingSalary,
  salaryStartAge,
  targetAge,
  salaryGrowthRate,
  employeePercent,
  employerPercent,
  investmentReturn,
}) {
  if (targetAge <= salaryStartAge) {
    return 0;
  }

  const months = Math.round(
    (targetAge - salaryStartAge) * 12,
  );

  const monthlyInvestmentRate =
    investmentReturn / 100 / 12;

  const monthlySalaryGrowthRate =
    salaryGrowthRate / 100 / 12;

  const totalContributionPercent =
    (employeePercent + employerPercent) / 100;

  let balance = 0;
  let monthlySalary = startingSalary / 12;

  for (let month = 0; month < months; month += 1) {
    balance *= 1 + monthlyInvestmentRate;

    balance +=
      monthlySalary * totalContributionPercent;

    monthlySalary *=
      1 + monthlySalaryGrowthRate;
  }

  return balance;
}

/* ======================================================
   SAVINGS / INVESTMENTS
====================================================== */

function projectInvestmentsToAge({
  startingBalance,
  monthlyContribution,
  fromAge,
  targetAge,
  investmentReturn,
}) {
  const months = Math.max(
    0,
    Math.round((targetAge - fromAge) * 12),
  );

  const monthlyRate =
    investmentReturn / 100 / 12;

  let balance = startingBalance;

  for (let month = 0; month < months; month += 1) {
    balance *= 1 + monthlyRate;
    balance += monthlyContribution;
  }

  return balance;
}

/* ======================================================
   POT AFTER DRAWDOWN STARTS

   Simple percentage drawdown model:

   - pot continues growing
   - each year, selected percentage of current pot is drawn
   - remaining pot rolls forward

   This is deliberately an illustration rather than a
   sustainable-withdrawal recommendation.
====================================================== */

function projectPotWithDrawdown({
  startingPot,
  startingAge,
  targetAge,
  annualGrowthRate,
  drawdownRate,
}) {
  let balance = Math.max(0, startingPot);

  if (targetAge <= startingAge) {
    return {
      balance,
      annualIncome:
        balance * (drawdownRate / 100),
    };
  }

  const years = targetAge - startingAge;

  for (let year = 0; year < years; year += 1) {
    balance *=
      1 + annualGrowthRate / 100;

    const withdrawal =
      balance * (drawdownRate / 100);

    balance = Math.max(
      0,
      balance - withdrawal,
    );
  }

  return {
    balance,
    annualIncome:
      balance * (drawdownRate / 100),
  };
}

/* ======================================================
   MAIN COMPONENT
====================================================== */

function IncomeStackBuilderView({
  pension,
  onBack,
}) {
  const leavingAge =
    pension?.leavingAge ?? 40;

  const statePensionAge =
    pension?.statePensionAge ?? 68;

  /* ---------- Display ---------- */

  const [displayMode, setDisplayMode] =
    useState("future");

  const [inflationRate, setInflationRate] =
    useState(2.5);

  /* ---------- Job ---------- */

  const [salary, setSalary] =
    useState(60000);

  const [salaryStartAge, setSalaryStartAge] =
    useState(leavingAge);

  const [salaryGrowthRate, setSalaryGrowthRate] =
    useState(2);

  /* ---------- Retirement goal ---------- */

  const [workOptionalAge, setWorkOptionalAge] =
    useState(60);

  /* ---------- Workplace pension ---------- */

  const [
    employeePensionPercent,
    setEmployeePensionPercent,
  ] = useState(8);

  const [
    employerPensionPercent,
    setEmployerPensionPercent,
  ] = useState(8);

  const [
    workplacePensionGrowthRate,
    setWorkplacePensionGrowthRate,
  ] = useState(4);

  const [
    workplacePensionDrawdownRate,
    setWorkplacePensionDrawdownRate,
  ] = useState(4);

  const [
    workplacePensionAccessAge,
    setWorkplacePensionAccessAge,
  ] = useState(57);

  /* ---------- Investments ---------- */

  const [
    existingInvestments,
    setExistingInvestments,
  ] = useState(5000);

  const [
    monthlyInvestments,
    setMonthlyInvestments,
  ] = useState(500);

  const [
    investmentGrowthRate,
    setInvestmentGrowthRate,
  ] = useState(5);

  const [
    investmentDrawdownRate,
    setInvestmentDrawdownRate,
  ] = useState(4);

  /* ---------- State Pension ---------- */

  const [
    statePensionEnabled,
    setStatePensionEnabled,
  ] = useState(true);

  const [
    statePensionIncome,
    setStatePensionIncome,
  ] = useState(12000);

  const [
    statePensionStartAge,
    setStatePensionStartAge,
  ] = useState(statePensionAge);

  /* ====================================================
     SALARY
  ==================================================== */

  const salaryWhenLeaving =
    salaryAtAge({
      startingSalary: salary,
      startAge: salaryStartAge,
      age: leavingAge,
      salaryGrowthRate,
    });

  /* ====================================================
     POT VALUES WHEN WORK STOPS
  ==================================================== */

  const workplacePotAtOptionalNominal =
    useMemo(() => {
      return projectWorkplacePensionToAge({
        startingSalary: salary,
        salaryStartAge,
        targetAge: workOptionalAge,
        salaryGrowthRate,
        employeePercent:
          employeePensionPercent,
        employerPercent:
          employerPensionPercent,
        investmentReturn:
          workplacePensionGrowthRate,
      });
    }, [
      salary,
      salaryStartAge,
      workOptionalAge,
      salaryGrowthRate,
      employeePensionPercent,
      employerPensionPercent,
      workplacePensionGrowthRate,
    ]);

  const investmentsAtOptionalNominal =
    useMemo(() => {
      return projectInvestmentsToAge({
        startingBalance:
          existingInvestments,
        monthlyContribution:
          monthlyInvestments,
        fromAge: leavingAge,
        targetAge: workOptionalAge,
        investmentReturn:
          investmentGrowthRate,
      });
    }, [
      existingInvestments,
      monthlyInvestments,
      leavingAge,
      workOptionalAge,
      investmentGrowthRate,
    ]);

  /* ====================================================
     WORKPLACE PENSION ACCESS

     If work stops before access age, the pension remains
     invested until access age. No workplace pension
     drawdown is included before that point.
  ==================================================== */

  const workplaceDrawdownStartAge =
    Math.max(
      workOptionalAge,
      workplacePensionAccessAge,
    );

  const workplacePotAtAccessNominal =
    useMemo(() => {
      if (
        workplaceDrawdownStartAge ===
        workOptionalAge
      ) {
        return workplacePotAtOptionalNominal;
      }

      return (
        workplacePotAtOptionalNominal *
        Math.pow(
          1 +
            workplacePensionGrowthRate /
              100,
          workplaceDrawdownStartAge -
            workOptionalAge,
        )
      );
    }, [
      workplacePotAtOptionalNominal,
      workplaceDrawdownStartAge,
      workOptionalAge,
      workplacePensionGrowthRate,
    ]);

  /* ====================================================
     POT PROJECTIONS AT STATE-PENSION AGE
  ==================================================== */

  const workplaceAtStateAgeNominal =
    useMemo(() => {
      if (
        statePensionStartAge <
        workplaceDrawdownStartAge
      ) {
        return {
          balance:
            workplacePotAtAccessNominal,
          annualIncome: 0,
        };
      }

      return projectPotWithDrawdown({
        startingPot:
          workplacePotAtAccessNominal,
        startingAge:
          workplaceDrawdownStartAge,
        targetAge:
          statePensionStartAge,
        annualGrowthRate:
          workplacePensionGrowthRate,
        drawdownRate:
          workplacePensionDrawdownRate,
      });
    }, [
      workplacePotAtAccessNominal,
      workplaceDrawdownStartAge,
      statePensionStartAge,
      workplacePensionGrowthRate,
      workplacePensionDrawdownRate,
    ]);

  const investmentsAtStateAgeNominal =
    useMemo(() => {
      return projectPotWithDrawdown({
        startingPot:
          investmentsAtOptionalNominal,
        startingAge:
          workOptionalAge,
        targetAge:
          statePensionStartAge,
        annualGrowthRate:
          investmentGrowthRate,
        drawdownRate:
          investmentDrawdownRate,
      });
    }, [
      investmentsAtOptionalNominal,
      workOptionalAge,
      statePensionStartAge,
      investmentGrowthRate,
      investmentDrawdownRate,
    ]);

  /* ====================================================
     DRAW DOWN INCOME AT OPTIONAL AGE
  ==================================================== */

  const workplaceIncomeAtOptionalNominal =
    workOptionalAge >=
    workplacePensionAccessAge
      ? workplacePotAtOptionalNominal *
        (workplacePensionDrawdownRate /
          100)
      : 0;

  const investmentIncomeAtOptionalNominal =
    investmentsAtOptionalNominal *
    (investmentDrawdownRate / 100);

  /* ====================================================
     ARMED FORCES PENSION
  ==================================================== */

  const afPensionAtLeaving =
    armedForcesPensionAtAge({
      pension,
      age: leavingAge,
      inflationRate,
      displayMode,
    });

  const afPensionAtOptional =
    armedForcesPensionAtAge({
      pension,
      age: workOptionalAge,
      inflationRate,
      displayMode,
    });

  const afPensionAtStateAge =
    armedForcesPensionAtAge({
      pension,
      age: statePensionStartAge,
      inflationRate,
      displayMode,
    });

  /* ====================================================
     DISPLAY CONVERSION

     Pot projections above are nominal.

     Today's-money mode converts them back into current
     purchasing power.
  ==================================================== */

  const convertFromFuture = (
    value,
    age,
  ) => {
    if (displayMode === "future") {
      return value;
    }

    return deflate(
      value,
      inflationRate,
      age - leavingAge,
    );
  };

  const workplacePotAtOptional =
    convertFromFuture(
      workplacePotAtOptionalNominal,
      workOptionalAge,
    );

  const investmentsAtOptional =
    convertFromFuture(
      investmentsAtOptionalNominal,
      workOptionalAge,
    );

  const workplaceIncomeAtOptional =
    convertFromFuture(
      workplaceIncomeAtOptionalNominal,
      workOptionalAge,
    );

  const investmentIncomeAtOptional =
    convertFromFuture(
      investmentIncomeAtOptionalNominal,
      workOptionalAge,
    );

  const workplacePotAtStateAge =
    convertFromFuture(
      workplaceAtStateAgeNominal.balance,
      statePensionStartAge,
    );

  const investmentPotAtStateAge =
    convertFromFuture(
      investmentsAtStateAgeNominal.balance,
      statePensionStartAge,
    );

  const workplaceIncomeAtStateAge =
    convertFromFuture(
      workplaceAtStateAgeNominal.annualIncome,
      statePensionStartAge,
    );

  const investmentIncomeAtStateAge =
    convertFromFuture(
      investmentsAtStateAgeNominal.annualIncome,
      statePensionStartAge,
    );

  /* ====================================================
     STATE PENSION

     User input is explicitly in today's money.
  ==================================================== */

  const statePensionAtStateAge =
    !statePensionEnabled
      ? 0
      : displayMode === "today"
        ? statePensionIncome
        : inflate(
            statePensionIncome,
            inflationRate,
            statePensionStartAge -
              leavingAge,
          );

  /* ====================================================
     TOTAL INCOME
  ==================================================== */

  const salaryAtLeavingDisplay =
    displayMode === "today"
      ? salaryWhenLeaving
      : salaryWhenLeaving;

  const totalAtLeaving =
    salaryAtLeavingDisplay +
    afPensionAtLeaving;

  const totalAtOptional =
    afPensionAtOptional +
    workplaceIncomeAtOptional +
    investmentIncomeAtOptional;

  const totalAtStateAge =
    afPensionAtStateAge +
    workplaceIncomeAtStateAge +
    investmentIncomeAtStateAge +
    statePensionAtStateAge;

  const pensionAvailableAtOptional =
    workOptionalAge >=
    workplacePensionAccessAge;

  return (
    <main className="builder-view">
      <div className="builder-view__container">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to pension
        </button>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="builder-hero">
          <div
            className="stack-mark"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>

          <p className="builder-eyebrow">
            Build your Income Stack
          </p>

          <h1>
            What could life after service
            look like?
          </h1>

          <p>
            Your Armed Forces pension gives you
            the foundation. Now add the other
            income you expect to build after
            leaving.
          </p>
        </section>

        {/* =================================================
            FOUNDATION
        ================================================= */}

        <section className="foundation-card">
          <div>
            <p className="builder-eyebrow">
              Your foundation
            </p>

            <h2>
              Armed Forces pension
            </h2>

            <p>
              {pension?.scenarioName ||
                "Selected forecast outcome"}
            </p>
          </div>

          <div className="foundation-card__figures">
            <div>
              <span>
                From age {leavingAge}
              </span>

              <strong>
                {formatMoney(
                  pension?.exitIncome || 0,
                )}
                /yr
              </strong>
            </div>

            <div>
              <span>
                Exit lump sum
              </span>

              <strong>
                {formatMoney(
                  pension?.exitLumpSum || 0,
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            PROJECTION SETTINGS
        ================================================= */}

        <section className="assumptions-bar">
          <div>
            <p className="builder-eyebrow">
              Projection settings
            </p>

            <h2>
              How should we show your future
              money?
            </h2>
          </div>

          <div className="money-mode-toggle">
            <button
              type="button"
              className={`money-mode-toggle__button ${
                displayMode === "today"
                  ? "money-mode-toggle__button--active"
                  : ""
              }`}
              onClick={() =>
                setDisplayMode("today")
              }
            >
              Today’s money
            </button>

            <button
              type="button"
              className={`money-mode-toggle__button ${
                displayMode === "future"
                  ? "money-mode-toggle__button--active"
                  : ""
              }`}
              onClick={() =>
                setDisplayMode("future")
              }
            >
              Future pounds
            </button>
          </div>

          <label className="inflation-control">
            <span>
              Assumed CPI inflation
            </span>

            <div className="suffix-input">
              <input
                type="number"
                value={inflationRate}
                min="0"
                max="10"
                step="0.1"
                onChange={(event) =>
                  setInflationRate(
                    clampNumber(
                      event.target.value,
                      0,
                      10,
                    ),
                  )
                }
              />

              <span>%</span>
            </div>
          </label>

          <p className="assumptions-bar__note">
            Today’s money shows future income in
            current purchasing power. Future
            pounds shows the estimated nominal
            amount you may actually see at that
            age.
          </p>
        </section>

        {/* =================================================
            BUILDER
        ================================================= */}

        <div className="builder-layout">
          <section className="builder-inputs">
            <div className="builder-section-heading">
              <p className="builder-eyebrow">
                Add your future
              </p>

              <h2>
                Build on top of your pension
              </h2>

              <p>
                These are planning assumptions.
                Change them and your Income Stack
                updates immediately.
              </p>
            </div>

            {/* JOB */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                01
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>Your next job</h3>

                  <p>
                    What might you earn after
                    leaving the Armed Forces?
                  </p>
                </div>
              </div>

              <div className="builder-fields">
                <label>
                  <span>
                    Annual salary
                  </span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={salary}
                      onChange={(event) =>
                        setSalary(
                          clampNumber(
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>Start age</span>

                  <input
                    type="number"
                    value={salaryStartAge}
                    min={leavingAge}
                    max="75"
                    onChange={(event) =>
                      setSalaryStartAge(
                        clampNumber(
                          event.target.value,
                          leavingAge,
                          75,
                        ),
                      )
                    }
                  />
                </label>

                <label>
                  <span>
                    Annual salary growth
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={salaryGrowthRate}
                      min="0"
                      max="10"
                      step="0.1"
                      onChange={(event) =>
                        setSalaryGrowthRate(
                          clampNumber(
                            event.target.value,
                            0,
                            10,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>
              </div>
            </article>

            {/* WORKPLACE PENSION */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                02
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>
                    Workplace pension
                  </h3>

                  <p>
                    Model a future
                    defined-contribution pension
                    separately from your Armed
                    Forces pension.
                  </p>
                </div>
              </div>

              <div className="builder-fields builder-fields--compact-four">
                <label>
                  <span>
                    Your contribution
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        employeePensionPercent
                      }
                      min="0"
                      max="100"
                      step="0.5"
                      onChange={(event) =>
                        setEmployeePensionPercent(
                          clampNumber(
                            event.target.value,
                            0,
                            100,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>
                    Employer contribution
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        employerPensionPercent
                      }
                      min="0"
                      max="100"
                      step="0.5"
                      onChange={(event) =>
                        setEmployerPensionPercent(
                          clampNumber(
                            event.target.value,
                            0,
                            100,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>
                    Investment return
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        workplacePensionGrowthRate
                      }
                      min="0"
                      max="15"
                      step="0.1"
                      onChange={(event) =>
                        setWorkplacePensionGrowthRate(
                          clampNumber(
                            event.target.value,
                            0,
                            15,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>
                    Drawdown rate
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        workplacePensionDrawdownRate
                      }
                      min="0"
                      max="10"
                      step="0.1"
                      onChange={(event) =>
                        setWorkplacePensionDrawdownRate(
                          clampNumber(
                            event.target.value,
                            0,
                            10,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>
                    Pension access age
                  </span>

                  <input
                    type="number"
                    value={
                      workplacePensionAccessAge
                    }
                    min="55"
                    max="75"
                    onChange={(event) =>
                      setWorkplacePensionAccessAge(
                        clampNumber(
                          event.target.value,
                          55,
                          75,
                        ),
                      )
                    }
                  />
                </label>
              </div>

              <div className="builder-result-grid">
                <div>
                  <span>
                    Projected pot when work
                    stops at {workOptionalAge}
                  </span>

                  <strong>
                    {formatMoney(
                      workplacePotAtOptional,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Illustrative income at{" "}
                    {workOptionalAge}
                  </span>

                  <strong>
                    {pensionAvailableAtOptional
                      ? `${formatMoney(
                          workplaceIncomeAtOptional,
                        )}/yr`
                      : "Not yet accessible"}
                  </strong>
                </div>
              </div>

              {!pensionAvailableAtOptional && (
                <div className="builder-access-note">
                  <strong>
                    Pension bridge needed
                  </strong>

                  <p>
                    You’ve selected work becoming
                    optional at age{" "}
                    {workOptionalAge}, but this
                    pension is set to become
                    accessible at age{" "}
                    {workplacePensionAccessAge}.
                    Income Stack therefore excludes
                    it from your income before that
                    age.
                  </p>
                </div>
              )}
            </article>

            {/* SAVINGS */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                03
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>
                    Savings & investments
                  </h3>

                  <p>
                    Model accessible savings,
                    ISAs and investments separately
                    from your pension.
                  </p>
                </div>
              </div>

              <div className="builder-fields builder-fields--compact-four">
                <label>
                  <span>
                    Already invested
                  </span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={
                        existingInvestments
                      }
                      onChange={(event) =>
                        setExistingInvestments(
                          clampNumber(
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Add each month
                  </span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={
                        monthlyInvestments
                      }
                      onChange={(event) =>
                        setMonthlyInvestments(
                          clampNumber(
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Investment return
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        investmentGrowthRate
                      }
                      min="0"
                      max="15"
                      step="0.1"
                      onChange={(event) =>
                        setInvestmentGrowthRate(
                          clampNumber(
                            event.target.value,
                            0,
                            15,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>
                    Drawdown rate
                  </span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={
                        investmentDrawdownRate
                      }
                      min="0"
                      max="10"
                      step="0.1"
                      onChange={(event) =>
                        setInvestmentDrawdownRate(
                          clampNumber(
                            event.target.value,
                            0,
                            10,
                          ),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>
              </div>

              <div className="builder-result-grid">
                <div>
                  <span>
                    Projected value at age{" "}
                    {workOptionalAge}
                  </span>

                  <strong>
                    {formatMoney(
                      investmentsAtOptional,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Illustrative drawdown
                  </span>

                  <strong>
                    {formatMoney(
                      investmentIncomeAtOptional,
                    )}
                    /yr
                  </strong>
                </div>
              </div>
            </article>

            {/* STATE PENSION */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                04
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>State Pension</h3>

                  <p>
                    Add an editable State Pension
                    assumption to your later-life
                    income.
                  </p>
                </div>

                <button
                  type="button"
                  className={`builder-toggle ${
                    statePensionEnabled
                      ? "builder-toggle--on"
                      : ""
                  }`}
                  onClick={() =>
                    setStatePensionEnabled(
                      (value) => !value,
                    )
                  }
                >
                  {statePensionEnabled
                    ? "Included"
                    : "Not included"}
                </button>
              </div>

              {statePensionEnabled && (
                <div className="builder-fields">
                  <label>
                    <span>
                      Annual amount in today’s
                      money
                    </span>

                    <div className="money-input">
                      <span>£</span>

                      <input
                        type="number"
                        value={
                          statePensionIncome
                        }
                        onChange={(event) =>
                          setStatePensionIncome(
                            clampNumber(
                              event.target.value,
                            ),
                          )
                        }
                      />
                    </div>
                  </label>

                  <label>
                    <span>
                      From age
                    </span>

                    <input
                      type="number"
                      value={
                        statePensionStartAge
                      }
                      min="55"
                      max="75"
                      onChange={(event) =>
                        setStatePensionStartAge(
                          clampNumber(
                            event.target.value,
                            55,
                            75,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              )}
            </article>
          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="builder-summary">
            <div className="builder-summary__sticky">
              <p className="builder-eyebrow">
                Your plan
              </p>

              <h2>
                When would you like work to
                become optional?
              </h2>

              <div className="optional-age">
                <strong>
                  {workOptionalAge}
                </strong>

                <span>years old</span>
              </div>

              <input
                className="optional-age-slider"
                type="range"
                min={Math.max(
                  leavingAge,
                  50,
                )}
                max={statePensionAge}
                value={workOptionalAge}
                onChange={(event) =>
                  setWorkOptionalAge(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              />

              <div className="optional-age-range">
                <span>
                  {Math.max(
                    leavingAge,
                    50,
                  )}
                </span>

                <span>
                  {statePensionAge}
                </span>
              </div>

              <div className="builder-summary__divider" />

              <span className="builder-summary__label">
                Estimated income if work
                stopped at {workOptionalAge}
              </span>

              <strong className="builder-summary__income">
                {formatMoney(
                  totalAtOptional,
                )}

                <small>/yr</small>
              </strong>

              <span className="builder-summary__monthly">
                About{" "}
                {formatMoney(
                  totalAtOptional / 12,
                )}{" "}
                per month before tax
              </span>

              <span className="builder-summary__mode">
                Shown in{" "}
                {displayMode === "today"
                  ? "today’s money"
                  : "future pounds"}
              </span>

              <div className="builder-summary__breakdown">
                <div>
                  <span>
                    Armed Forces pension
                  </span>

                  <strong>
                    {formatMoney(
                      afPensionAtOptional,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Workplace pension
                  </span>

                  <strong>
                    {pensionAvailableAtOptional
                      ? formatMoney(
                          workplaceIncomeAtOptional,
                        )
                      : "£0"}
                  </strong>
                </div>

                <div>
                  <span>
                    Investments
                  </span>

                  <strong>
                    {formatMoney(
                      investmentIncomeAtOptional,
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* =================================================
            INCOME TIMELINE
        ================================================= */}

        <section className="income-picture">
          <div className="builder-section-heading">
            <p className="builder-eyebrow">
              Your Income Stack
            </p>

            <h2>
              One future. Multiple income
              sources.
            </h2>

            <p>
              All figures below are shown in{" "}
              <strong>
                {displayMode === "today"
                  ? "today’s money"
                  : "future pounds"}
              </strong>
              .
            </p>
          </div>

          <div className="income-picture__timeline">
            {/* LEAVING */}

            <article className="income-stage">
              <div className="income-stage__age">
                <span>Age</span>

                <strong>
                  {leavingAge}
                </strong>
              </div>

              <div className="income-stage__content">
                <p>
                  Leave the Armed Forces
                </p>

                <h3>
                  {formatMoney(
                    totalAtLeaving,
                  )}

                  <small>
                    /yr gross income
                  </small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>
                      Future salary
                    </span>

                    <strong>
                      {formatMoney(
                        salaryAtLeavingDisplay,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Armed Forces pension
                    </span>

                    <strong>
                      {formatMoney(
                        afPensionAtLeaving,
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            {/* OPTIONAL */}

            <article className="income-stage income-stage--focus">
              <div className="income-stage__age">
                <span>Age</span>

                <strong>
                  {workOptionalAge}
                </strong>
              </div>

              <div className="income-stage__content">
                <p>
                  Work becomes optional
                </p>

                <h3>
                  {formatMoney(
                    totalAtOptional,
                  )}

                  <small>
                    /yr without salary
                  </small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>
                      Armed Forces pension
                    </span>

                    <strong>
                      {formatMoney(
                        afPensionAtOptional,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Workplace pension
                    </span>

                    <strong>
                      {pensionAvailableAtOptional
                        ? formatMoney(
                            workplaceIncomeAtOptional,
                          )
                        : "Not accessible yet"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Investments
                    </span>

                    <strong>
                      {formatMoney(
                        investmentIncomeAtOptional,
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            {/* STATE PENSION */}

            <article className="income-stage">
              <div className="income-stage__age">
                <span>Age</span>

                <strong>
                  {statePensionStartAge}
                </strong>
              </div>

              <div className="income-stage__content">
                <p>
                  State Pension stage
                </p>

                <h3>
                  {formatMoney(
                    totalAtStateAge,
                  )}

                  <small>
                    /yr estimated income
                  </small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>
                      Armed Forces pension
                    </span>

                    <strong>
                      {formatMoney(
                        afPensionAtStateAge,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Workplace pension
                    </span>

                    <strong>
                      {formatMoney(
                        workplaceIncomeAtStateAge,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Workplace pension pot
                    </span>

                    <strong>
                      {formatMoney(
                        workplacePotAtStateAge,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Investment income
                    </span>

                    <strong>
                      {formatMoney(
                        investmentIncomeAtStateAge,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Investments remaining
                    </span>

                    <strong>
                      {formatMoney(
                        investmentPotAtStateAge,
                      )}
                    </strong>
                  </div>

                  {statePensionEnabled && (
                    <div>
                      <span>
                        State Pension
                      </span>

                      <strong>
                        {formatMoney(
                          statePensionAtStateAge,
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* =================================================
            DISCLAIMER
        ================================================= */}

        <aside className="builder-disclaimer">
          <strong>
            About this projection
          </strong>

          <p>
            Armed Forces pension figures originate
            from the selected official forecast.
            Future-pound AFPS amounts are Income
            Stack illustrations using your CPI
            assumption. Workplace pension
            contributions rise with the salary
            growth assumption you enter. Pension
            and investment pots remain invested
            after drawdown begins and are modelled
            using a simple percentage-of-pot
            withdrawal each year. These figures
            are planning illustrations, not
            guarantees or financial advice.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default IncomeStackBuilderView;
