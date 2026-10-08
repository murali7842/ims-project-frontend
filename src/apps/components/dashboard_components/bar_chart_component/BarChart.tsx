import './BarChart.css';

export interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  emptyText?: string;
}

// Simple vertical bar chart; bars are scaled to the largest value
const BarChart = ({ data, height = 220, emptyText = "No data" }: BarChartProps) => {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0) {
    return <p className="bar-chart-empty">{emptyText}</p>;
  }

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      {data.map((item) => (
        <div key={item.label} className="bar-chart-column">
          <span className="bar-chart-value">{item.value.toLocaleString()}</span>
          <div className="bar-chart-bar" style={{ height: `${(item.value / max) * 100}%` }} />
          <span className="bar-chart-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
