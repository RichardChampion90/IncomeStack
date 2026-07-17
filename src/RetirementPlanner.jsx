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
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://gbr01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fpdf.js%2F4.0.379%2Fpdf.worker.min.js&data=05%7C02%7Crichard.champion609%40mod.gov.uk%7C1baf2771752742afabcf08dee382aea8%7Cbe7760ed5953484bae95d0a16dfa09e5%7C0%7C0%7C639198347589595223%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=7pGDfcmdSjWfhAF3lQLPuM2tURht2Fy9bQ%2BRwjOfA9M%3D&reserved=0";

const PERSONAL_ALLOWANCE = 12570;
const BASIC_LIMIT = 50270;
const HIGHER_LIMIT = 125140;

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

const CURRENT_YEAR = new Date().getFullYear();

const EXAMPLE = {
  exitAge: 40,
  edpAtExit: 9482,
  lumpSumAtExit: 59054,
  edpAt55: 12471,
  deferredAt65: 15460,
  deferredAtSPA: 22261,
};

const BLANK = {
  exitAge: 40,
  edpAtExit: 0,
  lumpSumAtExit: 0,
  edpAt55: 0,
  deferredAt65: 0,
  deferredAtSPA: 0,
};

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text;
}

function parseAfpc(text) {
  const num = (re) => {
    const m = text.match(re);
    return m ? parseInt(m[1].replace(/,/g, ""), 10) : null;
  };
  const dobMatch = text.match(/Date of Birth\s+(\d{2})\/(\d{2})\/(\d{4})/i);
  let currentAge = null;
  if (dobMatch) {
    const dob = new Date(
      parseInt(dobMatch[3], 10),
      parseInt(dobMatch[2], 10) - 1,
      parseInt(dobMatch[1], 10)
    );
    const now = new Date();
    currentAge = Math.floor((now - dob) / (365.25 * 24 * 3600 * 1000));
  }
  return {
    edpAtExit: num(/Pension\/EDP at Exit\s+([\d,]+)/i),
    lumpSumAtExit: num(/Lump Sum at Exit\s+([\d,]+)/i),
    edpAt55: num(/EDP at 55\s+([\d,]+)/i),
    deferredAt65: num(/Deferred Pension at 65\s+([\d,]+)/i),
    deferredAtSPA: num(/Deferred Pension at SPA\s+([\d,]+)/i),
    statePensionAge: num(/State Pension Age \(SPA\)\s+(\d+)/i),
    exitAge: num(/Age at the end Reckonable Service\s+(\d+)/i),
    currentAge,
  };
}

function getSalaryForAge(age, periods) {
  const sorted = [...periods].sort((a, b) => a.startAge - b.startAge);
  let current = 0;
  for (const p of sorted) {
    if (age >= p.startAge) current = p.salary;
    else break;
  }
  return current;
}

function afpsIncome(age, afps, spa, accessAge, reductionPerYear) {
  if (age < afps.exitAge) return 0;
  if (age < 55) return afps.edpAtExit;
  if (accessAge >= spa) {
    if (age < 65) return afps.edpAt55;
    if (age < spa) return afps.deferredAt65;
    return afps.deferredAtSPA;
  }
  if (age < accessAge) {
    if (age < 65) return afps.edpAt55;
    return afps.deferredAt65;
  }
  const yearsEarly = Math.max(spa - accessAge, 0);
  const reduced = Math.max(afps.deferredAtSPA * (1 - (reductionPerYear / 100) * yearsEarly), 0);
  if (age < spa) return reduced + afps.edpAt55;
  return reduced;
}

function afpsInflationFactor(age, exitAge, currentAge, cpiRate, useNominal) {
  if (!useNominal) return 1;
  if (age < 55) {
    return Math.pow(1 + cpiRate / 100, Math.max(exitAge - currentAge, 0));
  }
  return Math.pow(1 + cpiRate / 100, Math.max(age - currentAge, 0)); }

export default function RetirementPlanner() {
  const [afps, setAfps] = useState(EXAMPLE);
  const [pdfStatus, setPdfStatus] = useState(null);

  const [currentAge, setCurrentAge] = useState(35);
  const exitAge = afps.exitAge;
  const exitYear = CURRENT_YEAR + (exitAge - currentAge);

  const [accessAge, setAccessAge] = useState(68);
  const [reductionPerYear, setReductionPerYear] = useState(4);

  const [salaryPeriods, setSalaryPeriods] = useState([
    { id: 1, startAge: 40, salary: 60000 },
  ]);
  function addSalaryPeriod() {
    setSalaryPeriods((prev) => {
      const last = prev[prev.length - 1];
      return [...prev, { id: Date.now(), startAge: (last?.startAge ?? 40) + 5, salary: last?.salary ?? 40000 }];
    });
  }
  function updateSalaryPeriod(id, key, value) {
    setSalaryPeriods((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }
  function removeSalaryPeriod(id) {
    setSalaryPeriods((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  }
  const [employeePct, setEmployeePct] = useState(8);
  const [employerPct, setEmployerPct] = useState(8);
  const [pensionGrowth, setPensionGrowth] = useState(5);

  const [isaMonthly, setIsaMonthly] = useState(500);
  const [isaGrowth, setIsaGrowth] = useState(5);

  const [drawdownRate, setDrawdownRate] = useState(4);
  const [statePension, setStatePension] = useState(12000);
  const [statePensionAge, setStatePensionAge] = useState(68);

  const [retireAge, setRetireAge] = useState(55);

  const [useNominal, setUseNominal] = useState(false);
  const [cpiRate, setCpiRate] = useState(2.5);

  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPdfStatus("reading");
    try {
      const text = await extractPdfText(file);
      const parsed = parseAfpc(text);
      setAfps((prev) => ({
        exitAge: parsed.exitAge ?? prev.exitAge,
        edpAtExit: parsed.edpAtExit ?? prev.edpAtExit,
        lumpSumAtExit: parsed.lumpSumAtExit ?? prev.lumpSumAtExit,
        edpAt55: parsed.edpAt55 ?? prev.edpAt55,
        deferredAt65: parsed.deferredAt65 ?? prev.deferredAt65,
        deferredAtSPA: parsed.deferredAtSPA ?? prev.deferredAtSPA,
      }));
      if (parsed.statePensionAge) setStatePensionAge(parsed.statePensionAge);
      if (parsed.currentAge) setCurrentAge(parsed.currentAge);
      const found = Object.values(parsed).filter((v) => v !== null).length;
      setPdfStatus(found >= 5 ? "ok" : "partial");
    } catch (err) {
      setPdfStatus("error");
    }
  }

  function projectPots(targetRetireAge) {
    let dcPot = 0;
    for (let age = exitAge; age < targetRetireAge; age++) {
      const sal = getSalaryForAge(age, salaryPeriods);
      const annualDc = sal * ((employeePct + employerPct) / 100);
      dcPot = dcPot * (1 + pensionGrowth / 100) + annualDc;
    }
    let isaPot = 0;
    const annualIsa = isaMonthly * 12;
    for (let age = currentAge; age < targetRetireAge; age++) {
      isaPot = isaPot * (1 + isaGrowth / 100) + annualIsa;
    }
    return { dcPot, isaPot };
  }

  function buildTimeline(targetRetireAge, chosenAccessAge) {
    const { dcPot, isaPot } = projectPots(targetRetireAge);
    const dcAnnual = dcPot * (drawdownRate / 100);
    const isaAnnual = isaPot * (drawdownRate / 100);
    const rows = [];
    for (let age = exitAge; age <= 85; age++) {
      const infl = useNominal
        ? Math.pow(1 + cpiRate / 100, Math.max(age - currentAge, 0))
        : 1;
      const afpsInfl = afpsInflationFactor(age, exitAge, currentAge, cpiRate, useNominal);
      const working = age < targetRetireAge;
      const salaryIncome = (working ? getSalaryForAge(age, salaryPeriods) : 0) * infl;
      const afpsInc =
        afpsIncome(age, afps, statePensionAge, chosenAccessAge, reductionPerYear) * afpsInfl;
      const dcIncome = (age >= targetRetireAge ? dcAnnual : 0) * infl;
      const isaIncome = (age >= targetRetireAge ? isaAnnual : 0) * infl;
      const spIncome = (age >= statePensionAge ? statePension : 0) * infl;
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
    () => buildTimeline(retireAge, accessAge),
    [afps, currentAge, salaryPeriods, employeePct, employerPct, pensionGrowth,
      isaMonthly, isaGrowth, drawdownRate, statePension, statePensionAge,
      retireAge, accessAge, reductionPerYear, useNominal, cpiRate]
  );

  const retireComparison = useMemo(() => {
    const out = [];
    for (let ra = 55; ra <= 67; ra++) {
      const { rows } = buildTimeline(ra, accessAge);
      const row = rows.find((r) => r.age === ra) || rows[0];
      out.push({ retireAge: ra, netFirstYear: row ? row.net : 0 });
    }
    return out;
  }, [afps, currentAge, salaryPeriods, employeePct, employerPct, pensionGrowth,
      isaMonthly, isaGrowth, drawdownRate, statePension, statePensionAge,
      accessAge, reductionPerYear, useNominal, cpiRate]);

  const accessComparison = useMemo(() => {
    const out = [];
    for (let aa = 55; aa <= statePensionAge; aa++) {
      let total = 0;
      for (let age = exitAge; age <= 85; age++) {
        total += afpsIncome(age, afps, statePensionAge, aa, reductionPerYear);
      }
      out.push({ accessAge: aa, lifetimeAfps: total });
    }
    return out;
  }, [afps, statePensionAge, reductionPerYear]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>YOUR NUMBERS, YOUR REPORT</div>
          <h1 style={styles.h1}>Your exit, mapped in numbers</h1>
          <p style={styles.subhead}>
            Upload your Armed Forces Pension Calculator PDF to auto-fill your
            figures, or type them in yourself. Combined with a second pension
            and ISA into one after-tax timeline. Not financial advice.
          </p>
        </header>

        <div style={styles.grid}>
          <div style={styles.panel}>
            <Section title="Upload your AFPC report">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                style={styles.fileInput}
              />
              {pdfStatus === "reading" && <p style={styles.note}>Reading your PDF…</p>}
              {pdfStatus === "ok" && (
                <p style={styles.note}>
                  Figures filled in below — check them against your report before relying on them.
                </p>
              )}
              {pdfStatus === "partial" && (
                <p style={styles.note}>
                  Filled in what we could find — some fields may need a manual check or entry below.
                </p>
              )}
              {pdfStatus === "error" && (
                <p style={styles.note}>
                  Couldn't read that file — try entering your figures manually below.
                </p>
              )}
              <p style={styles.note}>
                If your report shows two remedy options (2015 vs 2022 choice),
                we fill in the first one found — check the figures match the
                option you want.
              </p>
            </Section>

            <Section title="Your AFPS / EDP figures">
              <Field label="Age you leave" value={afps.exitAge}
                setValue={(v) => setAfps({ ...afps, exitAge: v })} min={30} max={60} />
              <Field label="EDP income at exit" value={afps.edpAtExit}
                setValue={(v) => setAfps({ ...afps, edpAtExit: v })} min={0} max={100000} step={100} prefix="£" />
              <Field label="Lump sum at exit" value={afps.lumpSumAtExit}
                setValue={(v) => setAfps({ ...afps, lumpSumAtExit: v })} min={0} max={200000} step={500} prefix="£" />
              <Field label="EDP income at 55" value={afps.edpAt55}
                setValue={(v) => setAfps({ ...afps, edpAt55: v })} min={0} max={100000} step={100} prefix="£" />
              <Field label="Deferred pension at 65" value={afps.deferredAt65}
                setValue={(v) => setAfps({ ...afps, deferredAt65: v })} min={0} max={100000} step={100} prefix="£" />
              <Field label="Full pension at SPA" value={afps.deferredAtSPA}
                setValue={(v) => setAfps({ ...afps, deferredAtSPA: v })} min={0} max={100000} step={100} prefix="£" />
              <button style={styles.smallBtn} onClick={() => setAfps(BLANK)}>Clear and enter my own</button>
              <button style={{ ...styles.smallBtn, marginLeft: 8 }} onClick={() => setAfps(EXAMPLE)}>Load example data</button>
            </Section>

            <Section title="Your service">
              <Field label="Current age" value={currentAge} setValue={setCurrentAge} min={20} max={60} />
              <p style={styles.note}>Leaving at {exitAge} ({exitYear}).</p>
            </Section>

            <Section title="Second career salary (changes over time)">
              {salaryPeriods.map((p) => (
                <div key={p.id} style={styles.salaryRow}>
                  <div style={styles.salaryFieldSmall}>
                    <label style={styles.fieldLabel}>From age</label>
                    <div style={styles.fieldInputWrap}>
                      <input type="number" value={p.startAge}
                        onChange={(e) => updateSalaryPeriod(p.id, "startAge", Number(e.target.value))}
                        style={styles.fieldInput} />
                    </div>
                  </div>
                  <div style={styles.salaryFieldSmall}>
                    <label style={styles.fieldLabel}>Salary</label>
                    <div style={styles.fieldInputWrap}>
                      <span style={styles.affix}>£</span>
                      <input type="number" value={p.salary}
                        onChange={(e) => updateSalaryPeriod(p.id, "salary", Number(e.target.value))}
                        style={styles.fieldInput} />
                    </div>
                  </div>
                  {salaryPeriods.length > 1 && (
                    <button style={styles.removeBtn} onClick={() => removeSalaryPeriod(p.id)}>✕</button>
                  )}
                </div>
              ))}
              <button style={styles.smallBtn} onClick={addSalaryPeriod}>+ Add salary change</button>
              <p style={styles.note}>E.g. £60,000 from 40, dropping to £40,000 from 55 if you expect to slow down.</p>
              <Field label="Your pension contribution %" value={employeePct} setValue={setEmployeePct} min={0} max={40} suffix="%" />
              <Field label="Employer match %" value={employerPct} setValue={setEmployerPct} min={0} max={40} suffix="%" />
              <Field label="Pension growth (annual, real)" value={pensionGrowth} setValue={setPensionGrowth} min={0} max={12} suffix="%" step={0.5} />
            </Section>

            <Section title="Stocks & shares ISA">
              <Field label="Monthly contribution" value={isaMonthly} setValue={setIsaMonthly} min={0} max={5000} step={50} prefix="£" />
              <Field label="Growth (annual, real)" value={isaGrowth} setValue={setIsaGrowth} min={0} max={12} suffix="%" step={0.5} />
            </Section>

            <Section title="At retirement">
              <Field label="Drawdown rate (2nd pension + ISA)" value={drawdownRate} setValue={setDrawdownRate} min={2} max={8} suffix="%" step={0.5} />
              <Field label="State pension (annual)" value={statePension} setValue={setStatePension} min={0} max={20000} step={100} prefix="£" />
              <Field label="State pension age" value={statePensionAge} setValue={setStatePensionAge} min={60} max={70} />
              <Field label="Early-access reduction (per year early)" value={reductionPerYear} setValue={setReductionPerYear} min={1} max={8} suffix="%" step={0.5} />
            </Section>

            <Section title="Inflation">
              <label style={styles.checkboxRow}>
                <input type="checkbox" checked={useNominal} onChange={(e) => setUseNominal(e.target.checked)} />
                Show future (nominal) pounds, not today's money
              </label>
              {useNominal && (
                <Field label="Assumed CPI (annual)" value={cpiRate} setValue={setCpiRate} min={0} max={8} suffix="%" step={0.1} />
              )}
              <p style={styles.note}>
                {useNominal
                  ? "Figures now show the actual pounds landing in your account each year. Tax bands stay fixed at today's levels, so this also shows the effect of fiscal drag over time."
                  : "Figures are in today's money throughout — easier to compare, but not what you'll actually see arrive in your account decades from now."}
              </p>
            </Section>
          </div>

          <div style={styles.results}>
            <div style={styles.cardsRow}>
              <StatCard label="Lump sum at exit (tax-free)" value={fmt(afps.lumpSumAtExit)} />
              <StatCard label="EDP income at exit" value={fmt(afps.edpAtExit)} />
              <StatCard label="Full pension at SPA" value={fmt(afps.deferredAtSPA)} />
            </div>

            <Section title="When do you draw your AFPS pension?">
              <input type="range" min={55} max={statePensionAge} value={accessAge}
                onChange={(e) => setAccessAge(Number(e.target.value))} style={styles.slider} />
              <div style={styles.sliderLabel}>
                {accessAge >= statePensionAge
                  ? "Waiting for the standard timeline: EDP to 55, deferred pension at 65, full pension at SPA."
                  : `Drawing early at ${accessAge}: an estimated ${reductionPerYear}%/year-reduced pension plus your continuing EDP, until SPA — then EDP drops away and you're left with the reduced pension alone. This is an approximation based on how your report's two elements (05/15) seemed to convert independently — not confirmed against official rules.`}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={accessComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDACD" />
                  <XAxis dataKey="accessAge" stroke="#6B6558" fontSize={11} />
                  <YAxis stroke="#6B6558" fontSize={11} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(a) => (a >= statePensionAge ? "Wait for SPA" : `Access at ${a}`)}
                    contentStyle={{ background: "#fff", border: "1px solid #DEDACD" }} />
                  <Bar dataKey="lifetimeAfps" fill="#6B7A56" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Section>

            <Section title="Pick a retirement age (2nd job) to explore">
              <input type="range" min={55} max={67} value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value))} style={styles.slider} />
              <div style={styles.sliderLabel}>
                Stopping work at {retireAge} ({CURRENT_YEAR + (retireAge - currentAge)}). Second
                pension pot: {fmt(selected.dcPot)}. ISA pot: {fmt(selected.isaPot)}.
              </div>
            </Section>

            <Section title="Net annual income by age">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={selected.rows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDACD" />
                  <XAxis dataKey="age" stroke="#6B6558" fontSize={12} />
                  <YAxis stroke="#6B6558" fontSize={12} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(age) => `Age ${age}`}
                    contentStyle={{ background: "#fff", border: "1px solid #DEDACD" }} />
                  <ReferenceLine x={65} stroke="#B08D57" strokeDasharray="4 2" label={{ value: "65", position: "top", fontSize: 11, fill: "#B08D57" }} />
                  <ReferenceLine x={statePensionAge} stroke="#6B7A56" strokeDasharray="4 2" label={{ value: "SPA", position: "top", fontSize: 11, fill: "#6B7A56" }} />
                  <Line type="monotone" dataKey="net" stroke="#3F4A34" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Section>

            <Section title="Where the money comes from, year by year">
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Age</th><th style={styles.th}>Year</th>
                      <th style={styles.th}>Salary</th><th style={styles.th}>AFPS/EDP</th>
                      <th style={styles.th}>2nd pension</th><th style={styles.th}>ISA</th>
                      <th style={styles.th}>State pension</th><th style={styles.th}>Tax</th>
                      <th style={{ ...styles.th, color: "#3F4A34" }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.rows.map((r) => (
                      <tr key={r.age}>
                        <td style={styles.td}>{r.age}</td>
                        <td style={styles.td}>{r.year}</td>
                        <td style={styles.td}>{r.salaryIncome ? fmt(r.salaryIncome) : "—"}</td>
                        <td style={styles.td}>{r.afpsInc ? fmt(r.afpsInc) : "—"}</td>
                        <td style={styles.td}>{r.dcIncome ? fmt(r.dcIncome) : "—"}</td>
                        <td style={styles.td}>{r.isaIncome ? fmt(r.isaIncome) : "—"}</td>
                        <td style={styles.td}>{r.spIncome ? fmt(r.spIncome) : "—"}</td>
                        <td style={styles.td}>{r.tax ? fmt(r.tax) : "—"}</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: "#3F4A34" }}>{fmt(r.net)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Retiring from the 2nd job at 55 vs each year after">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={retireComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DEDACD" />
                  <XAxis dataKey="retireAge" stroke="#6B6558" fontSize={12} />
                  <YAxis stroke="#6B6558" fontSize={12} tickFormatter={(v) => `£${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(age) => `Retire at ${age}`}
                    contentStyle={{ background: "#fff", border: "1px solid #DEDACD" }} />
                  <Bar dataKey="netFirstYear" fill="#B08D57" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Section>

            <div style={styles.disclaimer}>
              PDF reading happens entirely in your browser — nothing is
              uploaded anywhere. EDP is modelled as flat in cash terms from
              exit to 55, then rising with CPI from 55 onward — matching how
              AFPS EDP actually behaves, rather than growing continuously
              from today. Early-access figures add an estimated reduced
              pension on top of your continuing EDP until SPA, then drop to
              the reduced pension alone — this reflects how your two pension
              elements seemed to convert independently in your report, but
              is not confirmed against official AFPS rules; check your
              report or Veterans UK before relying on it. Growth rates you
              enter for the second pension and ISA are assumed to be real
              (above-inflation). 2026/27 tax bands held fixed under the
              nominal/CPI toggle to show fiscal drag. No National Insurance
              or personal allowance taper included. This is a planning
              sketch, not financial advice — confirm real numbers with
              Veterans UK or an independent financial adviser before
              deciding anything.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value, setValue, min, max, step = 1, prefix = "", suffix = "" }) {
  return (
    <div style={styles.fieldRow}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={styles.fieldInputWrap}>
        {prefix && <span style={styles.affix}>{prefix}</span>}
        <input type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => setValue(Number(e.target.value))} style={styles.fieldInput} />
        {suffix && <span style={styles.affix}>{suffix}</span>}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#F4F1E9", color: "#232821",
    fontFamily: "ui-sans-serif, -apple-system, 'Segoe UI', Inter, system-ui, sans-serif",
    padding: "32px 16px 64px" },
  container: { maxWidth: 1080, margin: "0 auto" },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 11, letterSpacing: "0.14em", color: "#8A8371", fontWeight: 700, marginBottom: 8 },
  h1: { fontSize: 32, lineHeight: 1.15, margin: "0 0 10px", fontWeight: 700, color: "#232821", letterSpacing: "-0.01em" },
  subhead: { fontSize: 15, color: "#5B5648", maxWidth: 640, lineHeight: 1.5 },
  grid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" },
  panel: { background: "#FBFAF6", border: "1px solid #E4E0D3", borderRadius: 10, padding: "18px 18px 8px", position: "sticky", top: 16 },
  results: { display: "flex", flexDirection: "column", gap: 20 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7A56", marginBottom: 10 },
  fieldRow: { marginBottom: 12 },
  fieldLabel: { display: "block", fontSize: 12.5, color: "#4A4638", marginBottom: 4 },
  fieldInputWrap: { display: "flex", alignItems: "center", border: "1px solid #DEDACD", borderRadius: 6, background: "#fff", padding: "6px 10px" },
  affix: { fontSize: 13, color: "#8A8371" },
  fieldInput: { border: "none", outline: "none", fontSize: 14, width: "100%", padding: "2px 6px", fontVariantNumeric: "tabular-nums", background: "transparent", color: "#232821" },
  fileInput: { fontSize: 12.5, marginBottom: 6 },
  salaryRow: { display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 },
  salaryFieldSmall: { flex: 1 },
  removeBtn: { border: "1px solid #DEDACD", background: "#fff", borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: "#8A8371" },
  smallBtn: { fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid #DEDACD", background: "#fff", cursor: "pointer", color: "#3F4A34" },
  checkboxRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4A4638", marginBottom: 8 },
  note: { fontSize: 12.5, color: "#7A7462", lineHeight: 1.5, marginTop: 6 },
  cardsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  statCard: { background: "#3F4A34", borderRadius: 10, padding: "16px 16px", color: "#F4F1E9" },
  statLabel: { fontSize: 11.5, opacity: 0.75, marginBottom: 6 },
  statValue: { fontSize: 21, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  slider: { width: "100%", accentColor: "#3F4A34" },
  sliderLabel: { fontSize: 13, color: "#4A4638", marginTop: 8, lineHeight: 1.5 },
  tableWrap: { overflowX: "auto", border: "1px solid #E4E0D3", borderRadius: 8, background: "#fff" },
  table: { borderCollapse: "collapse", width: "100%", fontSize: 12.5 },
  th: { textAlign: "right", padding: "8px 10px", borderBottom: "1px solid #E4E0D3", color: "#6B6558", fontWeight: 600, whiteSpace: "nowrap" },
  td: { textAlign: "right", padding: "6px 10px", borderBottom: "1px solid #F0EDE3", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" },
  disclaimer: { fontSize: 11.5, color: "#8A8371", lineHeight: 1.6, borderTop: "1px solid #E4E0D3", paddingTop: 14 }, };

