const fs = require('fs');
const path = require('path');

const enPath = path.resolve(__dirname, '..', 'src', 'locales', 'en.json');
const roPath = path.resolve(__dirname, '..', 'src', 'locales', 'ro.json');
const outPath = path.resolve(__dirname, 'untranslated-bullets.json');

function read(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function walk(enObj, roObj, prefix = '') {
  const results = [];
  if (Array.isArray(enObj)) {
    // compare arrays element-wise where roObj is also array
    if (!Array.isArray(roObj)) return results;
    for (let i = 0; i < enObj.length; i++) {
      const e = enObj[i];
      const r = roObj[i];
      const key = `${prefix}[${i}]`;
      if (typeof e === 'string') {
        if (r === e) results.push({ key, value: e });
      } else if (typeof e === 'object' && e !== null) {
        results.push(...walk(e, r || {}, key));
      }
    }
    return results;
  }

  if (typeof enObj === 'object' && enObj !== null) {
    for (const k of Object.keys(enObj)) {
      const newPrefix = prefix ? `${prefix}.${k}` : k;
      results.push(...walk(enObj[k], (roObj && roObj[k]) || undefined, newPrefix));
    }
  }
  return results;
}

function main() {
  if (!fs.existsSync(enPath) || !fs.existsSync(roPath)) {
    console.error('missing en.json or ro.json'); process.exit(1);
  }
  const en = read(enPath);
  const ro = read(roPath);
  const untranslated = walk(en, ro, '');
  fs.writeFileSync(outPath, JSON.stringify(untranslated, null, 2) + '\n', 'utf8');
  console.log('FOUND', untranslated.length, 'untranslated bullet/list items ->', outPath);
}

main();
