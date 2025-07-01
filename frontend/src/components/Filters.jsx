import { useState } from 'react';
import { formatNumber } from '../utils/formatters';

const Filters = ({
  countries,
  currentCountry,
  currentDays,
  onCountryChange,
  onDaysChange,
  onCompare,
  onHotspots,
  onPredictions,
  onExport,
  showToast
}) => {
  const [continent, setContinent] = useState('');
  const [sortBy, setSortBy] = useState('cases');

  const handleExport = async () => {
    try {
      await onExport();
      showToast('Data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 fade-in">
      <h2 className="text-lg font-semibold mb-4">Filters & Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Country Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Country/Region</label>
          <select 
            value={currentCountry}
            onChange={e => onCountryChange(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="global">🌍 Global</option>
            {countries.map(country => (
              <option key={country.country} value={country.country}>
                {country.country} ({formatNumber(country.cases)} cases)
              </option>
            ))}
          </select>
        </div>
        
        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <select 
            value={currentDays}
            onChange={e => onDaysChange(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="7">Last Week</option>
            <option value="30">Last Month</option>
            <option value="90">Last 3 Months</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        {/*
        // Continent Filter (commented out)
        <div>
          <label className="block text-sm font-medium mb-2">Continent</label>
          <select 
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">All Continents</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="Africa">Africa</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Australia-Oceania">Oceania</option>
          </select>
        </div>
        */}

        {/*
        // Sort Options (commented out)
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="cases">Total Cases</option>
            <option value="todayCases">New Cases</option>
            <option value="deaths">Total Deaths</option>
            <option value="recovered">Recovered</option>
            <option value="active">Active Cases</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        */}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        {/*
        <button
          onClick={onCompare}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition 
                     transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <i className="fas fa-chart-line mr-2"></i>Compare Countries
        </button>
        */}

        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition 
                     transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <i className="fas fa-download mr-2"></i>Export Data
        </button>

        {/*
        <button
          onClick={onHotspots}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition 
                     transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <i className="fas fa-fire mr-2"></i>View Hotspots
        </button>
        */}

        {/*
        <button
          onClick={onPredictions}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition 
                     transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <i className="fas fa-crystal-ball mr-2"></i>Predictions
        </button>
        */}
      </div>
    </div>
  );
};

export default Filters;
