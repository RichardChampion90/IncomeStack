import { useEffect, useState } from "react";

const readingSteps = [
  "Identifying your pension scheme",
  "Reading retirement dates",
  "Finding your pension income",
  "Building your timeline",
];

function ReadingForecastView({ file, onComplete, onBack }) {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    const timers = readingSteps.map((_, index) =>
      window.setTimeout(() => {
        setCompletedSteps(index + 1);
      }, 650 * (index + 1))
    );

    const completionTimer = window.setTimeout(() => {
      onComplete();
    }, 650 * readingSteps.length + 700);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <main className="reading-view">
      <div className="reading-view__container">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="reading-view__content">
          <div className="stack-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="reading-view__eyebrow">Your pension, made clearer</p>

          <h1>We’re reading your official forecast.</h1>

          <p className="reading-view__intro">
            We’re finding the key figures and turning them into a clear pension
            timeline.
          </p>

          <div className="reading-card">
            <div className="reading-card__file">
              <span className="reading-card__file-icon" aria-hidden="true">
                PDF
              </span>

              <div>
                <p>Official forecast</p>
                <strong>{file?.name || "Pension forecast.pdf"}</strong>
              </div>
            </div>

            <div className="reading-progress" aria-live="polite">
              {readingSteps.map((step, index) => {
                const isComplete = index < completedSteps;
                const isActive = index === completedSteps;

                return (
                  <div
                    className={`reading-step ${
                      isComplete ? "reading-step--complete" : ""
                    } ${isActive ? "reading-step--active" : ""}`}
                    key={step}
                  >
                    <span className="reading-step__status" aria-hidden="true">
                      {isComplete ? "✓" : ""}
                    </span>

                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="reading-view__note">
            Income Stack uses the figures in your official document. It does
            not create or replace Armed Forces pension calculations.
          </p>
        </div>
      </div>
    </main>
  );
}

export default ReadingForecastView;
