import { formatDate, formatNumber } from './formatters';

export const processHistoricalData = (historical, country) => {
  const timeline = country === 'global' ? historical : historical.timeline;
  
  if (!timeline || !timeline.cases) {
    return null;
  }
  
  const dates = Object.keys(timeline.cases || {});
  const cases = Object.values(timeline.cases || {});
  const deaths = Object.values(timeline.deaths || {});
  let recovered = Object.values(timeline.recovered || {});
  
  // If no recovery data, estimate it
  if (recovered.length === 0 || recovered.every(v => v === 0)) {
    recovered = cases.map((c, i) => Math.max(0, c - (deaths[i] || 0)));
  }
  
  // Calculate daily values
  const dailyCases = calculateDailyFromCumulative(cases);
  const dailyDeaths = calculateDailyFromCumulative(deaths);
  const dailyRecovered = calculateDailyFromCumulative(recovered);
  
  return {
    dates,
    cases,
    deaths,
    recovered,
    dailyCases,
    dailyDeaths,
    dailyRecovered,
    totalCases: cases,
    totalDeaths: deaths,
    totalRecovered: recovered
  };
};

export const calculateDailyFromCumulative = (cumulativeData) => {
  return cumulativeData.map((val, i) => {
    if (i === 0) return 0;
    const daily = val - cumulativeData[i - 1];
    return daily >= 0 ? daily : 0;
  });
};

export const prepareChartData = (labels, datasets, options = {}) => {
  return {
    labels: labels.map(formatDate),
    datasets: datasets.map(dataset => ({
      ...dataset,
      borderWidth: dataset.borderWidth || 2,
      pointRadius: dataset.pointRadius || 0,
      tension: dataset.tension || 0.4,
      ...options
    }))
  };
};

export const getChartColorScheme = (type) => {
  const schemes = {
    primary: {
      border: '#3B82F6',
      background: 'rgba(59, 130, 246, 0.1)'
    },
    danger: {
      border: '#EF4444',
      background: 'rgba(239, 68, 68, 0.1)'
    },
    success: {
      border: '#10B981',
      background: 'rgba(16, 185, 129, 0.1)'
    },
    warning: {
      border: '#F59E0B',
      background: 'rgba(245, 158, 11, 0.1)'
    },
    purple: {
      border: '#8B5CF6',
      background: 'rgba(139, 92, 246, 0.1)'
    }
  };
  
  return schemes[type] || schemes.primary;
};

export const generateChartGradient = (ctx, height, colorStart, colorEnd) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

export const calculateTrendLine = (data) => {
  if (!data || data.length < 2) return [];
  
  const n = data.length;
  const sumX = data.reduce((sum, _, i) => sum + i, 0);
  const sumY = data.reduce((sum, val) => sum + val, 0);
  const sumXY = data.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return data.map((_, i) => slope * i + intercept);
};

export const getMetricLabel = (metric) => {
  const labels = {
    cases: 'Total Cases',
    todayCases: 'New Cases',
    deaths: 'Total Deaths',
    todayDeaths: 'New Deaths',
    recovered: 'Recovered',
    active: 'Active Cases',
    critical: 'Critical Cases',
    casesPerOneMillion: 'Cases per Million',
    deathsPerOneMillion: 'Deaths per Million',
    tests: 'Total Tests',
    testsPerOneMillion: 'Tests per Million'
  };
  
  return labels[metric] || metric;
};

export const createTooltipCallback = (formatValue = true) => {
  return {
    label: (context) => {
      let label = context.dataset.label || '';
      if (label) {
        label += ': ';
      }
      const value = context.parsed.y;
      label += formatValue ? formatNumber(value) : value;
      return label;
    }
  };
};

export const createAxisConfig = (options = {}) => {
  return {
    grid: {
      display: options.showGrid !== false,
      color: 'rgba(156, 163, 175, 0.1)',
      ...options.grid
    },
    ticks: {
      font: {
        family: 'Inter',
        size: 11
      },
      ...options.ticks
    }
  };
};

export const detectChartType = (data) => {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return 'line';
  }
  
  const dataset = data.datasets[0];
  const dataPoints = dataset.data.length;
  
  // Use bar chart for small datasets
  if (dataPoints < 15) {
    return 'bar';
  }
  
  // Use line chart for trends
  return 'line';
};

export const smoothData = (data, factor = 0.5) => {
  if (!data || data.length < 3) return data;
  
  const smoothed = [data[0]];
  
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];
    
    const smoothValue = curr * (1 - factor) + (prev + next) * (factor / 2);
    smoothed.push(smoothValue);
  }
  
  smoothed.push(data[data.length - 1]);
  return smoothed;
};