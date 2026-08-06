import { useState } from "react";

function UploadView({ onBack, onContinue }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setError("Please choose a PDF file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  function handleContinue() {
    if (!selectedFile) {
      return;
    }

    onContinue(selectedFile);
  }

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

          <div
            className={`upload-panel ${
              selectedFile ? "upload-panel--selected" : ""
            }`}
          >
            {selectedFile ? (
              <>
                <div
                  className="upload-panel__success-icon"
                  aria-hidden="true"
                >
                  ✓
                </div>

                <p className="upload-panel__status">Forecast selected</p>

                <h2>{selectedFile.name}</h2>

                <p>
                  Your PDF is ready. We’ll use the official figures it contains
                  to explain your pension.
                </p>

                <button
                  type="button"
                  className="upload-change-button"
                  onClick={() => {
                    setSelectedFile(null);
                    setError("");
                  }}
                >
                  Choose a different PDF
                </button>
              </>
            ) : (
              <>
                <div className="upload-panel__icon" aria-hidden="true">
                  ↑
                </div>

                <h2>Choose your pension forecast</h2>

                <p>
                  Upload the official PDF you received from the Armed Forces
                  Pension Calculator or pension administrator.
                </p>

                <label className="upload-button" htmlFor="forecast-upload">
                  Choose PDF
                </label>

                <input
                  id="forecast-upload"
                  className="upload-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                />

                <p className="upload-panel__note">
                  PDF files only. Your forecast will not be changed.
                </p>
              </>
            )}
          </div>

          {error && (
            <p className="upload-error" role="alert">
              {error}
            </p>
          )}

          {selectedFile && (
            <button
              type="button"
              className="button button--primary upload-continue-button"
              onClick={handleContinue}
            >
              Continue
            </button>
          )}

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
