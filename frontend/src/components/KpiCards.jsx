export default function KpiCards({ summary }) {
  const cards = [
    {
      label: "Total Employees",
      value: summary.total ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="#3B82F6" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-700", value_color: "text-blue-800",
      trend: "Total workforce analyzed"
    },
    {
      label: "High Risk",
      value: summary.high_risk ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-red-50", iconBg: "bg-red-100", text: "text-red-700", value_color: "text-red-800",
      trend: "Immediate attention needed"
    },
    {
      label: "Medium Risk",
      value: summary.medium_risk ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-700", value_color: "text-amber-800",
      trend: "Monitor closely"
    },
    {
      label: "Low Risk",
      value: summary.low_risk ?? 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-700", value_color: "text-emerald-800",
      trend: "Stable employees"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl p-4 ${c.bg} border border-opacity-20`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
            <div className={`w-8 h-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
              {c.icon}
            </div>
          </div>
          <p className={`text-3xl font-bold ${c.value_color} mb-1`}>
            {c.value.toLocaleString()}
          </p>
          <p className={`text-xs ${c.text} opacity-70`}>{c.trend}</p>
        </div>
      ))}
    </div>
  );
}