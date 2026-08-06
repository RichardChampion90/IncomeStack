function BenefitsSection() {
  const benefits = [
    {
      title: "Understand",
      text: "See what your pension provides, when payments begin and what the figures mean in plain English.",
    },
    {
      title: "Compare",
      text: "Explore different official forecasts and saved scenarios side by side.",
    },
    {
      title: "Build",
      text: "See how earnings, pensions and investing could combine to shape your future income.",
    },
  ];

  return (
    <section className="benefits-section" aria-labelledby="benefits-title">
      <div className="benefits-section__inner">
        <div className="benefits-section__heading">
          <p className="benefits-section__eyebrow">
            What Income Stack helps you do
          </p>

          <h2 id="benefits-title">
            Make sense of the numbers before making a decision.
          </h2>
        </div>

        <div className="benefits-section__grid">
          {benefits.map((benefit, index) => (
            <article className="benefit-card" key={benefit.title}>
              <span className="benefit-card__number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
