export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatLongDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const calculateMovingAverage = (data, window = 7) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    result.push(Math.round(avg));
  }
  return result;
};

export const calculateDailyValues = (cumulativeData) => {
  return cumulativeData.map((val, i) => {
    if (i === 0) return 0;
    const daily = val - cumulativeData[i - 1];
    return daily >= 0 ? daily : 0;
  });
};

export const calculateDailyAverage = (rawData) => {
  const values = Object.values(rawData);
  if (values.length < 2) return 0;
  
  const dailyValues = values.map((val, i) => 
    i === 0 ? 0 : Math.max(0, val - values[i-1])
  ).slice(1);
  
  return Math.round(dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length);
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

export const formatCompactNumber = (num) => {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
};