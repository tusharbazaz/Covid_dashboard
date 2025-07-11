import React from 'react';
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
  const handleExport = async () => {
    try {
      await onExport();
      showToast('Data exported successfully', 'success');
    } catch {
      showToast('Failed to export data', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 fade-in">
      <h2 className="text-lg font-semibold mb-4">Filters & Controls</h2>

      {/* flex container: stacks on mobile, row on md+ */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        
        {/* select group */}
        <div className="flex flex-col sm:flex-row flex-1 gap-4">
          {/* Country */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Country/Region</label>
            <select
              value={currentCountry}
              onChange={e => onCountryChange(e.target.value)}
              className="w-full p-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="global">🌍 Global</option>
              {countries.map(c => (
                <option key={c.country} value={c.country}>
                  {c.country} ({formatNumber(c.cases)} cases)
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="flex-1">
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
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Continent</label>
            <select
              value={continent}
              onChange={e => setContinent(e.target.value)}
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
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
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

        {/* Export button on the right */}
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600
                     transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <i className="fas fa-download mr-2"></i>Export Data
        </button>
      </div>
    </div>
  );
};

export default Filters;
