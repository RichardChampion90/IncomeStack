import React from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router";

import RetirementPlanner from "./RetirementPlanner.jsx";

function HomePage() {
  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>Income Stack</div>

        <Link to="/setup" style={styles.navButton}>
          Build my forecast
        </Link>
      </nav>

      <section style={styles.hero}>
        <div style={styles.eyebrow}>FINANCIAL PLANNING AFTER SERVICE</div>

        <h1 style={styles.heading}>
          See how your future income stacks up.
        </h1>

        <p style={styles.intro}>
          Combine your Armed Forces pension, second career, workplace pension,
          ISA and State Pension into one clear financial timeline.
        </p>

        <div style={styles.actions}>
          <Link to="/setup" style={styles.primaryButton}>
            Build my income forecast
          </Link>

          <a href="#how-it-works" style={styles.secondaryButton}>
            See how it works
          </a>
        </div>

        <p style={styles.privacy}>
          Your pension PDF is read inside your browser and is not uploaded.
        </p>
      </section>

      <section id="how-it-works" style={styles.howSection}>
        <div style={styles.sectionHeading}>
          Build your forecast in three steps
        </div>

        <div style={styles.cardGrid}>
          <FeatureCard
            number="1"
            title="Add your pension"
            text="Upload your Armed Forces Pension Calculator report or enter the figures manually."
          />

          <FeatureCard
            number="2"
            title="Add your next chapter"
            text="Include future salaries, workplace pension contributions and ISA savings."
          />

          <FeatureCard
            number="3"
            title="See your timeline"
            text="Visualise where your income comes from each year and identify possible gaps."
          />
        </div>
      </section>

      <footer style={styles.footer}>
        Income Stack is a planning tool, not financial advice.
      </footer>
    </main>
  );
}

function FeatureCard({ number, title, text }) {
  return (
    <article style={styles.card}>
      <div style={styles.cardNumber}>{number}</div>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardText}>{text}</p>
    </article>
  );
}

function PlannerPage() {
  return (
    <>
      <div style={styles.plannerTopBar}>
        <Link to="/" style={styles.backLink}>
          ← Income Stack
        </Link>
      </div>

      <RetirementPlanner />
    </>
  );
}

function DashboardPlaceholder() {
  return (
    <main style={styles.page}>
      <div style={styles.placeholder}>
        <div style={styles.eyebrow}>INCOME STACK</div>
        <h1 style={styles.heading}>Your dashboard is coming next.</h1>
        <p style={styles.intro}>
          We will move the main chart, totals and insights onto this screen
          once the landing and setup journey are working.
        </p>

        <Link to="/setup" style={styles.primaryButton}>
          Return to planner
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/setup" element={<PlannerPage />} />
      <Route path="/dashboard" element={<DashboardPlaceholder />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F1E9",
    color: "#232821",
    fontFamily:
      "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  nav: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "22px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    fontWeight: 800,
    fontSize: 20,
    color: "#3F4A34",
  },

  navButton: {
    textDecoration: "none",
    background: "#3F4A34",
    color: "#FFFFFF",
    padding: "10px 15px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 650,
  },

  hero: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "95px 20px 110px",
    textAlign: "center",
  },

  eyebrow: {
    color: "#6B7A56",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.14em",
    marginBottom: 18,
  },

  heading: {
    maxWidth: 760,
    margin: "0 auto 22px",
    fontSize: "clamp(40px, 7vw, 72px)",
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
  },

  intro: {
    maxWidth: 650,
    margin: "0 auto",
    color: "#5B5648",
    fontSize: "clamp(17px, 2.5vw, 21px)",
    lineHeight: 1.6,
  },

  actions: {
    marginTop: 34,
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },

  primaryButton: {
    display: "inline-block",
    textDecoration: "none",
    background: "#3F4A34",
    color: "#FFFFFF",
    padding: "14px 20px",
    borderRadius: 9,
    fontWeight: 700,
  },

  secondaryButton: {
    display: "inline-block",
    textDecoration: "none",
    background: "#FBFAF6",
    color: "#3F4A34",
    padding: "13px 20px",
    borderRadius: 9,
    border: "1px solid #D7D1C2",
    fontWeight: 700,
  },

  privacy: {
    marginTop: 18,
    color: "#7A7462",
    fontSize: 13,
  },

  howSection: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 20px 100px",
  },

  sectionHeading: {
    marginBottom: 24,
    textAlign: "center",
    color: "#3F4A34",
    fontSize: 25,
    fontWeight: 750,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },

  card: {
    background: "#FBFAF6",
    border: "1px solid #E4E0D3",
    borderRadius: 14,
    padding: 24,
  },

  cardNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    background: "#E2E7D9",
    color: "#3F4A34",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
  },

  cardTitle: {
    fontSize: 19,
    margin: "20px 0 8px",
  },

  cardText: {
    margin: 0,
    color: "#6B6558",
    lineHeight: 1.6,
  },

  plannerTopBar: {
    background: "#F4F1E9",
    padding: "14px 20px 0",
  },

  backLink: {
    color: "#3F4A34",
    fontWeight: 700,
    textDecoration: "none",
  },

  placeholder: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "140px 20px",
    textAlign: "center",
  },

  footer: {
    borderTop: "1px solid #DEDACD",
    padding: 25,
    textAlign: "center",
    color: "#7A7462",
    fontSize: 13,
  },
};
