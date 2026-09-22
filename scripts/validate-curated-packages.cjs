// Run: node scripts/validate-curated-packages.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const html = fs.readdirSync(path.join(root, 'app'))
  .filter(n => /^katabasis-\d+\.txt$/.test(n)).sort()
  .map(n => fs.readFileSync(path.join(root, 'app', n), 'utf8')).join('');
const data = {};
let main;
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (match[1].includes('application/json')) {
    data[match[1].match(/id="([^"]+)"/)[1]] = JSON.parse(match[2]);
  } else {
    new vm.Script(match[2]);
    if (match[2].includes('const katabasisNewReadings=')) main = match[2];
  }
}
const read = JSON.parse(main.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const art = JSON.parse(main.match(/const katabasisNewPaintings=(\[[\s\S]*?\n\]);/)[1]);
const extraPackages = vm.runInNewContext('['+main.match(/packages\.push\(([\s\S]*?)\n\);/)[1]+']');
const aliases=JSON.parse(main.match(/const curatedReadingAliases=(\{[\s\S]*?\n\});/)[1]);
const works=data['anthology-data'].filter(w=>!aliases[w.id]);
for(const reading of read){
  const index=works.findIndex(w=>w.id===reading.id);
  if(index===-1)works.push(reading);else works[index]=reading;
}
const paintings = [...data['paintings-data'], ...art];
const packages = [...data['packages-data'], ...extraPackages];
const geography=data['geography-data'];
const catalog=works.filter(w=>w.package_id==='mvp'||packages.some(p=>p.id===w.package_id));
assert.equal(new Set(geography.groups.map(g=>g.id)).size, geography.groups.length, 'Duplicate map region');
for(const w of catalog){
  const group=geography.groups.find(g=>g.id===w.region);
  assert(group, 'Missing map region for '+w.id+': '+w.region);
  assert(group.es && group.en, 'Missing map translation for '+w.region);
  if(!group.historical)assert(geography.countries.some(c=>c.id===w.region && c.d), 'Missing country shape for '+w.id);
}
assert.equal(geography.groups.reduce((n,g)=>n+catalog.filter(w=>w.region===g.id).length,0),catalog.length,'Map must count each reading once');
// Exercise the actual catalog renderer for every new reading and author.
const resultsRenderer=main.slice(main.indexOf('function renderCatalogResults(){'),main.indexOf('function selectRegion('));
const resultElement={innerHTML:''};
const context={activeWorks:()=>catalog,geography,selectedRegion:'all',lang:'es',
  $:()=>resultElement,esc:s=>String(s),regionName:g=>g.es,
  readingCount:n=>String(n),authorCount:n=>String(n),titleOf:w=>w.title_es||w.title,
  kindOf:w=>w.kind,minutes:()=>'',languageOf:w=>w.lang,scopeOf:w=>w.scope_es||w.scope};
vm.createContext(context);
vm.runInContext(resultsRenderer,context);
for(const w of read){
  context.selectedRegion=w.region;
  vm.runInContext('renderCatalogResults()',context);
  assert(resultElement.innerHTML.includes('data-book="'+w.id+'"'), 'Reading missing from country results: '+w.id);
  assert(resultElement.innerHTML.includes(w.author), 'Author missing from country results: '+w.author);
}
for (const list of [works, paintings, packages]) {
  assert.equal(new Set(list.map(x=>x.id)).size, list.length, 'Duplicate ID');
}
for (const [id, expectedReadings, expectedArt] of [
  ['renaissance-superpack', 12, 6], ['latin-american-romanticism', 6, 3]
]) {
  assert.equal(works.filter(w=>w.package_id===id).length, expectedReadings);
  assert.equal(paintings.filter(w=>w.package_id===id).length, expectedArt);
  assert(paintings.some(a=>a.id===packages.find(p=>p.id===id).cover_id && a.package_id===id));
}
const expectedLines = {
  'ren-michelangelo-sonnet':14, 'ren-camoes-fire':14, 'ren-shakespeare-73':14,
  'ren-wyatt-hunt':14, 'ren-spenser-name':14, 'ren-dubellay-ulysse':14,
  'ren-ronsard-rose':18, 'ren-san-juan-night':40, 'latrom-avellaneda-partir':14,
  'ren-ariosto-opening':16, 'pkg-latam-romantic-heredia-teocalli':23,
  'pkg-latam-romantic-acuna-nocturno':10
};
let maxMinutes=0;
const normalise=s=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const original=w=>normalise(w.segments.flat().map(s=>s.original).join(' '));
const grams=s=>{const words=s.split(' '),g=new Set();for(let i=0;i<=words.length-5;i++)g.add(words.slice(i,i+5).join(' '));return g};
// Compare originals across the entire effective catalog, including inactive packages.
// This catches a renamed title and short extracts of an existing complete work.
for(const w of read){
  for(const other of works){
    if(other.id===w.id)continue;
    const a=grams(original(w)),b=grams(original(other));
    if(!a.size||!b.size)continue;
    const shared=[...a].filter(g=>b.has(g)).length/Math.min(a.size,b.size);
    assert(shared<0.55, 'Potential duplicated passage: '+w.id+' / '+other.id);
  }
}
assert.equal(works.filter(w=>/shall i compare thee/.test(original(w))).length,1,'Sonnet 18 must occur only once');
assert.equal(works.find(w=>w.id==='shakespeare18').package_id,'mvp');
for(const target of Object.values(aliases))assert(works.some(w=>w.id===target),'Favourite alias must resolve');
for(const a of art){
  const normTitle=normalise(a.title_es);
  for(const other of paintings){
    if(other.id===a.id)continue;
    assert.notEqual(normalise(other.title_es),normTitle,'Duplicate artwork title');
    assert.notEqual(other.image,a.image,'Duplicate artwork bytes');
  }
}
for (const w of read) {
  assert(w.source.startsWith('https://'));
  assert(w.note && w.note_es && w.scope && w.scope_es);
  if (expectedLines[w.id]) assert.equal(w.segments.filter(r=>r.some(s=>s.original.trim())).length,expectedLines[w.id],w.id);
  for (const segment of w.segments.flat()) {
    for (const l of ['original','es','en']) assert.equal(typeof segment[l], 'string');
    if (['es','en'].includes(w.lang)) assert.equal(segment[w.lang], segment.original, 'Original language must not be paraphrased');
    assert(!segment.original.includes(' / '), 'Poetry should use separate verse rows');
  }
  for (const l of ['es','en']) {
    const words = w.segments.flat().map(s=>s[l]).join(' ').trim().split(/\s+/).filter(Boolean).length;
    assert.equal(w['reading_words_'+l], words, w.id+' word count');
    assert(words <= 1900, w.id+' exceeds ten minutes');
    maxMinutes=Math.max(maxMinutes,Math.ceil(words/190));
  }
}
for (const a of art) {
  assert(a.image.startsWith('data:image/jpeg;base64,'), 'New art must be embedded for offline use');
  const bytes=Buffer.from(a.image.split(',')[1],'base64');
  assert(bytes.length>1000 && bytes[0]===255 && bytes[1]===216, 'Invalid JPEG '+a.id);
  assert(a.source_url.startsWith('https://commons.wikimedia.org/wiki/File:'));
  assert(a.rights && a.rights_policy_url);
}
console.log(`PASS: ${read.length} readings; ${art.length} embedded artworks; maximum ${maxMinutes} min in ES/EN.`);
console.log(`Catalog totals: ${works.length} readings, ${paintings.length} artworks, ${packages.length} optional packages.`);
