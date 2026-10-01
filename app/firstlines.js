// Learn · First lines. One line of a text from the anthology is revealed; the reader writes around
// it — before or after, never over it — and then sees what the author did with that line.
// Round 1 uses a first line, round 2 a second line, and so on up to five; any round can be skipped.
(() => {
  const L = (es, en) => (lang === 'es' ? es : en);
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ORD_ES = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta'], ORD_EN = ['first', 'second', 'third', 'fourth', 'fifth'];
  const ord = k => L(ORD_ES[k - 1], ORD_EN[k - 1]);
  const RECENT_KEY = 'katabasis-first-lines-recent-v1';
  let st = { phase: 'setup', rounds: 1, round: 1, w: null, before: '', after: '', log: [], used: new Set(), saved: false };

  // ---- texts ------------------------------------------------------------------------------------
  const side = w => (w.lang === lang ? 'original' : lang);
  const rowsOf = w => w.segments.map(r => r.map(s => s[side(w)]).join('').replace(/\s+/g, ' ').trim()).filter(Boolean);
  function recent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch (e) { return []; } }
  function remember(id) { try { localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...recent().filter(x => x !== id)].slice(0, 40))); } catch (e) {} }
  // A text qualifies for round k if its k-th line is a real line (not a repeated refrain, not a whole
  // paragraph) and the author wrote on after it.
  function candidate(w, k) {
    const rows = rowsOf(w), line = rows[k - 1];
    if (!line || rows.length < k + 1) return false;
    const words = line.split(' ').length;
    return line.length >= 8 && line.length <= 180 && words >= 3 && rows.indexOf(line) === k - 1;
  }
  function pick(k) {
    const pool = (typeof activeWorks === 'function' ? activeWorks() : works).filter(w => !st.used.has(w.id) && candidate(w, k));
    if (!pool.length) return null;
    const seen = new Set(recent()), fresh = pool.filter(w => !seen.has(w.id)), list = fresh.length ? fresh : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---- shared words ---------------------------------------------------------------------------------
  const STOP = new Set(('para pero como cuando este esta estos estas aquel aquella entre desde hasta porque donde también todo toda todos todas '
    + 'sobre tiene tienen había hace eran fueron será sino ante bajo tras cada otro otra otros otras mismo misma muy más menos nada algo '
    + 'that with from this have were what your they there their which would these those them then than when where while into upon '
    + 'shall will been being does each some such only also very just more most other over under about after before your yours ours').split(' '));
  const words = t => (t.toLowerCase().match(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu) || []);
  const keyword = w => w.length >= 4 && !STOP.has(w);
  function shared(mine, theirs, given) {
    const g = new Set(words(given)), t = new Set(words(theirs).filter(keyword));
    return [...new Set(words(mine).filter(w => keyword(w) && t.has(w) && !g.has(w)))];
  }
  const mark = (text, set) => escH(text).replace(/[\p{L}\p{M}]+(?:(?:['’]|&#39;)[\p{L}\p{M}]+)*/gu, m => set.has(m.toLowerCase().replace(/&#39;/g, "'")) ? `<mark class="lines-match">${m}</mark>` : m);

  // ---- flow ------------------------------------------------------------------------------------------
  function startRound() {
    st.w = pick(st.round);
    st.before = ''; st.after = ''; st.saved = false;
    if (!st.w) { st.phase = 'done'; return; }
    st.used.add(st.w.id);
    st.phase = 'write';
  }
  function next() {
    if (st.round >= st.rounds) { st.phase = 'done'; return; }
    st.round++; startRound();
  }
  function begin(n) {
    st = { phase: 'write', rounds: n, round: 1, w: null, before: '', after: '', log: [], used: new Set(), saved: false };
    startRound();
  }

  // ---- views -----------------------------------------------------------------------------------------
  const bar = () => `<div class="learn-bar"><button class="learn-back" data-learn-back>← ${L('Aprender', 'Learn')}</button><span>${L('Primeras líneas', 'First lines')}</span></div>`;
  function setup() {
    const opts = [1, 2, 3, 4, 5].map(n => `<button type="button" class="lines-rounds" data-lines-start="${n}"><strong>${n}</strong><span>${n === 1 ? L('una primera línea', 'one first line') : L(`de la primera a la ${ORD_ES[n - 1]} línea`, `from the first to the ${ORD_EN[n - 1]} line`)}</span></button>`).join('');
    return `${bar()}<div class="lines-setup"><h2 id="workshop-title" tabindex="-1">${L('Primeras líneas', 'First lines')}</h2>
      <p>${L('Se te revela una sola línea de un texto de la antología. Escribe antes o después de ella: la línea queda fija en la página y no se puede borrar ni escribir encima. Al terminar verás qué hizo el autor con ella.', 'A single line from a text in the anthology is revealed. Write before or after it: the line stays fixed on the page and cannot be deleted or written over. When you finish you will see what the author did with it.')}</p>
      <p>${L('La primera ronda usa una primera línea; la segunda, una segunda línea de otro texto; y así hasta la quinta. Cualquier ronda se puede saltar.', 'The first round uses a first line; the second, a second line from another text; and so on up to the fifth. Any round can be skipped.')}</p>
      <h3>${L('¿Cuántas rondas?', 'How many rounds?')}</h3><div class="lines-round-grid">${opts}</div></div>`;
  }
  function write() {
    const line = rowsOf(st.w)[st.round - 1];
    return `${bar()}<div class="lines-play"><div class="lines-head"><p class="tiny-title">${L(`Ronda ${st.round} de ${st.rounds}`, `Round ${st.round} of ${st.rounds}`)} · ${L(`${ord(st.round)} línea`, `${ord(st.round)} line`)}</p>
      <h2 id="workshop-title" tabindex="-1">${L('Escribe alrededor de la línea', 'Write around the line')}</h2></div>
      <div class="lines-sheet">
        <textarea class="lines-text" data-lines-part="before" rows="2" aria-label="${L('Texto antes de la línea', 'Text before the line')}" placeholder="${L('Antes de la línea, si quieres…', 'Before the line, if you like…')}">${escH(st.before)}</textarea>
        <p class="lines-fixed" aria-label="${L('Línea fija', 'Fixed line')}">${escH(line)}</p>
        <textarea class="lines-text" data-lines-part="after" rows="6" aria-label="${L('Texto después de la línea', 'Text after the line')}" placeholder="${L('…o sigue desde aquí.', '…or carry on from here.')}">${escH(st.after)}</textarea>
      </div>
      <div class="lines-actions"><button type="button" class="book-btn" data-lines-done>${L('Terminé · ver qué hizo el autor', 'Done · see what the author did')}</button><button type="button" class="secondary" data-lines-skip>${st.round < st.rounds ? L(`Saltar a la ${ORD_ES[st.round]} línea`, `Skip to the ${ORD_EN[st.round]} line`) : L('Saltar', 'Skip')}</button></div>
      <p class="lines-private">${L('Lo que escribes no se envía a ningún sitio. Al final podrás guardarlo en tu cuaderno, si quieres.', 'What you write is not sent anywhere. At the end you can keep it in your notebook, if you like.')}</p></div>`;
  }
  function reveal() {
    const w = st.w, rows = rowsOf(w), k = st.round, line = rows[k - 1], upto = Math.min(rows.length, k + 8);
    const theirs = rows.slice(0, upto).join('\n'), mine = [st.before, st.after].join('\n');
    const common = shared(mine, theirs, line), set = new Set(common);
    const yours = `${st.before.trim() ? `<div class="lines-mine">${mark(st.before.trim(), set)}</div>` : ''}<p class="lines-fixed">${escH(line)}</p>${st.after.trim() ? `<div class="lines-mine">${mark(st.after.trim(), set)}</div>` : ''}`;
    const author = rows.slice(0, upto).map((r, i) => i === k - 1 ? `<p class="lines-fixed">${escH(r)}</p>` : `<div class="lines-row">${mark(r, set)}</div>`).join('') + (upto < rows.length ? '<div class="lines-row lines-more">…</div>' : '');
    const title = typeof bookTitleOf === 'function' ? bookTitleOf(w) : titleOf(w);
    const more = st.round < st.rounds;
    return `${bar()}<div class="lines-play"><div class="lines-head"><p class="tiny-title">${L(`Ronda ${k} de ${st.rounds}`, `Round ${k} of ${st.rounds}`)} · ${L(`${ord(k)} línea`, `${ord(k)} line`)}</p>
      <h2 id="workshop-title" tabindex="-1">${L('Lo que hizo el autor', 'What the author did')}</h2></div>
      <div class="lines-compare"><section><h3>${L('Tu texto', 'Your text')}</h3><div class="lines-sheet lines-read">${yours}</div></section>
        <section><h3>${escH(w.author.split(' · ')[0])} · <em>${escH(title)}</em></h3><div class="lines-sheet lines-read" lang="${lang}">${author}</div>
        <p class="lines-source">${escH(titleOf(w))} · ${escH(w.year || '')} · <button type="button" class="text-button" data-lines-open="${escH(w.id)}">${L('Leer el texto completo ↗', 'Read the whole text ↗')}</button></p></section></div>
      <p class="lines-shared">${common.length ? `${L('Palabras que también usó el autor', 'Words the author also used')}: ${common.map(x => `<mark class="lines-match">${escH(x)}</mark>`).join(' ')}` : L('No usaste ninguna palabra que el autor usara aquí.', 'You used none of the words the author used here.')}</p>
      ${typeof KatabasisNotebook !== 'undefined' ? `<p class="lines-keep">${st.saved ? `<span>${L('Guardado en tu cuaderno ✓', 'Saved to your notebook ✓')}</span>` : `<button type="button" class="text-button" data-lines-note>${L('Guardar lo que escribiste en el cuaderno, como nota de este texto', 'Save what you wrote to the notebook, as a note on this text')}</button>`}</p>` : ''}
      <div class="lines-actions">${more ? `<button type="button" class="book-btn" data-lines-next>${L(`Siguiente: ${ORD_ES[k]} línea →`, `Next: ${ORD_EN[k]} line →`)}</button>` : st.rounds === 1 ? `<button type="button" class="book-btn" data-lines-again>${L('Otra primera línea', 'Another first line')}</button>` : `<button type="button" class="book-btn" data-lines-next>${L('Terminar', 'Finish')}</button>`}
        <button type="button" class="secondary" data-lines-setup>${L('Cambiar el número de rondas', 'Change the number of rounds')}</button></div></div>`;
  }
  function done() {
    const items = st.log.map(e => `<li><span>${L(`${ORD_ES[e.k - 1]} línea`, `${ORD_EN[e.k - 1]} line`)}</span> ${e.skipped ? `<em>${L('saltada', 'skipped')}</em>` : `${escH(e.w.author.split(' · ')[0])} · ${escH(typeof bookTitleOf === 'function' ? bookTitleOf(e.w) : titleOf(e.w))}`}</li>`).join('');
    return `${bar()}<div class="lines-setup"><h2 id="workshop-title" tabindex="-1">${L('Fin de las rondas', 'End of the rounds')}</h2>
      ${items ? `<ol class="lines-log">${items}</ol>` : `<p>${L('No quedan textos disponibles para esa línea con los paquetes activos.', 'No texts are left for that line with the active packages.')}</p>`}
      <div class="lines-actions"><button type="button" class="book-btn" data-lines-start="${st.rounds}">${L('Jugar otra vez', 'Play again')}</button><button type="button" class="secondary" data-lines-setup>${L('Cambiar el número de rondas', 'Change the number of rounds')}</button></div></div>`;
  }
  function render(el) {
    el.className = 'workshop-view lines-view';
    el.innerHTML = `<div class="learn-detail">${st.phase === 'write' ? write() : st.phase === 'reveal' ? reveal() : st.phase === 'done' ? done() : setup()}</div>`;
    el.querySelectorAll('.lines-text').forEach(grow);
    el.scrollTop = 0;
  }
  function grow(t) { t.style.height = 'auto'; t.style.height = Math.max(t.scrollHeight, t.dataset.linesPart === 'after' ? 150 : 56) + 'px'; }
  const view = () => document.getElementById('workshop-view');
  const refresh = focus => { const el = view(); if (!el) return; render(el); const f = focus && el.querySelector(focus); (f || el.querySelector('#workshop-title'))?.focus({ preventScroll: true }); };

  document.addEventListener('input', e => {
    const t = e.target.closest && e.target.closest('[data-lines-part]');
    if (!t) return;
    st[t.dataset.linesPart] = t.value; grow(t);
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !b.closest('.lines-view')) return;
    if (b.dataset.linesStart) { begin(Number(b.dataset.linesStart)); return refresh('[data-lines-part="after"]'); }
    if (b.matches('[data-lines-setup]')) { st.phase = 'setup'; return refresh(); }
    if (b.matches('[data-lines-done]')) { st.log.push({ k: st.round, w: st.w, skipped: false }); remember(st.w.id); st.phase = 'reveal'; return refresh(); }
    if (b.matches('[data-lines-skip]')) { st.log.push({ k: st.round, w: st.w, skipped: true }); next(); return refresh('[data-lines-part="after"]'); }
    if (b.matches('[data-lines-next]')) { next(); return refresh('[data-lines-part="after"]'); }
    if (b.matches('[data-lines-again]')) { begin(1); return refresh('[data-lines-part="after"]'); }
    if (b.matches('[data-lines-note]')) {
      const w = st.w, rows = rowsOf(w), k = st.round, upto = Math.min(rows.length, k + 8);
      const mine = [st.before.trim(), rows[k - 1], st.after.trim()].filter(Boolean).join('\n');
      KatabasisNotebook.open({ kind: 'new', reading: w.id, text: rows.slice(0, upto).join('\n'), note: mine, onSave: () => { st.saved = true; if (st.phase === 'reveal') refresh(); } });
      return;
    }
    if (b.dataset.linesOpen) { const w = works.find(x => x.id === b.dataset.linesOpen); if (w) openBook(w.id); }
  });

  window.KatabasisLines = { render, candidate, shared, state: () => st };
})();
