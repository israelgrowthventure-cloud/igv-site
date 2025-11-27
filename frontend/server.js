const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

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

app.use(express.static(buildPath, { 
  fallthrough: true, // Continue to next handler if file not found
  index: false // Don't auto-serve index.html from static middleware
}));

// Pour toutes les routes, servir index.html (SPA React Router gère tout)
app.get('*', (req, res) => {
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error serving index.html for ${req.url}:`, err);
      res.status(500).send('Internal Server Error');
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ IGV Site Server running on port ${port}`);
  console.log(`📂 Serving from: ${buildPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
