import { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { formatDate, formatNumber, calculatePercentage } from '../../utils/formatters';
import { defaultChartOptions } from '../../config/chartConfig';

const RecoveryChart = ({ data }) => {
  const chartRef = useRef(null);

  if (!data || !data.dailyRecovered || data.dailyRecovered.every(v => v === 0)) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Recovery Analysis</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Recovery data not available</p>
        </div>
      </div>
    );
  }

  const { dates, dailyRecovered, totalCases, totalRecovered } = data;
  
  // Calculate recovery rate
  const lastCases = totalCases[totalCases.length - 1];
  const lastRecovered = totalRecovered[totalRecovered.length - 1];
  const recoveryRate = calculatePercentage(lastRecovered, lastCases);

  const chartData = {
    labels: dates.map(formatDate),
    datasets: [
      {
        label: 'Daily Recoveries',
        data: dailyRecovered,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => formatNumber(value)
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Recovery Analysis</h3>
        <span className="text-sm text-gray-500">
          Recovery Rate: {recoveryRate}%
        </span>
      </div>
      <div className="chart-sm">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RecoveryChart;