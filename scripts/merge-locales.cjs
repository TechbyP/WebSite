const fs = require('fs');
function merge(en, ro){
  if (typeof en !== 'object' || en === null) return ro === undefined ? en : ro;
  if (Array.isArray(en)) return ro === undefined ? en : ro;
  const out = ro && typeof ro === 'object' && !Array.isArray(ro) ? {...ro} : {};
  for(const k of Object.keys(en)){
    if(out[k] === undefined){
      out[k] = en[k];
    } else {
      out[k] = merge(en[k], out[k]);
    }
  }
  return out;
}
try{
  const en = JSON.parse(fs.readFileSync('src/locales/en.json','utf8'));
  const ro = JSON.parse(fs.readFileSync('src/locales/ro.json','utf8'));
  const merged = merge(en, ro);
  fs.writeFileSync('src/locales/ro.json', JSON.stringify(merged, null, 2),'utf8');
  console.log('MERGE_DONE');
} catch (err){
  console.error('MERGE_ERROR', err && err.message);
  process.exit(2);
}
