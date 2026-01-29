const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/locales/en.json','utf8'));
const ro = JSON.parse(fs.readFileSync('src/locales/ro.json','utf8'));
function walk(o, p='', res={}){
  if(typeof o==='string'){
    const rv = p.split('.').reduce((a,k)=>a&&a[k], ro);
    if(rv===o) res[p]=o;
  } else if(o && typeof o==='object' && !Array.isArray(o)){
    for(const k of Object.keys(o)) walk(o[k], p? p+'.'+k:k, res);
  }
  return res;
}
const map = walk(en);
fs.writeFileSync('scripts/identical-strings.json', JSON.stringify(map,null,2),'utf8');
console.log('EXPORTED', Object.keys(map).length);
