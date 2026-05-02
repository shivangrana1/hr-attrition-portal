import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import API from "../api";
import Navbar from "../components/Navbar";
import KpiCards from "../components/KpiCards";
import RiskTable from "../components/RiskTable";
import ShapChart from "../components/ShapChart";
import MetricsCard from "../components/MetricsCard";
import DeptChart from "../components/DeptChart";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({});
  const [shapData, setShapData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [empRes, sumRes, shapRes, metricsRes] = await Promise.all([
          API.get("/employees/"),
          API.get("/predict/summary"),
          API.get("/predict/shap"),
          API.get("/predict/metrics"),
        ]);
        setEmployees(empRes.data);
        setSummary(sumRes.data);
        setShapData(Array.isArray(shapRes.data) ? shapRes.data : []);
        setMetrics(metricsRes.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportToExcel = () => {
    const data = employees.map((e, i) => ({
      "#": i + 1,
      Employee: e.name,
      Department: e.department,
      Age: e.age || "—",
      "Monthly Income": e.monthly_income ? `$${e.monthly_income}` : "—",
      "Attrition Risk %": (e.attrition_risk * 100).toFixed(1) + "%",
      "Risk Level": e.risk_label,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attrition Report");

    ws["!cols"] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 20 },
      { wch: 8 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
    ];

    XLSX.writeFile(wb, "HR_Attrition_Report.xlsx");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );

  const attritionRate = summary.total
    ? ((summary.high_risk / summary.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Employee attrition risk overview
              {summary.total
                ? ` · ${summary.total.toLocaleString()} employees · ${attritionRate}% high risk rate`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {employees.length > 0 && (
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="7 10 12 15 17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="12"
                    y1="15"
                    x2="12"
                    y2="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Export Excel
              </button>
            )}
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="17 8 12 3 7 8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="15"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <KpiCards summary={summary} />

        <MetricsCard metrics={metrics} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="md:col-span-2">
            <ShapChart data={shapData} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Risk Distribution
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Breakdown by risk category
            </p>
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "High Risk",
                  value: summary.high_risk,
                  color: "bg-red-500",
                  light: "bg-red-50",
                  text: "text-red-600",
                },
                {
                  label: "Medium Risk",
                  value: summary.medium_risk,
                  color: "bg-amber-500",
                  light: "bg-amber-50",
                  text: "text-amber-600",
                },
                {
                  label: "Low Risk",
                  value: summary.low_risk,
                  color: "bg-emerald-500",
                  light: "bg-emerald-50",
                  text: "text-emerald-600",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-medium ${item.text}`}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {(
                          ((item.value ?? 0) / (summary.total || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.light} ${item.text}`}
                      >
                        {(item.value ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                      style={{
                        width: `${((item.value ?? 0) / (summary.total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>High risk rate</span>
                <span className="font-semibold text-red-600">
                  {attritionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <DeptChart employees={employees} />
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or department..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {["All", "High", "Medium", "Low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  filter === f
                    ? f === "High"
                      ? "bg-red-500 text-white"
                      : f === "Medium"
                        ? "bg-amber-500 text-white"
                        : f === "Low"
                          ? "bg-emerald-500 text-white"
                          : "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="17 8 12 3 7 8"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="15"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold mb-1">No data yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Upload an HR CSV file to get started
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Upload CSV
            </button>
          </div>
        ) : (
          <RiskTable employees={employees} filter={filter} search={search} />
        )}
      </div>
    </div>
  );
}
