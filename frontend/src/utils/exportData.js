import { formatNumber } from './formatters';

export const exportData = async (data, country) => {
  const { stats, historical } = data;
  const timeline = country === 'global' ? historical : historical.timeline;
  
  // Prepare CSV data
  const headers = [
    'Date',
    'Total Cases',
    'New Cases',
    'Total Deaths',
    'New Deaths',
    'Total Recovered',
    'New Recovered',
    'Active Cases'
  ];
  
  const rows = [headers];
  
  if (timeline && timeline.cases) {
    const dates = Object.keys(timeline.cases);
    const cases = Object.values(timeline.cases);
    const deaths = Object.values(timeline.deaths || {});
    const recovered = Object.values(timeline.recovered || {});
    
    dates.forEach((date, i) => {
      const newCases = i === 0 ? 0 : cases[i] - cases[i-1];
      const newDeaths = i === 0 ? 0 : deaths[i] - deaths[i-1];
      const newRecovered = i === 0 ? 0 : recovered[i] - recovered[i-1];
      const activeCases = cases[i] - deaths[i] - recovered[i];
      
      rows.push([
        date,
        cases[i] || 0,
        newCases > 0 ? newCases : 0,
        deaths[i] || 0,
        newDeaths > 0 ? newDeaths : 0,
        recovered[i] || 0,
        newRecovered > 0 ? newRecovered : 0,
        activeCases > 0 ? activeCases : 0
      ]);
    });
  }
  
  // Add summary section
  rows.push([]);
  rows.push(['Summary']);
  rows.push(['Country', country]);
  rows.push(['Total Cases', formatNumber(stats.cases)]);
  rows.push(['Total Deaths', formatNumber(stats.deaths)]);
  rows.push(['Total Recovered', formatNumber(stats.recovered)]);
  rows.push(['Active Cases', formatNumber(stats.active)]);
  rows.push(['Critical Cases', formatNumber(stats.critical)]);
  rows.push(['Tests', formatNumber(stats.tests)]);
  
  if (stats.cases && stats.recovered) {
    rows.push(['Recovery Rate', `${((stats.recovered / stats.cases) * 100).toFixed(2)}%`]);
  }
  if (stats.cases && stats.deaths) {
    rows.push(['Mortality Rate', `${((stats.deaths / stats.cases) * 100).toFixed(2)}%`]);
  }
  
  // Convert to CSV
  const csv = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
  
  // Create blob and download
    // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `covid-data-${country}-${new Date().toISOString().split('T')[0]}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTableData = (countries, filters = {}) => {
  const headers = [
    'Country',
    'Continent',
    'Total Cases',
    'New Cases',
    'Total Deaths',
    'New Deaths',
    'Recovered',
    'Active',
    'Critical',
    'Cases per Million',
    'Deaths per Million',
    'Tests',
    'Tests per Million',
    'Population'
  ];
  
  const rows = [headers];
  
  countries.forEach(country => {
    rows.push([
      country.country,
      country.continent || 'N/A',
      country.cases || 0,
      country.todayCases || 0,
      country.deaths || 0,
      country.todayDeaths || 0,
      country.recovered || 0,
      country.active || 0,
      country.critical || 0,
      country.casesPerOneMillion || 0,
      country.deathsPerOneMillion || 0,
      country.tests || 0,
      country.testsPerOneMillion || 0,
      country.population || 0
    ]);
  });
  
  const csv = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `covid-countries-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
  