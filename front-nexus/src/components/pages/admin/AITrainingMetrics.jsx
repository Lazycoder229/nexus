import { useCallback, useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const styles = `
  .aim-root { min-height:100%; padding:28px; background:#f7f8fc; color:#182230; }
  .aim-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:22px; }
  .aim-head h1 { margin:0; font-size:25px; font-weight:700; }
  .aim-head p { margin:7px 0 0; color:#667085; font-size:14px; }
  .aim-refresh { border:1px solid #d0d5dd; background:white; color:#344054; padding:9px 14px; border-radius:9px; cursor:pointer; }
  .aim-train { border:1px solid #3157a4; background:#3157a4; color:white; padding:10px 15px; border-radius:9px; cursor:pointer; font-weight:600; }
  .aim-train:disabled,.aim-refresh:disabled { opacity:.55; cursor:not-allowed; }
  .aim-card { background:#fff; border:1px solid #e4e7ec; border-radius:14px; padding:20px; box-shadow:0 1px 2px #1018280a; }
  .aim-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:18px; }
  .aim-chart-title { margin:0 0 16px; font-size:15px; font-weight:650; }
  .aim-chart { height:260px; }
  .aim-empty { height:100%; display:grid; place-items:center; text-align:center; color:#667085; font-size:13px; padding:20px; }
  .aim-error { color:#b42318; }
  @media(max-width:850px){ .aim-grid{grid-template-columns:1fr} .aim-root{padding:18px} }
`;

export default function AITrainingMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState("");

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/ai/training-metrics");
      setMetrics(response.data);
    } catch (requestError) {
      setMetrics(null);
      setError(requestError.response?.data?.message || requestError.message || "Could not load AI training metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  const trainNewModel = async () => {
    setTraining(true);
    setError("");
    try {
      await api.post("/api/reports/prediction-model/train");
      await loadMetrics();
    } catch (requestError) {
      setMetrics(null);
      setError(requestError.response?.data?.message || requestError.message || "Could not train a new prediction model.");
    } finally {
      setTraining(false);
    }
  };

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  const latestRun = metrics?.runs?.[0];
  const epochs = (latestRun?.epochs || metrics?.epochs || []).map((row, index) => ({
    epoch: row.epoch ?? index + 1,
    loss: row.loss == null ? null : Number(row.loss),
    mae: row.mae == null ? null : Number(row.mae),
  }));
  const hasEpochs = epochs.length > 0;

  return (
    <>
      <style>{styles}</style>
      <main className="aim-root">
        <header className="aim-head">
          <div>
            <h1>AI Training Metrics</h1>
            <p>Train the semester prediction model again from the prepared JSON dataset and review its epoch metrics.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="aim-refresh" onClick={loadMetrics} disabled={loading || training}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button className="aim-train" onClick={trainNewModel} disabled={loading || training}>
              {training ? "Training model…" : "Train new semester model"}
            </button>
          </div>
        </header>

        {metrics?.prediction && (
          <section className="aim-card" style={{ marginTop: 18 }} aria-label="Next semester prediction">
            <h2 className="aim-chart-title">Next semester enrollment prediction</h2>
            <div style={{ fontSize: 25, fontWeight: 700, color: "#3157a4" }}>
              {metrics.prediction.enrollment_count.toLocaleString()} students · {metrics.prediction.period_label}
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12, color: "#475467", fontSize: 13 }}>
              {metrics.prediction.programs?.map((program) => (
                <span key={program.program}>{program.program}: <strong>{program.enrollment_count.toLocaleString()}</strong></span>
              ))}
            </div>
          </section>
        )}

        <section className="aim-grid" aria-label="Training charts">
          {[{ key: "loss", title: "Loss (MSE) by epoch", color: "#e07a3f" }, { key: "mae", title: "Mean absolute error by epoch", color: "#3478c8" }].map((chart) => (
            <div className="aim-card" key={chart.key}>
              <h2 className="aim-chart-title">{chart.title}</h2>
              <div className="aim-chart">
                {loading ? <div className="aim-empty">Loading chart…</div> : error || !hasEpochs ? (
                  <div className="aim-empty">{error ? "Metrics could not be loaded." : "No training data for this run"}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={epochs} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid stroke="#eaecf0" strokeDasharray="3 3" />
                      <XAxis dataKey="epoch" label={{ value: "Epoch", position: "insideBottom", offset: -4 }} />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Line type="monotone" dataKey={chart.key} stroke={chart.color} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
