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

  function handleGetStarted() {
    setView("upload");
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setView("home");
    window.scrollTo(0, 0);
  }

  if (view === "upload") {
    return <UploadView onBack={handleBack} />;
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
