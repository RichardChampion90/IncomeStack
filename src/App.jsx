import { useCallback, useState } from "react";

import Header from "./components/Header";
import IntroSection from "./components/IntroSection";
import BenefitsSection from "./components/BenefitsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FinalCTASection from "./components/FinalCTASection";
import Footer from "./components/Footer";
import UploadView from "./views/UploadView";
import ReadingForecastView from "./views/ReadingForecastView";
import PensionExplainedView from "./views/PensionExplainedView";
import IncomeStackBuilderView from "./views/IncomeStackBuilderView";

function App() {
  const [view, setView] = useState("home");
  const [forecastFile, setForecastFile] = useState(null);
  const [selectedPension, setSelectedPension] = useState(null);

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

  function handleBuildIncomeStack(pensionData) {
    setSelectedPension(pensionData);
    goToView("builder");
  }

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
        onBuildStack={handleBuildIncomeStack}
      />
    );
  }

  if (view === "builder") {
    return (
      <IncomeStackBuilderView
        pension={selectedPension}
        onBack={() => goToView("explained")}
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
