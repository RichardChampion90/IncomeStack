function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Tell us why you’re here",
      text: "Choose what you want to understand, compare or explore.",
    },
    {
      number: "02",
      title: "Upload your official forecast",
      text: "We turn the figures in your pension forecast into a clear timeline.",
    },
    {
      number: "03",
      title: "Explore your future",
      text: "See how your pension and the choices you make today could shape your future income.",
    },
  ];

  return (
    <section
      className="how-it-works"
      id="how-it-works"
      aria-labelledby="how-it-works-title"
    >
      <div className="how-it-works__inner">
        <div className="how-it-works__heading">
          <p className="how-it-works__eyebrow">How it works</p>

          <h2 id="how-it-works-title">
            From pension forecast to a clearer view of your future.
          </h2>
        </div>

        <div className="how-it-works__steps">
          {steps.map((step) => (
            <article className="process-step" key={step.number}>
              <span className="process-step__number">{step.number}</span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
