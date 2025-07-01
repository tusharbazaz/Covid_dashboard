import axios from 'axios';
import { performanceMonitor } from '../utils/performanceMonitor';

// Update this to point to your deployed backend
const API_BASE = process.env.REACT_APP_API_URL || 'https://covid-dashboard-lypt.onrender.com/api';
const DISEASE_SH_API = 'https://disease.sh/v3/covid-19';

// Create axios instance with default config
const axiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    performanceMonitor.mark(`api-${config.url}-start`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    performanceMonitor.mark(`api-${response.config.url}-end`);
    performanceMonitor.measure(
      `api-${response.config.url}`,
      `api-${response.config.url}-start`,
      `api-${response.config.url}-end`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Retry logic
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.log(`Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const api = {
  // Your backend APIs
  getCountries: async () => {
    const response = await retryRequest(() => 
      axiosInstance.get(`${API_BASE}/countries`)
    );
    return response.data;
  },

  getStats: async (country = 'global') => {
    const url = country === 'global' 
      ? `${API_BASE}/global`
      : `${API_BASE}/countries/${encodeURIComponent(country)}`;
    const response = await retryRequest(() => axiosInstance.get(url));
    return response.data;
  },

  getHistorical: async (country = 'global', days = '90') => {
    const url = country === 'global'
      ? `${API_BASE}/historical/global?lastdays=${days}`
      : `${API_BASE}/historical/${encodeURIComponent(country)}?lastdays=${days}`;
    const response = await retryRequest(() => axiosInstance.get(url));
    return response.data;
  },

  // External API calls
  getVaccineData: async (country, days) => {
    try {
      const response = await axios.get(
        `${DISEASE_SH_API}/vaccine/coverage/countries/${encodeURIComponent(country)}?lastdays=${days}&fullData=false`
      );
      return response.data;
    } catch (error) {
      console.error('Vaccine data error:', error);
      return null;
    }
  },

  getContinentData: async () => {
    const response = await axios.get(`${DISEASE_SH_API}/continents`);
    return response.data;
  },

  // Feature APIs
  getHotspots: async (threshold = 1000) => {
    const response = await axiosInstance.get(`${API_BASE}/hotspots?threshold=${threshold}`);
    return response.data;
  },

  getPredictions: async (country, days = 7) => {
    const response = await axiosInstance.get(
      `${API_BASE}/predictions/${encodeURIComponent(country)}?days=${days}`
    );
    return response.data;
  },

  compareCountries: async (countries) => {
    const response = await axiosInstance.get(
      `${API_BASE}/comparison?countries=${countries.join(',')}&metric=cases`
    );
    return response.data;
  },

  // Batch requests
  getBatchData: async (requests) => {
    const promises = requests.map(request => {
      switch (request.type) {
        case 'stats':
          return api.getStats(request.country);
        case 'historical':
          return api.getHistorical(request.country, request.days);
        case 'vaccine':
          return api.getVaccineData(request.country, request.days);
        default:
          return Promise.resolve(null);
      }
    });

    const results = await Promise.allSettled(promises);
    return results.map((result, index) => ({
      ...requests[index],
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  },

  // Cache management
  clearCache: () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }
};

// Export individual functions for direct use
export const fetchWithCache = async (url, cacheTime = 5 * 60 * 1000) => {
  const cacheKey = `api-cache-${url}`;
  
  try {
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTime) {
        console.log('📦 Using cached data for:', url);
        return data;
      }
    }
  } catch (error) {
    console.warn('Cache error:', error);
    // Continue without cache
  }
  
  const response = await axios.get(url);
  const data = response.data;
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to cache data:', error);
    // Continue without caching
  }
  
  return data;
};
