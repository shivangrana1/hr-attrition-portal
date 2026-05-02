export default function MetricsCard({ metrics }) {
  if (!metrics || metrics.accuracy === 0) return null;

  const items = [
    {
      label: "Accuracy",
      value: metrics.accuracy,
      desc: "Overall correct predictions",
      color: "text-blue-700",
      bg: "bg-blue-50",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Precision",
      value: metrics.precision,
      desc: "Of predicted high-risk, actually left",
      color: "text-purple-700",
      bg: "bg-purple-50",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Recall",
      value: metrics.recall,
      desc: "Of actual leavers, correctly identified",
      color: "text-amber-700",
      bg: "bg-amber-50",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="23 4 23 10 17 10" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="#D97706" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "F1 Score",
      value: metrics.f1,
      desc: "Balance of precision and recall",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Model Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5">Evaluated on 20% holdout test set</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-medium">
          XGBoost
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4`}>
            <div className="flex items-center gap-1.5 mb-2">
              {item.icon}
              <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
            </div>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}%
            </div>
            <div className={`mt-1 h-1.5 bg-white bg-opacity-60 rounded-full`}>
              <div
                className={`h-1.5 rounded-full ${
                  item.label === "Accuracy" ? "bg-blue-500" :
                  item.label === "Precision" ? "bg-purple-500" :
                  item.label === "Recall" ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <p className={`text-xs mt-2 ${item.color} opacity-70 leading-tight`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}