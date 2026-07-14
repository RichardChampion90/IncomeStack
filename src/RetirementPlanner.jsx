import React, { useMemo, useState } from "react"; import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ---------- UK 2026/27 tax assumptions (simplified) ---------- const PERSONAL_ALLOWANCE = 12570; const BASIC_LIMIT = 50270; const HIGHER_LIMIT = 125140;

function incomeTax(taxable) {
  if (taxable <= 0) return 0;
  let tax = 0;
  let remaining = taxable;
  const band0 = Math.min(remaining, PERSONAL_ALLOWANCE);
  remaining -= band0;
  const band1 = Math.min(remaining, BASIC_LIMIT - PERSONAL_ALLOWANCE);
  tax += Math.max(band1, 0) * 0.2;
  remaining -= Math.max(band1, 0);
  const band2 = Math.min(remaining, HIGHER_LIMIT - BASIC_LIMIT);
  tax += Math.max(band2, 0) * 0.4;
  remaining -= Math.max(band2, 0);
  tax += Math.max(remaining, 0) * 0.45;
  return Math.round(tax);
}

const fmt = (n) =>
  "£" + Math.round(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });

const CURRENT_YEAR = 2026;

// ---------- Real AFPC milestone data, from the user's report ---------- const SCENARIOS = {
  A: {
    label: "Remedy: legacy scheme until 1 Apr 2022",
    exitAge; 40,
    edpAtExit: 9482,
    lumpSumAtExit: 59054,
    edpAt55: 12471,
    deferredAt65: 15460,
    afps05NormalAt65: 11957,
    deferredAtSPA: 22261,
    earlyTotal: {
      55: 12274, 56: 12840, 57: 13462, 58: 14112, 59: 14820,
      60: 15555, 61: 16403, 62: 17280, 63: 18270, 64: 19316,
    },
    earlyAfps15Only: { 65: 8547, 66: 9078, 67: 9655 },
  },
  B: {
    label: "Remedy: legacy scheme until 1 Apr 2015",
    exitAge: 40,
    edpAtExit: 9027,
    lumpSumAtExit: 57900,
    edpAt55: 10514,
    deferredAt65: 12001,
    afps05NormalAt65: 5948,
    deferredAtSPA: 23750,
    earlyTotal: {
      55: 12401, 56: 12972, 57: 13601, 58: 14258, 59: 14972,
      60: 15715, 61: 16572, 62: 17458, 63: 18458, 64: 19515,
    },
    earlyAfps15Only: { 65: 14767, 66: 15684, 67: 16682 },
  },
};

function afpsIncome(age, s, earlyAccessAge) {
  if (age < s.exitAge) return 0;
  if (age < 55) return s.edpAtExit;
  if (earlyAccessAge >= 68) {
    if (age < 65) return s.edpAt55;
    if (age < 68) return s.deferredAt65;
    return s.deferredAtSPA;
  }
  if (earlyAccessAge < 65) {
    if (age < earlyAccessAge) return s.edpAt55;
    const locked = Math.min(Math.max(earlyAccessAge, 55), 64);
    return s.earlyTotal[locked];
  }
  if (age < 65) return s.edpAt55;
  if (age < earlyAccessAge) return s.deferredAt65;
  const locked = Math.min(Math.max(earlyAccessAge, 65), 67);
  return s.afps05NormalAt65 + s.earlyAfps15Only[locked]; }

export default function RetirementPlanner() {
  const [scenarioKey, setScenarioKey] = useState("A");
  const scenario = SCENARIOS[scenarioKey];

  const [currentAge, setCurrentAge] = useState(35);
  const yearsToExit = scenario.exitAge - currentAge;

  const [afpsAccessAge, setAfpsAccessAge] = useState(68);

  const [salary, setSalary] = useState(60000);
  const [employeePct, setEmployeePct] = useState(8);
  const [employerPct, setEmployerPct] = useState(8);
  const [pensionGrowth, setPensionGrowth] = useState(5);

  const [isaMonthly, setIsaMonthly] = useState(500);
  const [isaGrowth, setIsaGrowth] = useState(5);

  const [drawdownRate, setDrawdownRate] = useState(4);
  const [statePension, setStatePension] = useState(12000);
  const [statePensionAge, setStatePensionAge] = useState(68);

  const [retireAge, setRetireAge] = useState(55);

  const exitAge = scenario.exitAge;
  const exitYear = CURRENT_YEAR + yearsToExit;

  function projectPots(targetRetireAge) {
    let dcPot = 0;
    const annualDc = salary * ((employeePct + employerPct) / 100);
    for (let age = exitAge; age < targetRetireAge; age++) {
      dcPot = dcPot * (1 + pensionGrowth / 100) + annualDc;
    }
    let isaPot = 0;
    const annualIsa = isaMonthly * 12;
    for (let age = currentAge; age < targetRetireAge; age++) {
      isaPot = isaPot * (1 + isaGrowth / 100) + annualIsa;
    }
    return { dcPot, isaPot };
  }

  function buildTimeline(targetRetireAge, accessAge) {
    const { dcPot, isaPot } = projectPots(targetRetireAge);
    const dcAnnual = dcPot * (drawdownRate / 100);
    const isaAnnual = isaPot * (drawdownRate / 100);
    const rows = [];
    for (let age = exitAge; age <= 85; age++) {
      const working = age < targetRetireAge;
      const salaryIncome = working ? salary : 0;
      const afpsInc = afpsIncome(age, scenario, accessAge);
      const dcIncome = age >= targetRetireAge ? dcAnnual : 0;
      const isaIncome = age >= targetRetireAge ? isaAnnual : 0;
      const spIncome = age >= statePensionAge ? statePension : 0;
      const taxable = salaryIncome + afpsInc + dcIncome + spIncome;
      const tax = incomeTax(taxable);
      const net = taxable - tax + isaIncome;
      rows.push({
        age,
        year: CURRENT_YEAR + (age - currentAge),
        salaryIncome, afpsInc, dcIncome, isaIncome, spIncome,
        taxable, tax, net,
      });
    }
    return { rows, dcPot, isaPot };
  }

  const selected = useMemo(
    () => buildTimeline(retireAge, afpsAccessAge),
    [scenarioKey, currentAge, salary, employeePct, employerPct, pensionGrowth,
      isaMonthly, isaGrowth, drawdownRate, statePension, statePensionAge,
      retireAge, afpsAccessAge]
  );

  const retireComparison = useMemo(() => {
    const out = [];
    for (let ra = 55; ra <= 67; ra++) {
      const { rows } = buildTimeline(ra, afpsAccessAge);
      const row = rows.find((r) => r.age === ra) || rows[0];
      out.push({ retireAge: ra, netFirstYear: row ? row.net : 0 });
    }
    return out;
  }, [scenarioKey, currentAge, salary, employeePct, employerPct, pensionGrowth,
      isaMonthly, isaGrowth, drawdownRate, statePension, statePensionAge, afpsAccessAge]);

  const afpsAccessComparison = useMemo(() => {
    const out = [];
    for (let aa = 55; aa <= 68; aa++) {
      let total = 0;
      for (let age = exitAge; age <= 85; age++) {
        total += afpsIncome(age, scenario, aa);
      }
      out.push({ accessAge: aa, lifetimeAfps: total });
    }
    return out;
  }, [scenarioKey]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>BUILT FROM YOUR REAL AFPC REPORT</div>
          <h1 style={styles.h1}>Your exit, mapped in numbers</h1>
          <p style={styles.subhead}>
            Figures below come from your Armed Forces Pension Calculator
            output (Ref: E8A03CC3), combined with a second pension and ISA.
            Today's money throughout — no inflation modelled. Not financial
            advice.
          </p>
        </header>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <Section title="Which remedy choice?">
              <select
                value={scenarioKey}
                onChange={(e) => setScenarioKey(e.target.value)}
                style={styles.select}
              >
                <option value="A">{SCENARIOS.A.label}</option>
                <option value="B">{SCENARIOS.B.label}</option>
              </select>
              <p style={styles.note}>
                Option A pays more sooner (higher pension at 65). Option B
                pays less until SPA but overtakes at {statePensionAge} (
                {fmt(SCENARIOS.B.deferredAtSPA)} vs {fmt(SCENARIOS.A.deferredAtSPA)}
                /yr). This is your "deferred choice" at discharge.
              </p>
            </Section>

            <Section title="Your service">
              <Field label="Current age" value={currentAge} setValue={setCurrentAge} min={30} max={45} />
              <p style={styles.note}>
                Leaving at {exitAge} ({exitYear}), {yearsToExit} years from now.
              </p>
            </Section>

            <Section title="Second career">
              <Field label="Salary" value={salary} setValue={setSalary} min={0} max={200000} step={1000} prefix="£" />
              <Field label="Your pension contribution %" value={employeePct} setValue={setEmployeePct} min={0} max={40} suffix="%" />
              <Field label="Employer match %" value={employerPct} setValue={setEmployerPct} min={0} max={40} suffix="%" />
              <Field label="Pension growth (annual)" value={pensionGrowth} setValue={setPensionGrowth} min={0} max={12} suffix="%" step={0.5} />
            </Section>

            <Section title="Stocks & shares ISA">
              <Field label="Monthly contribution" value={isaMonthly} setValue={setIsaMonthly} min={0} max={5000} step={50} prefix="£" />
              <Field label="Growth (annual)" value={isaGrowth} setValue={setIsaGrowth} min={0} max={12} suffix="%" step={0.5} />
            </Section>

            <Section title="At retirement">
              <Field label="Drawdown rate (2nd pension + ISA)" value={drawdownRate} setValue={setDrawdownRate} min={2} max={8} suffix="%" step={0.5} />
              <Field label="State pension (annual)" value={statePension} setValue={setStatePension} min={0} max={20000} step={100} prefix="£" />
              <Field label="State pension age" value={statePensionAge} setValue={setStatePensionAge} min={60} max={70} />
            </Section>
          </div>

          <div style={styles.results}>
            <div style={styles.cardsRow}>
              <StatCard label="EDP lump sum at exit (tax‑free)" value={fmt(scenario.lumpSumAtExit)} />
              <StatCard label="EDP income at exit (age 40)" value={fmt(scenario.edpAtExit)} />
              <StatCard label="Full pension at SPA (68)" value={fmt(scenario.deferredAtSPA)} />
            </div>

            <Section title="When do you draw your AFPS pension?">
              <input type="range" min={55} max={68} value={afpsAccessAge}
                onChange={(e) => setAfpsAccessAge(Number(e.target.value))} style={styles.slider} />
              <div style={styles.sliderLabel}>
                {afpsAccessAge === 68
                  ? "Waiting for the standard timeline: EDP to 55, deferred pension at 65, full pension at SPA (68)."
                  : `Drawing early at ${afpsAccessAge} with a permanent actuarial reduction — locks in roughly ${fmt(afpsIncome(afpsAccessAge, scenario, afpsAccessAge))}/yr for life from that age. There's also a separate deferred lump sum around this age (see your report) not included in the totals below.`}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={afpsAccessComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDACD" />
                  <XAxis dataKey="accessAge" stroke="#6B6558" fontSize={11} />
                  <YAxis stroke="#6B6558" fontSize={11} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(a) => (a === 68 ? "Wait for SPA" : `Access at ${a}`)}
                    contentStyle={{ background: "#fff", border: "1px solid #DEDACD" }} />
                  <Bar dataKey="lifetimeAfps" fill="#6B7A56" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p style={styles.note}>Total AFPS income received from exit to age 85, at each access-age choice — the classic "take it early and smaller, or wait and bigger" trade-off.</p>
            </Section>

            <Section title="Pick a retirement age (2nd job) to explore">
              <input type="range" min={55} max={67} value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value))} style={styles.slider} />
              <div style={styles.sliderLabel}>
                Stopping work at {retireAge} ({CURRENT_YEAR + (retireAge - currentAge)}). Second
                pension pot: {fmt(selected.dcPot)}. ISA pot: {fmt(selected.isaPot)}.
              </div>
            </Section>

            <Section title={`Net annual income by age`}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={selected.rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDACD" />
                  <XAxis dataKey="age" stroke="#6B6558" fontSize={12} />
                  <YAxis stroke="#6B6558" fontSize={12} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(age) => `Age ${age}`}
                    contentStyle={{ background: "#fff", border: "1px solid #DEDACD" }} />
                  <ReferenceLine x={65} stroke="#B08D57" strokeDasharray="4 2" label={{ value: "65", position: "top", fontSize: 11, fill: "#B08D57" }} />
