import ReactApexChart from "react-apexcharts";

export default function DeptChart({ employees }) {
  if (!employees || employees.length === 0) return null;

  // Count high risk employees per department
  const deptMap = {};
  employees.forEach(e => {
    if (!deptMap[e.department]) {
      deptMap[e.department] = { total: 0, high: 0 };
    }
    deptMap[e.department].total += 1;
    if (e.risk_label === "High") deptMap[e.department].high += 1;
  });

  const labels = Object.keys(deptMap);
  const series = labels.map(d => deptMap[d].high);

  const options = {
    chart: { type: "donut", toolbar: { show: false } },
    labels,
    colors: ["#3B82F6", "#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#14B8A6"],
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: { width: 8, height: 8, radius: 8 },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: { fontSize: "11px" },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "High Risk",
              fontSize: "12px",
              color: "#6B7280",
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0),
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val} employees` },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">High Risk by Department</h3>
          <p className="text-xs text-gray-400 mt-0.5">Number of high-risk employees per department</p>
        </div>
        <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
          High Risk Only
        </span>
      </div>
      <ReactApexChart options={options} series={series} type="donut" height={280} />
    </div>
  );
}