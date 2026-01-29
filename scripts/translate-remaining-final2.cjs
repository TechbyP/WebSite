const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, 'identical-strings-remaining.json');
const outPath = path.resolve(__dirname, 'translations-ro-final2.json');

if (!fs.existsSync(srcPath)) { console.error('source not found', srcPath); process.exit(1); }
const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

const map = {
  'termsOfService.intro.company': 'Bodenprobetechnik Peters GmbH',
  'company.name': 'Bodenprobetechnik Peters GmbH',
  'company.address.street': 'Am Fliegerhorst 11',
  'company.address.zipCity': '49610 Quakenbrück',
  'contact.title': 'Contact',
  'contact.emailLabel': 'Email:',
  'certifications.title': 'Certificări de calitate',
  'form.email': 'Email',
  'summary.total': 'Total',
  'notApplicable': 'N/A',
  'commentsFunction.anonymousInitial': 'A',
  'hero.newsTypes.blog': 'Blog',
  'sortDropdown.options.electric.main': 'Electric',
  'productNames.powerPack': 'Powerpack',
  'foot.company.contact': 'Contact',
  'foot.social.facebook': 'Facebook',
  'foot.social.linkedin': 'LinkedIn',
  'foot.social.youtube': 'YouTube',
  'foot.social.instagram': 'Instagram',
  'contact_page.formular.email': 'Email',
  'adminDashboard.user.role.admin': 'Admin',
  'adminDashboard.user.role.editor': 'Editor',
  'mp1.nickname': 'Recuperator nucleu complet',
  'mp2.nickname': 'MultiPRO gamă medie',
  'mp3.nickname': 'TripleLayer Pro',
  'mp4.nickname': 'UltraAdâncime MAX',
  'dh.nickname': 'Explorator hidraulic',
  'de.nickname': 'Explorator electric',
  'boprob.nickname': 'The Sixteen Express',
  'laydown.nickname': 'Kit montare',
  'tph.name': 'Priză în trei puncte',
  'tph.nickname': 'Kit montare',
  'fc.name': 'Conversie completă',
  'fc.nickname': 'Conversion Kit',
  'trailer.nickname': 'Remorci de teren',
  'powerpack.name': 'Power Pack',
  'powerpack.nickname': 'Unități de acționare independente',
  'spareparts.nickname': 'The Lifesavers',
  'coolbox.name': 'Coolbox 95L',
  'coolbox.nickname': 'The Chiller',
  'led.nickname': 'The Midnight Sun',
  'camera.nickname': 'Turn de supraveghere',
  'probes.nickname': 'Puristul N-min',
  'drillrods.nickname': 'Deschizătorul adânc',
  'goettingerDrills.name': 'Burghie de sol Göttinger',
  'raupe.nickname': 'Șoptitorul de pământ'
};

function isInternational(v) {
  if (typeof v !== 'string') return true;
  if (/https?:\/\//i.test(v)) return true;
  if (/^\+?\d|DE\d{9}|\d{2,}/.test(v)) return true;
  if (/@/.test(v)) return true;
  return false;
}

const out = {};
for (const k of Object.keys(src)) {
  const v = src[k];
  if (map[k]) { out[k] = map[k]; continue; }
  if (isInternational(v)) continue;
  let t = v;
  t = t.replace(/Steuer-Nr\./g, 'Nr. impozit');
  t = t.replace(/Impact-driven, fully automatic/g, 'Impuls mecanic, complet automat');
  t = t.replace(/Impact-driven, semi-automatic/g, 'Impuls mecanic, semi-automat');
  t = t.replace(/Sampling Depth/g, 'Adâncime de prelevare');
  t = t.replace(/Magazines/g, 'Magazine');
  t = t.replace(/Weight/g, 'Greutate');
  t = t.replace(/Operating Voltage/g, 'Tensiune de funcționare');
  t = t.replace(/Power Consumption/g, 'Consum de energie');
  t = t.replace(/Capacity/g, 'Capacitate');
  t = t.replace(/Resolution/g, 'Rezoluție');
  t = t.replace(/Viewing Angle/g, 'Unghi de vizualizare');
  t = t.replace(/Power Supply/g, 'Sursă de alimentare');
  t = t.replace(/Diameter/g, 'Diametru');
  t = t.replace(/Track Width/g, 'Lățime șenile');
  t = t.replace(/Engine/g, 'Motor');
  if (t !== v) out[k] = t;
}

fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('WROTE', Object.keys(out).length, 'translations to', outPath);
