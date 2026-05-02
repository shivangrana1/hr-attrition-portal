import ReactApexChart from "react-apexcharts";

export default function ShapChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-full shadow-sm">
      <p className="text-gray-400 text-sm">Upload a dataset to see SHAP analysis</p>
    </div>
  );

  const series = [{ name: "Impact", data: data.map(d => parseFloat(Math.abs(d.value).toFixed(4))) }];
  const options = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "55%" } },
    colors: ["#3B82F6"],
    fill: { type: "gradient", gradient: { shade: "light", type: "horizontal", gradientToColors: ["#6366F1"], stops: [0, 100] } },
    xaxis: {
      categories: data.map(d => d.feature),
      labels: { style: { fontSize: "12px", colors: "#6B7280" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "12px", colors: "#374151", fontWeight: 500 } } },
    dataLabels: { enabled: true, formatter: val => val.toFixed(3), style: { fontSize: "11px", colors: ["#fff"] } },
    grid: { borderColor: "#F3F4F6", strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    tooltip: { y: { formatter: val => `Impact: ${val.toFixed(4)}` } },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Top Attrition Factors</h3>
          <p className="text-xs text-gray-400 mt-0.5">SHAP feature importance from your dataset</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">SHAP Analysis</span>
      </div>
      <ReactApexChart options={options} series={series} type="bar" height={200} />
    </div>
  );
}