import { useCallback, useState } from "react";

import Header from "./Header";
import IntroSection from "./IntroSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";
import UploadView from "./UploadView";
import ReadingForecastView from "./ReadingForecastView";
import PensionExplainedView from "./PensionExplainedView";

function App() {
  const [view, setView] = useState("home");
  const [forecastFile, setForecastFile] = useState(null);

  function goToView(nextView) {
    setView(nextView);
    window.scrollTo(0, 0);
  }

  function handleGetStarted() {
    goToView("upload");
  }

  function handleUploadContinue(file) {
    setForecastFile(file);
    goToView("reading");
  }

  const handleReadingComplete = useCallback(() => {
    goToView("explained");
  }, []);

  if (view === "upload") {
    return (
      <UploadView
        onBack={() => goToView("home")}
        onContinue={handleUploadContinue}
      />
    );
  }

  if (view === "reading") {
    return (
      <ReadingForecastView
        file={forecastFile}
        onBack={() => goToView("upload")}
        onComplete={handleReadingComplete}
      />
    );
  }

  if (view === "explained") {
    return (
      <PensionExplainedView
        file={forecastFile}
        onBack={() => goToView("upload")}
      />
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
