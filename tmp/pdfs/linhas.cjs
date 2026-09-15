const fs=require('fs');
const rows=fs.readFileSync('tmp/pdfs/anexo-coords.tsv','utf8').split('\n').filter(Boolean).map(line=>{const [stream,x,y,font,...rest]=line.split('\t');return {stream:+stream,x:+x,y:+y,font,text:rest.join('\t')}});
function rot(s){return s.replace(/[A-Z]/g,c=>String.fromCharCode((c.charCodeAt(0)-65+23)%26+65)).replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-97+23)%26+97));}
for(const r of rows)if(r.font.startsWith('C2'))r.text=rot(r.text);
let out=[];
for(const stream of [30,33,34,35,36,38,39,40]) for(const side of [0,1]) { const data=rows.filter(r=>r.stream===stream&&(side?r.x>=280:r.x<280)).sort((a,b)=>b.y-a.y||a.x-b.x); let groups=[];for(const r of data){let g=groups.find(g=>Math.abs(g.y-r.y)<1);if(!g)groups.push(g={y:r.y,parts:[]});g.parts.push(r)}out.push(`\n===== STREAM ${stream} ${side?'DIREITA':'ESQUERDA'} =====`);for(const g of groups)out.push(g.parts.sort((a,b)=>a.x-b.x).map(r=>r.text).join(' | ')); }
fs.writeFileSync('tmp/pdfs/anexo-linhas.txt',out.join('\n'));

