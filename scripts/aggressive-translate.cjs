const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'identical-strings-remaining.json');
const outPath = path.resolve(__dirname, 'translations-ro.json');

if (!fs.existsSync(srcPath)) {
  console.error('source not found', srcPath); process.exit(1);
}

const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const out = {};

const specMap = {
  'Sampling Depth': 'Adâncime de prelevare',
  'Magazines': 'Magazine',
  'Weight': 'Greutate',
  'Operating Voltage': 'Tensiune de alimentare',
  'Capacity': 'Capacitate',
  'PowerConsumption': 'Consum de energie',
  'Voltage': 'Voltaj',
  'Resolution': 'Rezoluție',
  'Transmission': 'Transmisie',
  'ViewingAngle': 'Unghi de vizualizare',
  'PowerSupply': 'Sursă de alimentare',
  'Diameter': 'Diametru',
  'IngressProtection': 'Protecție la pătrundere',
  'LuminousFlux': 'Flux luminos',
  'NumberOfLEDs': 'Număr de LED-uri',
  'CableLength': 'Lungime cablu'
};

const footerMap = {
  'Contact': 'Contact',
  'About Us': 'Despre noi',
  'News': 'Noutăți',
  'Privacy Policy': 'Politica de confidențialitate',
  'Terms and Conditions': 'Termeni și condiții',
  'Imprint': 'Mentă legală',
  'Download Center': 'Centru de descărcări',
  'User Manuals': 'Manuale utilizator',
  'Tech Support': 'Suport tehnic',
  'Training': 'Instruire și certificare'
};

function translateValue(key, val) {
  if (typeof val !== 'string') return val;
  // product technical specs keys
  if (/\.technicalSpecs\./.test(key) || /\.technicalSpecs$/.test(key) || /specs/i.test(key)) {
    for (const en in specMap) {
      if (val.includes(en)) return val.replace(en, specMap[en]);
    }
    // common patterns
    if (/\bcm\b/i.test(val) || /mm|kg|V|W|K|°/i.test(val)) return val; // keep numeric specs
    // short fallbacks
    if (val.match(/^[A-Za-z\- ]+$/)) return val.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return val;
  }

  // footer and header
  if (/^foot\.|^header\./.test(key) || /footer|contact_page|foot\./.test(key)) {
    // try exact match in footerMap
    if (footerMap[val]) return footerMap[val];
    // small heuristics
    if (/Contact/i.test(val)) return 'Contact';
    if (/Privacy|privacy/i.test(val)) return 'Politica de confidențialitate';
    if (/Terms|termeni/i.test(val)) return 'Termeni și condiții';
    return val;
  }

  // header nav items
  if (/^header\./.test(key)) {
    if (/CONTACT/.test(val)) return 'CONTACT';
    if (/TOATE PRODUSELE|ALL PRODUCTS/i.test(val)) return 'TOATE PRODUSELE';
    // preserve empty language switchers
    if (val === '') return '';
    return val;
  }

  // generic: try simple replacements
  if (/Product|Catalogue|Catalog|Download|Read more|Citește mai mult|Configure/.test(val)) {
    return val.replace(/Download/gi, 'Descarcă').replace(/Read more/gi, 'Citește mai mult').replace(/Configure/gi, 'Configurează').replace(/Catalogue|Catalog/gi, 'Catalog');
  }

  return val;
}

let count = 0;
for (const k of Object.keys(src)) {
  if (/^product\.|\.technicalSpecs\.|^foot\.|^header\.|contact_page|productShowcase|product\./.test(k)) {
    const t = translateValue(k, src[k]);
    if (t && t !== src[k]) {
      out[k] = t;
      count++;
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE', count, 'translations to', outPath);
