const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readdirSync(path.join(root,'app')).filter(n=>/^katabasis-\d+\.txt$/.test(n)).sort().map(n=>fs.readFileSync(path.join(root,'app',n),'utf8')).join('');
const json=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const additions=JSON.parse(fs.readFileSync(path.join(root,'app/reading-package-additions.json')));
const extra=JSON.parse(html.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const aliases=JSON.parse(html.match(/const curatedReadingAliases=(\{[\s\S]*?\n\});/)[1]);
const packageIds=new Set(['mvp','renaissance-superpack','latin-american-romanticism',...json('packages-data').map(p=>p.id),...additions.packages.map(p=>p.id)]);
const merged=new Map([...json('anthology-data').filter(w=>!aliases[w.id]),...extra,...additions.works].map(w=>[w.id,w]));
const catalog=[...merged.values()].filter(w=>packageIds.has(w.package_id));
const lives=JSON.parse(fs.readFileSync(path.join(root,'app/author-lives.json'))).authors;
assert.equal(new Set(lives.map(p=>p.author)).size,lives.length,'One biography per author');
for(const author of new Set(catalog.map(w=>w.author)))assert(lives.some(p=>p.author===author),'Missing biography record: '+author);
for(const p of lives){
  if(p.birth&&p.death){
    assert(p.source?.startsWith('https://www.wikidata.org/wiki/Q'),'Missing source: '+p.author);
    for(const d of [p.birth,p.death])assert(Number.isInteger(d.min)&&Number.isInteger(d.max)&&d.min<=d.max&&d.min!==0&&d.max!==0,'Invalid years: '+p.author);
    assert(p.birth.max<=p.death.max,'Life reversed: '+p.author);
  }else assert(p.note_es&&p.note_en,'Uncertain authors need an explanation: '+p.author);
}
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'app/author-timeline.js'),'utf8'),context);
const timeline=context.KatabasisTimeline;
const people=timeline.authors(catalog,lives);
assert.equal(people.length,new Set(catalog.map(w=>w.author)).size);
assert.equal(people.reduce((n,p)=>n+p.works.length,0),catalog.length);
assert.equal(timeline.authors(catalog.filter(w=>w.package_id==='mvp'),lives).length,new Set(catalog.filter(w=>w.package_id==='mvp').map(w=>w.author)).size);
const shakespeare=people.find(p=>p.author==='William Shakespeare');
assert.equal(shakespeare.birth.min,1564);assert.equal(shakespeare.death.max,1616);assert.equal(shakespeare.works.length,6);
assert.equal(timeline.lifespan(shakespeare,'es'),'1564 — 1616','Calendar qualifiers do not make years approximate');
assert.equal(timeline.lifespan(people.find(p=>p.author==='Leo Tolstoy'),'es'),'1828 — 1910');
assert.equal(people.find(p=>p.author.startsWith('Hernando Alvarado')).birth.max,1525,'A century-precision claim is not a second birth year');
for(const language of ['es','en']){
  // The timeline opens on a single period; the dropdown lists every period in order, with its years.
  const all=timeline.render(catalog,lives,language);
  const first=timeline.eras.find(e=>people.some(p=>timeline.eraOf(p)===e.id));
  assert.equal((all.match(/data-timeline-author=/g)||[]).length,people.filter(p=>timeline.eraOf(p)===first.id).length,'Only the first period is open');
  assert(all.includes('timeline-query')&&all.includes('timeline-era'));
  const options=[...all.matchAll(/<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g)];
  assert.equal(options.map(o=>o[1]).join(),timeline.eras.map(e=>e.id).join(),'Periods listed in chronological order, no catch-all');
  for(const [,id,text] of options)if(id!=='undated')assert(/\d{3,4}.*–.*\d{3,4}/.test(text),'Period label carries its years: '+text);
  assert(timeline.eras.filter(e=>e.from!==undefined).every((e,i,a)=>!i||a[i-1].to===e.from),'Periods are contiguous');
  // Across the periods, every author appears exactly once and every reading is reachable.
  const shown=timeline.eras.map(e=>timeline.results(catalog,lives,language,'',e.id)).join('');
  assert.equal((shown.match(/data-timeline-author=/g)||[]).length,people.length);
  for(const w of catalog)assert(shown.includes('data-book="'+w.id+'"'),'Reading absent from timeline: '+w.id);
  assert(timeline.results(catalog,lives,language,'cervantes','ancient').includes('pkg-cervantes'),'A search spans every period');
  const match=timeline.results(catalog,lives,language,'  CERVANTES  ');
  assert.equal((match.match(/data-timeline-author=/g)||[]).length,1);
  assert(match.includes('pkg-cervantes'));
  assert(timeline.results(catalog,lives,language,'becquer').includes('Gustavo Adolfo'));
  assert.equal((timeline.results(catalog,lives,language,'author-does-not-exist').match(/data-timeline-author=/g)||[]).length,0);
  const ancient=timeline.results(catalog,lives,language,'','ancient');
  assert(ancient.includes('Virgil')&&!ancient.includes('William Shakespeare'));
  const unknown=timeline.results(catalog,lives,language,'','undated');
  assert(unknown.includes('Homer')&&unknown.includes('Psalms'));
  const malicious=timeline.results([{id:'unsafe',author:'<script>alert(1)</script>',title:'<img onerror=x>',year:'1',source:'https://example.com'}],[],language);
  assert(!malicious.includes('<script>')&&!malicious.includes('<img onerror'));
}
// The loader must compile and place the timeline beneath the atlas results.
const loader=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const script of loader.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
assert(html.indexOf('class="author-timeline"')>html.indexOf('class="catalog-results" id="catalog-results"'));
console.log(`PASS: ${people.length} authors, ${catalog.length} readings; lifespan sources, search, periods, ES/EN and package filtering.`);
