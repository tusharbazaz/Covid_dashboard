import { useState, useEffect } from 'react';
import { formatNumber, formatPercentage } from '../utils/formatters';
import { api } from '../services/api';
import SkeletonLoader from './SkeletonLoader';

const HotspotsSection = ({ showToast }) => {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(1000);

  useEffect(() => {
    loadHotspots();
  }, [threshold]);

  const loadHotspots = async () => {
    setLoading(true);
    try {
      const data = await api.getHotspots(threshold);
      setHotspots(data);
    } catch (error) {
      console.error('Hotspots error:', error);
      showToast('Failed to load hotspots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    const icons = {
      increasing: 'fa-arrow-up text-red-500',
      decreasing: 'fa-arrow-down text-green-500',
      stable: 'fa-minus text-yellow-500'
    };
    return icons[trend] || icons.stable;
  };

  const getTrendBadge = (trend) => {
    const badges = {
      increasing: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      decreasing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      stable: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return badges[trend] || badges.stable;
  };

  return (
    <div className="card mb-6 fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          <i className="fas fa-fire mr-2 text-red-500"></i>COVID-19 Hotspots
        </h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="text-sm p-2 border rounded dark:bg-gray-700"
          >
            <option value={100}>100+ daily cases</option>
            <option value={500}>500+ daily cases</option>
            <option value={1000}>1,000+ daily cases</option>
            <option value={5000}>5,000+ daily cases</option>
            <option value={10000}>10,000+ daily cases</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b dark:border-gray-700">
            <tr>
              <th className="text-left p-3">Country</th>
              <th className="text-right p-3">New Cases</th>
              <th className="text-right p-3">Active Cases</th>
              <th className="text-right p-3">Critical</th>
              <th className="text-right p-3">Growth Rate</th>
              <th className="text-center p-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonLoader type="table-row" count={5} />
            ) : hotspots.length > 0 ? (
              hotspots.map((country, index) => (
                <tr 
                  key={country.country}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {country.countryInfo?.flag && (
                        <img 
                          src={country.countryInfo.flag} 
                          alt={country.country} 
                          className="w-6 h-4 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">{country.country}</span>
                    </div>
                  </td>
                  <td className="text-right p-3 text-red-500 font-semibold">
                    {formatNumber(country.todayCases)}
                  </td>
                  <td className="text-right p-3">
                    {formatNumber(country.activeCases)}
                  </td>
                  <td className="text-right p-3 text-orange-500">
                    {formatNumber(country.criticalCases)}
                  </td>
                  <td className="text-right p-3">
                    <span className={country.growthRate > 5 ? 'text-red-500' : ''}>
                      {country.growthRate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center p-3">
                    <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getTrendBadge(country.trend)}`}>
                      <i className={`fas ${getTrendIcon(country.trend)} mr-1`}></i>
                      {country.trend}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No hotspots found with the selected threshold
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && hotspots.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <i className="fas fa-info-circle mr-2"></i>
            Countries are marked as hotspots based on daily new cases exceeding {formatNumber(threshold)} 
            and showing an increasing trend over the past 7 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotspotsSection;