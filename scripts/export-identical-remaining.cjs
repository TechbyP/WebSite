const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '..', 'src', 'locales', 'en.json');
const roPath = path.resolve(__dirname, '..', 'src', 'locales', 'ro.json');
const outPath = path.resolve(__dirname, 'identical-strings-remaining.json');

function collect(obj, prefix = '') {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collect(v, key));
    } else {
      keys.push({ key, value: v });
    }
  }
  return keys;
}

function main() {
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const ro = JSON.parse(fs.readFileSync(roPath, 'utf8'));

  const enFlat = collect(en);
  const roFlat = collect(ro).reduce((acc, cur) => { acc[cur.key] = cur.value; return acc; }, {});

  const identical = {};
  for (const item of enFlat) {
    const key = item.key;
    const enVal = item.value;
    const roVal = roFlat[key];
    if (typeof enVal === 'string' && roVal === enVal) {
      identical[key] = enVal;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(identical, null, 2) + '\n', 'utf8');
  console.log('EXPORTED', Object.keys(identical).length, 'identical strings to', outPath);
}

main();
