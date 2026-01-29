const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'identical-strings-remaining.json');
const outPath = path.resolve(__dirname, 'translations-ro.json');

if (!fs.existsSync(srcPath)) { console.error('source not found', srcPath); process.exit(1); }
const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const out = {};

const tokenMap = {
  'Sampling Depth': 'Adâncime de prelevare',
  'Sampling Type': 'Tip de prelevare',
  'Magazines': 'Magazine',
  'Weight': 'Greutate',
  'Operating Voltage': 'Tensiune de funcționare',
  'Capacity': 'Capacitate',
  'Power Consumption': 'Consum de energie',
  'Voltage': 'Tensiune',
  'Resolution': 'Rezoluție',
  'Transmission': 'Transmisie',
  'Viewing Angle': 'Unghi de vizualizare',
  'Power Supply': 'Sursă de alimentare',
  'Diameter': 'Diametru',
  'Ingress Protection': 'Protecție la pătrundere',
  'Luminous Flux': 'Flux luminos',
  'NumberOfLEDs': 'Număr LED-uri',
  'Cable Length': 'Lungime cablu',
  'Track Width': 'Lățime șenile',
  'Engine': 'Motor',
  'Capacity': 'Capacitate',
  'Field Haulers': 'Remorci de teren',
  'Independent Drive Units': 'Unități de acționare independente',
  'Full Conversion': 'Conversie completă',
  'Three‑Point Hitch': 'Priză în trei puncte',
  'Power Pack': 'Pachet de alimentare',
  'BEST': 'TOP',
  'BESTSELLER': 'CEL MAI VÂNDUT',
  'SMART': 'INTELIGENT',
  'Quality Certifications': 'Certificări de calitate'
};

function looksNumericOrUnits(v) {
  if (typeof v !== 'string') return false;
  if (/^[0-9\-––\s€,\.\/]+$/.test(v)) return true;
  if (/\d+\s?(cm|mm|kg|g|L|V|W|K|°|%)\b/i.test(v)) return true;
  return false;
}

let wrote = 0;
for (const k of Object.keys(src)) {
  const v = src[k];
  if (/\.technicalSpecs\.|^productSelection\.|^foot\.|^header\.|productShowcase|contact_page|product\./.test(k)) {
    if (looksNumericOrUnits(v)) continue;
    if (tokenMap[v]) { out[k] = tokenMap[v]; wrote++; continue; }
    let t = v;
    for (const en in tokenMap) {
      const re = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      t = t.replace(re, tokenMap[en]);
    }
    if (/^[A-Z\s\-]{2,}$/.test(v) && v.length <= 20) {
      if (v === 'BEST') t = 'TOP';
      if (v === 'BESTSELLER') t = 'CEL MAI VÂNDUT';
      if (v === 'SMART') t = 'INTELIGENT';
    }
    if (t !== v) { out[k] = t; wrote++; }
  }
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE', wrote, 'translations to', outPath);
