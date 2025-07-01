import { formatNumber } from '../utils/formatters';

const AnalysisSummary = ({ analysis }) => {
  if (!analysis) return null;

  const metrics = [
    { 
      label: 'Recovery Rate', 
      value: `${analysis.recoveryRate}%`, 
      icon: 'fa-percentage', 
      color: 'text-green-500' 
    },
    { 
      label: 'Mortality Rate', 
      value: `${analysis.mortalityRate}%`, 
      icon: 'fa-skull', 
      color: 'text-red-500' 
    },
    { 
      label: 'Cases per Million', 
      value: formatNumber(analysis.casesPerMillion), 
      icon: 'fa-users', 
      color: 'text-blue-500' 
    },
    { 
      label: 'Deaths per Million', 
      value: formatNumber(analysis.deathsPerMillion), 
      icon: 'fa-chart-line', 
      color: 'text-purple-500' 
    },
    { 
      label: 'Tests per Million', 
      value: formatNumber(analysis.testsPerMillion), 
      icon: 'fa-vial', 
      color: 'text-indigo-500' 
    },
    { 
      label: 'Active Percentage', 
      value: `${analysis.activePercentage}%`, 
      icon: 'fa-bed', 
      color: 'text-yellow-500' 
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 fade-in">
      <h2 className="text-lg font-semibold mb-4">
        <i className="fas fa-chart-pie mr-2"></i>Analysis Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={metric.label}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg
                     hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <i className={`fas ${metric.icon} ${metric.color} text-xl`}></i>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
              <p className="font-semibold">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisSummary;