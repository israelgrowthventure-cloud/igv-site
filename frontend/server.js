const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'build')));

// Route admin - servir admin.html directement
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Pour toutes les autres routes, servir index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
