import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../utils/formatters';
import { chartColors, defaultChartOptions } from '../config/chartConfig';
import { api } from '../services/api';

const ComparisonSection = ({ countries, showToast }) => {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState('cases');

  const handleCountryToggle = (country) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
    } else if (selectedCountries.length < 5) {
      setSelectedCountries([...selectedCountries, country]);
    } else {
      showToast('Maximum 5 countries can be compared', 'warning');
    }
  };

  const loadComparison = async () => {
    if (selectedCountries.length < 2) {
      showToast('Please select at least 2 countries to compare', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await api.compareCountries(selectedCountries);
      setComparisonData(data);
    } catch (error) {
      console.error('Comparison error:', error);
      showToast('Failed to load comparison data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCountries.length >= 2) {
      loadComparison();
    }
  }, [selectedCountries, metric]);

  const renderChart = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    const metrics = ['cases', 'deaths', 'recovered', 'active'];
    const colors = [chartColors.primary, chartColors.danger, chartColors.success, chartColors.warning];

    const chartData = {
      labels: comparisonData.map(c => c.country),
      datasets: metrics.map((m, i) => ({
        label: m.charAt(0).toUpperCase() + m.slice(1),
        data: comparisonData.map(country => country[m] || 0),
        backgroundColor: colors[i],
        borderWidth: 0
      }))
    };

    const options = {
      ...defaultChartOptions,
      plugins: {
        ...defaultChartOptions.plugins,
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatNumber(value)
          }
        }
      }
    };

    return <Bar data={chartData} options={options} />;
  };

  return (
    <div className="card mb-6 fade-in">
      <h3 className="font-semibold text-lg mb-4">Country Comparison</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Select countries to compare (max 5):
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded dark:border-gray-700">
          {countries.map(country => (
            <label key={country.country} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.country)}
                onChange={() => handleCountryToggle(country.country)}
                className="rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm truncate">{country.country}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Selected: {selectedCountries.join(', ') || 'None'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="chart-sm" style={{ height: '300px' }}>
          {renderChart()}
        </div>
      )}
    </div>
  );
};

export default ComparisonSection;