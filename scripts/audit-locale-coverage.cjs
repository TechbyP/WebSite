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
      if (isObject(item) || Array.isArray(item)) {
        leaves.push(...flattenLeaves(item, key));
      } else {
        leaves.push([key, item]);
      }
    });
    return leaves;
  }

  if (isObject(obj)) {
    Object.entries(obj).forEach(([k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (isObject(v) || Array.isArray(v)) {
        leaves.push(...flattenLeaves(v, key));
      } else {
        leaves.push([key, v]);
      }
    });
    return leaves;
  }

  leaves.push([prefix, obj]);
  return leaves;
}

function isMeaningfulString(value) {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (!text) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^[\d\s.,%€+\-/:()]*$/.test(text)) return false;
  return true;
}

function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  const sourceMap = Object.fromEntries(flattenLeaves(source));
  const targetMap = Object.fromEntries(flattenLeaves(target));

  const sourceKeys = Object.keys(sourceMap);
  const targetKeys = Object.keys(targetMap);

  const missing = sourceKeys.filter((key) => !(key in targetMap));
  const extra = targetKeys.filter((key) => !(key in sourceMap));

  const identical = sourceKeys.filter(
    (key) =>
      key in targetMap &&
      sourceMap[key] === targetMap[key] &&
      isMeaningfulString(sourceMap[key])
  );

  const report = {
    sourceLang,
    targetLang,
    sourceLeafCount: sourceKeys.length,
    targetLeafCount: targetKeys.length,
    missingCount: missing.length,
    extraCount: extra.length,
    identicalMeaningfulCount: identical.length,
    missingSample: missing.slice(0, 50),
    identicalMeaningfulSample: identical.slice(0, 80)
  };

  console.log(JSON.stringify(report, null, 2));
}

main();
