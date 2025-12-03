const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Version: 2025-12-02-17:50 - Fix SPA routing
console.log('🚀 Starting IGV Site Server...');
console.log('📅 Version: 2025-12-02-17:50');

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques du build
const buildPath = path.join(__dirname, 'build');
const indexPath = path.join(buildPath, 'index.html');

console.log('🔍 Checking build directory...');
console.log(`📂 Build path: ${buildPath}`);
console.log(`📄 Index path: ${indexPath}`);

if (!fs.existsSync(buildPath)) {
  console.error('❌ ERROR: Build directory not found!');
  console.error('   Please run "npm run build" before starting the server.');
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('❌ ERROR: index.html not found in build directory!');
  console.error('   Please run "npm run build" to generate the build.');
  process.exit(1);
}

console.log('✅ Build directory found');
console.log(`📁 Static files served from: ${buildPath}`);

// Health check endpoint avec version
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.1',
    timestamp: new Date().toISOString(),
    buildPath: buildPath,
    indexExists: fs.existsSync(indexPath)
  });
});

// Servir les fichiers statiques avec options strictes
app.use('/static', express.static(path.join(buildPath, 'static'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    } else if (filepath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Servir les autres fichiers statiques à la racine (favicon, robots.txt, etc.)
app.use(express.static(buildPath, {
  index: false, // Ne pas servir index.html automatiquement
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }
  }
}));

// Pour toutes les routes NON-statiques, servir index.html (SPA React Router)
// IMPORTANT: Ceci doit être le DERNIER handler
app.get('*', (req, res) => {
  console.log(`🔄 SPA Fallback - Serving index.html for: ${req.url}`);
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error serving index.html for ${req.url}:`, err);
      res.status(500).send('Internal Server Error: Could not load application');
    } else {
      console.log(`✅ Successfully served index.html for: ${req.url}`);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ IGV Site Server running on port ${port}`);
  console.log(`📂 Serving from: ${buildPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
