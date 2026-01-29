const fs = require('fs');
const path = process.argv[2] || 'src/locales/ro.json';
const s = fs.readFileSync(path, 'utf8');
try {
  JSON.parse(s);
  console.log(path + ': OK');
} catch (e) {
  console.error(path + ':', e.message);
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const i = +m[1];
    const start = Math.max(0, i - 140);
    const end = Math.min(s.length, i + 140);
    console.log('---context around position', i, '---');
    console.log(s.slice(start, end));
  }
  process.exit(1);
}
