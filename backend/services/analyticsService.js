const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

function movingAverage(data, window = 7) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
    result.push(Math.round(avg));
  }
  return result;
}

function calculateGrowthRate(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(2);
}

function linearRegression(data) {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  data.forEach((y, x) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

module.exports = {
  calculateGlobalTrends(data) {
    if (!data) return {};
    
    return {
      casesPerMillion: data.population > 0 ? (data.cases / data.population * 1000000).toFixed(2) : 0,
      deathsPerMillion: data.population > 0 ? (data.deaths / data.population * 1000000).toFixed(2) : 0,
      recoveryRate: data.cases > 0 ? (data.recovered / data.cases * 100).toFixed(2) : 0,
      mortalityRate: data.cases > 0 ? (data.deaths / data.cases * 100).toFixed(2) : 0,
      activePercentage: data.cases > 0 ? (data.active / data.cases * 100).toFixed(2) : 0,
      testsPerMillion: data.testsPerOneMillion || 0,
      vaccineEfficiency: data.population && data.active ? 
        ((data.population - data.active) / data.population * 100).toFixed(2) : 0
    };
  },

analyzeCountryData(current, historical) {
  if (!current || !historical) return {};

  try {
    // 1) Grab your global‐style stats (casesPerMillion, recoveryRate, etc.)
    const basicMetrics = this.calculateGlobalTrends(current);

    // 2) If there’s no historical timeline, just return the basics
    const timeline = historical.timeline || historical;
    if (!timeline || !timeline.cases) {
      return basicMetrics;
    }

    // 3) Build daily arrays
    const cases  = Object.values(timeline.cases);
    const deaths = Object.values(timeline.deaths || []);

    const dailyCases  = cases.map((v,i)   => i===0 ? 0 : Math.max(0, v - cases[i-1]));
    const dailyDeaths = deaths.map((v,i) => i===0 ? 0 : Math.max(0, v - deaths[i-1]));

    const recentCases  = dailyCases.slice(-7);
    const recentDeaths = dailyDeaths.slice(-7);

    // 4) Return a merged object: first global stats, then your country-specific fields
    return {
      ...basicMetrics,

      averageDailyCases:  Math.round(recentCases.reduce((a,b) => a+b, 0)  / 7),
      averageDailyDeaths: Math.round(recentDeaths.reduce((a,b) => a+b, 0) / 7),

      trend: recentCases.length > 1 && recentCases[6] > recentCases[0]
        ? 'increasing'
        : 'decreasing',

      growthRate: cases.length > 7
        ? ((cases[cases.length-1] - cases[cases.length-8]) 
           / cases[cases.length-8] * 100).toFixed(2)
        : '0.00',

      peakDailyCases:  dailyCases.length  ? Math.max(...dailyCases)  : 0,
      peakDailyDeaths: dailyDeaths.length ? Math.max(...dailyDeaths) : 0,

      daysToDouble: (cases.length > 7 && cases[cases.length-8] > 0)
        ? Math.round(7 / Math.log2(cases[cases.length-1] / cases[cases.length-8]))
        : Infinity
    };
  } catch (error) {
    console.error('Error in analyzeCountryData:', error);
    return {};
  }
},


  calculateTrends(data) {
    if (!data) return {};
    
    try {
      const timeline = data.timeline || data;
      if (!timeline) return {};
      
      const cases = Object.values(timeline.cases || {});
      const deaths = Object.values(timeline.deaths || {});
      const recovered = Object.values(timeline.recovered || {});
      
      const dailyCases = cases.map((val, i) => i === 0 ? 0 : Math.max(0, val - cases[i-1]));
      const dailyDeaths = deaths.map((val, i) => i === 0 ? 0 : Math.max(0, val - deaths[i-1]));
      const dailyRecovered = recovered.map((val, i) => i === 0 ? 0 : Math.max(0, val - recovered[i-1]));
      
      return {
        movingAverages: {
          cases: movingAverage(dailyCases),
          deaths: movingAverage(dailyDeaths),
          recovered: movingAverage(dailyRecovered)
        },
        peaks: {
          cases: { value: Math.max(...dailyCases), index: dailyCases.indexOf(Math.max(...dailyCases)) },
          deaths: { value: Math.max(...dailyDeaths), index: dailyDeaths.indexOf(Math.max(...dailyDeaths)) }
        },
        totals: {
          cases: cases.length > 0 ? cases[cases.length - 1] : 0,
          deaths: deaths.length > 0 ? deaths[deaths.length - 1] : 0,
          recovered: recovered.length > 0 ? recovered[recovered.length - 1] : 0
        }
      };
    } catch (error) {
      console.error('Error in calculateTrends:', error);
      return {};
    }
  },

  analyzeVaccineData(data) {
    if (!data) return null;
    
    try {
      const timeline = data.timeline || [];
      if (timeline.length === 0) return null;
      
      const coverage = timeline.map(t => t.total || 0);
      const daily = coverage.map((val, i) => i === 0 ? 0 : Math.max(0, val - coverage[i-1]));
      
      return {
        totalVaccinated: coverage[coverage.length - 1],
        averageDailyVaccinations: Math.round(daily.slice(-7).reduce((a,b) => a+b, 0) / 7),
        vaccinationRate: movingAverage(daily, 7),
        daysToFullCoverage: daily.slice(-7).reduce((a,b) => a+b, 0) > 0 ?
          Math.round((data.population - coverage[coverage.length - 1]) / 
          (daily.slice(-7).reduce((a,b) => a+b, 0) / 7)) : Infinity
      };
    } catch (error) {
      console.error('Error in analyzeVaccineData:', error);
      return null;
    }
  },

  async compareCountries(countries, metric) {
    const key = `compare:${countries.join(',')}:${metric}`;
    if (cache.has(key)) return cache.get(key);

    const service = require('./diseaseService');
    const results = await Promise.all(
      countries.map(async code => {
        try {
          const data       = await service.getCountry(code);
          const historical = await service.getHistorical(code, 30);
          const globalMs   = this.calculateGlobalTrends(data);
          const analysis   = this.analyzeCountryData(data, historical);

          return {
            country: data.country,
            flag:    data.countryInfo?.flag || '',

            // the raw metric (e.g. cases, deaths, tests…)
            [metric]: data[metric] || 0,

            // all the “per-million” and rate stats:
            ...globalMs,

            // trend info from your country analyzer
            trend:      analysis.trend      || 'stable',
            growthRate: analysis.growthRate || '0.00'
          };
        } catch {
          return {
            country: code,
            flag:    '',
            [metric]: 0,

            casesPerMillion:  '0.00',
            deathsPerMillion: '0.00',
            recoveryRate:     '0.00',
            mortalityRate:    '0.00',
            activePercentage: '0.00',
            testsPerMillion:  0,

            trend:      'unknown',
            growthRate: '0.00'
          };
        }
      })
    );

    const sorted = results.sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
    cache.set(key, sorted);
    return sorted;
  },


  aggregateByContinents(countries) {
    try {
      const continents = {};
      
      countries.forEach(country => {
        const continent = country.continent || 'Unknown';
        if (!continents[continent]) {
          continents[continent] = {
            countries: 0,
            cases: 0,
            deaths: 0,
            recovered: 0,
            active: 0,
            population: 0,
            tests: 0
          };
        }
        
        continents[continent].countries++;
        continents[continent].cases += country.cases || 0;
        continents[continent].deaths += country.deaths || 0;
        continents[continent].recovered += country.recovered || 0;
        continents[continent].active += country.active || 0;
        continents[continent].population += country.population || 0;
        continents[continent].tests += country.tests || 0;
      });
      
      //calculate rates
      Object.keys(continents).forEach(continent => {
        const data = continents[continent];
        data.casesPerMillion = data.population > 0 ? 
          Math.round(data.cases / data.population * 1000000) : 0;
        data.deathsPerMillion = data.population > 0 ? 
          Math.round(data.deaths / data.population * 1000000) : 0;
        data.recoveryRate = data.cases > 0 ? 
          (data.recovered / data.cases * 100).toFixed(2) : 0;
        data.mortalityRate = data.cases > 0 ? 
          (data.deaths / data.cases * 100).toFixed(2) : 0;
      });
      
      return continents;
    } catch (error) {
      console.error('Error in aggregateByContinents:', error);
      return {};
    }
  },

  predictTrends(historical, days = 7) {
    const key = `predict:${days}`;
    if (cache.has(key)) return cache.get(key);

    const timeline = historical.timeline || historical;
    if (!timeline?.cases) {
      return { current: {}, predictions: [], confidence: {} };
    }

    const values = Object.values(timeline.cases);
    if (values.length < 2) {
      return { current: {}, predictions: [], confidence: {} };
    }

    // daily new cases
    const daily = values.map((v,i) => i===0 ? 0 : Math.max(0, v - values[i-1]));
    const recent = daily.slice(-14);
    const { slope, intercept } = linearRegression(recent);

    // build future predictions
    const predictions = [];
    for (let i = 1; i <= days; i++) {
      const x = recent.length + i - 1;
      const pred = Math.max(0, Math.round(slope * x + intercept));
      predictions.push({
        day:        i,
        cases:      pred,
        totalCases: values[values.length-1] + pred
      });
    }

    const conf = Math.max(0, Math.min(100, (1 - (daily.reduce((sum,y,i) =>
                sum + Math.pow(y - (slope*i+intercept), 2), 0) /
                daily.reduce((sum,y) => sum + Math.pow(y - (daily.reduce((a,b)=>a+b,0)/daily.length), 2),0))) * 100
            )).toFixed(2);

    const current = {
      totalCases: values[values.length-1],
      dailyCases: daily[daily.length-1]
    };

    const result = { current, predictions, confidence: { cases: conf } };
    cache.set(key, result);
    return result;
  },

identifyHotspots(countries, threshold = 1000) {
    const key = `hotspots:${threshold}`;
    if (cache.has(key)) return cache.get(key);

    const list = countries
      .filter(c => (c.todayCases || 0) > threshold)
      .map(c => {
        const globalMs = this.calculateGlobalTrends(c);
        // reuse your country analyzer; pass minimal timeline
        const analysis = this.analyzeCountryData(
          c,
          { timeline: { cases: c.timeline?.cases || {} } }
        );

        return {
          country:          c.country,
          continent:        c.continent || 'Unknown',
          todayCases:       c.todayCases  || 0,
          todayDeaths:      c.todayDeaths || 0,

          ...globalMs,

          trend:      analysis.trend      || 'stable',
          growthRate: analysis.growthRate || '0.00'
        };
      })
      .sort((a, b) => b.todayCases - a.todayCases);

    cache.set(key, list);
    return list;
  },

  async getTopCountriesData(limit = 10) {
    try {
      const service = require('./diseaseService');
      const countries = await service.getAllCountries();
      
      return countries
        .sort((a, b) => (b.cases || 0) - (a.cases || 0))
        .slice(0, limit)
        .map(country => ({
          country: country.country,
          flag: country.countryInfo?.flag || '',
          cases: country.cases || 0,
          active: country.active || 0,
          recovered: country.recovered || 0,
          deaths: country.deaths || 0,
          todayCases: country.todayCases || 0,
          todayDeaths: country.todayDeaths || 0,
          todayRecovered: country.todayRecovered || 0,
          critical: country.critical || 0,
          tests: country.tests || 0,
          population: country.population || 0,
          casesPerMillion: country.casesPerOneMillion || 0,
          deathsPerMillion: country.deathsPerOneMillion || 0
        }));
    } catch (error) {
      console.error('Error in getTopCountriesData:', error);
      return [];
    }
  }
};
