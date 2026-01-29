const fs = require('fs');
function collect(o, prefix=''){
  let res = [];
  if (o && typeof o === 'object' && !Array.isArray(o)){
    for(const k of Object.keys(o)){
      const path = prefix? prefix + '.' + k : k;
      res.push(path);
      try{ if(o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) res = res.concat(collect(o[k], path)); }catch(e){}
    }
  }
  return res;
}
try{
  const en = JSON.parse(fs.readFileSync('src/locales/en.json','utf8'));
  const ro = JSON.parse(fs.readFileSync('src/locales/ro.json','utf8'));
  const eKeys = collect(en);
  const rKeys = collect(ro);
  const missing = eKeys.filter(k=>!rKeys.includes(k));
  const extra = rKeys.filter(k=>!eKeys.includes(k));
  const out = {missingCount: missing.length, extraCount: extra.length, missing: missing, extra: extra};
  console.log(JSON.stringify(out,null,2));
} catch (err){
  console.error('COMPARE_ERROR', err && err.message);
  process.exit(2);
}
