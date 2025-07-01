import { useEffect, useState, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { formatDate, formatNumber, calculateDailyAverage } from '../../utils/formatters';
import { defaultChartOptions } from '../../config/chartConfig';
import { api } from '../../services/api';

const VaccineChart = ({ country, days }) => {
  const [vaccineData, setVaccineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (country && country !== 'global') {
      fetchVaccineData();
    }
  }, [country, days]);

  const fetchVaccineData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getVaccineData(country, days);
      
      if (data && data.timeline && Object.keys(data.timeline).length > 0) {
        const processedData = processVaccineData(data.timeline);
        setVaccineData(processedData);
      } else {
        setError(`No vaccination data available for ${country}`);
      }
    } catch (err) {
      console.error('Vaccine data error:', err);
      setError(`Failed to load vaccination data`);
    } finally {
      setLoading(false);
    }
  };

  const processVaccineData = (timeline) => {
    const dates = Object.keys(timeline);
    const totals = Object.values(timeline);
    const daily = totals.map((val, i) => i === 0 ? 0 : Math.max(0, val - totals[i-1]));
    const avgDaily = calculateDailyAverage(timeline);

    return {
      dates,
      totals,
      daily,
      avgDaily
    };
  };

  const renderContent = () => {
    if (country === 'global') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-syringe text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">
              Select a specific country to view vaccination data
            </p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-syringe text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
          </div>
        </div>
      );
    }

    if (!vaccineData) return null;

    const chartData = {
      labels: vaccineData.dates.map(formatDate),
      datasets: [
        {
          label: 'Total Vaccinated',
          data: vaccineData.totals,
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          yAxisID: 'y',
          tension: 0.4,
          pointRadius: 0
        },
        {
          label: 'Daily Vaccinations',
          data: vaccineData.daily,
          type: 'bar',
          backgroundColor: 'rgba(139, 92, 246, 0.3)',
          yAxisID: 'y1'
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
              const label = context.dataset.label || '';
              const value = formatNumber(Math.abs(context.parsed.y));
              return `${label}: ${value}`;
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
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            callback: (value) => formatNumber(value)
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: (value) => formatNumber(value)
          }
        }
      }
    };

    return (
      <div className="chart-sm">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    );
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Vaccination Progress</h3>
        {vaccineData && (
          <span className="text-sm text-gray-500">
            Average daily: {formatNumber(vaccineData.avgDaily)}
          </span>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default VaccineChart;