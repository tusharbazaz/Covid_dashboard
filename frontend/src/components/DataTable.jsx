import { useState, useEffect, useMemo } from 'react';
import { formatNumber } from '../utils/formatters';
import SkeletonLoader from './SkeletonLoader';

const DataTable = ({ countries, onViewDetails, showToast }) => {
  const [sortColumn, setSortColumn] = useState('cases');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Get unique continents
  const continents = useMemo(() => {
    const uniqueContinents = [...new Set(countries.map(c => c.continent))].filter(Boolean);
    return uniqueContinents.sort();
  }, [countries]);

  // Filter and sort countries
  const processedCountries = useMemo(() => {
    let filtered = [...countries];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by continent
    if (selectedContinent) {
      filtered = filtered.filter(country => country.continent === selectedContinent);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortColumn] || 0;
      const bVal = b[sortColumn] || 0;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [countries, searchTerm, selectedContinent, sortColumn, sortOrder]);

  // Pagination
  const paginatedCountries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCountries.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCountries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedCountries.length / itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedContinent]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  const handleAddToComparison = (country) => {
    showToast(`${country.country} added to comparison`, 'success');
    // Add actual comparison logic here
  };

  if (!countries || countries.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Detailed Data</h3>
        <SkeletonLoader type="table-row" count={10} />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
        <h3 className="font-semibold text-lg">Detailed Data</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={selectedContinent}
            onChange={(e) => setSelectedContinent(e.target.value)}
            className="p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Continents</option>
            {continents.map(continent => (
              <option key={continent} value={continent}>{continent}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search countries..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:border-gray-600 flex-1 sm:flex-initial"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead className="border-b dark:border-gray-700">
            <tr>
              <SortableHeader 
                column="country" 
                label="Country" 
                currentSort={sortColumn} 
                sortOrder={sortOrder} 
                onSort={handleSort}
              />
              <SortableHeader 
                column="cases" 
                label="Total Cases" 
                currentSort={sortColumn} 
                sortOrder={sortOrder} 
                onSort={handleSort}
                align="right"
              />
              <SortableHeader 
                column="deaths" 
                label="Deaths" 
                currentSort={sortColumn} 
                sortOrder={sortOrder} 
                onSort={handleSort}
                align="right"
              />
              <SortableHeader 
                column="recovered" 
                label="Recovered" 
                currentSort={sortColumn} 
                sortOrder={sortOrder} 
                onSort={handleSort}
                align="right"
              />
              <SortableHeader 
                column="active" 
                label="Active" 
                currentSort={sortColumn} 
                sortOrder={sortOrder} 
                onSort={handleSort}
                align="right"
              />
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCountries.map((country, index) => (
              <TableRow 
                key={country.country}
                country={country}
                index={index}
                onViewDetails={onViewDetails}
                onAddToComparison={handleAddToComparison}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {paginatedCountries.length} of {processedCountries.length} countries
      </div>
    </div>
  );
};

// Sortable Header Component
const SortableHeader = ({ column, label, currentSort, sortOrder, onSort, align = 'left' }) => {
  const isActive = currentSort === column;
  
  return (
    <th 
      className={`text-${align} p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
      onClick={() => onSort(column)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <span className="ml-1">
          {isActive ? (
            <i className={`fas fa-sort-${sortOrder === 'desc' ? 'down' : 'up'} text-xs`}></i>
          ) : (
            <i className="fas fa-sort text-xs text-gray-400"></i>
          )}
        </span>
      </div>
    </th>
  );
};

// Table Row Component
const TableRow = ({ country, index, onViewDetails, onAddToComparison }) => {
  return (
    <tr 
      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      style={{ animationDelay: `${index * 0.02}s` }}
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
      <td className="text-right p-3">
        <div>
          <div className="font-medium">{formatNumber(country.cases)}</div>
          {country.todayCases > 0 && (
            <div className="text-xs text-red-500">+{formatNumber(country.todayCases)}</div>
          )}
        </div>
      </td>
      <td className="text-right p-3">
        <div>
          <div className="font-medium">{formatNumber(country.deaths)}</div>
          {country.todayDeaths > 0 && (
            <div className="text-xs text-red-500">+{formatNumber(country.todayDeaths)}</div>
          )}
        </div>
      </td>
      <td className="text-right p-3 text-green-600 dark:text-green-400">
        {formatNumber(country.recovered)}
      </td>
      <td className="text-right p-3 text-yellow-600 dark:text-yellow-400">
        {formatNumber(country.active)}
      </td>
      <td className="text-center p-3">
        <button 
          onClick={() => onViewDetails(country.country)}
          className="text-blue-500 hover:text-blue-700 mr-2 p-1 rounded transition"
          title="View details"
        >
          <i className="fas fa-chart-line"></i>
        </button>
        <button 
          onClick={() => onAddToComparison(country)}
          className="text-green-500 hover:text-green-700 p-1 rounded transition"
          title="Add to comparison"
        >
          <i className="fas fa-plus"></i>
        </button>
      </td>
    </tr>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-1 rounded transition ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : page === '...'
              ? 'cursor-default'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default DataTable;
