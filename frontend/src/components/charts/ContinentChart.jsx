import { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { formatNumber } from '../../utils/formatters';
import { defaultChartOptions, chartColors } from '../../config/chartConfig';
import { api } from '../../services/api';

const ContinentChart = () => {
  const [continentData, setContinentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchContinentData();
  }, []);

  const fetchContinentData = async () => {
    try {
      const data = await api.getContinentData();
      
      if (data && Array.isArray(data)) {
        const filteredData = data.filter(c => c.continent !== 'Unknown');
        setContinentData(filteredData);
      } else {
        setError('Invalid continent data received');
      }
    } catch (err) {
      console.error('Continent data error:', err);
      setError('Failed to load continent data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Continental Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !continentData) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Continental Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: continentData.map(c => c.continent),
    datasets: [{
      data: continentData.map(c => c.cases),
      backgroundColor: [
        chartColors.primary,
        chartColors.danger,
        chartColors.success,
        chartColors.warning,
        chartColors.purple,
        chartColors.pink,
        chartColors.teal
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const options = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          usePointStyle: true,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label}: ${formatNumber(data.datasets[0].data[i])}`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].borderColor,
              lineWidth: data.datasets[0].borderWidth,
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const continent = continentData[context.dataIndex];
            return [
              `Cases: ${formatNumber(continent.cases)}`,
              `Deaths: ${formatNumber(continent.deaths)}`,
              `Recovered: ${formatNumber(continent.recovered)}`,
              `Countries: ${continent.countries.length}`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">Continental Distribution</h3>
      <div className="chart-sm">
        <Doughnut ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ContinentChart;