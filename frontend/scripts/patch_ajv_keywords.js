const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'ajv-keywords', 'dist', 'index.js');

try {
  let content = fs.readFileSync(target, 'utf8');
  const needle = 'throw new Error("Unknown keyword " + keyword);';
  if (content.includes(needle)) {
    content = content.replace(needle, 'return () => ajv => ajv; // patched to ignore unknown keywords');
    fs.writeFileSync(target, content, 'utf8');
    console.log('[patch] ajv-keywords patched to ignore unknown keywords');
  } else {
    console.log('[patch] ajv-keywords already patched');
  }
} catch (err) {
  console.warn('[patch] ajv-keywords patch failed:', err.message);
}
