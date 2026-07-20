import Header from "./Header";
import IntroSection from "./IntroSection";
import BenefitsSection from "./BenefitsSection";

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
      </main>
    </>
  );
}

export default App;
