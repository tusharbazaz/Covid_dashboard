import { useState, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { formatDate, formatNumber, calculateMovingAverage } from '../../utils/formatters';
import { defaultChartOptions } from '../../config/chartConfig';

const TrendsChart = ({ data }) => {
  const [chartType, setChartType] = useState('line');
  const chartRef = useRef(null);

  if (!data || !data.dates) return null;

  const { dates, dailyCases } = data;
  const movingAvg = calculateMovingAverage(dailyCases, 7);

  const chartData = {
    labels: dates.map(formatDate),
    datasets: [
      {
        label: 'Daily Cases',
        data: dailyCases,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: true
      },
      {
        label: '7-Day Average',
        data: movingAvg,
        borderColor: '#EF4444',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  };

  const options = {
    ...defaultChartOptions,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatNumber(context.parsed.y)}`;
          }
        }
      }
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
        <h3 className="font-semibold text-lg">Daily Trends</h3>
        <div className="flex gap-2">
          <button 
            className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
          <button 
            className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
        </div>
      </div>
      <div className="chart-sm">
        {chartType === 'bar' ? (
          <Bar ref={chartRef} data={chartData} options={options} />
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default TrendsChart;
