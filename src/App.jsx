import Header from "./Header";
import IntroSection from "./IntroSection";
import BenefitsSection from "./BenefitsSection";
import HowItWorksSection from "./HowItWorksSection";

function App() {
  function handleGetStarted() {
    console.log("Get started selected");
  }

  return (
    <>
      <Header onGetStarted={handleGetStarted} />

      <main>
        <IntroSection onGetStarted={handleGetStarted} />
        <BenefitsSection />
        <HowItWorksSection />
      </main>
    </>
  );
}

export default App;
