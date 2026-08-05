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
      "Your forecast contains two alternative treatments of your service during the 2015 Pension Remedy period. You would not receive both outcomes.",
  },

  scenarios: [
    {
      id: "legacy",
      shortLabel: "Legacy benefits",
      tabLabel: "Legacy to 2022",
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
          badge: "Income change",
          title: "Your EDP increases",
          description:
            "Your Early Departure Payment is uplifted at age 55. This reflects the index-linking treatment that applies to the payment after leaving service.",
          annualIncome: 12471,
        },
        {
          id: "age65",
          age: 65,
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
          badge: "AFPS 15",
          title: "Your full Armed Forces pension is now in payment",
          description:
            "Your remaining AFPS 15 benefits become payable. The annual figure shown here is the total Armed Forces pension income shown in your forecast at age 68.",
          annualIncome: 22261,
        },
      ],

      benefitStreams: [
        {
          name: "Early Departure Payment",
          scheme: "AFPS 15",
          description:
            "Income paid after leaving service before all deferred pension benefits are in payment.",
        },
        {
          name: "Deferred pension",
          scheme: "AFPS 05",
          description:
            "Your legacy AFPS 05 pension becomes payable later in your pension journey.",
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
          },
          {
            id: "maximum",
            label: "Maximum commutation",
            pension: 19626,
            lumpSum: 67485,
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
          "Your forecast also contains actuarially reduced early-payment options for deferred benefits.",
      },
    },

    {
      id: "afps15",
      shortLabel: "AFPS 15 benefits",
      tabLabel: "AFPS 15 from 2015",
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
          badge: "Income change",
          title: "Your EDP increases",
          description:
            "Your Early Departure Payment is uplifted at age 55. This reflects the index-linking treatment that applies to the payment after leaving service.",
          annualIncome: 10514,
        },
        {
          id: "age65",
          age: 65,
          badge: "Deferred pension",
          title: "Your legacy pension element becomes payable",
          description:
            "The remaining legacy pension element shown in this outcome begins, together with the associated lump sum.",
          annualIncome: 12001,
          lumpSum: 17844,
        },
        {
          id: "spa",
          age: 68,
          badge: "AFPS 15",
          title: "Your full Armed Forces pension is now in payment",
          description:
            "Your remaining AFPS 15 benefits become payable. The annual figure shown here is the total Armed Forces pension income shown in your forecast at age 68.",
          annualIncome: 23750,
        },
      ],

      benefitStreams: [
        {
          name: "Early Departure Payment",
          scheme: "AFPS 15",
          description:
            "Income paid after leaving service before all pension benefits are in payment.",
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
          },
          {
            id: "maximum",
            label: "Maximum commutation",
            pension: 18160,
            lumpSum: 92458,
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
  return Number.isInteger(value)
    ? `${value} years`
    : `${value.toFixed(1)} years`;
}

function inflateMoney(value, rate, years) {
  return value * Math.pow(1 + rate / 100, years);
}

function ExpandableSection({
  eyebrow,
  title,
  open,
  onToggle,
  children,
}) {
  return (
    <section className="compact-accordion">
      <button
        type="button"
        className="compact-accordion__trigger"
        aria-expanded={open}
        onClick={onToggle}
      >
        <div>
          <span className="section-heading__eyebrow">{eyebrow}</span>
          <strong>{title}</strong>
        </div>

        <span className="compact-accordion__symbol">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="compact-accordion__content">
          {children}
        </div>
      )}
    </section>
  );
}

function PensionExplainedView({
  file,
  onBack,
  onBuildStack,
}) {
  const [selectedScenarioId, setSelectedScenarioId] =
    useState("legacy");

  const [expandedEventId, setExpandedEventId] =
    useState(null);

  const [remedyInfoOpen, setRemedyInfoOpen] =
    useState(false);

  const [commutationOpen, setCommutationOpen] =
    useState(false);

  const [earlyAccessOpen, setEarlyAccessOpen] =
    useState(false);

  const [inflationOpen, setInflationOpen] =
    useState(false);

  const [breakdownOpen, setBreakdownOpen] =
    useState(false);

  const [comparisonOpen, setComparisonOpen] =
    useState(false);

  const [illustrativeCpi, setIllustrativeCpi] =
    useState(2.5);

  const selectedScenario = useMemo(() => {
    return (
      pensionForecast.scenarios.find(
        (scenario) =>
          scenario.id === selectedScenarioId,
      ) ?? pensionForecast.scenarios[0]
    );
  }, [selectedScenarioId]);

  const age55Event =
    selectedScenario.events.find(
      (event) => event.age === 55,
    );

  const age55OfficialIncome =
    age55Event?.annualIncome || 0;

  const yearsTo55 =
    55 - pensionForecast.member.leavingAge;

  const age55IllustrativeFutureIncome =
    inflateMoney(
      age55OfficialIncome,
      illustrativeCpi,
      yearsTo55,
    );

  return (
    <main className="explained-view explained-view--compressed">
      <div className="explained-view__container">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <section className="pension-hero pension-hero--compressed">
          <div
            className="stack-mark"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>

          <p className="explained-view__eyebrow">
            Your pension explained
          </p>

          <h1>
            Here’s what your forecast means.
          </h1>

          <p className="explained-view__intro">
            Your key payments, milestones and choices —
            without the pension jargon.
          </p>

          <div className="forecast-confirmation forecast-confirmation--compact">
            <div className="forecast-confirmation__icon">
              ✓
            </div>

            <div>
              <span>
                Forecast read successfully
              </span>

              <strong>
                {file?.name ||
                  pensionForecast.source.label}
              </strong>
            </div>
          </div>
        </section>

        <section className="forecast-summary compact-section">
          <div className="section-heading section-heading--compact">
            <p className="section-heading__eyebrow">
              Your forecast
            </p>

            <h2>At a glance</h2>
          </div>

          <div className="forecast-summary__grid">
            <article className="summary-detail">
              <span>Leaving</span>
              <strong>
                {pensionForecast.member.leavingDate}
              </strong>
            </article>

            <article className="summary-detail">
              <span>Age</span>
              <strong>
                {pensionForecast.member.leavingAge}
              </strong>
            </article>

            <article className="summary-detail">
              <span>Rank</span>
              <strong>
                {pensionForecast.member.rank}
              </strong>
            </article>

            <article className="summary-detail">
              <span>Schemes</span>
              <strong>
                {pensionForecast.schemes.join(" + ")}
              </strong>
            </article>
          </div>
        </section>

        {pensionForecast.remedy.applicable && (
          <section className="remedy-section remedy-section--compressed compact-section">
            <div className="section-heading section-heading--compact">
              <p className="section-heading__eyebrow">
                2015 Pension Remedy
              </p>

              <h2>
                Compare your two possible outcomes
              </h2>
            </div>

            <div
              className="remedy-tabs"
              role="radiogroup"
              aria-label="Choose a Pension Remedy outcome"
            >
              {pensionForecast.scenarios.map(
                (scenario) => {
                  const selected =
                    scenario.id ===
                    selectedScenarioId;

                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`remedy-tab ${
                        selected
                          ? "remedy-tab--selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedScenarioId(
                          scenario.id,
                        );
                        setExpandedEventId(null);
                      }}
                    >
                      <span>
                        {scenario.tabLabel}
                      </span>

                      {selected && (
                        <strong>✓</strong>
                      )}
                    </button>
                  );
                },
              )}
            </div>

            <button
              type="button"
              className="inline-info-button"
              onClick={() =>
                setRemedyInfoOpen(
                  (value) => !value,
                )
              }
            >
              {remedyInfoOpen
                ? "Hide explanation"
                : "What does this mean?"}
            </button>

            {remedyInfoOpen && (
              <div className="inline-info-panel">
                <p>
                  {
                    pensionForecast.remedy
                      .explanation
                  }
                </p>

                <p>
                  {selectedScenario.description}
                </p>
              </div>
            )}
          </section>
        )}

        <section className="current-outcome current-outcome--compressed compact-section">
          <div className="current-outcome__heading">
            <div>
              <p className="section-heading__eyebrow">
                Selected outcome
              </p>

              <h2>
                {selectedScenario.shortLabel}
              </h2>
            </div>
          </div>

          <div className="headline-values headline-values--compact">
            <article className="headline-card headline-card--primary">
              <span>
                Income when you leave
              </span>

              <strong>
                {formatMoney(
                  selectedScenario.summary
                    .exitIncome,
                )}
              </strong>

              <p>per year before tax</p>
            </article>

            <article className="headline-card">
              <span>
                Lump sum at exit
              </span>

              <strong>
                {formatMoney(
                  selectedScenario.summary
                    .exitLumpSum,
                )}
              </strong>
            </article>

            <article className="headline-card">
              <span>
                Later-life income
              </span>

              <strong>
                {formatMoney(
                  selectedScenario.summary
                    .laterIncome,
                )}
              </strong>

              <p>
                per year at age{" "}
                {
                  pensionForecast.member
                    .statePensionAge
                }
              </p>
            </article>
          </div>

          <div className="outcome-meaning">
            <strong>
              What this means
            </strong>

            <p>
              You receive an income immediately
              after leaving service, and your Armed
              Forces pension then increases as
              additional benefits become payable
              later.
            </p>
          </div>
        </section>

        <section className="forecast-one-liner compact-section">
          <p className="section-heading__eyebrow">
            Your forecast in one sentence
          </p>

          <p>
            Leave service at age{" "}
            <strong>
              {
                pensionForecast.member
                  .leavingAge
              }
            </strong>{" "}
            with{" "}
            <strong>
              {formatMoney(
                selectedScenario.summary
                  .exitLumpSum,
              )}
            </strong>{" "}
            upfront and{" "}
            <strong>
              {formatMoney(
                selectedScenario.summary
                  .exitIncome,
              )}{" "}
              a year
            </strong>
            , with your Armed Forces pension
            increasing as additional benefits
            become payable later.
          </p>
        </section>

        <section className="timeline-section timeline-section--compressed compact-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">
              Your pension journey
            </p>

            <h2>
              What happens, and when
            </h2>
          </div>

          <div className="compact-timeline">
            {selectedScenario.events.map(
              (event, index) => {
                const isExpanded =
                  expandedEventId === event.id;

                return (
                  <div
                    className="compact-timeline__item"
                    key={event.id}
                  >
                    <div className="compact-timeline__rail">
                      <div className="compact-timeline__age">
                        {event.age}
                      </div>

                      {index <
                        selectedScenario.events
                          .length -
                          1 && (
                        <div className="compact-timeline__line" />
                      )}
                    </div>

                    <button
                      type="button"
                      className="compact-timeline__event"
                      onClick={() =>
                        setExpandedEventId(
                          isExpanded
                            ? null
                            : event.id,
                        )
                      }
                    >
                      <div className="compact-timeline__main">
                        <span>
                          {event.badge}
                        </span>

                        <strong>
                          {event.title}
                        </strong>

                        <div className="compact-timeline__figures">
                          {event.annualIncome && (
                            <b>
                              {formatMoney(
                                event.annualIncome,
                              )}
                              /yr
                            </b>
                          )}

                          {event.lumpSum && (
                            <b>
                              {formatMoney(
                                event.lumpSum,
                              )}{" "}
                              lump sum
                            </b>
                          )}
                        </div>
                      </div>

                      <span className="compact-timeline__expand">
                        {isExpanded
                          ? "−"
                          : "+"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="compact-timeline__detail">
                        <p>
                          {
                            event.description
                          }
                        </p>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </section>

        <section className="options-list compact-section">
          <div className="section-heading section-heading--compact">
            <p className="section-heading__eyebrow">
              Your options
            </p>

            <h2>
              Explore the detail when you need it
            </h2>
          </div>

          <ExpandableSection
            eyebrow="Commutation"
            title="Taking a larger lump sum"
            open={commutationOpen}
            onToggle={() =>
              setCommutationOpen(
                (value) => !value,
              )
            }
          >
            <p className="accordion-intro">
              Your forecast shows that you may be
              able to exchange some annual pension
              for a larger lump sum.
            </p>

            <div className="commutation-options commutation-options--compressed">
              {selectedScenario.commutation.options.map(
                (option) => (
                  <article
                    key={option.id}
                    className={`commutation-card ${
                      option.id === "maximum"
                        ? "commutation-card--highlight"
                        : ""
                    }`}
                  >
                    <span className="commutation-card__label">
                      {option.label}
                    </span>

                    <div className="commutation-pair">
                      <div>
                        <span>
                          Annual pension
                        </span>

                        <strong>
                          {formatMoney(
                            option.pension,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Lump sum
                        </span>

                        <strong>
                          {formatMoney(
                            option.lumpSum,
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            <div className="tradeoff-card tradeoff-card--compressed">
              <p className="tradeoff-card__eyebrow">
                The trade-off
              </p>

              <h3>
                More upfront, less pension each
                year.
              </h3>

              <div className="tradeoff-grid">
                <div>
                  <span>
                    Extra upfront
                  </span>

                  <strong>
                    +
                    {formatMoney(
                      selectedScenario
                        .commutation.tradeOff
                        .extraLumpSum,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Pension given up
                  </span>

                  <strong>
                    −
                    {formatMoney(
                      selectedScenario
                        .commutation.tradeOff
                        .annualPensionGivenUp,
                    )}
                    /yr
                  </strong>
                </div>

                <div>
                  <span>
                    Simple crossover
                  </span>

                  <strong>
                    {formatYears(
                      selectedScenario
                        .commutation.tradeOff
                        .simpleBreakEvenYears,
                    )}
                  </strong>
                </div>
              </div>

              <p className="tradeoff-card__note">
                This is a simple comparison of the
                figures in your forecast. It does
                not account for tax, pension
                increases, investment returns,
                longevity or personal
                circumstances.
              </p>
            </div>
          </ExpandableSection>

          <ExpandableSection
            eyebrow="Early access"
            title="Taking pension earlier"
            open={earlyAccessOpen}
            onToggle={() =>
              setEarlyAccessOpen(
                (value) => !value,
              )
            }
          >
            <div className="simple-option-panel">
              <div>
                <span>
                  Earliest age shown
                </span>

                <strong>
                  {
                    selectedScenario
                      .earlyAccess
                      .minimumAge
                  }
                </strong>
              </div>

              <p>
                {
                  selectedScenario.earlyAccess
                    .description
                }
              </p>
            </div>
          </ExpandableSection>

          <ExpandableSection
  eyebrow="Inflation"
  title="How CPI could affect your pension"
  open={inflationOpen}
  onToggle={() =>
    setInflationOpen((value) => !value)
  }
>
  <p className="accordion-intro">
    Your forecast shows pension figures in today’s money.
    That means they are expressed in current purchasing power,
    rather than the number of pounds you may actually receive
    in the future.
  </p>

  <div className="pension-inflation-explainer">
    <strong>What happens to your EDP?</strong>

    <p>
      Your Early Departure Payment is normally paid at its
      original rate until age 55. At age 55, accumulated CPI
      increases since leaving service are applied. It then
      normally increases annually thereafter.
    </p>
  </div>

  <label className="pension-cpi-control">
    <span>Illustrative CPI assumption</span>

    <div className="suffix-input">
      <input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={illustrativeCpi}
        onChange={(event) =>
          setIllustrativeCpi(
            Number(event.target.value),
          )
        }
      />

      <span>%</span>
    </div>
  </label>

  <div className="pension-inflation-example">
    <div>
      <span>
        Official forecast figure
      </span>

      <strong>
        {formatMoney(age55OfficialIncome)}
        /yr
      </strong>

      <p>in today’s money</p>
    </div>

    <div>
      <span>
        Illustrative amount at age 55
      </span>

      <strong>
        {formatMoney(
          age55IllustrativeFutureIncome,
        )}
        /yr
      </strong>

      <p>in future pounds</p>
    </div>
  </div>

  <p className="pension-inflation-comparison">
    At an average CPI rate of{" "}
    <strong>{illustrativeCpi}%</strong> over{" "}
    <strong>{yearsTo55} years</strong>,{" "}
    {formatMoney(age55OfficialIncome)} in today’s
    money is equivalent to about{" "}
    <strong>
      {formatMoney(
        age55IllustrativeFutureIncome,
      )}
    </strong>{" "}
    at age 55.
  </p>

  <div className="pension-inflation-why">
    <span>Why this matters</span>

    <p>
      The amount you actually see paid into your account at
      age 55 could look materially higher in pounds, without
      necessarily giving you more purchasing power than the
      original forecast figure has today.
    </p>
  </div>

  <p className="pension-inflation-note">
    This is an Income Stack illustration using your chosen
    CPI assumption. It does not replace your official
    forecast or calculate your pension entitlement.
  </p>
</ExpandableSection>

          <ExpandableSection
            eyebrow="Scheme breakdown"
            title="Where your pension comes from"
            open={breakdownOpen}
            onToggle={() =>
              setBreakdownOpen(
                (value) => !value,
              )
            }
          >
            <div className="scheme-breakdown scheme-breakdown--compressed">
              {selectedScenario.benefitStreams.map(
                (benefit, index) => (
                  <article
                    key={`${benefit.scheme}-${index}`}
                  >
                    <span>
                      {benefit.scheme}
                    </span>

                    <h3>
                      {benefit.name}
                    </h3>

                    <p>
                      {benefit.description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </ExpandableSection>

          <ExpandableSection
            eyebrow="2015 Pension Remedy"
            title="Compare both outcomes"
            open={comparisonOpen}
            onToggle={() =>
              setComparisonOpen(
                (value) => !value,
              )
            }
          >
            <div className="comparison-table-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Milestone</th>
                    <th>Legacy</th>
                    <th>AFPS 15</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <th>
                      Income when leaving
                    </th>
                    <td>
                      {formatMoney(9482)}
                    </td>
                    <td>
                      {formatMoney(9027)}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Lump sum at exit
                    </th>
                    <td>
                      {formatMoney(59054)}
                    </td>
                    <td>
                      {formatMoney(57900)}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Income at 55
                    </th>
                    <td>
                      {formatMoney(12471)}
                    </td>
                    <td>
                      {formatMoney(10514)}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Income at 65
                    </th>
                    <td>
                      {formatMoney(15460)}
                    </td>
                    <td>
                      {formatMoney(12001)}
                    </td>
                  </tr>

                  <tr>
                    <th>
                      Income at 68
                    </th>
                    <td>
                      {formatMoney(22261)}
                    </td>
                    <td>
                      {formatMoney(23750)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ExpandableSection>
        </section>

        <section className="next-step-section next-step-section--compressed compact-section">
          <p className="section-heading__eyebrow">
            Income Stack
          </p>

          <h2>
            Your pension is the foundation.
          </h2>

          <p className="next-step-section__lead">
            Now see what life after the Armed
            Forces could actually look like.
          </p>

          <p>
            Add your future salary, workplace
            pension, savings, investments and
            State Pension to build your complete
            income picture.
          </p>

          <button
            type="button"
            className="button button--primary"
            onClick={() =>
              onBuildStack?.({
                leavingAge:
                  pensionForecast.member
                    .leavingAge,

                statePensionAge:
                  pensionForecast.member
                    .statePensionAge,

                scenarioName:
                  selectedScenario.shortLabel,

                exitIncome:
                  selectedScenario.summary
                    .exitIncome,

                exitLumpSum:
                  selectedScenario.summary
                    .exitLumpSum,

                laterIncome:
                  selectedScenario.summary
                    .laterIncome,

                events:
                  selectedScenario.events,
              })
            }
          >
            Build my income stack →
          </button>
        </section>

        <aside className="forecast-disclaimer forecast-disclaimer--compressed">
          <strong>
            About these figures
          </strong>

          <p>
            Income Stack is displaying and
            explaining figures from your uploaded
            Armed Forces pension forecast. It has
            not independently calculated your
            pension or recommended which option you
            should choose.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default PensionExplainedView;
