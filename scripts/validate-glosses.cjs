const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readdirSync(path.join(root,'app')).filter(n=>/^katabasis-\d+\.txt$/.test(n)).sort().map(n=>fs.readFileSync(path.join(root,'app',n),'utf8')).join('');
const json=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)</script>'))[1]);
const additions=JSON.parse(fs.readFileSync(path.join(root,'app/reading-package-additions.json')));
const extra=JSON.parse(html.match(/const katabasisNewReadings=(\[[\s\S]*?\n\]);/)[1]);
const aliases=JSON.parse(html.match(/const curatedReadingAliases=(\{[\s\S]*?\n\});/)[1]);
const works=[...new Map([...json('anthology-data').filter(w=>!aliases[w.id]),...extra,...additions.works].map(w=>[w.id,w])).values()];
const lexicon=JSON.parse(fs.readFileSync(path.join(root,'app/gloss-lexicon.json'),'utf8'));
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'app/gloss.js'),'utf8'),context);
const gloss=context.KatabasisGloss;

// Every word of every original carries a literal gloss in each reader language it can be read against.
const used=new Map();
for(const w of works){
  assert(gloss.available(w.lang,lexicon),'No glosses for language: '+w.lang+' ('+w.id+')');
  if(!used.has(w.lang))used.set(w.lang,new Set());
  for(const row of w.segments)for(const s of row){
    for(const k of gloss.keys(s.original,w.lang)){
      used.get(w.lang).add(k);
      const entry=lexicon[w.lang][k];
      for(const target of gloss.targets(w.lang))assert(entry&&entry[target==='es'?0:1],'Missing '+target+' gloss for "'+k+'" in '+w.id);
    }
    for(const target of gloss.targets(w.lang)){
      const out=gloss.render(s.original,w.lang,lexicon,target);
      for(const [,word,meaning] of out.matchAll(/<span class="gl-w">(.*?)<\/span><span class="gl-t"[^>]*>(.*?)<\/span>/g))
        if(/\p{L}/u.test(word.replace(/&[a-z]+;|&#\d+;/g,'')))assert.notEqual(meaning,'&#8203;','Word left without a gloss in '+w.id+': '+word);
      assert.equal(out.replace(/<span class="gl-t"[^>]*>.*?<\/span>/g,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'"),s.original,'Glossing keeps the original text intact: '+w.id);
    }
  }
}
// The lexicon holds only what the readings use, so it does not grow stale.
for(const [language,entries] of Object.entries(lexicon)){
  assert(used.has(language),'Glosses for a language no reading uses: '+language);
  for(const k of Object.keys(entries))assert(used.get(language).has(k),'Unused gloss "'+k+'" in '+language);
}
// Tokenising rules for scripts that do not separate words with spaces.
assert.equal(gloss.keys('學而時習之','zh').join(),'學,而,時,習,之','Chinese is glossed character by character');
assert.equal(gloss.keys('ወይቤሎ፡እግዚአብሔር፡','gez').join(),'ወይቤሎ,እግዚአብሔር','Geʽez splits on its word divider');
assert.equal(gloss.key('בְּרֵאשִׁ֖ית'),'בְּרֵאשִׁית','Hebrew cantillation does not change the lookup');
assert.equal(gloss.targets('es').join(),'en');assert.equal(gloss.targets('en').join(),'es');assert.equal(gloss.targets('la').join(),'es,en');
const unsafe=gloss.render('<img onerror=x>',"la",{la:{img:['<b>','<i>']}},'es');
assert(!unsafe.includes('<img')&&!unsafe.includes('<b>'),'Originals and glosses are escaped');
// The loader ships the lexicon and the renderer with the page.
const loader=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const file of ['app/gloss-lexicon.json','app/gloss.js','app/extras.css'])assert(loader.includes("'"+file+"'"),'Loader misses '+file);
console.log('Glosses: '+works.length+' readings, '+Object.keys(lexicon).length+' languages, '+Object.values(lexicon).reduce((n,e)=>n+Object.keys(e).length,0)+' entries checked.');
