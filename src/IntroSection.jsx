function IntroSection({ onGetStarted }) {
  function handleHowItWorks() {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="intro-section">
      <div className="intro-section__inner">
        <p className="intro-section__eyebrow">
          Financial planning after service
        </p>

        <h1 className="intro-section__title">
          Understand your pension.
          <br />
          Explore your future.
        </h1>

        <p className="intro-section__description">
          Upload your official Armed Forces pension forecast and see what it
          means in plain English. Then explore how the choices you make today
          could shape your future income.
        </p>

        <div className="intro-section__actions">
          <button
            className="button button--primary intro-section__primary"
            type="button"
            onClick={onGetStarted}
          >
            Get started
          </button>

          <button
            className="button button--secondary"
            type="button"
            onClick={handleHowItWorks}
          >
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
}

export default IntroSection;
