const fs = require('fs');
const s = fs.readFileSync('src/locales/ro.json', 'utf8');
let depth = 0;
let inStr = false;
let esc = false;
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (inStr) {
    if (esc) {
      esc = false;
    } else if (ch === '\\') {
      esc = true;
    } else if (ch === '"') {
      inStr = false;
    }
  } else {
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0 && i < s.length - 1) {
        const rest = s.slice(i + 1).trim();
        if (rest.length > 0) {
          console.log('Depth returned to 0 at index', i, 'char after:', s[i+1]);
          console.log('Context before:');
          console.log(s.slice(Math.max(0, i-120), i+1));
          console.log('Context after:');
          console.log(s.slice(i+1, i+160));
          process.exit(0);
        }
      }
    }
  }
}
console.log('No premature top-level close detected; final depth:', depth);
