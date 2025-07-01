import { useState, useEffect, useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { formatDate, formatNumber } from '../../utils/formatters';
import { defaultChartOptions } from '../../config/chartConfig';

const DeathChart = ({ data }) => {
  const [metric, setMetric] = useState('daily');
  const chartRef = useRef(null);

  if (!data || !data.dates) return null;

  const { dates, deaths, cases } = data;
  
  let chartData, label, chartType = 'bar';
  
  switch (metric) {
    case 'daily':
      chartData = deaths.map((val, i) => i === 0 ? 0 : val - deaths[i-1]);
      label = 'Daily Deaths';
      break;
    case 'cumulative':
      chartData = deaths;
      label = 'Total Deaths';
      break;
    case 'rate':
      chartData = deaths.map((d, i) => cases[i] > 0 ? (d / cases[i] * 100) : 0);
      label = 'Mortality Rate (%)';
      chartType = 'line';
      break;
    default:
      chartData = deaths.map((val, i) => i === 0 ? 0 : val - deaths[i-1]);
      label = 'Daily Deaths';
  }

  const config = {
    labels: dates.map(formatDate),
    datasets: [{
      label,
      data: chartData,
      backgroundColor: metric === 'rate' ? 'transparent' : 'rgba(239, 68, 68, 0.5)',
      borderColor: '#EF4444',
      borderWidth: 2,
      pointRadius: metric === 'rate' ? 2 : 0,
      tension: 0.4
    }]
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
          callback: (value) => metric === 'rate' ? `${value.toFixed(1)}%` : formatNumber(value)
        }
      }
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Death Analysis</h3>
        <select 
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="text-sm p-2 border rounded bg-gray-100 dark:bg-gray-700"
        >
          <option value="daily">Daily Deaths</option>
          <option value="cumulative">Cumulative</option>
          <option value="rate">Mortality Rate</option>
        </select>
      </div>
      <div className="chart-sm">
        <ChartComponent ref={chartRef} data={config} options={options} />
      </div>
    </div>
  );
};

export default DeathChart;
