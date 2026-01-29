const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'identical-strings-remaining.json');
const outPath = path.resolve(__dirname, 'translations-ro-auto.json');

function looksInternational(s) {
  if (!s || typeof s !== 'string') return true;
  if (/https?:\/\//i.test(s)) return true;
  if (/@/.test(s)) return true;
  if (/\+?\d/.test(s)) return true;
  if (/€|%|\bcm\b|\bmm\b|\bkg\b|\bL\b|\bV\b|\bHz\b/i.test(s)) return true;
  if (/[<>]/.test(s)) return true;
  if (/^[\p{Emoji}\s\S]*$/u.test(s) && /[\u2600-\u26FF\u2700-\u27BF]/u.test(s)) return true;
  // Skip short ALL-CAPS tokens (like CONTACT, BEST)
  if (s.length <= 12 && s === s.toUpperCase() && /[A-Z]/.test(s)) return true;
  return false;
}

function translateText(s) {
  const dict = {
    'Contact': 'Contact',
    'Blog': 'Blog',
    'Electric': 'Electric',
    'Quality Certifications': 'Certificări de calitate',
    'Total': 'Total',
    'Powerpack': 'Powerpack',
    'Field Haulers': 'Remorci de teren',
    'Select Your Product': 'Selectează produsul tău',
    'Select Your Product': 'Selectează produsul tău',
    'Select Your Product': 'Selectează produsul tău',
    'Contact TechByP': 'Contact TechByP',
    'Phone Support': 'Suport telefonic',
    'Message sent successfully!': 'Mesaj trimis cu succes!'
  };
  if (dict[s]) return dict[s];

  // Simple sentence-level heuristics
  let t = s;
  t = t.replace(/Have questions about our equipment or services\?/i, 'Ai întrebări despre echipamentele sau serviciile noastre?');
  t = t.replace(/Get in touch with TechByP – your reliable partner for soil sampling equipment\./i, 'Contactează TechByP – partenerul tău de încredere pentru echipamente de prelevare a solului.');
  t = t.replace(/Choose the power pack suitable for trailer mounting\./i, 'Alege pachetul de alimentare potrivit pentru montare pe remorcă.');
  t = t.replace(/Choose the power pack suitable for vehicle mounting\./i, 'Alege pachetul de alimentare potrivit pentru montare pe vehicul.');
  t = t.replace(/No articles found/i, 'Nu s-au găsit articole');
  t = t.replace(/Try adjusting your search or filter to find what you're looking for\./i, 'Încearcă să ajustezi căutarea sau filtrul pentru a găsi ce cauți.');
  t = t.replace(/Insights & News \| TECHBYP/i, 'Insight-uri & Știri | TECHBYP');
  t = t.replace(/Configure the \{\{productName\}\}/i, 'Configurează {{productName}}');

  // If sentence contains many English words, attempt word-level mapping
  const words = t.split(/(\s+)/);
  const wordMap = {
    'Contact': 'Contact', 'Blog': 'Blog', 'Download': 'Descarcă', 'Downloads': 'Descarcări', 'Featured': 'Recomandat', 'Trending': 'Popular', 'Latest': 'Ultimele'
  };
  let changed = false;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const key = w.replace(/[^A-Za-z]/g, '');
    if (wordMap[key]) { words[i] = words[i].replace(key, wordMap[key]); changed = true; }
  }
  if (changed) return words.join('');

  // Fallback: if short single word, try translate common ones
  const single = s.trim();
  const singleMap = {
    'Price not available': 'Preț indisponibil',
    'Unnamed Product': 'Produs fără nume',
    'Product': 'Produs',
    'Continue reading': 'Continuă lectura',
    'Read more': 'Citește mai mult',
    'Show less': 'Arată mai puțin',
    'Reset filters': 'Resetează filtrele',
    'No articles found': 'Nu s-au găsit articole'
  };
  if (singleMap[single]) return singleMap[single];

  // As last resort, return original (keeps international ones unchanged)
  return s;
}

function main() {
  if (!fs.existsSync(srcPath)) { console.error('source not found', srcPath); process.exit(1); }
  const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
  const out = {};
  let translated = 0;
  let skipped = 0;
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (looksInternational(v)) { skipped++; continue; }
    const tr = translateText(v);
    if (tr !== v) translated++;
    out[k] = tr;
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('WROTE', Object.keys(out).length, 'translations (translated', translated, 'skipped', skipped, ') to', outPath);
}

main();
