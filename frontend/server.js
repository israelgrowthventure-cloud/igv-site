const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 IGV Frontend Server Starting...');
console.log('📂 Serving from:', path.join(__dirname, 'build'));
console.log('🌐 Port:', PORT);

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, 'build')));

// Toutes les routes renvoient index.html (SPA routing)
app.get('*', (req, res) => {
  console.log('📄 Request:', req.url);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});
