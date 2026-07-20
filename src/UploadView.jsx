function UploadView({ onBack }) {
  return (
    <main className="upload-view">
      <div className="upload-view__container">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back
        </button>

        <div className="upload-view__content">
          <p className="upload-view__eyebrow">Your pension, made clearer</p>

          <h1>Upload your official pension forecast.</h1>

          <p className="upload-view__intro">
            We’ll use the figures in your AFPC forecast to explain your pension
            in plain English.
          </p>

          <div className="upload-panel">
            <div className="upload-panel__icon" aria-hidden="true">
              ↑
            </div>

            <h2>Choose your pension forecast</h2>

            <p>
              Upload the official PDF you received from the Armed Forces Pension
              Calculator or pension administrator.
            </p>

            <label className="upload-button" htmlFor="forecast-upload">
              Choose PDF
            </label>

            <input
              id="forecast-upload"
              className="upload-input"
              type="file"
              accept=".pdf,application/pdf"
            />

            <p className="upload-panel__note">
              PDF files only. Your forecast will not be changed.
            </p>
          </div>

          <div className="upload-assurance">
            <h2>We explain. We don’t estimate.</h2>

            <p>
              Income Stack uses the figures from your official forecast. It
              does not invent or replace Armed Forces pension calculations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default UploadView;
