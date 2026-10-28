const fs = require('fs');

const files = [
  'node_modules/sonner/dist/index.mjs',
  'node_modules/sonner/dist/index.js',
  'node_modules/sonner/dist/styles.css',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const countBefore = (content.match(/height \.?4(?:00)?m?s,?\s*/g) || []).length;
    content = content.replace(/height \.?4(?:00)?m?s,?\s*/g, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}: removed ${countBefore} occurrences`);
  }
});

