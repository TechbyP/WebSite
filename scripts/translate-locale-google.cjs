const fs = require('fs');
const path = require('path');

const SOURCE_LANG = process.argv[2] || 'en';
const TARGET_LANG = process.argv[3] || 'pt';

const sourcePath = path.resolve(__dirname, '..', 'src', 'locales', `${SOURCE_LANG}.json`);
const targetPath = path.resolve(__dirname, '..', 'src', 'locales', `${TARGET_LANG}.json`);
const BATCH_SIZE = 40;

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function shouldSkipTranslation(text) {
  if (typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^[\d\s.,%€+\-/:()]*$/.test(trimmed)) return true;
  if (/^[A-Z0-9_\- ]{1,12}$/.test(trimmed) && !/[a-z]/.test(trimmed)) return true;
  return false;
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

function setByPath(target, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const raw = parts[i];
    const nextRaw = parts[i + 1];
    const nextIndex = Number(nextRaw);
    const nextIsIndex = Number.isInteger(nextIndex) && String(nextIndex) === nextRaw;

    if (Array.isArray(cursor)) {
      const index = Number(raw);
      if (cursor[index] === undefined) {
        cursor[index] = nextIsIndex ? [] : {};
      }
      cursor = cursor[index];
    } else {
      if (cursor[raw] === undefined) {
        cursor[raw] = nextIsIndex ? [] : {};
      }
      cursor = cursor[raw];
    }
  }

  const last = parts[parts.length - 1];

  if (Array.isArray(cursor)) {
    const lastIndex = Number(last);
    cursor[lastIndex] = value;
  } else {
    cursor[last] = value;
  }
}

async function translateSingle(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${TARGET_LANG}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translate API error: ${response.status}`);
  }
  const payload = await response.json();

  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error('Unexpected translation payload format');
  }

  const translated = payload[0].map((part) => (Array.isArray(part) ? part[0] : '')).join('');
  return translated || text;
}

async function translateBatch(texts) {
  if (texts.length === 1) {
    return [await translateSingle(texts[0])];
  }

  const separator = ' __COPILOT_SPLIT_TOKEN__ ';
  const joined = texts.join(separator);
  const translatedJoined = await translateSingle(joined);
  const split = translatedJoined.split(separator);

  if (split.length === texts.length) {
    return split;
  }

  const fallback = [];
  for (const text of texts) {
    fallback.push(await translateSingle(text));
  }
  return fallback;
}

async function main() {
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  const sourceLeaves = flattenLeaves(source);
  const toTranslate = sourceLeaves.filter(([, value]) => !shouldSkipTranslation(value));

  let translatedCount = 0;
  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const chunk = toTranslate.slice(i, i + BATCH_SIZE);
    const texts = chunk.map(([, value]) => value);
    const translatedTexts = await translateBatch(texts);

    chunk.forEach(([key], idx) => {
      setByPath(target, key, translatedTexts[idx]);
      translatedCount += 1;
    });

    if ((i / BATCH_SIZE + 1) % 10 === 0) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, toTranslate.length)}/${toTranslate.length}`);
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(target, null, 2) + '\n', 'utf8');
  console.log(`Translated ${translatedCount} strings to ${targetPath}`);
}

main().catch((err) => {
  console.error('TRANSLATION_FAILED:', err.message);
  process.exit(1);
});
