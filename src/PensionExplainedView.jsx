import { useMemo, useState } from "react";

const pensionForecast = {
  source: {
    type: "AFPC_FORECAST",
    label: "Armed Forces Pension Calculator forecast",
  },

  member: {
    leavingDate: "25 July 2030",
    leavingAge: 40,
    rank: "Chief Petty Officer",
    statePensionAge: 68,
  },

  schemes: ["AFPS 05", "AFPS 15"],

  remedy: {
    applicable: true,
    explanation:
      "Your forecast shows two alternative treatments of your service during the 2015 Pension Remedy period. You would not receive both outcomes.",
  },

  scenarios: [
    {
      id: "legacy",

      shortLabel: "Legacy benefits",
      title: "Legacy benefits to 2022",

      description:
        "Your eligible legacy scheme service continues through the Remedy period, with AFPS 15 applying from 1 April 2022.",

      summary: {
        exitIncome: 9482,
        exitLumpSum: 59054,
        laterIncome: 22261,
      },

      events: [
        {
          id: "leave",
          age: 40,
          type: "exit",
          badge: "Leaving service",
          title: "You leave the Armed Forces",
          description:
            "Your Early Departure Payment begins immediately and your exit lump sum is paid.",
          annualIncome: 9482,
          lumpSum: 59054,
        },

        {
          id: "age55",
          age: 55,
          type: "income_change",
          badge: "Income change",
          title: "Your EDP increases",
          description:
            "The annual Early Departure Payment shown in your forecast increases at age 55.",
          annualIncome: 12471,
        },

        {
          id: "age65",
          age: 65,
          type: "legacy_pension",
          badge: "AFPS 05",
          title: "Your AFPS 05 pension becomes payable",
          description:
            "Your deferred AFPS 05 benefits begin and the forecast shows an additional lump sum.",
          annualIncome: 15460,
          lumpSum: 35871,
        },

        {
          id: "spa",
          age: 68,
          type: "deferred_pension",
          badge: "AFPS 15",
          title: "Your AFPS 15 pension becomes payable",
          description:
            "Your remaining AFPS 15 deferred pension becomes payable at the State Pension Age used in your forecast.",
          annualIncome: 22261,
        },
      ],

      benefitStreams: [
        {
          name: "Early Departure Payment",
          scheme: "AFPS 15",
          description:
            "Income paid after leaving service before all of your deferred pension benefits are in payment.",
        },

        {
          name: "Deferred pension",
          scheme: "AFPS 05",
          description:
            "Your legacy AFPS 05 pension becomes payable later in your retirement journey.",
        },

        {
          name: "Deferred pension",
          scheme: "AFPS 15",
          description:
            "Your AFPS 15 pension becomes payable at the State Pension Age shown in your forecast.",
        },
      ],

      commutation: {
        available: true,

        options: [
          {
            id: "standard",
            label: "Standard benefits",
            pension: 22261,
            lumpSum: 35871,
            note: "Keep the pension and lump sum shown in the standard forecast.",
          },

          {
            id: "maximum",
            label: "Maximum commutation",
            pension: 19626,
            lumpSum: 67485,
            note: "Take a larger lump sum in exchange for a lower annual pension.",
          },
        ],

        tradeOff: {
          extraLumpSum: 31614,
          annualPensionGivenUp: 2635,
          simpleBreakEvenYears: 12,
        },
      },

      earlyAccess: {
        available: true,
        minimumAge: 55,
        description:
          "Your forecast also contains actuarially reduced early-payment options for deferred AFPS 15 benefits.",
      },
    },

    {
      id: "afps15",

      shortLabel: "AFPS 15 benefits",
      title: "AFPS 15 benefits from 2015",

      description:
        "Your eligible service during the Remedy period is treated as AFPS 15 service from 1 April 2015.",

      summary: {
        exitIncome: 9027,
        exitLumpSum: 57900,
        laterIncome: 23750,
      },

      events: [
        {
          id: "leave",
          age: 40,
          type: "exit",
          badge: "Leaving service",
          title: "You leave the Armed Forces",
          description:
            "Your Early Departure Payment begins immediately and your exit lump sum is paid.",
          annualIncome: 9027,
          lumpSum: 57900,
        },

        {
          id: "age55",
          age: 55,
          type: "income_change",
          badge: "Income change",
          title: "Your EDP increases",
          description:
            "The annual Early Departure Payment shown in this Remedy outcome increases at age 55.",
          annualIncome: 10514,
        },

        {
          id: "age65",
          age: 65,
          type: "legacy_pension",
          badge: "Deferred pension",
          title: "Your legacy pension element becomes payable",
          description:
            "The remaining legacy pension element shown in this Remedy outcome begins, together with the associated lump sum.",
          annualIncome: 12001,
          lumpSum: 17844,
        },

        {
          id: "spa",
          age: 68,
          type: "deferred_pension",
          badge: "AFPS 15",
          title: "Your AFPS 15 pension becomes payable",
          description:
            "Your remaining AFPS 15 deferred pension becomes payable at the State Pension Age used in your forecast.",
          annualIncome: 23750,
        },
      ],

      benefitStreams: [
        {
          name: "Early Departure Payment",
          scheme: "AFPS 15",
          description:
            "Income paid after leaving service before all of your pension benefits are in payment.",
        },

        {
          name: "Legacy pension",
          scheme: "AFPS 05",
          description:
            "A smaller legacy pension element remains within this Remedy outcome.",
        },

        {
          name: "Deferred pension",
          scheme: "AFPS 15",
          description:
            "A greater proportion of your future pension sits within AFPS 15 under this outcome.",
        },
      ],

      commutation: {
        available: true,

        options: [
          {
            id: "standard",
            label: "Standard benefits",
            pension: 23750,
            lumpSum: 17844,
            note: "Keep the pension and lump sum shown in the standard forecast.",
          },

          {
            id: "maximum",
            label: "Maximum commutation",
            pension: 18160,
            lumpSum: 92458,
            note: "Take a larger lump sum in exchange for a lower annual pension.",
          },
        ],

        tradeOff: {
          extraLumpSum: 74614,
          annualPensionGivenUp: 5590,
          simpleBreakEvenYears: 13.3,
        },
      },

      earlyAccess: {
        available: true,
        minimumAge: 55,
        description:
          "Your forecast contains actuarially reduced early-payment options for AFPS 15 benefits from age 55.",
      },
    },
  ],
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatYears(value) {
  if (Number.isInteger(value)) {
    return `${value} years`;
  }

  return `${value.toFixed(1)} years`;
}

function PensionExplainedView({ file, onBack }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState("legacy");
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(true);

  const selectedScenario = useMemo(() => {
    return (
      pensionForecast.scenarios.find(
        (scenario) => scenario.id === selectedScenarioId,
      ) ?? pensionForecast.scenarios[0]
    );
  }, [selectedScenarioId]);

  const comparisonRows = [
    {
      label: "Income when leaving",
      values: pensionForecast.scenarios.map(
        (scenario) => scenario.summary.exitIncome,
      ),
    },
    {
      label: "Lump sum when leaving",
      values: pensionForecast.scenarios.map(
        (scenario) => scenario.summary.exitLumpSum,
      ),
    },
    {
      label: "Income at age 55",
      values: pensionForecast.scenarios.map(
        (scenario) =>
          scenario.events.find((event) => event.age === 55)?.annualIncome,
      ),
    },
    {
      label: "Income at age 65",
      values: pensionForecast.scenarios.map(
        (scenario) =>
          scenario.events.find((event) => event.age === 65)?.annualIncome,
      ),
    },
    {
      label: `Income at age ${pensionForecast.member.statePensionAge}`,
      values: pensionForecast.scenarios.map(
        (scenario) => scenario.summary.laterIncome,
      ),
    },
  ];

  return (
    <main className="explained-view">
      <div className="explained-view__container">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>

        <section className="pension-hero">
          <div className="stack-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="explained-view__eyebrow">Your pension explained</p>

          <h1>Here’s what your forecast means.</h1>

          <p className="explained-view__intro">
            We’ve taken the figures in your Armed Forces pension forecast and
            organised them into the key stages, payments and choices that
            matter.
          </p>

          <div className="forecast-confirmation">
            <div className="forecast-confirmation__icon">✓</div>

            <div>
              <span>Forecast read successfully</span>
              <strong>
                {file?.name || pensionForecast.source.label}
              </strong>
            </div>
          </div>
        </section>

        <section className="forecast-summary compact-section">
          <div className="section-heading section-heading--compact">
            <p className="section-heading__eyebrow">Your forecast</p>
            <h2>At a glance</h2>
          </div>

          <div className="forecast-summary__grid">
            <article className="summary-detail">
              <span>Leaving</span>
              <strong>{pensionForecast.member.leavingDate}</strong>
            </article>

            <article className="summary-detail">
              <span>Age</span>
              <strong>{pensionForecast.member.leavingAge}</strong>
            </article>

            <article className="summary-detail">
              <span>Rank</span>
              <strong>{pensionForecast.member.rank}</strong>
            </article>

            <article className="summary-detail">
              <span>Schemes</span>
              <strong>{pensionForecast.schemes.join(" + ")}</strong>
            </article>
          </div>
        </section>

        {pensionForecast.remedy.applicable && (
          <section className="remedy-section compact-section">
            <div className="section-heading">
              <p className="section-heading__eyebrow">
                2015 Pension Remedy
              </p>

              <h2>Your forecast contains two possible outcomes</h2>

              <p>{pensionForecast.remedy.explanation}</p>
            </div>

            <div
              className="scenario-selector"
              role="radiogroup"
              aria-label="Choose a Pension Remedy outcome"
            >
              {pensionForecast.scenarios.map((scenario) => {
                const selected = scenario.id === selectedScenarioId;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`scenario-option ${
                      selected ? "scenario-option--selected" : ""
                    }`}
                    onClick={() => setSelectedScenarioId(scenario.id)}
                  >
                    <span className="scenario-option__status">
                      {selected ? "Selected" : "View"}
                    </span>

                    <strong>{scenario.title}</strong>

                    <p>{scenario.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section className="current-outcome compact-section">
          <div className="current-outcome__heading">
            <div>
              <p className="section-heading__eyebrow">
                If you choose this outcome
              </p>

              <h2>{selectedScenario.shortLabel}</h2>
            </div>

            <span className="current-outcome__badge">
              Forecast figures
            </span>
          </div>

          <div className="headline-values">
            <article className="headline-card headline-card--primary">
              <span>Income when you leave</span>

              <strong>
                {formatMoney(selectedScenario.summary.exitIncome)}
              </strong>

              <p>per year before tax</p>
            </article>

            <article className="headline-card">
              <span>Lump sum at exit</span>

              <strong>
                {formatMoney(selectedScenario.summary.exitLumpSum)}
              </strong>

              <p>shown in your forecast</p>
            </article>

            <article className="headline-card">
              <span>Later-life income</span>

              <strong>
                {formatMoney(selectedScenario.summary.laterIncome)}
              </strong>

              <p>
                per year at age{" "}
                {pensionForecast.member.statePensionAge}
              </p>
            </article>
          </div>
        </section>

        <section className="timeline-section compact-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Your pension journey</p>

            <h2>What happens, and when</h2>

            <p>
              Your Armed Forces pension is made up of different benefits that
              become payable at different stages.
            </p>
          </div>

          <div className="pension-timeline">
            {selectedScenario.events.map((event) => (
              <article className="timeline-event" key={event.id}>
                <div className="timeline-event__marker">
                  <span>Age</span>
                  <strong>{event.age}</strong>
                </div>

                <div className="timeline-event__content">
                  <span className="timeline-event__badge">
                    {event.badge}
                  </span>

                  <h3>{event.title}</h3>

                  <p>{event.description}</p>

                  {(event.annualIncome || event.lumpSum) && (
                    <div className="timeline-event__figures">
                      {event.annualIncome && (
                        <div>
                          <span>Annual income</span>
                          <strong>
                            {formatMoney(event.annualIncome)}
                          </strong>
                        </div>
                      )}

                      {event.lumpSum && (
                        <div>
                          <span>Lump sum</span>
                          <strong>{formatMoney(event.lumpSum)}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="meaning-section compact-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">In plain English</p>
            <h2>The three things that matter most</h2>
          </div>

          <div className="meaning-grid">
            <article className="meaning-card">
              <span className="meaning-card__number">01</span>

              <h3>You have income from the day you leave</h3>

              <p>
                Your forecast shows Early Departure Payment entitlement, so
                you do not need to wait until normal pension age before
                receiving an income.
              </p>
            </article>

            <article className="meaning-card">
              <span className="meaning-card__number">02</span>

              <h3>Your income is not one fixed amount</h3>

              <p>
                Different pension benefits become payable at different ages,
                so your Armed Forces income changes throughout your life.
              </p>
            </article>

            <article className="meaning-card">
              <span className="meaning-card__number">03</span>

              <h3>Your Remedy choice changes the balance</h3>

              <p>
                One outcome gives you more legacy-scheme benefit while the
                other places more of your service into AFPS 15.
              </p>
            </article>
          </div>
        </section>

        {selectedScenario.commutation.available && (
          <section className="choices-section compact-section">
            <button
              type="button"
              className="choices-heading"
              aria-expanded={choicesOpen}
              onClick={() => setChoicesOpen((value) => !value)}
            >
              <div>
                <span className="section-heading__eyebrow">
                  Your choices
                </span>

                <strong>Taking a larger lump sum</strong>
              </div>

              <span className="choices-heading__symbol">
                {choicesOpen ? "−" : "+"}
              </span>
            </button>

            {choicesOpen && (
              <div className="choices-content">
                <p className="choices-intro">
                  Your forecast shows that you may be able to exchange some
                  annual pension for a larger lump sum. This is known as
                  commutation.
                </p>

                <div className="commutation-options">
                  {selectedScenario.commutation.options.map((option) => (
                    <article
                      className={`commutation-card ${
                        option.id === "maximum"
                          ? "commutation-card--highlight"
                          : ""
                      }`}
                      key={option.id}
                    >
                      <span className="commutation-card__label">
                        {option.label}
                      </span>

                      <div className="commutation-card__value">
                        <span>Annual pension</span>
                        <strong>{formatMoney(option.pension)}</strong>
                      </div>

                      <div className="commutation-card__value">
                        <span>Lump sum</span>
                        <strong>{formatMoney(option.lumpSum)}</strong>
                      </div>

                      <p>{option.note}</p>
                    </article>
                  ))}
                </div>

                <div className="tradeoff-card">
                  <p className="tradeoff-card__eyebrow">
                    What changes?
                  </p>

                  <h3>
                    More money upfront, less pension each year.
                  </h3>

                  <div className="tradeoff-grid">
                    <div>
                      <span>Extra upfront</span>
                      <strong className="positive-value">
                        +{formatMoney(
                          selectedScenario.commutation.tradeOff
                            .extraLumpSum,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Pension given up</span>
                      <strong>
                        −
                        {formatMoney(
                          selectedScenario.commutation.tradeOff
                            .annualPensionGivenUp,
                        )}
                        /yr
                      </strong>
                    </div>

                    <div>
                      <span>Simple crossover</span>
                      <strong>
                        {formatYears(
                          selectedScenario.commutation.tradeOff
                            .simpleBreakEvenYears,
                        )}
                      </strong>
                    </div>
                  </div>

                  <p className="tradeoff-card__explanation">
                    In simple terms, the extra lump sum is equivalent to about{" "}
                    <strong>
                      {formatYears(
                        selectedScenario.commutation.tradeOff
                          .simpleBreakEvenYears,
                      )}
                    </strong>{" "}
                    of the annual pension being exchanged.
                  </p>

                  <p className="tradeoff-card__note">
                    This is only a simple comparison of the figures in your
                    forecast. It does not account for tax, pension increases,
                    investment returns, longevity or personal circumstances.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {selectedScenario.earlyAccess.available && (
          <section className="early-access-card compact-section">
            <div>
              <p className="section-heading__eyebrow">
                Another option in your forecast
              </p>

              <h2>Could you take part of your pension earlier?</h2>

              <p>
                {selectedScenario.earlyAccess.description}
              </p>
            </div>

            <div className="early-access-card__age">
              <span>Earliest age shown</span>
              <strong>
                {selectedScenario.earlyAccess.minimumAge}
              </strong>
            </div>
          </section>
        )}

        <section className="breakdown-section compact-section">
          <button
            type="button"
            className="breakdown-toggle"
            aria-expanded={breakdownOpen}
            onClick={() => setBreakdownOpen((value) => !value)}
          >
            <div>
              <span className="section-heading__eyebrow">
                Scheme breakdown
              </span>

              <strong>Where your pension comes from</strong>
            </div>

            <span className="breakdown-toggle__symbol">
              {breakdownOpen ? "−" : "+"}
            </span>
          </button>

          {breakdownOpen && (
            <div className="scheme-breakdown">
              {selectedScenario.benefitStreams.map((benefit, index) => (
                <article key={`${benefit.scheme}-${index}`}>
                  <span>{benefit.scheme}</span>
                  <h3>{benefit.name}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="comparison-section compact-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">
              Remedy comparison
            </p>

            <h2>See both outcomes side by side</h2>

            <p>
              Neither option is automatically “better”. They provide
              different combinations of pension benefits at different stages.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Milestone</th>

                  {pensionForecast.scenarios.map((scenario) => (
                    <th key={scenario.id}>
                      {scenario.shortLabel}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>

                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`}>
                        {value ? formatMoney(value) : "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="next-step-section compact-section">
          <p className="section-heading__eyebrow">Income Stack</p>

          <h2>Your pension is the foundation.</h2>

          <p>
            Next, Income Stack will help you see how this pension could work
            alongside your future salary, workplace pension, savings,
            investments and State Pension.
          </p>

          <button type="button" className="button button--primary">
            Build my income stack →
          </button>
        </section>

        <aside className="forecast-disclaimer">
          <strong>About these figures</strong>

          <p>
            Income Stack is displaying and explaining figures from your
            uploaded Armed Forces pension forecast. It has not independently
            calculated your pension or recommended which pension option you
            should choose.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default PensionExplainedView;
