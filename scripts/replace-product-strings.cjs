const fs = require('fs');
const path = require('path');

const roPath = path.resolve(__dirname, '..', 'src', 'locales', 'ro.json');
if (!fs.existsSync(roPath)) { console.error('ro.json not found'); process.exit(1); }
const ro = JSON.parse(fs.readFileSync(roPath, 'utf8'));

const replacements = {
  'Hydraulic or electric powered to suit your workflow': 'Alimentare hidraulică sau electrică, adaptată fluxului tău de lucru',
  'Rugged steel casing with corrosion protection': 'Carcasă robustă din oțel cu protecție împotriva coroziunii',
  'LCD battery status on electric models': 'Indicator LCD al bateriei pe modelele electrice',
  'Return and suction filtration for hydraulic longevity': 'Filtrare de retur și aspirație pentru durabilitatea sistemului hidraulic',
  'Portable and easy to mount or transport': 'Portabil și ușor de montat sau transportat',
  'Power source for MP-series and DH-series soil samplers': 'Sursă de alimentare pentru prelevatoarele de sol seria MP și DH',
  'Field operations requiring independent hydraulic or electric power': 'Operațiuni pe teren care necesită alimentare hidraulică sau electrică independentă',
  'Remote sampling locations without vehicle power supply': 'Locații de prelevare îndepărtate, fără sursă de alimentare de la vehicul',
  'Pick hydraulic or electric depending on how much oomph your sampler demands (and how fancy you feel).': 'Alege hidraulic sau electric în funcție de câtă putere solicită prelevatorul tău (și cât de sofisticat te simți).',
  'Bolt it on securely to your vehicle or trailer—no improvising with duct tape, please.': 'Fixează-l bine pe vehiculul sau remorca ta — fără improvizații cu bandă adezivă, te rog.',
  'Keep an eye on power levels via LCD (electric) or fuel/oil gauges (hydraulic)—because surprises are for birthday parties, not fieldwork.': 'Monitorizează nivelurile de alimentare prin LCD (electric) sau prin indicatoare de combustibil/ulei (hidraulic) — surprizele sunt pentru petreceri, nu pentru lucrul pe teren.',
  'Top up oil and change filters regularly—treat it well, and it\'ll keep your sampler humming like a charm.': 'Completează uleiul și schimbă filtrele regulat — îngrijește-l bine și va menține prelevatorul funcționând impecabil.',
  'Se evidențiază': 'Se evidențiază',
  'Această parte e chiar satisfăcătoare': 'Această parte e chiar satisfăcătoare',
  '1.': '1.', '2.': '2.', '3.': '3.', '4.': '4.'
};

function walk(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        const s = obj[i];
        if (replacements[s]) obj[i] = replacements[s];
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        walk(obj[i]);
      }
    }
    return;
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === 'string') {
        const s = obj[k];
        if (replacements[s]) obj[k] = replacements[s];
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        walk(obj[k]);
      }
    }
  }
}

walk(ro);
fs.writeFileSync(roPath, JSON.stringify(ro, null, 2) + '\n', 'utf8');
console.log('Applied product-string replacements to', roPath);
