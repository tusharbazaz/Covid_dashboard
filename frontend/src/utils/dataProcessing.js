export const calculateTrendDirection = (data) => {
  if (!data || data.length < 2) return 'stable';
  
  const recent = data.slice(-7);
  const older = data.slice(-14, -7);
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (changePercent > 10) return 'increasing';
  if (changePercent < -10) return 'decreasing';
  return 'stable';
};

export const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const identifyHotspots = (countries, threshold = 1000) => {
  return countries
    .filter(country => country.todayCases >= threshold)
    .map(country => {
      const historicalData = country.timeline?.cases 
        ? Object.values(country.timeline.cases) 
        : [];
      
      const trend = calculateTrendDirection(historicalData);
      const growthRate = calculateGrowthRate(country.cases, country.cases - country.todayCases);
      
      return {
        ...country,
        trend,
        growthRate,
        activeCases: country.active,
        criticalCases: country.critical
      };
    })
    .sort((a, b) => b.todayCases - a.todayCases);
};

export const predictFutureTrend = (data, days = 7) => {
  if (!data || data.length < 14) {
    return { predictions: [], confidence: 0 };
  }

  // Simple linear regression
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = data.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const ssTotal = data.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = data.reduce((sum, y, i) => 
    sum + Math.pow(y - (slope * i + intercept), 2), 0
  );
  const rSquared = 1 - (ssResidual / ssTotal);
  
  // Generate predictions
  const predictions = [];
  for (let i = 1; i <= days; i++) {
    const predictedValue = slope * (n + i - 1) + intercept;
    predictions.push({
      day: i,
      value: Math.max(0, Math.round(predictedValue))
    });
  }
  
  return {
    predictions,
    confidence: Math.max(0, Math.min(100, rSquared * 100)),
    slope,
    intercept
  };
};

export const aggregateByContinent = (countries) => {
  const continents = {};
  
  countries.forEach(country => {
    const continent = country.continent || 'Unknown';
    if (!continents[continent]) {
      continents[continent] = {
        continent,
        cases: 0,
        deaths: 0,
        recovered: 0,
        active: 0,
        critical: 0,
        countries: []
      };
    }
    
    continents[continent].cases += country.cases || 0;
    continents[continent].deaths += country.deaths || 0;
    continents[continent].recovered += country.recovered || 0;
    continents[continent].active += country.active || 0;
    continents[continent].critical += country.critical || 0;
    continents[continent].countries.push(country.country);
  });
  
  return Object.values(continents);
};

export const validateData = (data) => {
  if (!data) return false;
  
  const requiredFields = ['cases', 'deaths', 'recovered'];
  return requiredFields.every(field => 
    data.hasOwnProperty(field) && 
    typeof data[field] === 'number' && 
    data[field] >= 0
  );
};

export const calculateCorrelation = (x, y) => {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  
  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};