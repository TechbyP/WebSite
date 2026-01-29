const fs = require('fs');
const path = require('path');

const translationsPath = path.resolve(__dirname, 'translations-ro-more.json');
const roPath = path.resolve(__dirname, '..', 'src', 'locales', 'ro.json');

function setByPath(obj, dottedKey, value) {
  const parts = dottedKey.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur) || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function main() {
  if (!fs.existsSync(translationsPath)) {
    console.error('translations file not found:', translationsPath);
    process.exit(1);
  }
  if (!fs.existsSync(roPath)) {
    console.error('ro.json not found:', roPath);
    process.exit(1);
  }

  const translationsRaw = fs.readFileSync(translationsPath, 'utf8');
  let translations;
  try {
    translations = JSON.parse(translationsRaw);
  } catch (err) {
    console.error('Failed to parse translations json:', err.message);
    process.exit(1);
  }

  const roRaw = fs.readFileSync(roPath, 'utf8');
  let ro;
  try {
    ro = JSON.parse(roRaw);
  } catch (err) {
    console.error('Failed to parse ro.json:', err.message);
    process.exit(1);
  }

  const keys = Object.keys(translations);
  keys.forEach(k => {
    setByPath(ro, k, translations[k]);
  });

  fs.writeFileSync(roPath, JSON.stringify(ro, null, 2) + '\n', 'utf8');
  console.log('APPLIED', keys.length, 'translations to', roPath);
}

main();
