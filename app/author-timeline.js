(function (root) {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalise = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
  const eras = [
    {id:'ancient', es:'La Antigüedad', en:'Antiquity', min:-800, max:500, ticks:[-800,-400,1,400]},
    {id:'medieval', es:'Los siglos medievales', en:'The medieval centuries', min:500, max:1500, ticks:[500,750,1000,1250,1500]},
    {id:'early-modern', es:'Del Renacimiento al Barroco', en:'From Renaissance to Baroque', min:1400, max:1800, ticks:[1400,1500,1600,1700,1800]},
    {id:'modern', es:'La modernidad', en:'Modernity', min:1700, max:2000, ticks:[1700,1800,1900,2000]},
    {id:'undated', es:'Vidas sin fechas seguras', en:'Lives without secure dates'}
  ];
  function year(value, lang) { return value < 0 ? `${Math.abs(value)} ${lang === 'es' ? 'a. C.' : 'BCE'}` : String(value); }
  function date(value, lang) {
    if (!value) return '?';
    const prefix=value.approximate?'c. ':'';
    return prefix+(value.min===value.max?year(value.min,lang):`${year(value.min,lang)}–${year(value.max,lang)}`);
  }
  function eraOf(person) {
    if (!person.birth || !person.death) return 'undated';
    const birth=person.birth.min;
    return birth<500?'ancient':birth<1400?'medieval':birth<1700?'early-modern':'modern';
  }
  function authors(readings, biographies) {
    const records=new Map(biographies.map(p=>[p.author,p])), grouped=new Map();
    for (const work of readings) {
      if (!grouped.has(work.author)) grouped.set(work.author,{...records.get(work.author),author:work.author,works:[]});
      grouped.get(work.author).works.push(work);
    }
    return [...grouped.values()].sort((a,b)=>(a.birth?.min??Infinity)-(b.birth?.min??Infinity)||a.author.localeCompare(b.author));
  }
  function lifespan(person, lang) {
    return person.birth&&person.death?`${date(person.birth,lang)} — ${date(person.death,lang)}`:(lang==='es'?'Sin fechas biográficas seguras':'No secure biographical dates');
  }
  function plot(person, era) {
    const x=year=>Math.max(0,Math.min(1000,(year-era.min)/(era.max-era.min)*1000));
    const start=x(person.birth.min),end=x(person.death.max);
    const uncertain=person.birth.approximate||person.death.approximate;
    return `<svg class="life-bar" viewBox="-6 0 1012 34" preserveAspectRatio="none" aria-hidden="true">${era.ticks.map(t=>`<line class="life-grid" x1="${x(t)}" x2="${x(t)}" y1="0" y2="34"/>`).join('')}<line class="life-span${uncertain?' uncertain':''}" x1="${start}" x2="${end}" y1="17" y2="17"/><circle class="life-start" cx="${start}" cy="17" r="4"/><circle class="life-end" cx="${end}" cy="17" r="4"/></svg>`;
  }
  function row(person,era,lang) {
    const es=lang==='es',count=person.works.length,dates=lifespan(person,lang);
    const source=person.source||person.works[0].source;
    return `<details class="life-row" data-timeline-author="${escape(person.author)}"><summary><span class="life-person"><strong>${escape(person.author)}</strong><span>${escape(dates)}</span></span>${era.id==='undated'?'<span class="life-unplaced" aria-hidden="true">· · ·</span>':plot(person,era)}<span class="life-count">${count} ${es?(count===1?'lectura':'lecturas'):(count===1?'reading':'readings')} <span aria-hidden="true">＋</span></span></summary><div class="life-detail">${person['note_'+lang]?`<p>${escape(person['note_'+lang])}</p>`:''}<p class="life-source"><a href="${escape(source)}" target="_blank" rel="noopener noreferrer">${es?(person.source?'Fuente biográfica':'Fuente de la tradición'):(person.source?'Biographical source':'Tradition source')} ↗</a></p><ul>${person.works.map(w=>`<li><button class="text-button" data-book="${escape(w.id)}">${escape(es?(w.title_es||w.title):w.title)} ↗</button><span>${escape(w.year)}</span></li>`).join('')}</ul></div></details>`;
  }
  function results(readings,biographies,lang,query='',eraFilter='all') {
    const es=lang==='es',all=authors(readings,biographies),q=normalise(query.trim());
    const filtered=all.filter(p=>(!q||normalise(p.author).includes(q))&&(eraFilter==='all'||eraOf(p)===eraFilter));
    let html=`<p class="timeline-result-count" role="status">${filtered.length} / ${all.length} ${es?'autores de tu selección':'authors in your selection'}</p>`;
    if(!filtered.length)return html+`<p class="timeline-empty">${es?'No hay autores que coincidan. Prueba otro nombre o muestra todas las épocas.':'No matching authors. Try another name or show all periods.'}</p>`;
    for(const era of eras){
      const people=filtered.filter(p=>eraOf(p)===era.id);if(!people.length)continue;
      html+=`<section class="life-era" aria-labelledby="life-era-${era.id}"><div class="life-era-heading"><span class="tiny-title">${people.length} ${es?(people.length===1?'voz':'voces'):(people.length===1?'voice':'voices')}</span><h3 id="life-era-${era.id}">${era[lang]}</h3></div>`;
      if(era.id==='undated')html+=`<p class="life-uncertain-note">${es?'La colección también incluye autorías anónimas, colectivas o de biografía incierta. Permanecen aquí, sin inventar un nacimiento o una muerte.':'The collection also includes anonymous, collective or biographically uncertain authorship. These remain here without invented birth or death dates.'}</p>`;
      else html+=`<div class="life-axis" aria-hidden="true"><span></span><div>${era.ticks.map(t=>`<span style="left:${(t-era.min)/(era.max-era.min)*100}%">${year(t,lang)}</span>`).join('')}</div><span></span></div>`;
      html+=people.map(p=>row(p,era,lang)).join('')+'</section>';
    }
    return html;
  }
  function render(readings,biographies,lang,query='',eraFilter='all') {
    const es=lang==='es';
    return `<div class="timeline-heading"><p class="tiny-title">${es?'Después del mapa, el tiempo':'Beyond the map, time'}</p><h2 id="timeline-title">${es?'Las vidas detrás de las obras':'The lives behind the works'}</h2><p>${es?'Una línea de vida para cada autor: nacimiento, muerte y las voces que compartieron una época. Abre un nombre para encontrar sus lecturas.':'A lifeline for each author: birth, death and the voices that shared an age. Open a name to find their readings.'}</p></div><div class="timeline-legend"><span><i class="legend-life"></i>${es?'Nacimiento → muerte':'Birth → death'}</span><span><i class="legend-life approximate"></i>${es?'c. = fecha aproximada':'c. = approximate date'}</span></div><p class="timeline-method">${es?'Las escalas cambian entre épocas para poder leerlas; dentro de cada época, las distancias representan años. Aparecen todos los autores de los paquetes activos, independientemente del país seleccionado arriba.':'Scales change between periods for readability; within each period, distances represent years. All authors from enabled packages appear, regardless of the country selected above.'}</p><div class="timeline-controls"><label for="timeline-query">${es?'Buscar autor':'Find an author'}<input id="timeline-query" type="search" value="${escape(query)}" placeholder="${es?'Un nombre, una voz…':'A name, a voice…'}" autocomplete="off" aria-controls="timeline-results"></label><label for="timeline-era">${es?'Época de nacimiento':'Birth period'}<select id="timeline-era" aria-controls="timeline-results"><option value="all" ${eraFilter==='all'?'selected':''}>${es?'Todas las épocas':'All periods'}</option>${eras.map(e=>`<option value="${e.id}" ${eraFilter===e.id?'selected':''}>${e[lang]}</option>`).join('')}</select></label></div><div id="timeline-results">${results(readings,biographies,lang,query,eraFilter)}</div>`;
  }
  root.KatabasisTimeline={authors,eraOf,lifespan,results,render};
})(globalThis);
