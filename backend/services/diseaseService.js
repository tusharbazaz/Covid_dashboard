const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

const BASE = 'https://disease.sh/v3/covid-19';

async function fetchWithCache(key, url) {
  const cached = cache.get(key);
  if (cached) return cached;
  
  try {
    const { data } = await axios.get(url);
    cache.set(key, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    throw error;
  }
}

module.exports = {
  getGlobal: () => fetchWithCache('global', `${BASE}/all`),
  
  getAllCountries: () => fetchWithCache('countries', `${BASE}/countries?sort=cases`),
  
  getCountry: country => {
    const key = `country_${country}`;
    const url = `${BASE}/countries/${encodeURIComponent(country)}`;
    return fetchWithCache(key, url);
  },
  
  getHistorical: (country, lastdays = 'all') => {
    const key = `hist_${country}_${lastdays}`;
    const url = `${BASE}/historical/${encodeURIComponent(country)}?lastdays=${lastdays}`;
    return fetchWithCache(key, url);
  },
  
  getHistoricalGlobal: lastdays => {
    const key = `hist_global_${lastdays}`;
    const url = `${BASE}/historical/all?lastdays=${lastdays}`;
    return fetchWithCache(key, url);
  },
  
  getVaccine: (country, lastdays = 'all') => {
    const key = `vaccine_${country}_${lastdays}`;
    const url = `${BASE}/vaccine/coverage/countries/${encodeURIComponent(country)}?lastdays=${lastdays}&fullData=true`;
    return fetchWithCache(key, url);
  },
  
  getVaccineGlobal: lastdays => {
    const key = `vaccine_global_${lastdays}`;
    const url = `${BASE}/vaccine/coverage?lastdays=${lastdays}&fullData=true`;
    return fetchWithCache(key, url);
  }
};