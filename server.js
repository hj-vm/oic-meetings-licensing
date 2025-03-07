// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const morgan = require('morgan');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = 'http://localhost:1337';

// Middleware
app.use(morgan('combined')); // Logging
app.use(compression()); // Compression

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Starting Strapi - different approach in production vs development
async function setupServer() {
  let strapiInstance;

  // In development, we'll start Strapi programmatically
  if (!isProduction) {
    try {
      const strapiPath = path.join(__dirname, 'backend', 'node_modules', '@strapi', 'strapi');
      const strapi = require(strapiPath);
      
      strapiInstance = await strapi({
        directory: path.join(__dirname, 'backend'),
        autoReload: true
      }).load();
      
      await strapiInstance.start();
      console.log('Strapi started in development mode');
    } catch (error) {
      console.error('Error starting Strapi in development mode:', error);
      process.exit(1);
    }
  } else {
    // In production, we assume Strapi is started as part of the start command
    // This avoids memory issues with running both in the same process
    console.log('Running in production mode - Strapi will be started separately');
  }

  // Proxy for Strapi API
  app.use(
    '/api',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Proxy for Strapi admin panel
  app.use(
    '/admin',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Proxy for Strapi uploads
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Serve frontend static files
  const frontendPath = path.join(__dirname, 'frontend', isProduction ? 'dist' : 'public');
  app.use(express.static(frontendPath));

  // For frontend routes in development, proxy to the dev server
  if (!isProduction) {
    app.use(
      '/',
      createProxyMiddleware({
        target: 'http://localhost:5173', // Default Vite dev server
        changeOrigin: true,
        ws: true,
        filter: (pathname) => {
          return !pathname.startsWith('/api') && 
                 !pathname.startsWith('/admin') && 
                 !pathname.startsWith('/uploads');
        }
      })
    );
  } else {
    // In production, serve the frontend SPA for all non-API routes
    app.get('*', (req, res, next) => {
      // Exclude known API and admin paths
      if (req.path.startsWith('/api') || 
          req.path.startsWith('/admin') || 
          req.path.startsWith('/uploads')) {
        return next();
      }
      
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Strapi Admin accessible at http://localho
cat > server.js << 'EOF'
// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const morgan = require('morgan');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const STRAPI_URL = 'http://localhost:1337';

// Middleware
app.use(morgan('combined')); // Logging
app.use(compression()); // Compression

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Starting Strapi - different approach in production vs development
async function setupServer() {
  let strapiInstance;

  // In development, we'll start Strapi programmatically
  if (!isProduction) {
    try {
      const strapiPath = path.join(__dirname, 'backend', 'node_modules', '@strapi', 'strapi');
      const strapi = require(strapiPath);
      
      strapiInstance = await strapi({
        directory: path.join(__dirname, 'backend'),
        autoReload: true
      }).load();
      
      await strapiInstance.start();
      console.log('Strapi started in development mode');
    } catch (error) {
      console.error('Error starting Strapi in development mode:', error);
      process.exit(1);
    }
  } else {
    // In production, we assume Strapi is started as part of the start command
    // This avoids memory issues with running both in the same process
    console.log('Running in production mode - Strapi will be started separately');
  }

  // Proxy for Strapi API
  app.use(
    '/api',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Proxy for Strapi admin panel
  app.use(
    '/admin',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Proxy for Strapi uploads
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: STRAPI_URL,
      changeOrigin: true
    })
  );

  // Serve frontend static files
  const frontendPath = path.join(__dirname, 'frontend', isProduction ? 'dist' : 'public');
  app.use(express.static(frontendPath));

  // For frontend routes in development, proxy to the dev server
  if (!isProduction) {
    app.use(
      '/',
      createProxyMiddleware({
        target: 'http://localhost:5173', // Default Vite dev server
        changeOrigin: true,
        ws: true,
        filter: (pathname) => {
          return !pathname.startsWith('/api') && 
                 !pathname.startsWith('/admin') && 
                 !pathname.startsWith('/uploads');
        }
      })
    );
  } else {
    // In production, serve the frontend SPA for all non-API routes
    app.get('*', (req, res, next) => {
      // Exclude known API and admin paths
      if (req.path.startsWith('/api') || 
          req.path.startsWith('/admin') || 
          req.path.startsWith('/uploads')) {
        return next();
      }
      
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Strapi Admin accessible at http://localhost:${PORT}/admin`);
  });
}

// Start the server
setupServer().catch(err => {
  console.error('Failed to start the server:', err);
  process.exit(1);
});
