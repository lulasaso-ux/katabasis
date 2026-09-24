// Checks the Compass quiz: complete bilingual questions, balanced axes, every quadrant reachable and populated.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readdirSync(path.join(root,'app')).filter(n=>/^katabasis-\d+\.txt$/.test(n)).sort().map(n=>fs.readFileSync(path.join(root,'app',n),'utf8')).join('');
const json=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const additions=JSON.parse(fs.readFileSync(path.join(root,'app/reading-package-additions.json')));
const extra=JSON.parse(html.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const authors=new Set([...json('anthology-data'),...extra,...additions.works].map(w=>w.author));
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'app/compass-data.js'),'utf8'),context);
const A=context.window.COMPASS_AUTHORS,Q=context.window.COMPASS_QUESTIONS;

for(const q of Q){
  assert(['x','y'].includes(q.axis),'Axis must be x or y');
  for(const k of ['q_es','q_en','l_es','r_es','l_en','r_en'])assert(typeof q[k]==='string'&&q[k].trim(),'Missing '+k+': '+q.q_en);
}
const nx=Q.filter(q=>q.axis==='x').length,ny=Q.filter(q=>q.axis==='y').length;
assert(nx>=6&&ny>=6,'Each axis needs at least six questions');
assert(Math.abs(nx-ny)<=3,'Axes should carry a similar number of questions');
for(const a of A){
  assert(authors.has(a.a),'Compass author without readings: '+a.a);
  assert(Math.abs(a.x)<=100&&Math.abs(a.y)<=100,'Out of range: '+a.a);
}
assert.equal(new Set(A.map(a=>a.a)).size,A.length,'Duplicate compass author');

// Same scoring as app/compass.js.
const score=ans=>{let sx=0,sy=0;Q.forEach((q,i)=>q.axis==='x'?sx+=ans[i]:sy+=ans[i]);return{x:Math.round(sx/(2*nx)*100),y:Math.round(sy/(2*ny)*100)}};
const quads=[[-1,1],[1,1],[-1,-1],[1,-1]];
for(const [sx,sy] of quads){
  for(const strength of [2,1]){
    const p=score(Q.map(q=>(q.axis==='x'?sx:sy)*strength));
    assert(Math.sign(p.x)===sx&&Math.sign(p.y)===sy&&Math.abs(p.x)===50*strength&&Math.abs(p.y)===50*strength,'Consistent answers must reach every quadrant');
  }
  assert(A.filter(a=>Math.sign(a.x)===sx&&Math.sign(a.y)===sy).length>=8,'Each quadrant needs at least eight authors');
}
console.log(`PASS: ${Q.length} compass questions (${nx} x, ${ny} y); ${A.length} authors; every quadrant reachable with strong or mild answers.`);
