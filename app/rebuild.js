// Learn · Rebuild. The exercise Benjamin Franklin describes in his Autobiography: he read essays of
// The Spectator, jotted short hints of what each part said, laid the book aside, wrote the pieces
// again from those hints in his own words, and then compared his version with the original to
// find and correct his faults. Here the reader chooses how many readings (1 to 10), reads them
// with room for their own milestones, rebuilds each from memory, and then sees theirs beside the
// original and notes where they ran long, rushed or lost the thread. Everything can be kept in
// the notebook, as notes of the source «Reconstrucción».
(() => {
  const L = (es, en) => (lang === 'es' ? es : en);
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const RECENT_KEY = 'katabasis-rebuild-recent-v1';
  let st = { phase: 'setup', n: 3, i: 0, items: [], saved: false };

  // ---- texts ------------------------------------------------------------------------------------
  const side = w => (w.lang === lang ? 'original' : lang);
  const rowsOf = w => w.segments.map(r => r.map(s => s[side(w)]).join('').replace(/[ \t]+/g, ' ').trim()).filter(Boolean);
  const textOfW = w => rowsOf(w).join('\n');
  const words = t => (String(t).toLowerCase().match(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu) || []);
  function recent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } }
  function remember(ids) { try { localStorage.setItem(RECENT_KEY, JSON.stringify([...ids, ...recent().filter(x => !ids.includes(x))].slice(0, 80))); } catch (e) {} }
  // Readings short enough to hold in mind after one reading, long enough to have a shape.
  function pick(n) {
    const all = (typeof activeWorks === 'function' ? activeWorks() : works).filter(w => { const k = words(textOfW(w)).length; return k >= 60 && k <= 450; });
    const seen = new Set(recent()), fresh = all.filter(w => !seen.has(w.id)), pool = (fresh.length >= n ? fresh : all).slice();
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, n);
  }
  const titleW = w => (typeof bookTitleOf === 'function' ? bookTitleOf(w) : titleOf(w));
  const authorW = w => w.author.split(' · ')[0];

  // ---- comparing --------------------------------------------------------------------------------
  const STOP = new Set(('para pero como cuando este esta estos estas aquel aquella entre desde hasta porque donde también todo toda todos todas '
    + 'sobre tiene tienen había hace eran fueron será sino ante bajo tras cada otro otra otros otras mismo misma muy más menos nada algo '
    + 'that with from this have were what your they there their which would these those them then than when where while into upon '
    + 'shall will been being does each some such only also very just more most other over under about after before').split(' '));
  const keyword = x => x.length >= 4 && !STOP.has(x);
  // How the rebuilt version compares: length against the original, and which of the original's
  // own words it kept (and which it lost) — a rough measure of what stayed in memory.
  function compare(mine, theirs) {
    const a = words(mine), b = words(theirs), kb = [...new Set(b.filter(keyword))], ka = new Set(a.filter(keyword));
    const kept = kb.filter(x => ka.has(x)), lost = kb.filter(x => !ka.has(x));
    return { mineWords: a.length, theirWords: b.length, kept, lost };
  }
  const mark = (text, set) => escH(text).replace(/[\p{L}\p{M}]+(?:(?:['’]|&#39;)[\p{L}\p{M}]+)*/gu, m => set.has(m.toLowerCase().replace(/&#39;/g, "'")) ? `<mark class="lines-match">${m}</mark>` : m);

  // ---- flow -------------------------------------------------------------------------------------
  function begin(n) {
    const list = pick(n);
    st = { phase: list.length ? 'read' : 'empty', n: list.length, i: 0, items: list.map(w => ({ w, marks: '', mine: '', audit: '' })), saved: false, started: Date.now() };
  }
  const item = () => st.items[st.i];

  // ---- views ------------------------------------------------------------------------------------
  const bar = () => `<div class="learn-bar"><button class="learn-back" data-learn-back>← ${L('Aprender', 'Learn')}</button><span>${L('Reconstruir', 'Rebuild')}</span></div>`;
  const steps = () => `<ol class="rebuild-steps">${[['read', L('Leer', 'Read')], ['rebuild', L('De memoria', 'From memory')], ['compare', L('Comparar', 'Compare')]].map(([k, t], j) => `<li class="${st.phase === k ? 'on' : ''}"><span>${j + 1}</span>${t}</li>`).join('')}</ol>`;
  const head = (kicker, title) => `<div class="lines-head">${steps()}<p class="tiny-title">${kicker}</p><h2 id="workshop-title" tabindex="-1">${title}</h2></div>`;
  const counter = () => (st.n > 1 ? L(`Lectura ${st.i + 1} de ${st.n}`, `Reading ${st.i + 1} of ${st.n}`) : L('Una lectura', 'One reading'));
  function setup() {
    const opts = Array.from({ length: 10 }, (_, k) => k + 1).map(n => `<button type="button" class="lines-rounds rebuild-n" data-rebuild-start="${n}"><strong>${n}</strong><span>${n === 1 ? L('lectura', 'reading') : L('lecturas', 'readings')}</span></button>`).join('');
    return `${bar()}<div class="lines-setup"><h2 id="workshop-title" tabindex="-1">${L('Reconstruir', 'Rebuild')}</h2>
      <p>${L('Benjamin Franklin cuenta en su Autobiografía cómo aprendió a escribir: leía un ensayo de The Spectator, apuntaba en pocas palabras lo que decía cada parte, cerraba el libro y días después lo volvía a escribir con sus propias palabras; luego lo comparaba con el original para descubrir sus fallas y corregirlas.', 'In his Autobiography Benjamin Franklin tells how he learned to write: he read an essay from The Spectator, jotted in a few words what each part said, put the book away and days later wrote it again in his own words; then he compared it with the original to find his faults and correct them.')}</p>
      <ol class="rebuild-how"><li><strong>${L('Leer.', 'Read.')}</strong> ${L('Lee con calma y, si quieres, anota los hitos: qué pasa, dónde cambia el tono, dónde sube la tensión. Sin copiar frases.', 'Read calmly and, if you like, note the milestones: what happens, where the tone shifts, where the tension rises. No copying sentences.')}</li>
        <li><strong>${L('De memoria.', 'From memory.')}</strong> ${L('Con el libro cerrado, vuelve a escribir cada lectura con tus palabras, de hito en hito. Si olvidas un tramo, invéntale el puente.', 'With the book closed, write each reading again in your own words, milestone to milestone. If you forget a stretch, invent the bridge.')}</li>
        <li><strong>${L('Comparar.', 'Compare.')}</strong> ${L('Pon tu versión junto al original: dónde te alargaste, dónde te apuraste, qué se perdió. Todo puede quedar en tu cuaderno.', 'Put your version beside the original: where you ran long, where you rushed, what was lost. All of it can stay in your notebook.')}</li></ol>
      <h3>${L('¿Cuántas lecturas?', 'How many readings?')}</h3><div class="lines-round-grid rebuild-grid">${opts}</div>
      <p class="lines-private">${L('Se eligen lecturas breves de tus paquetes activos. Lo que escribes no se envía a ningún sitio.', 'Short readings are chosen from your active packages. What you write is not sent anywhere.')}</p></div>`;
  }
  function read() {
    const it = item(), w = it.w, verse = w.kind === 'Poem';
    const last = st.i === st.n - 1;
    return `${bar()}<div class="lines-play">${head(`${counter()} · ${typeof minutes === 'function' ? L('unos ', 'about ') + minutes(w) : ''}`, escH(titleOf(w)))}
      <p class="rebuild-cite">${escH(authorW(w))} · <em>${escH(titleW(w))}</em></p>
      <div class="lines-sheet lines-read rebuild-text ${verse ? 'verse' : ''}" lang="${lang}">${escH(textOfW(w))}</div>
      <label class="rebuild-label" for="rebuild-marks">${L('Tus hitos (opcional)', 'Your milestones (optional)')}</label>
      <textarea id="rebuild-marks" class="lines-text rebuild-marks" data-rebuild-field="marks" rows="3" placeholder="${L('1. … 2. … 3. … — qué pasa, dónde gira, cómo termina', '1. … 2. … 3. … — what happens, where it turns, how it ends')}">${escH(it.marks)}</textarea>
      <div class="lines-actions">${st.i > 0 ? `<button type="button" class="secondary" data-rebuild-prev>← ${L('Anterior', 'Previous')}</button>` : ''}
        <button type="button" class="book-btn" data-rebuild-next>${last ? L('Cerrar los libros →', 'Close the books →') : L('Siguiente lectura →', 'Next reading →')}</button></div></div>`;
  }
  function rebuild() {
    const it = item(), w = it.w, last = st.i === st.n - 1;
    return `${bar()}<div class="lines-play">${head(counter(), L('Escríbela de memoria', 'Write it from memory'))}
      <p class="rebuild-cite">${escH(authorW(w))} · <em>${escH(titleOf(w))}</em> · ${L(`${words(textOfW(w)).length} palabras en el original`, `${words(textOfW(w)).length} words in the original`)}</p>
      ${it.marks.trim() ? `<div class="rebuild-marks-view"><span>${L('Tus hitos', 'Your milestones')}</span><p>${escH(it.marks.trim())}</p></div>` : ''}
      <textarea class="lines-text rebuild-mine" data-rebuild-field="mine" rows="10" aria-label="${L('Tu versión, de memoria', 'Your version, from memory')}" placeholder="${L('Con tus palabras, de hito en hito…', 'In your own words, milestone to milestone…')}">${escH(it.mine)}</textarea>
      <div class="lines-actions">${st.i > 0 ? `<button type="button" class="secondary" data-rebuild-prev>← ${L('Anterior', 'Previous')}</button>` : ''}
        <button type="button" class="book-btn" data-rebuild-next>${last ? L('Abrir los libros y comparar →', 'Open the books and compare →') : L('Siguiente →', 'Next →')}</button></div></div>`;
  }
  function comparison() {
    const it = item(), w = it.w, theirs = textOfW(w), c = compare(it.mine, theirs), set = new Set(c.kept), last = st.i === st.n - 1;
    const ratio = c.theirWords ? Math.round((c.mineWords / c.theirWords - 1) * 100) : 0;
    const length = !c.mineWords ? L('No escribiste nada para esta lectura.', 'You wrote nothing for this reading.')
      : Math.abs(ratio) < 10 ? L(`Tu versión tiene casi la misma extensión que el original (${c.mineWords} y ${c.theirWords} palabras).`, `Your version is almost as long as the original (${c.mineWords} and ${c.theirWords} words).`)
      : ratio > 0 ? L(`Tu versión es un ${ratio} % más larga que el original (${c.mineWords} y ${c.theirWords} palabras): ¿dónde te extendiste?`, `Your version is ${ratio}% longer than the original (${c.mineWords} and ${c.theirWords} words): where did you run on?`)
      : L(`Tu versión es un ${-ratio} % más corta que el original (${c.mineWords} y ${c.theirWords} palabras): ¿qué te saltaste o apuraste?`, `Your version is ${-ratio}% shorter than the original (${c.mineWords} and ${c.theirWords} words): what did you skip or rush?`);
    const keptShare = c.kept.length + c.lost.length ? Math.round(100 * c.kept.length / (c.kept.length + c.lost.length)) : 0;
    return `${bar()}<div class="lines-play">${head(counter(), L('Tu versión y el original', 'Your version and the original'))}
      <div class="lines-compare"><section><h3>${L('De memoria', 'From memory')}</h3><div class="lines-sheet lines-read rebuild-text">${it.mine.trim() ? mark(it.mine.trim(), set) : `<em>${L('(vacío)', '(empty)')}</em>`}</div></section>
        <section><h3>${escH(authorW(w))} · <em>${escH(titleOf(w))}</em></h3><div class="lines-sheet lines-read rebuild-text ${w.kind === 'Poem' ? 'verse' : ''}" lang="${lang}">${mark(theirs, set)}</div>
        <p class="lines-source"><button type="button" class="text-button" data-rebuild-open="${escH(w.id)}">${L('Abrir en el libro ↗', 'Open in the book ↗')}</button></p></section></div>
      <ul class="rebuild-facts"><li>${length}</li>${c.mineWords ? `<li>${L(`Conservaste ${c.kept.length} de las ${c.kept.length + c.lost.length} palabras con peso del original (${keptShare} %), marcadas en ambos textos.`, `You kept ${c.kept.length} of the original's ${c.kept.length + c.lost.length} weighty words (${keptShare}%), marked in both texts.`)}</li>` : ''}</ul>
      <label class="rebuild-label" for="rebuild-audit">${L('¿Dónde te alargaste, dónde te apuraste, qué se perdió?', 'Where did you run long, where did you rush, what was lost?')}</label>
      <textarea id="rebuild-audit" class="lines-text" data-rebuild-field="audit" rows="4" placeholder="${L('Lo que aprendes al comparar…', 'What you learn by comparing…')}">${escH(it.audit)}</textarea>
      <div class="lines-actions">${st.i > 0 ? `<button type="button" class="secondary" data-rebuild-prev>← ${L('Anterior', 'Previous')}</button>` : ''}
        ${last ? `<button type="button" class="book-btn" data-rebuild-save>${typeof KatabasisNotebook !== 'undefined' ? L('Guardar en el cuaderno y terminar', 'Save to the notebook and finish') : L('Terminar', 'Finish')}</button><button type="button" class="secondary" data-rebuild-finish>${L('Terminar sin guardar', 'Finish without saving')}</button>`
          : `<button type="button" class="book-btn" data-rebuild-next>${L('Siguiente →', 'Next →')}</button>`}</div></div>`;
  }
  function done() {
    const list = st.items.map(it => `<li>${escH(authorW(it.w))} · <em>${escH(titleOf(it.w))}</em>${it.mine.trim() ? '' : ` <span class="rebuild-skip">${L('(sin reconstruir)', '(not rebuilt)')}</span>`}</li>`).join('');
    return `${bar()}<div class="lines-setup"><h2 id="workshop-title" tabindex="-1">${L('Terminado', 'Done')}</h2>
      <p>${st.saved ? L('Tus reconstrucciones, tus hitos y tus notas quedaron en el cuaderno, en cada lectura, marcados como «Reconstrucción».', 'Your rebuilds, milestones and notes are in the notebook, on each reading, marked “Rebuild”.') : L('No se guardó nada en el cuaderno.', 'Nothing was saved to the notebook.')}</p>
      <ol class="lines-log">${list}</ol>
      <div class="lines-actions"><button type="button" class="book-btn" data-rebuild-start="${st.n}">${L('Otra vez, con otras lecturas', 'Again, with other readings')}</button>${st.saved ? `<button type="button" class="secondary" data-rebuild-notebook>${L('Ver el cuaderno', 'See the notebook')}</button>` : ''}<button type="button" class="secondary" data-rebuild-setup>${L('Cambiar el número de lecturas', 'Change the number of readings')}</button></div></div>`;
  }
  function empty() {
    return `${bar()}<div class="lines-setup"><h2 id="workshop-title" tabindex="-1">${L('Reconstruir', 'Rebuild')}</h2><p>${L('No hay lecturas breves en tus paquetes activos. Activa algún paquete y vuelve a intentarlo.', 'There are no short readings in your active packages. Enable a package and try again.')}</p>
      <div class="lines-actions"><button type="button" class="secondary" data-rebuild-setup>${L('Volver', 'Back')}</button></div></div>`;
  }
  function render(el) {
    el.className = 'workshop-view lines-view rebuild-view';
    const v = { read, rebuild, compare: comparison, done, empty }[st.phase] || setup;
    el.innerHTML = `<div class="learn-detail">${v()}</div>`;
    el.querySelectorAll('textarea').forEach(grow);
    el.scrollTop = 0;
  }
  function grow(t) { t.style.height = 'auto'; t.style.height = Math.max(t.scrollHeight, t.classList.contains('rebuild-mine') ? 240 : 90) + 'px'; }
  const view = () => document.getElementById('workshop-view');
  const refresh = focus => { const el = view(); if (!el) return; render(el); const f = focus && el.querySelector(focus); (f || el.querySelector('#workshop-title'))?.focus({ preventScroll: true }); };
  function save() {
    if (typeof KatabasisNotebook === 'undefined') return false;
    let n = 0;
    for (const it of st.items) {
      if (!it.mine.trim() && !it.audit.trim() && !it.marks.trim()) continue;
      if (KatabasisNotebook.add({ ref: 'reading:' + it.w.id, source: 'rebuild', text: it.audit.trim(), mine: it.mine.trim(), marks: it.marks.trim() })) n++;
    }
    return n > 0;
  }

  document.addEventListener('input', e => {
    const t = e.target.closest && e.target.closest('[data-rebuild-field]');
    if (!t || !item()) return;
    item()[t.dataset.rebuildField] = t.value; grow(t);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !b.closest('.rebuild-view')) return;
    if (b.dataset.rebuildStart) { begin(Number(b.dataset.rebuildStart)); return refresh(); }
    if (b.matches('[data-rebuild-setup]')) { st.phase = 'setup'; return refresh(); }
    if (b.matches('[data-rebuild-prev]')) { st.i = Math.max(0, st.i - 1); return refresh(st.phase === 'rebuild' ? '.rebuild-mine' : null); }
    if (b.matches('[data-rebuild-next]')) {
      if (st.i < st.n - 1) { st.i++; return refresh(st.phase === 'rebuild' ? '.rebuild-mine' : null); }
      if (st.phase === 'read') { st.phase = 'rebuild'; st.i = 0; remember(st.items.map(it => it.w.id)); return refresh('.rebuild-mine'); }
      if (st.phase === 'rebuild') { st.phase = 'compare'; st.i = 0; return refresh(); }
    }
    if (b.matches('[data-rebuild-save]')) { st.saved = save(); st.phase = 'done'; return refresh(); }
    if (b.matches('[data-rebuild-finish]')) { st.phase = 'done'; return refresh(); }
    if (b.matches('[data-rebuild-notebook]')) { document.getElementById('favorites-open')?.click(); return; }
    if (b.dataset.rebuildOpen) { const w = works.find(x => x.id === b.dataset.rebuildOpen); if (w) openBook(w.id); }
  });

  window.KatabasisRebuild = { render, compare, state: () => st };
})();
