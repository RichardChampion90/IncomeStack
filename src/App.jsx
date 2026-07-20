import { useState } from "react";

import Header from "./Header";
import IntroSection from "./IntroSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";
import UploadView from "./UploadView";

function App() {
  const [view, setView] = useState("home");
  const [forecastFile, setForecastFile] = useState(null);

  function handleGetStarted() {
    setView("upload");
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setView("home");
    window.scrollTo(0, 0);
  }

  function handleUploadContinue(file) {
    setForecastFile(file);
    setView("processing");
    window.scrollTo(0, 0);
  }

  if (view === "upload") {
    return (
      <UploadView
        onBack={handleBack}
        onContinue={handleUploadContinue}
      />
    );
  }

  if (view === "processing") {
    return (
      <main className="processing-view">
        <div className="processing-view__container">
          <p className="processing-view__eyebrow">
            Forecast received
          </p>

          <h1>We’ve got your pension forecast.</h1>

          <p>
            Selected file: <strong>{forecastFile?.name}</strong>
          </p>

          <p>
            Next, we’ll build the screen that explains the key figures and
            pension timeline.
          </p>

          <button
            type="button"
            className="button button--primary"
            onClick={() => setView("upload")}
          >
            Back to upload
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header onGetStarted={handleGetStarted} />

      <main>
        <IntroSection onGetStarted={handleGetStarted} />
        <BenefitsSection />
        <HowItWorksSection />
        <FinalCTASection onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </>
  );
}

export default App;
