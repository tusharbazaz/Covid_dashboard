const service = require('../services/diseaseService');
const analytics = require('../services/analyticsService');


//so these are Endpoints!
//we using exports here so that we can use it / this function in other files
exports.getGlobalStats = async (req, res, next) => {
  try { 
    const data = await service.getGlobal();
    const analysis = analytics.calculateGlobalTrends(data);
    res.json({ ...data, analysis }); 
  }
  catch (e) { 
    console.error('Error in getGlobalStats:', e);
    next(e); 
  }
};

exports.getAllCountries = async (req, res, next) => {
  try { 
    const { sort = 'cases', order = 'desc', limit, continent } = req.query;
    let countries = await service.getAllCountries();
    
    // Filter by continent
    if (continent && continent !== 'all') {
      countries = countries.filter(c => c.continent === continent);
    }
    
    // Sort
    if (sort) {
      countries.sort((a, b) => {
        const aVal = a[sort] || 0;
        const bVal = b[sort] || 0;
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }
    
    // Limit
    if (limit && !isNaN(parseInt(limit))) {
      countries = countries.slice(0, parseInt(limit));
    }
    
    res.json(countries); 
  }
  catch (e) { 
    console.error('Error in getAllCountries:', e);
    next(e); 
  }
};

exports.getCountryStats = async (req, res, next) => {
  try {
    const country = req.params.country;
    if (!country) {
      return res.status(400).json({ error: 'Country parameter is required' });
    }
    
    const data = await service.getCountry(country);
    
    // Get historical data for analysis
    try {
      const historical = await service.getHistorical(country, 30);
      const analysis = analytics.analyzeCountryData(data, historical);
      res.json({ ...data, analysis });
    } catch (histError) {
      console.warn('Historical data not available for', country);
      res.json(data);
    }
  } catch (e) { 
    console.error('Error in getCountryStats:', e);
    next(e); 
  }
};

exports.getHistorical = async (req, res, next) => {
  try {
    const country = req.params.country;
    const days = req.query.lastdays || 'all';
    
    if (!country) {
      return res.status(400).json({ error: 'Country parameter is required' });
    }
    
    const data = await service.getHistorical(country, days);
    const analysis = analytics.calculateTrends(data);
    res.json({ ...data, analysis });
  } catch (e) { 
    console.error('Error in getHistorical:', e);
    next(e); 
  }
};

exports.getHistoricalGlobal = async (req, res, next) => {
  try {
    const days = req.query.lastdays || 'all';
    const data = await service.getHistoricalGlobal(days);
    const analysis = analytics.calculateTrends({ timeline: data });
    res.json({ ...data, analysis });
  } catch (e) { 
    console.error('Error in getHistoricalGlobal:', e);
    next(e); 
  }
};

exports.getVaccine = async (req, res, next) => {
  try {
    const country = req.params.country;
    const days = req.query.lastdays || 'all';
    
    if (!country) {
      return res.status(400).json({ error: 'Country parameter is required' });
    }
    
    const data = await service.getVaccine(country, days);
    const analysis = analytics.analyzeVaccineData(data);
    res.json({ ...data, analysis });
  } catch (e) { 
    console.error('Error in getVaccine:', e);
    // Don't fail completely if vaccine data is not available
    res.json({ timeline: [], analysis: null });
  }
};

//new 
// analytical endpoints
exports.getComparison = async (req, res, next) => {
  try {
    const countriesParam = req.query.countries;
    if (!countriesParam) {
      return res.status(400).json({ error: 'Countries parameter is required' });
    }
    
    const countries = countriesParam.split(',').filter(c => c.trim());
    const metric = req.query.metric || 'cases';
    
    if (countries.length < 2) {
      return res.status(400).json({ error: 'At least 2 countries are required for comparison' });
    }
    
    const comparison = await analytics.compareCountries(countries, metric);
    res.json(comparison);
  } catch (e) { 
    console.error('Error in getComparison:', e);
    next(e); 
  }
};

exports.getContinentStats = async (req, res, next) => {
  try {
    const data = await service.getAllCountries();
    const continentStats = analytics.aggregateByContinents(data);
    res.json(continentStats);
  } catch (e) { 
    console.error('Error in getContinentStats:', e);
    next(e); 
  }
};

exports.getPredictions = async (req, res, next) => {
  try {
    const country = req.params.country;
    if (!country) {
      return res.status(400).json({ error: 'Country parameter is required' });
    }
    
    const days = parseInt(req.query.days) || 7;
    if (days < 1 || days > 30) {
      return res.status(400).json({ error: 'Days must be between 1 and 30' });
    }
    
    const historical = await service.getHistorical(country, 30);
    const predictions = analytics.predictTrends(historical, days);
    res.json(predictions);
  } catch (e) { 
    console.error('Error in getPredictions:', e);
    next(e); 
  }
};

exports.getHotspots = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 1000;
    const countries = await service.getAllCountries();
    const hotspots = analytics.identifyHotspots(countries, threshold);
    res.json(hotspots);
  } catch (e) { 
    console.error('Error in getHotspots:', e);
    next(e); 
  }
};
