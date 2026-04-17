const fs = require('fs');
const path = require('path');

const sourceLang = process.argv[2] || 'en';
const targetLang = process.argv[3] || 'pt';

const sourcePath = path.resolve(__dirname, '..', 'src', 'locales', `${sourceLang}.json`);
const targetPath = path.resolve(__dirname, '..', 'src', 'locales', `${targetLang}.json`);

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function flattenLeaves(obj, prefix = '') {
  const leaves = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const key = prefix ? `${prefix}.${index}` : String(index);
      if (isObject(item) || Array.isArray(item)) leaves.push(...flattenLeaves(item, key));
      else leaves.push([key, item]);
    });
    return leaves;
  }
  if (isObject(obj)) {
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (isObject(v) || Array.isArray(v)) leaves.push(...flattenLeaves(v, key));
      else leaves.push([key, v]);
    });
    return leaves;
  }
  leaves.push([prefix, obj]);
  return leaves;
}

function setByPath(target, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (Array.isArray(cursor)) {
      const index = Number(key);
      if (cursor[index] === undefined) cursor[index] = {};
      cursor = cursor[index];
    } else {
      if (cursor[key] === undefined) cursor[key] = {};
      cursor = cursor[key];
    }
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cursor)) cursor[Number(last)] = value;
  else cursor[last] = value;
}

function isMeaningfulString(value) {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (!text) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^[\d\s.,%€+\-/:()]*$/.test(text)) return false;
  return true;
}

function shouldPreserveAsIs(key, text) {
  if (!text) return true;
  if (/@/.test(text)) return true;
  if (/\b(IBAN|BIC|VAT|N\/A|Facebook|LinkedIn|YouTube|Instagram|Blog|Email)\b/i.test(text)) return true;
  if (/^(company\.|bankDetails\.|contact\.email|contact_page\.address\.|contact_page\.email\.)/.test(key)) return true;
  if (/\.abbr$/.test(key)) return true;
  if (/^https?:\/\//i.test(text)) return true;
  return false;
}

async function translateSingle(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translate API error: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return text;
  const translated = payload[0].map((part) => (Array.isArray(part) ? part[0] : '')).join('');
  return translated || text;
}

async function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const sourceMap = Object.fromEntries(flattenLeaves(source));
  const targetMap = Object.fromEntries(flattenLeaves(target));

  const identical = Object.keys(sourceMap).filter(
    (key) => key in targetMap && sourceMap[key] === targetMap[key] && isMeaningfulString(sourceMap[key])
  );

  let updated = 0;
  for (const key of identical) {
    const sourceText = sourceMap[key];
    if (shouldPreserveAsIs(key, sourceText)) continue;
    const translated = await translateSingle(sourceText);
    if (translated && translated !== targetMap[key]) {
      setByPath(target, key, translated);
      updated += 1;
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(target, null, 2) + '\n', 'utf8');
  console.log(`Updated ${updated} identical strings in ${targetPath}`);
}

main().catch((err) => {
  console.error('IDENTICAL_TRANSLATION_FAILED:', err.message);
  process.exit(1);
});
