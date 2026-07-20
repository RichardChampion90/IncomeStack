import { useState } from "react";

import Header from "./Header";
import IntroSection from "./IntroSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";
import FinalCTASection from "./FinalCTASection";
import Footer from "./Footer";
import WelcomeView from "./WelcomeView";

function App() {
  const [view, setView] = useState("home");

  function handleGetStarted() {
    setView("welcome");
  }

  function handleBack() {
    setView("home");
  }

  function handleSelection(choice) {
    console.log(choice);
  }

  if (view === "welcome") {
    return (
      <WelcomeView
        onBack={handleBack}
        onSelect={handleSelection}
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
