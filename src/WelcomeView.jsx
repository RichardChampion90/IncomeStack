function WelcomeView({ onSelect, onBack }) {
  const options = [
    {
      id: "leave",
      icon: "🪖",
      title: "I'm thinking about leaving",
      text: "Understand what leaving service could look like.",
    },
    {
      id: "understand",
      icon: "📄",
      title: "I want to understand my pension",
      text: "Explain my pension forecast in plain English.",
    },
    {
      id: "compare",
      icon: "⚖️",
      title: "I want to compare options",
      text: "Compare different official pension forecasts.",
    },
    {
      id: "future",
      icon: "📈",
      title: "I want to build my future",
      text: "Explore future income and retirement scenarios.",
    },
  ];

  return (
    <main className="welcome-view">
      <div className="welcome-view__container">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <h1>What would you like to do today?</h1>

        <p className="welcome-intro">
          Choose where you'd like to begin.
        </p>

        <div className="option-grid">
          {options.map((option) => (
            <button
              key={option.id}
              className="option-card"
              type="button"
              onClick={() => onSelect(option.id)}
            >
              <span className="option-icon">{option.icon}</span>

              <h2>{option.title}</h2>

              <p>{option.text}</p>

              <span className="option-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default WelcomeView;
