import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Navbar from "../components/Navbar";

const steps = [
  "Reading your CSV file...",
  "Detecting columns...",
  "Training XGBoost model...",
  "Calculating SHAP values...",
  "Saving predictions to database...",
  "Almost done...",
];

export default function Upload() {
  const [file, setFile]           = useState(null);
  const [columns, setColumns]     = useState([]);
  const [targetCol, setTargetCol] = useState("");
  const [nameCol, setNameCol]     = useState("");
  const [deptCol, setDeptCol]     = useState("");
  const [sampleVals, setSampleVals] = useState({});
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState(0);
  const [msg, setMsg]             = useState("");
  const navigate = useNavigate();

  const handleDetect = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await API.post("/predict/detect-columns", form);
      if (res.data.error) { setMsg(res.data.error); return; }
      setColumns(res.data.columns);
      setTargetCol(res.data.likely_target);
      setNameCol(res.data.likely_name);
      setDeptCol(res.data.likely_dept);
      setSampleVals(res.data.sample_values || {});
      setStep(2);
    } catch {
      setMsg("Could not read file. Please check it is a valid CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadStep(0);

    // Animate loading steps
    const interval = setInterval(() => {
      setLoadStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1800);

    const form = new FormData();
    form.append("file", file);
    form.append("target_col", targetCol);
    form.append("name_col", nameCol);
    form.append("dept_col", deptCol);
    try {
      const res = await API.post("/predict/upload", form);
      clearInterval(interval);
      if (res.data.error) {
        setMsg(res.data.error);
        setLoading(false);
        return;
      }
      setLoadStep(steps.length - 1);
      setMsg(`Done! ${res.data.total} employees processed.`);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      clearInterval(interval);
      setMsg("Upload failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto mt-12 px-4">

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-8">
          {["Upload CSV", "Map Columns", "Predict"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                ${step > i ? "bg-green-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > i ? "✓" : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? "text-gray-800 font-medium" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {msg && !loading && (
          <p className="text-blue-600 text-sm mb-4 bg-blue-50 p-3 rounded-lg">{msg}</p>
        )}

        {/* Loading overlay */}
        {loading && step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm mb-4">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"
              style={{ borderWidth: "3px" }}></div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Processing your dataset</h3>
            <p className="text-xs text-gray-400 mb-6">This may take 30–60 seconds depending on dataset size</p>
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 text-xs px-4 py-2 rounded-lg transition-all ${
                  i < loadStep ? "text-green-600 bg-green-50" :
                  i === loadStep ? "text-blue-600 bg-blue-50 font-medium" :
                  "text-gray-300"
                }`}>
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {i < loadStep ? "✓" : i === loadStep ? "→" : "○"}
                  </span>
                  {s}
                </div>
              ))}
            </div>
            {msg && (
              <p className="text-green-600 text-sm mt-4 font-medium">{msg}</p>
            )}
          </div>
        )}

        {/* Step 1 — File upload */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Upload your HR dataset</h2>
            <p className="text-sm text-gray-500 mb-6">Any CSV file with employee data — we'll auto-detect the columns</p>
            <form onSubmit={handleDetect} className="flex flex-col gap-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-3">Click to select your CSV file</p>
                <input type="file" accept=".csv"
                  onChange={e => { setFile(e.target.files[0]); setMsg(""); }}
                  className="text-sm text-gray-600" required />
                {file && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <span>✓</span>
                    <span>{file.name} selected</span>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading}
                className="bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                {loading ? "Detecting columns..." : "Detect Columns →"}
              </button>
            </form>
          </div>
        )}

        {/* Step 2 — Column mapping */}
        {step === 2 && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Map your columns</h2>
            <p className="text-sm text-gray-500 mb-6">We auto-detected these — confirm or change them</p>
            <form onSubmit={handleUpload} className="flex flex-col gap-5">

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Target column <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-1">(who left the company)</span>
                </label>
                <select value={targetCol} onChange={e => setTargetCol(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {sampleVals[targetCol] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Sample values: {sampleVals[targetCol].join(", ")}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Employee name / ID column
                </label>
                <select value={nameCol} onChange={e => setNameCol(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Department column
                </label>
                <select value={deptCol} onChange={e => setDeptCol(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-700 font-medium mb-1">All other columns will be used as features</p>
                <p className="text-xs text-blue-600">{columns.length - 1} columns detected — model will train on your data automatically</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">
                  Run Prediction →
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}