import { useState } from "react";

const badge = (label) => {
  const styles = {
    High:   "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  };
  const dots = {
    High: "bg-red-500", Medium: "bg-amber-500", Low: "bg-emerald-500"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${styles[label] || ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[label]}`}></span>
      {label}
    </span>
  );
};

const getAvatar = (name) => {
  const str = String(name);
  return isNaN(str.charAt(0)) ? str.charAt(0).toUpperCase() : "E";
};

const PAGE_SIZE = 20;

export default function RiskTable({ employees, filter, search }) {
  const [page, setPage] = useState(1);

  const filtered = employees.filter((e) => {
    const matchRisk   = filter === "All" || e.risk_label === filter;
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
                        e.department?.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter or search changes
  const handleFilter = () => { if (page !== 1) setPage(1); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Employee Risk Table</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {filtered.length} employees
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["#", "Employee", "Department", "Age", "Monthly Income", "Risk Score", "Risk Level"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((e, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 text-xs text-gray-400">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                      {getAvatar(e.name)}
                    </div>
                    <span className="font-medium text-gray-800">{e.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{e.department}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{e.age || "—"}</td>
                <td className="px-5 py-3.5 text-gray-600">
                  {e.monthly_income ? `$${e.monthly_income.toLocaleString()}` : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-1.5 rounded-full ${
                        e.risk_label === "High"   ? "bg-red-500" :
                        e.risk_label === "Medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} style={{ width: `${(e.attrition_risk * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {(e.attrition_risk * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">{badge(e.risk_label)}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                  No employees match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} employees
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition">
              «
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition">
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition">
              Next
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition">
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}