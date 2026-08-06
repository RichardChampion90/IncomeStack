function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Upload your official forecast",
      description:
        "We turn the figures in your pension forecast into a clearer pension journey.",
    },
    {
      number: "02",
      title: "Understand what you have",
      description:
        "See when your pension is paid, how the different schemes fit together and what your forecast actually means.",
    },
    {
      number: "03",
      title: "Build your future",
      description:
        "Add future earnings, workplace pensions, savings and investments to see how your income could develop.",
    },
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works__inner">
        <div className="how-it-works__heading">
          <p className="how-it-works__eyebrow">
            How it works
          </p>

          <h2>
            From pension forecast to a clearer view of your future.
          </h2>
        </div>

        <div className="how-it-works__steps">
          {steps.map((step) => (
            <article
              key={step.number}
              className="process-step"
            >
              <div className="process-step__number">
                {step.number}
              </div>

              <div>
                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
