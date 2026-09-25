// Checks app/official-translations.json: every block range covers its reading exactly once,
// and every translation carries its translator, dates and source within the public-domain rule
// (published before 1930, translator dead before 1946).
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readdirSync(path.join(root,'app')).filter(n=>/^katabasis-\d+\.txt$/.test(n)).sort().map(n=>fs.readFileSync(path.join(root,'app',n),'utf8')).join('');
const json=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const additions=JSON.parse(fs.readFileSync(path.join(root,'app/reading-package-additions.json')));
const extra=JSON.parse(html.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const aliases=JSON.parse(html.match(/const curatedReadingAliases=(\{[\s\S]*?\n\});/)[1]);
const works=new Map([...json('anthology-data').filter(w=>!aliases[w.id]),...extra,...additions.works].map(w=>[w.id,w]));
const official=JSON.parse(fs.readFileSync(path.join(root,'app/official-translations.json'),'utf8'));
let n=0,es=0,en=0;
for(const [id,langs] of Object.entries(official)){
  const w=works.get(id);assert(w,'Unknown reading: '+id);
  for(const [lang,t] of Object.entries(langs)){
    assert(['es','en'].includes(lang),'Language must be es or en: '+id);
    assert.notEqual(lang,w.lang,'An official translation cannot be in the original language: '+id);
    for(const k of ['translator','translator_life','year','edition','source'])assert(typeof t[k]==='string'&&t[k].trim(),`Missing ${k}: ${id}.${lang}`);
    assert(/^https:\/\//.test(t.source),'Source must be a link: '+id);
    const years=t.year.match(/\d{3,4}/g);assert(years&&Math.max(...years.map(Number))<1930,'Published 1930 or later: '+id+'.'+lang);
    const life=t.translator_life.match(/\d{3,4}/g);if(life&&/[–-]/.test(t.translator_life))assert(Number(life.at(-1))<1946,'Translator died 1946 or later: '+id+'.'+lang);
    let next=0;
    for(const b of t.blocks){
      assert(Array.isArray(b.rows)&&b.rows[0]===next&&b.rows[1]>=b.rows[0],`Blocks must be contiguous: ${id}.${lang} at row ${next}`);
      assert(typeof b.text==='string'&&b.text.trim(),`Empty block: ${id}.${lang}`);
      next=b.rows[1]+1;
    }
    assert.equal(next,w.segments.length,`Blocks must cover every row: ${id}.${lang}`);
    n++;if(lang==='es')es++;else en++;
  }
}
console.log(`PASS: ${Object.keys(official).length} readings with official translations (${en} EN, ${es} ES); rows fully covered; published before 1930 and translators dead before 1946.`);
