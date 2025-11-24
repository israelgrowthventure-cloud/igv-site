const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'build')));

// Route admin - servir admin.html directement
app.get('/admin', (req, res) => {
  const adminPath = path.join(__dirname, 'build', 'admin.html');
  res.sendFile(adminPath, (err) => {
    if (err) {
      console.error('Error sending admin.html:', err);
      res.status(404).send('Admin page not found');
    }
  });
});

// Pour toutes les autres routes, servir index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
