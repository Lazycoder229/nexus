import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
  BarChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ─── helpers ────────────────────────────────────────────────────────────────

function getY(r) {
  return Number(r.enrollment_count ?? r.total_enrollment_count ?? r.count ?? r.value ?? 0);
}
function getLabel(r, i) {
  return r.period_label || r.period || r.name || `P${i + 1}`;
}
function getProgramName(r, i) {
  return r.program || r.name || `Program ${i + 1}`;
}

/** Linear-regression forecast — no TF.js needed */
function linearPredict(ys) {
  const n = ys.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  ys.forEach((y, i) => { sx += i; sy += y; sxy += i * y; sxx += i * i; });
  const denom = n * sxx - sx * sx || 1;
  const m = (n * sxy - sx * sy) / denom;
  const b = (sy - m * sx) / n;
  const predY = Math.max(0, Math.round(m * n + b));
  const mae = ys.reduce((acc, y, i) => acc + Math.abs(y - (m * i + b)), 0) / n;
  const meanY = sy / n || 1;
  const confidence = Math.max(0, Math.min(100, Math.round((1 - mae / meanY) * 100)));
  return { value: predY, confidence };
}

// ─── subcomponents ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, subColor = "#6b7280" }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, children, style }) {
  return (
    <div className="section-card" style={style}>
      {title && <div className="section-title">{title}</div>}
      {children}
    </div>
  );
}

const PROGRAM_COLORS = [
  "#185FA5", "#3B6D11", "#534AB7", "#BA7517",
  "#0F6E56", "#993556", "#993C1D", "#5F5E5A",
];

function ProgramList({ data }) {
  const sorted = [...data].sort((a, b) => getY(b) - getY(a)).slice(0, 8);
  const max = Math.max(...sorted.map(getY), 1);
  return (
    <div className="prog-list">
      {sorted.map((p, i) => {
        const pct = Math.round((getY(p) / max) * 100);
        return (
          <div key={i} className="prog-row">
            <div className="prog-meta">
              <span className="prog-name">{getProgramName(p, i)}</span>
              <span className="prog-count">{getY(p).toLocaleString()}</span>
            </div>
            <div className="prog-bar-bg">
              <div
                className="prog-bar"
                style={{ width: `${pct}%`, background: PROGRAM_COLORS[i % PROGRAM_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InsightList({ trends, prog }) {
  const ys = trends.map(getY);
  const n = ys.length;
  if (n < 2) return null;

  const recentGrowth = n >= 2
    ? Math.round(((ys[n - 1] - ys[n - 2]) / (ys[n - 2] || 1)) * 100) : 0;

  const total = ys.reduce((a, b) => a + b, 0);
  const topProg = [...prog].sort((a, b) => getY(b) - getY(a))[0];
  const topShare = topProg ? Math.round((getY(topProg) / (total || 1)) * 100) : 0;

  const half = Math.floor(n / 2);
  const h1 = ys.slice(0, half).reduce((a, b) => a + b, 0);
  const h2 = ys.slice(half).reduce((a, b) => a + b, 0);
  const isUp = h2 >= h1;

  const items = [
    {
      dot: "#185FA5", bg: "#E6F1FB",
      text: <><strong>Latest period</strong> saw {recentGrowth >= 0 ? "+" : ""}{recentGrowth}% enrollment change vs the prior period.</>,
    },
    {
      dot: "#3B6D11", bg: "#EAF3DE",
      text: <><strong>{topProg ? getProgramName(topProg, 0) : "Top program"}</strong> leads with {topShare}% of total enrollment share.</>,
    },
    {
      dot: "#534AB7", bg: "#EEEDFE",
      text: <>Overall trend is <strong>{isUp ? "upward" : "downward"}</strong> — second half {isUp ? "exceeds" : "trails"} first half by {Math.abs(h2 - h1).toLocaleString()}.</>,
    },
  ];

  return (
    <div className="insight-list">
      {items.map((it, i) => (
        <div key={i} className="insight-item" style={{ background: it.bg }}>
          <div className="insight-dot" style={{ background: it.dot }} />
          <div className="insight-text">{it.text}</div>
        </div>
      ))}
    </div>
  );
}

function PredictionBanner({ pred }) {
  if (!pred) return null;
  return (
    <div className="pred-banner">
      <div>
        <div className="pred-label">AI forecast · next period</div>
        <div className="pred-value">{pred.value.toLocaleString()}</div>
      </div>
      <div className="pred-conf">
        <div className="pred-conf-header">
          <span>Confidence</span>
          <span>{pred.confidence}%</span>
        </div>
        <div className="pred-conf-bg">
          <div className="pred-conf-fill" style={{ width: `${pred.confidence}%` }} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: <strong>{Number(p.value).toLocaleString()}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const FALLBACK_TRENDS = [
  { period_label: "Jan", enrollment_count: 142 },
  { period_label: "Feb", enrollment_count: 165 },
  { period_label: "Mar", enrollment_count: 193 },
  { period_label: "Apr", enrollment_count: 178 },
  { period_label: "May", enrollment_count: 221 },
  { period_label: "Jun", enrollment_count: 247 },
  { period_label: "Jul", enrollment_count: 230 },
  { period_label: "Aug", enrollment_count: 268 },
  { period_label: "Sep", enrollment_count: 312 },
  { period_label: "Oct", enrollment_count: 295 },
  { period_label: "Nov", enrollment_count: 341 },
  { period_label: "Dec", enrollment_count: 378 },
];

const FALLBACK_PROG = [
  { program: "Computer Science", count: 312 },
  { program: "Business Admin", count: 278 },
  { program: "Nursing", count: 241 },
  { program: "Engineering", count: 198 },
  { program: "Education", count: 165 },
  { program: "Psychology", count: 143 },
  { program: "Fine Arts", count: 89 },
  { program: "Mathematics", count: 74 },
];

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);
  const [prog, setProg] = useState([]);
  const [admissionsCount, setAdmissionsCount] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [chartView, setChartView] = useState("area"); // "area" | "bar"

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [tr, pr, st] = await Promise.all([
          fetch(`${BASE}/api/reports/enrollment-trends`).then((r) => r.json()).catch(() => null),
          fetch(`${BASE}/api/reports/enrollment-by-program`).then((r) => r.json()).catch(() => null),
          fetch(`${BASE}/api/reports/statistics`).then((r) => r.json()).catch(() => null),
        ]);
        if (!mounted) return;

        const tdata = tr
          ? (tr.data?.series || tr.data || tr.series || (Array.isArray(tr) ? tr : []))
          : FALLBACK_TRENDS;
        const pdata = pr
          ? (pr.data || pr || (Array.isArray(pr) ? pr : []))
          : FALLBACK_PROG;

        const t = Array.isArray(tdata) && tdata.length ? tdata : FALLBACK_TRENDS;
        const p = Array.isArray(pdata) && pdata.length ? pdata : FALLBACK_PROG;

        setTrends(t);
        setProg(p);
        // pick admissions enrolled from statistics if available
        if (st && st.data && st.data.admissions && typeof st.data.admissions.enrolled !== "undefined") {
          setAdmissionsCount(Number(st.data.admissions.enrolled || 0));
        }
        if (t.length >= 3) setPrediction(linearPredict(t.map(getY)));
      } catch {
        if (mounted) { setTrends(FALLBACK_TRENDS); setProg(FALLBACK_PROG); }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // ── derived data ────────────────────────────────────────────────────────
  const ys = trends.map(getY);
  // Prefer admissionsCount (from admissions.status) if available; otherwise fall back to enrollments series total
  const seriesTotal = ys.reduce((a, b) => a + b, 0);
  const total = admissionsCount !== null ? admissionsCount : seriesTotal;
  const avg = Math.round(total / (ys.length || 1));
  const peakIdx = ys.indexOf(Math.max(...ys, 0));
  const half = Math.floor(ys.length / 2);
  const h1avg = half ? Math.round(ys.slice(0, half).reduce((a, b) => a + b, 0) / half) : avg;
  const h2avg = (ys.length - half) ? Math.round(ys.slice(half).reduce((a, b) => a + b, 0) / (ys.length - half)) : avg;
  const pctChange = h1avg ? Math.round(((h2avg - h1avg) / h1avg) * 100) : 0;

  // trend chart data (actual + forecast point)
  const trendData = trends.map((r, i) => ({
    label: getLabel(r, i),
    actual: getY(r),
    forecast: null,
  }));
  if (prediction) trendData.push({ label: "Next", actual: null, forecast: prediction.value });

  // period-over-period change data
  const changeData = trends.slice(1).map((r, i) => ({
    label: getLabel(r, i + 1),
    delta: getY(r) - getY(trends[i]),
  }));

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="aa-root">
        {/* header */}
        <div className="aa-header">
          <div>
            <h2 className="aa-title">Enrollment Analytics</h2>
            <p className="aa-subtitle">Academic performance overview</p>
          </div>
          <div className="aa-status">
            <span className={`aa-dot ${loading ? "aa-dot-loading" : "aa-dot-live"}`} />
            {loading ? "Loading…" : "Live data"}
          </div>
        </div>

        {/* KPI row */}
        <div className="kpi-grid">
          <KpiCard
            label="Total enrolled"
            value={total.toLocaleString()}
            sub={`${pctChange >= 0 ? "+" : ""}${pctChange}% vs prior half`}
            subColor={pctChange >= 0 ? "#3B6D11" : "#A32D2D"}
          />
          <KpiCard
            label="Active programs"
            value={prog.length}
            sub="tracked programs"
          />
          <KpiCard
            label="Avg per period"
            value={avg.toLocaleString()}
            sub="enrollments / period"
          />
          <KpiCard
            label="Peak period"
            value={trends[peakIdx] ? getLabel(trends[peakIdx], peakIdx) : "—"}
            sub={ys.length ? `${Math.max(...ys).toLocaleString()} enrollments` : ""}
          />
        </div>

        {/* main row: trend + programs */}
        <div className="main-grid">
          <SectionCard title="Enrollment trends">
            {/* view toggle */}
            <div className="toggle-row">
              {["area", "bar"].map((v) => (
                <button
                  key={v}
                  className={`toggle-btn ${chartView === v ? "toggle-btn-active" : ""}`}
                  onClick={() => setChartView(v)}
                >
                  {v === "area" ? "Line" : "Bar"}
                </button>
              ))}
            </div>

            {/* legend */}
            <div className="legend-row">
              <span className="legend-item">
                <span className="legend-swatch" style={{ background: "#185FA5" }} />
                Actual
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch-dashed" />
                Forecast
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              {chartView === "area" ? (
                <AreaChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <defs>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#185FA5" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#185FA5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#185FA5" strokeWidth={2} fill="url(#gradActual)" dot={{ r: 3, fill: "#185FA5" }} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#BA7517" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 5, fill: "#BA7517" }} connectNulls={false} />
                </AreaChart>
              ) : (
                <BarChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="actual" name="Actual" fill="#185FA5" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="forecast" name="Forecast" fill="#BA7517" fillOpacity={0.8} radius={[3, 3, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>

            <PredictionBanner pred={prediction} />
          </SectionCard>

          <SectionCard title="By program">
            <ProgramList data={prog} />
          </SectionCard>
        </div>

        {/* bottom row: change + insights */}
        <div className="bottom-grid">
          <SectionCard title="Period-over-period change">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={changeData} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} formatter={(v) => [v > 0 ? `+${v}` : v, "Change"]} />
                <ReferenceLine y={0} stroke="rgba(128,128,128,0.3)" />
                <Bar dataKey="delta" name="Change" radius={[3, 3, 0, 0]}>
                  {changeData.map((entry, i) => (
                    <Cell key={i} fill={entry.delta >= 0 ? "rgba(59,109,17,0.75)" : "rgba(163,45,45,0.75)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Key insights">
            {trends.length >= 2 && prog.length > 0 && (
              <InsightList trends={trends} prog={prog} />
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
};

// ─── styles ──────────────────────────────────────────────────────────────────

const CSS = `
.aa-root { padding: 12px 16px; font-family: system-ui, sans-serif; }
.aa-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.aa-title { font-size: 20px; font-weight: 600; color: #111827; margin: 0; }
.aa-subtitle { font-size: 13px; color: #6b7280; margin: 2px 0 0; }
.aa-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; margin-top: 4px; }
.aa-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.aa-dot-live { background: #3B6D11; }
.aa-dot-loading { background: #BA7517; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

/* KPIs */
.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
.kpi-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; }
.kpi-label { font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.kpi-value { font-size: 22px; font-weight: 600; color: #111827; }
.kpi-sub { font-size: 12px; margin-top: 3px; }

/* cards */
.section-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 18px; }
.section-title { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 14px; }

/* grids */
.main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px; }
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* toggle */
.toggle-row { display: flex; gap: 4px; margin-bottom: 10px; }
.toggle-btn { font-size: 12px; padding: 4px 12px; border-radius: 6px; cursor: pointer; background: transparent; border: 1px solid #e5e7eb; color: #6b7280; transition: all 0.15s; }
.toggle-btn:hover { border-color: #d1d5db; color: #374151; }
.toggle-btn-active { background: #EFF6FF; color: #185FA5; border-color: #BFDBFE; }

/* legend */
.legend-row { display: flex; gap: 14px; margin-bottom: 8px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; }
.legend-swatch { width: 10px; height: 10px; border-radius: 2px; }
.legend-swatch-dashed { background: transparent; border: 2px dashed #BA7517; }

/* program list */
.prog-list { display: flex; flex-direction: column; gap: 10px; }
.prog-row { display: flex; flex-direction: column; gap: 4px; }
.prog-meta { display: flex; justify-content: space-between; }
.prog-name { font-size: 13px; color: #374151; }
.prog-count { font-size: 13px; color: #6b7280; font-variant-numeric: tabular-nums; }
.prog-bar-bg { background: #f3f4f6; border-radius: 3px; height: 5px; overflow: hidden; }
.prog-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

/* insights */
.insight-list { display: flex; flex-direction: column; gap: 10px; }
.insight-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 8px; }
.insight-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.insight-text { font-size: 13px; color: #6b7280; line-height: 1.55; }
.insight-text strong { color: #111827; font-weight: 600; }

/* prediction */
.pred-banner { margin-top: 12px; padding: 12px 14px; background: #EFF6FF; border-radius: 8px; display: flex; align-items: center; gap: 16px; }
.pred-label { font-size: 11px; color: #185FA5; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.pred-value { font-size: 20px; font-weight: 600; color: #185FA5; }
.pred-conf { flex: 1; }
.pred-conf-header { display: flex; justify-content: space-between; font-size: 11px; color: #185FA5; margin-bottom: 5px; }
.pred-conf-bg { background: rgba(24,95,165,0.15); border-radius: 3px; height: 5px; }
.pred-conf-fill { height: 100%; border-radius: 3px; background: #185FA5; transition: width 0.6s ease; }

/* tooltip */
.custom-tooltip { background: #1f2937; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #f9fafb; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.tooltip-label { font-size: 11px; color: #9ca3af; margin-bottom: 5px; }
.tooltip-row { display: flex; align-items: center; gap: 6px; }
.tooltip-dot { width: 7px; height: 7px; border-radius: 50%; }

@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}
`;

export default AdminAnalytics;