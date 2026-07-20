import Header from "./components/Header";

function App() {
  function handleGetStarted() {
    console.log("Get started selected");
  }

  return (
    <>
      <Header onGetStarted={handleGetStarted} />

      <main>
        {/* The main introduction section comes next. */}
      </main>
    </>
  );
}

export default App;
