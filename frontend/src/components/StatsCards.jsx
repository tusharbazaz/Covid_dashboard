import { formatNumber } from '../utils/formatters';

const StatsCards = ({ stats }) => {
  if (!stats) {
    // Loading skeleton
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card loading h-32"></div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: 'Total Cases',
      value: stats.cases || 0,
      change: stats.todayCases || 0,
      icon: 'fa-virus',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Deaths',
      value: stats.deaths || 0,
      change: stats.todayDeaths || 0,
      icon: 'fa-skull-crossbones',
      gradient: 'from-red-500 to-red-600'
    },
    {
      label: 'Recovered',
      value: stats.recovered || 0,
      change: stats.todayRecovered || 0,
      icon: 'fa-heart',
      gradient: 'from-green-500 to-green-600'
    },
    {
      label: 'Active Cases',
      value: stats.active || 0,
      change: stats.critical || 0,
      icon: 'fa-procedures',
      gradient: 'from-yellow-500 to-yellow-600',
      sublabel: 'critical'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat, index) => (
        <div 
          key={stat.label}
          className={`stat-card bg-gradient-to-br ${stat.gradient} fade-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stat.value)}</p>
              {stat.change > 0 && (
                <p className="text-sm mt-2 opacity-90">
                  <i className="fas fa-arrow-up mr-1"></i>
                  +{formatNumber(stat.change)} {stat.sublabel || 'today'}
                </p>
              )}
            </div>
            <i className={`fas ${stat.icon} text-4xl opacity-20`}></i>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;