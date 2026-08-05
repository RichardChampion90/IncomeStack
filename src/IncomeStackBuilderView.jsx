import { useMemo, useState } from "react";

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

function futureValueMonthly({
  startingBalance,
  monthlyContribution,
  annualGrowth,
  years,
}) {
  const months = Math.max(0, years * 12);
  const monthlyRate = annualGrowth / 100 / 12;

  let balance = Number(startingBalance) || 0;

  for (let month = 0; month < months; month += 1) {
    balance *= 1 + monthlyRate;
    balance += Number(monthlyContribution) || 0;
  }

  return balance;
}

function pensionIncomeAtAge(pension, age) {
  if (!pension?.events?.length) {
    return 0;
  }

  const eligibleEvents = pension.events
    .filter(
      (event) =>
        event.age <= age &&
        typeof event.annualIncome === "number",
    )
    .sort((a, b) => a.age - b.age);

  if (!eligibleEvents.length) {
    return 0;
  }

  return eligibleEvents[eligibleEvents.length - 1].annualIncome;
}

function IncomeStackBuilderView({ pension, onBack }) {
  const leavingAge = pension?.leavingAge ?? 40;
  const statePensionAge = pension?.statePensionAge ?? 68;

  const [salary, setSalary] = useState(45000);
  const [salaryStartAge, setSalaryStartAge] = useState(leavingAge);

  const [workOptionalAge, setWorkOptionalAge] = useState(60);

  const [employeePensionPercent, setEmployeePensionPercent] =
    useState(5);

  const [employerPensionPercent, setEmployerPensionPercent] =
    useState(8);

  const [existingInvestments, setExistingInvestments] =
    useState(0);

  const [monthlyInvestments, setMonthlyInvestments] =
    useState(300);

  const [growthRate, setGrowthRate] = useState(5);

  const [statePensionEnabled, setStatePensionEnabled] =
    useState(true);

  const [statePensionIncome, setStatePensionIncome] =
    useState(12000);

  const [statePensionStartAge, setStatePensionStartAge] =
    useState(statePensionAge);

  const workplaceProjection = useMemo(() => {
    const years =
      Math.max(0, workOptionalAge - salaryStartAge);

    const annualContribution =
      salary *
      ((employeePensionPercent + employerPensionPercent) / 100);

    return futureValueMonthly({
      startingBalance: 0,
      monthlyContribution: annualContribution / 12,
      annualGrowth: growthRate,
      years,
    });
  }, [
    salary,
    salaryStartAge,
    workOptionalAge,
    employeePensionPercent,
    employerPensionPercent,
    growthRate,
  ]);

  const investmentProjection = useMemo(() => {
    const years = Math.max(
      0,
      workOptionalAge - leavingAge,
    );

    return futureValueMonthly({
      startingBalance: existingInvestments,
      monthlyContribution: monthlyInvestments,
      annualGrowth: growthRate,
      years,
    });
  }, [
    existingInvestments,
    monthlyInvestments,
    growthRate,
    leavingAge,
    workOptionalAge,
  ]);

  const workplaceIncome =
    workplaceProjection * 0.04;

  const investmentIncome =
    investmentProjection * 0.04;

  const pensionAtLeaving =
    pensionIncomeAtAge(pension, leavingAge);

  const pensionAtOptional =
    pensionIncomeAtAge(pension, workOptionalAge);

  const pensionAtStateAge =
    pensionIncomeAtAge(pension, statePensionStartAge);

  const salaryAtLeaving =
    salaryStartAge <= leavingAge ? salary : 0;

  const salaryAtOptional =
    workOptionalAge >= salaryStartAge ? salary : 0;

  const totalAtLeaving =
    salaryAtLeaving + pensionAtLeaving;

  const retirementIncomeAtOptional =
    pensionAtOptional +
    workplaceIncome +
    investmentIncome;

  const totalAtStateAge =
    pensionAtStateAge +
    workplaceIncome +
    investmentIncome +
    (statePensionEnabled ? statePensionIncome : 0);

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

        <section className="builder-hero">
          <div className="stack-mark" aria-hidden="true">
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
            foundation. Now add the other income you expect
            to build after leaving.
          </p>
        </section>

        <section className="foundation-card">
          <div>
            <p className="builder-eyebrow">
              Your foundation
            </p>

            <h2>Armed Forces pension</h2>

            <p>
              {pension?.scenarioName ||
                "Selected forecast outcome"}
            </p>
          </div>

          <div className="foundation-card__figures">
            <div>
              <span>From age {leavingAge}</span>

              <strong>
                {formatMoney(
                  pension?.exitIncome || 0,
                )}
                /yr
              </strong>
            </div>

            <div>
              <span>Exit lump sum</span>

              <strong>
                {formatMoney(
                  pension?.exitLumpSum || 0,
                )}
              </strong>
            </div>
          </div>
        </section>

        <div className="builder-layout">
          <section className="builder-inputs">
            <div className="builder-section-heading">
              <p className="builder-eyebrow">
                Add your future
              </p>

              <h2>Build on top of your pension</h2>

              <p>
                These are planning assumptions. You can
                change them at any time.
              </p>
            </div>

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                01
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>Your next job</h3>
                  <p>
                    What might you earn after leaving the
                    Armed Forces?
                  </p>
                </div>
              </div>

              <div className="builder-fields">
                <label>
                  <span>Annual salary</span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={salary}
                      onChange={(event) =>
                        setSalary(
                          Number(event.target.value),
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
                    max={75}
                    onChange={(event) =>
                      setSalaryStartAge(
                        Number(event.target.value),
                      )
                    }
                  />
                </label>
              </div>
            </article>

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                02
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>Workplace pension</h3>

                  <p>
                    Add your expected contributions from a
                    future employer.
                  </p>
                </div>
              </div>

              <div className="builder-fields">
                <label>
                  <span>Your contribution</span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={employeePensionPercent}
                      min="0"
                      max="100"
                      step="0.5"
                      onChange={(event) =>
                        setEmployeePensionPercent(
                          Number(event.target.value),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>

                <label>
                  <span>Employer contribution</span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={employerPensionPercent}
                      min="0"
                      max="100"
                      step="0.5"
                      onChange={(event) =>
                        setEmployerPensionPercent(
                          Number(event.target.value),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>
              </div>

              <div className="builder-mini-result">
                <span>Projected pot at age {workOptionalAge}</span>

                <strong>
                  {formatMoney(workplaceProjection)}
                </strong>
              </div>
            </article>

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                03
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>Savings & investments</h3>

                  <p>
                    Add money you already have and what you
                    may continue putting aside.
                  </p>
                </div>
              </div>

              <div className="builder-fields">
                <label>
                  <span>Already invested</span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={existingInvestments}
                      onChange={(event) =>
                        setExistingInvestments(
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>Add each month</span>

                  <div className="money-input">
                    <span>£</span>

                    <input
                      type="number"
                      value={monthlyInvestments}
                      onChange={(event) =>
                        setMonthlyInvestments(
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  <span>Growth assumption</span>

                  <div className="suffix-input">
                    <input
                      type="number"
                      value={growthRate}
                      min="0"
                      max="15"
                      step="0.5"
                      onChange={(event) =>
                        setGrowthRate(
                          Number(event.target.value),
                        )
                      }
                    />

                    <span>%</span>
                  </div>
                </label>
              </div>

              <div className="builder-mini-result">
                <span>
                  Projected value at age{" "}
                  {workOptionalAge}
                </span>

                <strong>
                  {formatMoney(investmentProjection)}
                </strong>
              </div>
            </article>

            <article className="builder-input-card">
              <div className="builder-input-card__number">
                04
              </div>

              <div className="builder-input-card__heading">
                <div>
                  <h3>State Pension</h3>

                  <p>
                    Include an editable State Pension
                    assumption in your later-life income.
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
                    <span>Annual amount</span>

                    <div className="money-input">
                      <span>£</span>

                      <input
                        type="number"
                        value={statePensionIncome}
                        onChange={(event) =>
                          setStatePensionIncome(
                            Number(
                              event.target.value,
                            ),
                          )
                        }
                      />
                    </div>
                  </label>

                  <label>
                    <span>From age</span>

                    <input
                      type="number"
                      value={statePensionStartAge}
                      min="55"
                      max="75"
                      onChange={(event) =>
                        setStatePensionStartAge(
                          Number(
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              )}
            </article>
          </section>

          <aside className="builder-summary">
            <div className="builder-summary__sticky">
              <p className="builder-eyebrow">
                Your plan
              </p>

              <h2>
                When would you like work to become optional?
              </h2>

              <div className="optional-age">
                <strong>{workOptionalAge}</strong>
                <span>years old</span>
              </div>

              <input
                className="optional-age-slider"
                type="range"
                min={Math.max(leavingAge, 50)}
                max={statePensionAge}
                value={workOptionalAge}
                onChange={(event) =>
                  setWorkOptionalAge(
                    Number(event.target.value),
                  )
                }
              />

              <div className="optional-age-range">
                <span>{Math.max(leavingAge, 50)}</span>
                <span>{statePensionAge}</span>
              </div>

              <div className="builder-summary__divider" />

              <span className="builder-summary__label">
                Estimated income if work stopped at{" "}
                {workOptionalAge}
              </span>

              <strong className="builder-summary__income">
                {formatMoney(
                  retirementIncomeAtOptional,
                )}
                <small>/yr</small>
              </strong>

              <span className="builder-summary__monthly">
                About{" "}
                {formatMoney(
                  retirementIncomeAtOptional / 12,
                )}{" "}
                per month before tax
              </span>

              <div className="builder-summary__breakdown">
                <div>
                  <span>Armed Forces pension</span>
                  <strong>
                    {formatMoney(pensionAtOptional)}
                  </strong>
                </div>

                <div>
                  <span>Workplace pension</span>
                  <strong>
                    {formatMoney(workplaceIncome)}
                  </strong>
                </div>

                <div>
                  <span>Savings & investments</span>
                  <strong>
                    {formatMoney(investmentIncome)}
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="income-picture">
          <div className="builder-section-heading">
            <p className="builder-eyebrow">
              Your Income Stack
            </p>

            <h2>One future. Multiple income sources.</h2>

            <p>
              This is where the different parts of your
              financial life begin to work together.
            </p>
          </div>

          <div className="income-picture__timeline">
            <article className="income-stage">
              <div className="income-stage__age">
                <span>Age</span>
                <strong>{leavingAge}</strong>
              </div>

              <div className="income-stage__content">
                <p>Leave the Armed Forces</p>

                <h3>
                  {formatMoney(totalAtLeaving)}
                  <small>/yr gross income</small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>Future salary</span>
                    <strong>
                      {formatMoney(salaryAtLeaving)}
                    </strong>
                  </div>

                  <div>
                    <span>Armed Forces pension</span>
                    <strong>
                      {formatMoney(pensionAtLeaving)}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="income-stage income-stage--focus">
              <div className="income-stage__age">
                <span>Age</span>
                <strong>{workOptionalAge}</strong>
              </div>

              <div className="income-stage__content">
                <p>Work becomes optional</p>

                <h3>
                  {formatMoney(
                    retirementIncomeAtOptional,
                  )}
                  <small>/yr without salary</small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>Armed Forces pension</span>
                    <strong>
                      {formatMoney(pensionAtOptional)}
                    </strong>
                  </div>

                  <div>
                    <span>Workplace pension</span>
                    <strong>
                      {formatMoney(workplaceIncome)}
                    </strong>
                  </div>

                  <div>
                    <span>Investments</span>
                    <strong>
                      {formatMoney(investmentIncome)}
                    </strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="income-stage">
              <div className="income-stage__age">
                <span>Age</span>
                <strong>{statePensionStartAge}</strong>
              </div>

              <div className="income-stage__content">
                <p>State Pension stage</p>

                <h3>
                  {formatMoney(totalAtStateAge)}
                  <small>/yr estimated income</small>
                </h3>

                <div className="income-stage__sources">
                  <div>
                    <span>Armed Forces pension</span>
                    <strong>
                      {formatMoney(pensionAtStateAge)}
                    </strong>
                  </div>

                  <div>
                    <span>Workplace pension</span>
                    <strong>
                      {formatMoney(workplaceIncome)}
                    </strong>
                  </div>

                  <div>
                    <span>Investments</span>
                    <strong>
                      {formatMoney(investmentIncome)}
                    </strong>
                  </div>

                  {statePensionEnabled && (
                    <div>
                      <span>State Pension</span>
                      <strong>
                        {formatMoney(
                          statePensionIncome,
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </div>
        </section>

        <aside className="builder-disclaimer">
          <strong>About this projection</strong>

          <p>
            This section is a planning illustration rather
            than a pension forecast. Workplace pension and
            investment values use the assumptions you enter,
            including the selected growth rate and a simple
            4% annual withdrawal illustration. Tax,
            inflation, charges, market movements and personal
            circumstances are not yet modelled.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default IncomeStackBuilderView;
