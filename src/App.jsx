import Header from "./Header";
import IntroSection from "./IntroSection";

function App() {
  function handleGetStarted() {
    console.log("Get started selected");
  }

  return (
    <>
      <Header onGetStarted={handleGetStarted} />

      <main>
        <IntroSection onGetStarted={handleGetStarted} />
      </main>
    </>
  );
}

export default App;
