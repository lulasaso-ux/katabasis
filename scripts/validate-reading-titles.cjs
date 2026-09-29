const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readdirSync(path.join(root,'app')).filter(n=>/^katabasis-\d+\.txt$/.test(n)).sort().map(n=>fs.readFileSync(path.join(root,'app',n),'utf8')).join('');
const json=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const additions=JSON.parse(fs.readFileSync(path.join(root,'app/reading-package-additions.json')));
const extra=JSON.parse(html.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const aliases=JSON.parse(html.match(/const curatedReadingAliases=(\{[\s\S]*?\n\});/)[1]);
const works=[...new Map([...json('anthology-data').filter(w=>!aliases[w.id]),...extra,...additions.works].map(w=>[w.id,w])).values()];
const titles=JSON.parse(fs.readFileSync(path.join(root,'app/reading-titles.json'),'utf8')).readings;

// Every reading records its text name and its title: a poem's own title, or the book a fragment comes from.
for(const w of works){
  const t=titles[w.id];
  assert(t,'No title record for '+w.id);
  assert(['poem','complete','fragment','letter'].includes(t.type),'Unknown type for '+w.id+': '+t.type);
  for(const k of ['name_es','name_en','title_es','title_en'])assert(typeof t[k]==='string'&&t[k].trim(),'Missing '+k+' for '+w.id);
  if(t.type==='poem'||t.type==='complete'){
    assert.equal(t.name_es,t.title_es,'A poem is named by its title: '+w.id);
    assert.equal(t.name_en,t.title_en,'A poem is named by its title: '+w.id);
  }
  if(t.type==='fragment'||t.type==='letter'){
    assert.equal(t.name_es,w.title_es||w.title,'A fragment keeps the app’s name: '+w.id);
    assert.equal(t.name_en,w.title,'A fragment keeps the app’s name: '+w.id);
  }
}
for(const id of Object.keys(titles))assert(works.some(w=>w.id===id),'Title record for an unknown reading: '+id);
// The loader ships the titles, the app names readings from them, and shared images use the title.
const loader=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(loader.includes("'app/reading-titles.json'")&&loader.includes('id="reading-titles"'),'Loader misses app/reading-titles.json');
assert(html.includes('const bookTitleOf='),'The app has no title lookup');
assert(fs.readFileSync(path.join(root,'app/share.js'),'utf8').includes('bookTitleOf(w)'),'Shared images do not use the title');
const count=type=>Object.values(titles).filter(t=>t.type===type).length;
console.log(`PASS: ${works.length} readings titled · ${count('poem')} poems, ${count('complete')} complete texts, ${count('fragment')} fragments, ${count('letter')} letters.`);
