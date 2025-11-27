const express = require('express');
const path = require('path');
const app = express();

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques du build
const buildPath = path.join(__dirname, 'build');
console.log(`Static files served from: ${buildPath}`);
app.use(express.static(buildPath, { 
  fallthrough: true, // Continue to next handler if file not found
  index: false // Don't auto-serve index.html from static middleware
}));

// Pour toutes les routes, servir index.html (SPA React Router gère tout)
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log(`Serving index.html for route: ${req.url}`);
  res.sendFile(indexPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ IGV Site Server running on port ${port}`);
  console.log(`📂 Serving from: ${buildPath}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
