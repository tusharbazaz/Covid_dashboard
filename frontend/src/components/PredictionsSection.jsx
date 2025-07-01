import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { formatNumber } from '../utils/formatters';
import { chartColors, defaultChartOptions } from '../config/chartConfig';
import { api } from '../services/api';

const PredictionsSection = ({ country, showToast }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confidence, setConfidence] = useState({ cases: 0, deaths: 0 });

  useEffect(() => {
    if (country && country !== 'global') {
      loadPredictions();
    }
  }, [country]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await api.getPredictions(country, 7);
      setPredictions(data);
            setConfidence(data.confidence || { cases: 0, deaths: 0 });
    } catch (error) {
      console.error('Predictions error:', error);
      showToast('Failed to load predictions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!predictions) return null;

    const labels = ['Today', ...predictions.predictions.map(p => `Day ${p.day}`)];
    const cases = [predictions.current.dailyCases, ...predictions.predictions.map(p => p.cases)];
    const deaths = [predictions.current.dailyDeaths, ...predictions.predictions.map(p => p.deaths)];

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Predicted Daily Cases',
          data: cases,
          borderColor: chartColors.primary,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: true
        },
        {
          label: 'Predicted Daily Deaths',
          data: deaths,
          borderColor: chartColors.danger,
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1',
          fill: true
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
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              xMin: 0.5,
              xMax: 0.5,
              borderColor: 'rgb(156, 163, 175)',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                content: 'Today',
                enabled: true,
                position: 'start'
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
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

    return <Line data={chartData} options={options} />;
  };

  const renderPredictionInfo = () => {
    if (!predictions) return null;

    const lastPrediction = predictions.predictions[predictions.predictions.length - 1];

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
            <i className="fas fa-virus mr-2"></i>Cases Projection
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Current total: <span className="font-semibold">{formatNumber(predictions.current.totalCases)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              7-day projection: <span className="font-semibold">{formatNumber(lastPrediction.totalCases)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Expected increase: <span className="font-semibold">
                +{formatNumber(lastPrediction.totalCases - predictions.current.totalCases)}
              </span>
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Confidence</span>
                <span className="text-xs">{confidence.cases.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${confidence.cases}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-red-800 dark:text-red-200">
            <i className="fas fa-skull-crossbones mr-2"></i>Deaths Projection
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Current total: <span className="font-semibold">{formatNumber(predictions.current.totalDeaths)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              7-day projection: <span className="font-semibold">{formatNumber(lastPrediction.totalDeaths)}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Expected increase: <span className="font-semibold">
                +{formatNumber(lastPrediction.totalDeaths - predictions.current.totalDeaths)}
              </span>
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">Confidence</span>
                <span className="text-xs">{confidence.deaths.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${confidence.deaths}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <i className="fas fa-info-circle mr-2"></i>
            Predictions are based on linear regression of the last 14 days of data.
            Actual results may vary significantly due to policy changes, vaccination rates, and other factors.
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="card mb-6">
        <h3 className="font-semibold text-lg mb-4">
          <i className="fas fa-chart-line mr-2"></i>7-Day Predictions
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6 fade-in">
      <h3 className="font-semibold text-lg mb-4">
        <i className="fas fa-chart-line mr-2"></i>7-Day Predictions for {country}
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-sm" style={{ height: '300px' }}>
          {renderChart()}
        </div>
        <div>
          {renderPredictionInfo()}
        </div>
      </div>
    </div>
  );
};

export default PredictionsSection;