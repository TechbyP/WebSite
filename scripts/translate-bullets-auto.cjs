const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'untranslated-bullets.json');
const outPath = path.resolve(__dirname, 'translations-ro.json');

if (!fs.existsSync(srcPath)) { console.error('source not found', srcPath); process.exit(1); }
const list = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const phraseMap = {
  'Use the services in any way that violates applicable laws': 'Folosiți serviciile într-un mod care încalcă legislația aplicabilă',
  'Attempt to gain unauthorized access to our systems': 'Încercați să obțineți acces neautorizat la sistemele noastre',
  'Interfere with the proper working of our services': 'Interferați cu funcționarea corectă a serviciilor noastre',
  'Use any automated means to access our services without permission': 'Folosiți mijloace automate pentru a accesa serviciile noastre fără permisiune',
  'Contact us through our website': 'Contactați-ne prin site-ul nostru',
  'Request a quote or product information': 'Solicitați o ofertă sau informații despre produs',
  'Subscribe to our newsletter': 'Abonați-vă la newsletter-ul nostru',
  'Download resources from our site': 'Descărcați resurse de pe site-ul nostru',
  'Provide and maintain our services': 'Furnizăm și întreținem serviciile noastre',
  'Respond to your inquiries and requests': 'Răspundem la întrebările și solicitările dvs.',
  'Improve our website and products': 'Îmbunătățim site-ul și produsele noastre',
  'Send periodic emails (you can unsubscribe at any time)': 'Trimitem emailuri periodice (vă puteți dezabona oricând)',
  'Necessary Cookies: Required for basic website functionality.': 'Cookie-uri necesare: necesare pentru funcționalitatea de bază a site-ului.',
  'Analytics Cookies: We use Google Analytics to collect anonymous usage statistics and improve our offerings.': 'Cookie-uri de analiză: folosim Google Analytics pentru a colecta statistici anonime și a îmbunătăți ofertele.',
  'Access, update, or delete your information': 'Accesați, actualizați sau ștergeți informațiile dvs.',
  'Object to our processing of your data': 'Formulați obiecții cu privire la prelucrarea datelor dvs.',
  'Request restriction of processing': 'Solicitați restricționarea prelucrării',
  'Request data portability': 'Solicitați portabilitatea datelor',
  'Soil pH Testing': 'Testare pH sol',
  'Nutrient Analysis': 'Analiză nutrienți',
  'Compaction Assessment': 'Evaluare compactare',
  'Irrigation Planning': 'Planificare irigații',
  'Bearing Capacity': 'Capacitate portanta',
  'Settlement Analysis': 'Analiză tasare',
  'Slope Stability': 'Stabilitate pantă',
  'Foundation Design': 'Proiectare fundații',
  'Contamination Detection': 'Detectare contaminare',
  'Groundwater Monitoring': 'Monitorizare ape subterane',
  'Environmental Impact': 'Impact de mediu',
  'Remediation Planning': 'Planificare remediere',
  'Site Preparation': 'Pregătire șantier',
  'Material Testing': 'Testare materiale',
  'Quality Control': 'Controlul calității',
  'Safety Assessment': 'Evaluare siguranță',
  'Full-length (0–90 cm) intact soil core for profile visibility': 'Nucleu de sol intact de lungime completă (0–90 cm) pentru vizibilitatea profilului',
  'Centimetre-precise depth control': 'Control al adâncimii cu precizie în centimetri',
  'Obstacle detection with automatic stop': 'Detectare obstacole cu oprire automată',
  'Manual core removal for sample integrity': 'Îndepărtare manuală a nucleului pentru integritatea probei',
  'Fits pickups, trailers, and lightweight vehicles': 'Se potrivește pe pick-up-uri, remorci și vehicule ușoare',
  'Upgradeable to MP-3.90 or MP-4.100': 'Posibilitate de upgrade la MP-3.90 sau MP-4.100'
};

function simpleTranslate(s) {
  if (!s || typeof s !== 'string') return s;
  if (phraseMap[s]) return phraseMap[s];
  // replace some tokens
  let t = s;
  const replacements = {
    'Depth': 'Adâncime', 'Depth:': 'Adâncime:', 'Depth\b': 'Adâncime',
    'Depth:': 'Adâncime:', 'Depth–': 'Adâncime–',
    'Depth\b': 'Adâncime', 'Depth:': 'Adâncime:',
    'Semi-automatic': 'Semi-automat', 'Full-core': 'Nucleu complet',
    '16sec/core sampling cycle': 'ciclu de prelevare 16s/miez',
    'km': 'km', 'cm': 'cm', 'kg': 'kg'
  };
  for (const k in replacements) t = t.replace(new RegExp(k, 'g'), replacements[k]);
  // fallback: if English words remain, attempt word-level map
  const wordMap = {
    'Depth': 'Adâncime', 'semi-automatic': 'semi-automat', 'Full-core': 'nucleu complet', 'Fits': 'Se potrivește', 'Upgradeable': 'Posibilitate de upgrade'
  };
  for (const w in wordMap) t = t.replace(new RegExp(w, 'gi'), wordMap[w]);
  return t;
}

const out = {};
for (const item of list) {
  const key = item.key.replace(/\[(\d+)\]/g, '.$1');
  const val = item.value;
  const tr = simpleTranslate(val);
  out[key] = tr;
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE', Object.keys(out).length, 'bullet translations to', outPath);
