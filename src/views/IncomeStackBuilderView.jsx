import { useMemo, useState } from "react";

import {
  annualDrawdownIncome,
  armedForcesPensionAtAge,
  canAccessPension,
  clampNumber,
  convertProjectedValue,
  projectInvestments,
  projectPotWithDrawdown,
  projectWorkplacePension,
  salaryAtAge,
  statePensionAtAge,
  totalIncome,
} from "../lib/projectionEngine";

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value) || 0));
}

function IncomeStackBuilderView({
  pension,
  onBack,
}) {
  const leavingAge =
    pension?.leavingAge ?? 40;

  const statePensionAge =
    pension?.statePensionAge ?? 68;

  /* ======================================================
     DISPLAY SETTINGS
  ====================================================== */

  const [displayMode, setDisplayMode] =
    useState("future");

  const [inflationRate, setInflationRate] =
    useState(2.5);

  /* ======================================================
     FUTURE JOB
  ====================================================== */

  const [salary, setSalary] =
    useState(60000);

  const [salaryStartAge, setSalaryStartAge] =
    useState(leavingAge);

  const [salaryGrowthRate, setSalaryGrowthRate] =
    useState(2);

  /* ======================================================
     WORK OPTIONAL AGE
  ====================================================== */

  const [workOptionalAge, setWorkOptionalAge] =
    useState(60);

  /* ======================================================
     WORKPLACE PENSION
  ====================================================== */

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

  /* ======================================================
     SAVINGS & INVESTMENTS
  ====================================================== */

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

  /* ======================================================
     STATE PENSION
  ====================================================== */

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

  /* ======================================================
     SALARY AT EXIT
  ====================================================== */

  const salaryWhenLeaving =
    salaryAtAge({
      startingSalary: salary,
      startAge: salaryStartAge,
      age: leavingAge,
      annualGrowthRate:
        salaryGrowthRate,
    });

  /* ======================================================
     WORKPLACE PENSION POT
     AT WORK OPTIONAL AGE
  ====================================================== */

  const workplacePotAtOptionalNominal =
    useMemo(() => {
      return projectWorkplacePension({
        startingSalary: salary,
        salaryStartAge,
        targetAge: workOptionalAge,

        salaryGrowthRate,

        employeeContributionPercent:
          employeePensionPercent,

        employerContributionPercent:
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

  /* ======================================================
     INVESTMENTS AT WORK OPTIONAL AGE
  ====================================================== */

  const investmentsAtOptionalNominal =
    useMemo(() => {
      return projectInvestments({
        startingBalance:
          existingInvestments,

        monthlyContribution:
          monthlyInvestments,

        fromAge:
          leavingAge,

        targetAge:
          workOptionalAge,

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

  /* ======================================================
     WORKPLACE PENSION ACCESS
  ====================================================== */

  const pensionAvailableAtOptional =
    canAccessPension({
      selectedAge:
        workOptionalAge,

      accessAge:
        workplacePensionAccessAge,
    });

  const workplaceDrawdownStartAge =
    Math.max(
      workOptionalAge,
      workplacePensionAccessAge,
    );

  /* ======================================================
     IF RETIRING BEFORE PENSION ACCESS,
     ALLOW POT TO KEEP GROWING
  ====================================================== */

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

  /* ======================================================
     INCOME AT WORK OPTIONAL AGE
  ====================================================== */

  const workplaceIncomeAtOptionalNominal =
    pensionAvailableAtOptional
      ? annualDrawdownIncome(
          workplacePotAtOptionalNominal,
          workplacePensionDrawdownRate,
        )
      : 0;

  const investmentIncomeAtOptionalNominal =
    annualDrawdownIncome(
      investmentsAtOptionalNominal,
      investmentDrawdownRate,
    );

  /* ======================================================
     PROJECT POTS FORWARD AFTER
     DRAWDOWN BEGINS
  ====================================================== */

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

  /* ======================================================
     ARMED FORCES PENSION
  ====================================================== */

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

  /* ======================================================
     DISPLAY VALUE CONVERSIONS
  ====================================================== */

  const workplacePotAtOptional =
    convertProjectedValue({
      value:
        workplacePotAtOptionalNominal,

      age:
        workOptionalAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const investmentsAtOptional =
    convertProjectedValue({
      value:
        investmentsAtOptionalNominal,

      age:
        workOptionalAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const workplaceIncomeAtOptional =
    convertProjectedValue({
      value:
        workplaceIncomeAtOptionalNominal,

      age:
        workOptionalAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const investmentIncomeAtOptional =
    convertProjectedValue({
      value:
        investmentIncomeAtOptionalNominal,

      age:
        workOptionalAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const workplacePotAtStateAge =
    convertProjectedValue({
      value:
        workplaceAtStateAgeNominal.balance,

      age:
        statePensionStartAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const workplaceIncomeAtStateAge =
    convertProjectedValue({
      value:
        workplaceAtStateAgeNominal.annualIncome,

      age:
        statePensionStartAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const investmentPotAtStateAge =
    convertProjectedValue({
      value:
        investmentsAtStateAgeNominal.balance,

      age:
        statePensionStartAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  const investmentIncomeAtStateAge =
    convertProjectedValue({
      value:
        investmentsAtStateAgeNominal.annualIncome,

      age:
        statePensionStartAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,
    });

  /* ======================================================
     STATE PENSION
  ====================================================== */

  const statePensionAtStateAge =
    statePensionAtAge({
      annualAmountToday:
        statePensionIncome,

      startAge:
        statePensionStartAge,

      baseAge:
        leavingAge,

      inflationRate,

      displayMode,

      enabled:
        statePensionEnabled,
    });

  /* ======================================================
     TOTAL INCOME
  ====================================================== */

  const totalAtLeaving =
    totalIncome(
      salaryWhenLeaving,
      afPensionAtLeaving,
    );

  const totalAtOptional =
    totalIncome(
      afPensionAtOptional,
      workplaceIncomeAtOptional,
      investmentIncomeAtOptional,
    );

  const totalAtStateAge =
    totalIncome(
      afPensionAtStateAge,
      workplaceIncomeAtStateAge,
      investmentIncomeAtStateAge,
      statePensionAtStateAge,
    );

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
            What could life after service look like?
          </h1>

          <p>
            Your Armed Forces pension gives you the
            foundation. Now add the other income you
            expect to build after leaving.
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
              How should we show your future money?
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
            current purchasing power. Future pounds
            shows the estimated nominal amount you
            may actually see at that age.
          </p>
        </section>

        {/* =================================================
            MAIN BUILDER
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

            {/* ================= JOB ================= */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                01
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>
                    Your next job
                  </h3>

                  <p>
                    What might you earn after leaving
                    the Armed Forces?
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
                  <span>
                    Start age
                  </span>

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

            {/* ============ WORKPLACE PENSION ============ */}

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
                    Model a future defined-contribution
                    pension separately from your Armed
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
                    Projected pot when work stops at{" "}
                    {workOptionalAge}
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

            {/* ============ INVESTMENTS ============ */}

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
                    Model accessible savings, ISAs and
                    investments separately from your
                    pension.
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

            {/* ============ STATE PENSION ============ */}

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                04
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>
                    State Pension
                  </h3>

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
                      Annual amount in today’s money
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
                When would you like work to become
                optional?
              </h2>

              <div className="optional-age">
                <strong>
                  {workOptionalAge}
                </strong>

                <span>
                  years old
                </span>
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
                Estimated income if work stopped at{" "}
                {workOptionalAge}
              </span>

              <strong className="builder-summary__income">
                {formatMoney(
                  totalAtOptional,
                )}

                <small>
                  /yr
                </small>
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
            TIMELINE
        ================================================= */}

        <section className="income-picture">
          <div className="builder-section-heading">
            <p className="builder-eyebrow">
              Your Income Stack
            </p>

            <h2>
              One future. Multiple income sources.
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
            {/* ============ LEAVE SERVICE ============ */}

            <article className="income-stage">
              <div className="income-stage__age">
                <span>
                  Age
                </span>

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
                        salaryWhenLeaving,
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

            {/* ============ OPTIONAL AGE ============ */}

            <article className="income-stage income-stage--focus">
              <div className="income-stage__age">
                <span>
                  Age
                </span>

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

            {/* ============ STATE PENSION AGE ============ */}

            <article className="income-stage">
              <div className="income-stage__age">
                <span>
                  Age
                </span>

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
            withdrawal each year. These figures are
            planning illustrations, not guarantees
            or financial advice.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default IncomeStackBuilderView;
