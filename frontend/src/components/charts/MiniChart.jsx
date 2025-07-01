import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { formatCompactNumber } from '../../utils/formatters';

const MiniChart = ({ data, label, color = '#3B82F6', height = 60 }) => {
  const chartRef = useRef(null);

  if (!data || data.length === 0) return null;

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [{
      data: data,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: false
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
        callbacks: {
          title: () => '',
          label: (context) => formatCompactNumber(context.parsed.y)
        }
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    },
    interaction: {
      intersect: false
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default MiniChart;