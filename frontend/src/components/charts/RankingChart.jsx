import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../utils/formatters';
import { defaultChartOptions, chartColors } from '../../config/chartConfig';

const RankingChart = ({ countries }) => {
  const [metric, setMetric] = useState('cases');
  const [topCountries, setTopCountries] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (countries && countries.length > 0) {
      updateRanking();
    }
  }, [countries, metric]);

  const updateRanking = () => {
    const sorted = [...countries]
      .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
      .slice(0, 10);
    setTopCountries(sorted);
  };

  if (!topCountries.length) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Top 10 Countries</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading ranking data...</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: topCountries.map(c => c.country),
    datasets: [
      {
        label: 'Active',
        data: topCountries.map(c => c.active || 0),
        backgroundColor: chartColors.purple,
        borderWidth: 0
      },
      {
        label: 'Recovered',
        data: topCountries.map(c => c.recovered || 0),
        backgroundColor: chartColors.success,
        borderWidth: 0
      },
      {
        label: 'Deaths',
        data: topCountries.map(c => c.deaths || 0),
        backgroundColor: chartColors.danger,
        borderWidth: 0
      }
    ]
  };

  const options = {
    ...defaultChartOptions,
    indexAxis: 'y',
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatNumber(context.parsed.x)}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          callback: (value) => formatNumber(value)
        }
      },
      y: {
        stacked: false,
        grid: { display: false }
      }
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Top 10 Countries</h3>
        <select 
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="text-sm p-2 border rounded dark:bg-gray-700"
        >
          <option value="cases">By Cases</option>
          <option value="deaths">By Deaths</option>
          <option value="active">By Active</option>
          <option value="todayCases">By New Cases</option>
          <option value="critical">By Critical</option>
        </select>
      </div>
      <div className="chart-sm" style={{ height: '400px' }}>
        <Bar ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RankingChart;