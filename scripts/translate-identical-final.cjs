const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'identical-strings-remaining.json');
const outPath = path.resolve(__dirname, 'translations-ro-final-pass.json');

if (!fs.existsSync(srcPath)) { console.error('source not found', srcPath); process.exit(1); }
const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const phraseMap = {
  'Contact': 'Contact',
  'Email:': 'Email:',
  'Quality Certifications': 'Certificări de calitate',
  'Electric': 'Electric',
  'Total': 'Total',
  'Powerpack': 'Powerpack',
  'N/A': 'N/A',
  'Admin': 'Admin',
  'Editor': 'Editor',
  'Digital': 'Digital',
  'Three‑Point Hitch': 'Priză în trei puncte',
  'Full Conversion': 'Conversie completă',
  'Mount Kit': 'Kit montare',
  'Field Haulers': 'Remorci de teren',
  'Independent Drive Units': 'Unități de acționare independente',
  'Coolbox 95L': 'Coolbox 95L',
  'The Watchtower': 'Turn de supraveghere',
  'The Sixteen Express': 'The Sixteen Express',
  'The Dirt Whisperer': 'Șoptitorul de pământ',
  'The N-min Purist': 'Puristul N-min',
  'The Deep Opener': 'Deschizătorul adânc',
  'Göttinger Soil Corers': 'Burghie de sol Göttinger'
};

function isInternational(s) {
  if (typeof s !== 'string') return true;
  if (/https?:\/\//i.test(s)) return true;
  if (/@/.test(s)) return true;
  if (/^\+?\d/.test(s)) return true;
  if (/^[A-Z0-9\-\s€£¥%,\.\/]+$/.test(s) && s.length < 8) return true;
  return false;
}

function translateValue(v) {
  if (isInternational(v)) return v;
  if (phraseMap[v]) return phraseMap[v];
  // units/numbers keep
  if (/\d+\s?(cm|mm|kg|g|L|V|W|K|°|MP|MP|mm|lm)/i.test(v)) return v;
  // simple replacements
  let t = v;
  const simple = {
    'Steuer-Nr.': 'Nr. impozit',
    'Steuer-Nr.': 'Nr. impozit',
    'Depth': 'Adâncime',
    'Weight': 'Greutate',
    'Magazines': 'Magazine',
    'Sampling Depth': 'Adâncime de prelevare',
    'Sampling Type': 'Tip de prelevare',
    'Impact-driven, fully automatic': 'Impuls mecanic, complet automat',
    'Impact-driven, semi-automatic': 'Impuls mecanic, semi-automat',
    'Operating Voltage': 'Tensiune de funcționare',
    'Power Consumption': 'Consum de energie',
    'Capacity': 'Capacitate',
    'Resolution': 'Rezoluție',
    'Transmission': 'Transmisie',
    'Viewing Angle': 'Unghi de vizualizare',
    'Power Supply': 'Sursă de alimentare',
    'Diameter': 'Diametru',
    'Track Width': 'Lățime șenile',
    'Engine': 'Motor'
  };
  for (const k in simple) {
    t = t.replace(new RegExp(k, 'g'), simple[k]);
  }
  return t;
}

const out = {};
for (const k of Object.keys(src)) {
  const v = src[k];
  const tr = translateValue(v);
  if (tr !== v) out[k] = tr;
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE', Object.keys(out).length, 'final translations to', outPath);
