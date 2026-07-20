import { useMemo, useState } from "react";

const pensionForecast = {
  member: {
    leavingDate: "25 July 2030",
    leavingAge: 40,
    rank: "Chief Petty Officer",
    statePensionAge: 68,
  },

  schemes: ["AFPS 05", "AFPS 15"],

  scenarios: [
    {
      id: "legacy",
      shortLabel: "Legacy benefits",
      label: "Legacy benefits until 2022",
      description:
        "Your legacy scheme benefits continue until 31 March 2022, with AFPS 15 benefits building from 1 April 2022.",

      exit: {
        annualIncome: 9482,
        lumpSum: 59054,
      },

      milestones: [
        {
          age: 40,
          title: "You leave the Armed Forces",
          description:
            "Your Early Departure Payment begins and your exit lump sum is paid.",
          annualIncome: 9482,
          lumpSum: 59054,
          badge: "Leaving service",
        },
        {
          age: 55,
          title: "Your annual income increases",
          description:
            "Your Early Departure Payment increases at age 55 in line with the forecast.",
          annualIncome: 12471,
          badge: "Income change",
        },
        {
          age: 65,
          title: "Your AFPS 05 pension becomes payable",
          description:
            "Your deferred AFPS 05 pension begins and an additional lump sum is paid.",
          annualIncome: 15460,
          lumpSum: 35871,
          badge: "AFPS 05",
        },
        {
          age: 68,
          title: "Your AFPS 15 pension becomes payable",
          description:
            "Your AFPS 15 benefits begin at the State Pension Age used in your forecast.",
          annualIncome: 22261,
          badge: "AFPS 15",
        },
      ],

      schemeBreakdown: [
        {
          scheme: "Early Departure Payment",
          description:
            "An income paid after leaving service, before all of your deferred pension benefits become payable.",
        },
        {
          scheme: "AFPS 05",
          description:
            "Your legacy AFPS 05 benefits become payable later in your pension journey.",
        },
        {
          scheme: "AFPS 15",
          description:
            "Your AFPS 15 benefits become payable at the State Pension Age used in the forecast.",
        },
      ],
    },

    {
      id: "afps15",
      shortLabel: "AFPS 15 benefits",
      label: "AFPS 15 benefits from 2015",
      description:
        "Your eligible service is treated as having moved to AFPS 15 from 1 April 2015.",

      exit: {
        annualIncome: 9027,
        lumpSum: 57900,
      },

      milestones: [
        {
          age: 40,
          title: "You leave the Armed Forces",
          description:
            "Your Early Departure Payment begins and your exit lump sum is paid.",
          annualIncome: 9027,
          lumpSum: 57900,
          badge: "Leaving service",
        },
        {
          age: 55,
          title: "Your annual income increases",
          description:
            "Your Early Departure Payment increases at age 55 in line with the forecast.",
          annualIncome: 10514,
          badge: "Income change",
        },
        {
          age: 65,
          title: "Part of your deferred pension becomes payable",
          description:
            "The legacy element shown in this outcome begins and an additional lump sum is paid.",
          annualIncome: 12001,
          lumpSum: 17844,
          badge: "Deferred pension",
        },
        {
          age: 68,
          title: "Your AFPS 15 pension becomes payable",
          description:
            "Your remaining AFPS 15 benefits begin at the State Pension Age used in your forecast.",
          annualIncome: 23750,
          badge: "AFPS 15",
        },
      ],

      schemeBreakdown: [
        {
          scheme: "Early Departure Payment",
          description:
            "An income paid after leaving service, before all of your deferred pension benefits become payable.",
        },
        {
          scheme: "Legacy benefits",
          description:
            "A smaller legacy pension element remains within this official remedy illustration.",
        },
        {
          scheme: "AFPS 15",
          description:
            "A greater proportion of your service is represented within AFPS 15 under this outcome.",
        },
      ],
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

function PensionExplainedView({ file, onBack }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState("legacy");
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const selectedScenario = useMemo(
    () =>
      pensionForecast.scenarios.find(
        (scenario) => scenario.id === selectedScenarioId,
      ) ?? pensionForecast.scenarios[0],
    [selectedScenarioId],
  );

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

          <h1>Here’s what we found in your forecast.</h1>

          <p className="explained-view__intro">
            We’ve organised the figures in your uploaded forecast into a
            clearer pension journey.
          </p>

          <div className="forecast-confirmation">
            <div className="forecast-confirmation__icon">✓</div>

            <div>
              <span>Forecast read successfully</span>
              <strong>{file?.name || "Armed Forces pension forecast"}</strong>
            </div>
          </div>
        </section>

        <section className="forecast-summary">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Forecast summary</p>
            <h2>Your pension at a glance</h2>
          </div>

          <div className="forecast-summary__grid">
            <article className="summary-detail">
              <span>Leaving service</span>
              <strong>{pensionForecast.member.leavingDate}</strong>
            </article>

            <article className="summary-detail">
              <span>Leaving age</span>
              <strong>{pensionForecast.member.leavingAge}</strong>
            </article>

            <article className="summary-detail">
              <span>Rank</span>
              <strong>{pensionForecast.member.rank}</strong>
            </article>

            <article className="summary-detail">
              <span>Schemes found</span>
              <strong>{pensionForecast.schemes.join(" and ")}</strong>
            </article>
          </div>
        </section>

        <section className="remedy-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Pension Remedy</p>
            <h2>Your forecast contains two possible outcomes</h2>
            <p>
              These are alternative official illustrations. You would not
              receive both sets of benefits.
            </p>
          </div>

          <div
            className="scenario-selector"
            role="radiogroup"
            aria-label="Choose a Pension Remedy outcome"
          >
            {pensionForecast.scenarios.map((scenario) => {
              const isSelected = scenario.id === selectedScenarioId;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`scenario-option ${
                    isSelected ? "scenario-option--selected" : ""
                  }`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                >
                  <span className="scenario-option__status">
                    {isSelected ? "Selected outcome" : "View outcome"}
                  </span>

                  <strong>{scenario.label}</strong>
                  <p>{scenario.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="current-outcome">
          <div className="current-outcome__heading">
            <div>
              <p className="section-heading__eyebrow">Selected outcome</p>
              <h2>{selectedScenario.label}</h2>
            </div>

            <span className="current-outcome__badge">
              Official forecast figures
            </span>
          </div>

          <div className="headline-values">
            <article className="headline-card headline-card--primary">
              <span>Annual income when you leave</span>
              <strong>
                {formatMoney(selectedScenario.exit.annualIncome)}
              </strong>
              <p>Before tax, based on your uploaded forecast.</p>
            </article>

            <article className="headline-card">
              <span>Lump sum when you leave</span>
              <strong>{formatMoney(selectedScenario.exit.lumpSum)}</strong>
              <p>Shown as payable at your forecast leaving date.</p>
            </article>

            <article className="headline-card">
              <span>Income starts</span>
              <strong>Age {pensionForecast.member.leavingAge}</strong>
              <p>Your forecast shows Early Departure Payment entitlement.</p>
            </article>
          </div>
        </section>

        <section className="timeline-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Your timeline</p>
            <h2>How your pension income changes over time</h2>
            <p>
              Your pension is made up of benefits that become payable at
              different stages.
            </p>
          </div>

          <div className="pension-timeline">
            {selectedScenario.milestones.map((milestone) => (
              <article
                className="timeline-event"
                key={`${selectedScenario.id}-${milestone.age}`}
              >
                <div className="timeline-event__marker">
                  <span>Age</span>
                  <strong>{milestone.age}</strong>
                </div>

                <div className="timeline-event__content">
                  <span className="timeline-event__badge">
                    {milestone.badge}
                  </span>

                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>

                  <div className="timeline-event__figures">
                    {milestone.annualIncome && (
                      <div>
                        <span>Annual income</span>
                        <strong>
                          {formatMoney(milestone.annualIncome)}
                        </strong>
                      </div>
                    )}

                    {milestone.lumpSum && (
                      <div>
                        <span>Lump sum</span>
                        <strong>{formatMoney(milestone.lumpSum)}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="meaning-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Plain English</p>
            <h2>What this means for you</h2>
          </div>

          <div className="meaning-grid">
            <article className="meaning-card">
              <span className="meaning-card__number">01</span>
              <h3>You have income immediately after leaving</h3>
              <p>
                Your forecast shows that you qualify for an Early Departure
                Payment, so you are not waiting until normal pension age for
                your first income.
              </p>
            </article>

            <article className="meaning-card">
              <span className="meaning-card__number">02</span>
              <h3>Your income changes at different ages</h3>
              <p>
                Your initial payment is not your final retirement income.
                Additional pension benefits become payable later.
              </p>
            </article>

            <article className="meaning-card">
              <span className="meaning-card__number">03</span>
              <h3>You have two Remedy illustrations</h3>
              <p>
                Your official forecast compares alternative treatment of your
                service between 2015 and 2022.
              </p>
            </article>
          </div>
        </section>

        <section className="breakdown-section">
          <button
            type="button"
            className="breakdown-toggle"
            aria-expanded={breakdownOpen}
            onClick={() => setBreakdownOpen((current) => !current)}
          >
            <div>
              <span className="section-heading__eyebrow">
                Scheme breakdown
              </span>
              <strong>See how this outcome is made up</strong>
            </div>

            <span className="breakdown-toggle__symbol">
              {breakdownOpen ? "−" : "+"}
            </span>
          </button>

          {breakdownOpen && (
            <div className="scheme-breakdown">
              {selectedScenario.schemeBreakdown.map((item) => (
                <article key={item.scheme}>
                  <h3>{item.scheme}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="comparison-section">
          <div className="section-heading">
            <p className="section-heading__eyebrow">Compare outcomes</p>
            <h2>Both official illustrations side by side</h2>
          </div>

          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">Milestone</th>
                  <th scope="col">Legacy benefits</th>
                  <th scope="col">AFPS 15 benefits</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th scope="row">Income when leaving</th>
                  <td>{formatMoney(9482)}</td>
                  <td>{formatMoney(9027)}</td>
                </tr>

                <tr>
                  <th scope="row">Lump sum when leaving</th>
                  <td>{formatMoney(59054)}</td>
                  <td>{formatMoney(57900)}</td>
                </tr>

                <tr>
                  <th scope="row">Annual income at age 55</th>
                  <td>{formatMoney(12471)}</td>
                  <td>{formatMoney(10514)}</td>
                </tr>

                <tr>
                  <th scope="row">Annual income at age 65</th>
                  <td>{formatMoney(15460)}</td>
                  <td>{formatMoney(12001)}</td>
                </tr>

                <tr>
                  <th scope="row">Lump sum at age 65</th>
                  <td>{formatMoney(35871)}</td>
                  <td>{formatMoney(17844)}</td>
                </tr>

                <tr>
                  <th scope="row">
                    Annual income at age{" "}
                    {pensionForecast.member.statePensionAge}
                  </th>
                  <td>{formatMoney(22261)}</td>
                  <td>{formatMoney(23750)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <aside className="forecast-disclaimer">
          <strong>About these figures</strong>
          <p>
            Income Stack is displaying and explaining the figures contained in
            your uploaded forecast. It has not independently calculated your
            Armed Forces pension. Figures may be subject to tax, inflation,
            future policy changes and the assumptions used in the official
            forecast.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default PensionExplainedView;
