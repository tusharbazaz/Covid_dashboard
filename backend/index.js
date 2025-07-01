const path = require('path');
const express = require('express');
const cors = require('cors');
const covidRouter = require('./routes/covidRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
      /^https:\/\/.*\.vercel\.app$/, // All Vercel deployments
      /^https:\/\/.*\.netlify\.app$/, // Netlify deployments (just in case)
    ];
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json());

// Enhanced middleware (install these if you want them)
try {
  const compression = require('compression');
  app.use(compression());
} catch (e) {
  console.warn('Compression middleware not available');
}

try {
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
} catch (e) {
  console.warn('Helmet middleware not available');
}

// Rate limiting (install express-rate-limit if you want this)
try {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);
} catch (e) {
  console.warn('Rate limiting not available');
}

// Serve frontend files (only if you have a frontend folder)
try {
  app.use(express.static(path.join(__dirname, '../frontend')));
} catch (e) {
  console.warn('Frontend static files not available');
}

// API routes
app.use('/api', covidRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Root route for API-only backend
app.get('/', (req, res) => {
  res.json({
    message: 'COVID-19 Analytics API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      global: '/api/global',
      countries: '/api/countries',
      historical: '/api/historical/:country',
      vaccine: '/api/vaccine/:country'
    }
  });
});

// Serve index.html for any other routes (only if frontend exists)
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } catch (e) {
    res.status(404).json({ error: 'Frontend not available' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // API error response
  if (req.path.startsWith('/api/')) {
    res.status(err.status || 500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  } else {
    // For non-API routes, return JSON error since this is primarily an API server
    res.status(404).json({ error: 'Page not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 COVID-19 Analytics API ready at https://covid-dashboard-lypt.onrender.com`);
  console.log(`🔗 API Health check: https://covid-dashboard-lypt.onrender.com/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
