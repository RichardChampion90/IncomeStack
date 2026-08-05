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
            "The annual Early Departure Payment shown in your forecast increases at age 55.",
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
            "The annual Early Departure Payment shown in this Remedy outcome increases at age 55.",
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

      {open && <div className="compact-accordion__content">{children}</div>}
    </section>
  );
}

function PensionExplainedView({ file, onBack }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState("legacy");
  const [expandedEventId, setExpandedEventId] = useState(null);

  const [remedyInfoOpen, setRemedyInfoOpen] = useState(false);
  const [commutationOpen, setCommutationOpen] = useState(false);
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const selectedScenario = useMemo(
    () =>
      pensionForecast.scenarios.find(
        (scenario) => scenario.id === selectedScenarioId,
      ) ?? pensionForecast.scenarios[0],
    [selectedScenarioId],
  );

  return (
    <main className="explained-view explained-view--compressed">
      <div className="explained-view__container">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>

        <section className="pension-hero pension-hero--compressed">
          <div className="stack-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="explained-view__eyebrow">Your pension explained</p>

          <h1>Here’s what your forecast means.</h1>

          <p className="explained-view__intro">
            Your key payments, milestones and choices — without the pension
            jargon.
          </p>

          <div className="forecast-confirmation forecast-confirmation--compact">
            <div className="forecast-confirmation__icon">✓</div>

            <div>
              <span>Forecast read successfully</span>
              <strong>{file?.name || pensionForecast.source.label}</strong>
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
          <section className="remedy-section remedy-section--compressed compact-section">
            <div className="section-heading section-heading--compact">
              <p className="section-heading__eyebrow">2015 Pension Remedy</p>
              <h2>Compare your two possible outcomes</h2>
            </div>

            <div
              className="remedy-tabs"
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
                    className={`remedy-tab ${
                      selected ? "remedy-tab--selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedScenarioId(scenario.id);
                      setExpandedEventId(null);
                    }}
                  >
                    <span>{scenario.tabLabel}</span>
                    {selected && <strong>✓</strong>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="inline-info-button"
              onClick={() => setRemedyInfoOpen((value) => !value)}
            >
              {remedyInfoOpen ? "Hide explanation" : "What does this mean?"}
            </button>

           
