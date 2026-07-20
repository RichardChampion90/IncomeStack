function PensionExplainedView({ file, onBack }) {
  return (
    <main className="explained-view">
      <div className="explained-view__container">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="explained-view__content">
          <p className="explained-view__eyebrow">Your pension explained</p>

          <h1>Your pension forecast is ready.</h1>

          <p className="explained-view__intro">
            We’ll build the full pension explanation here next.
          </p>

          <div className="explained-placeholder">
            <p>Forecast received</p>
            <strong>{file?.name}</strong>

            <div className="explained-placeholder__message">
              Next, we’ll design your pension timeline using sample figures
              before connecting real PDF extraction.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PensionExplainedView;
