function FinalCTASection({ onGetStarted }) {
  return (
    <section className="final-cta">
      <div className="final-cta__inner">
        <p className="final-cta__eyebrow">Start with what you already have</p>

        <h2>See what your pension could mean for your future.</h2>

        <p className="final-cta__description">
          Begin with your official Armed Forces pension forecast. We’ll help
          make the figures easier to understand.
        </p>

        <button
          className="button button--primary final-cta__button"
          type="button"
          onClick={onGetStarted}
        >
          Get started
        </button>
      </div>
    </section>
  );
}

export default FinalCTASection;
