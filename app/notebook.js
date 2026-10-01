// Reading notebook: the verses and passages a reader keeps, and the readings and artworks they
// save, each with a private note. Over time it becomes the reader's own anthology. Everything
// stays in this browser; it can be downloaded as text or as a backup copy and restored.
(() => {
  const KEY = 'katabasis-notebook-v1', VIEW_KEY = 'katabasis-notebook-view-v1';
  const L = (es, en) => (lang === 'es' ? es : en);
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };
  function load() {
    try {
      const d = JSON.parse(store.get(KEY) || '{}');
      return {
        passages: Array.isArray(d.passages) ? d.passages.filter(p => p && p.id && p.reading && typeof p.text === 'string' && p.text.trim()) : [],
        notes: d.notes && typeof d.notes === 'object' ? d.notes : {},
        times: d.times && typeof d.times === 'object' ? d.times : {}
      };
    } catch (e) { return { passages: [], notes: {}, times: {} }; }
  }
  let data = load(), view = store.get(VIEW_KEY) === 'anthology' ? 'anthology' : 'recent', editing = null;
  const persist = () => store.set(KEY, JSON.stringify(data));
  const announce = msg => { const a = document.getElementById('announcement'); if (a) a.textContent = msg; };
  const readingId = id => (typeof curatedReadingAliases !== 'undefined' && curatedReadingAliases[id]) || id;
  const reading = id => works.find(w => w.id === readingId(id));
  const passages = () => data.passages.filter(p => reading(p.reading));
  const count = () => passages().length;
  const itemKey = (type, id) => type + ':' + id;
  const noteOf = key => (data.notes[key] && data.notes[key].text) || '';
  const refreshCount = () => { if (typeof refreshFavoriteButtons === 'function') refreshFavoriteButtons(); };
  const when = t => t ? new Date(t).toLocaleDateString(lang === 'es' ? 'es' : 'en', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const cite = w => `${w.author.split(' · ')[0]} · ${typeof bookTitleOf === 'function' ? bookTitleOf(w) : titleOf(w)}`;
  const icon = d => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  // ---- the note editor ------------------------------------------------------------------------
  function editor() {
    let d = document.getElementById('note-dialog');
    if (d) return d;
    document.body.insertAdjacentHTML('beforeend', `<dialog id="note-dialog" class="note-dialog" aria-labelledby="note-title"><form method="dialog">
      <h2 id="note-title"></h2><blockquote class="note-passage" id="note-passage"></blockquote><p class="note-source" id="note-source"></p>
      <label class="note-label" for="note-text"></label><textarea id="note-text" rows="5" maxlength="4000"></textarea>
      <p class="note-privacy" id="note-privacy"></p>
      <div class="note-actions"><button type="button" class="secondary" data-note-cancel></button><button type="submit" class="book-btn" data-note-save></button></div></form></dialog>`);
    d = document.getElementById('note-dialog');
    d.querySelector('form').addEventListener('submit', e => { e.preventDefault(); saveEditor(); });
    d.querySelector('[data-note-cancel]').addEventListener('click', () => d.close());
    d.addEventListener('close', () => { editing = null; });
    return d;
  }
  // mode: {kind:'new', reading, text, note?, onSave?} | {kind:'passage', id} | {kind:'item', type, id}
  function openEditor(mode) {
    const d = editor(), passage = mode.kind === 'passage' ? data.passages.find(p => p.id === mode.id) : null;
    const w = mode.kind === 'new' ? reading(mode.reading) : passage ? reading(passage.reading) : mode.type === 'reading' ? reading(mode.id) : null;
    const art = mode.kind === 'item' && mode.type === 'painting' ? paintings.find(p => p.id === mode.id) : null;
    const text = mode.kind === 'new' ? mode.text : passage ? passage.text : '';
    const note = mode.kind === 'new' ? (mode.note || '').slice(0, 4000) : passage ? passage.note || '' : mode.kind === 'item' ? noteOf(itemKey(mode.type, mode.id)) : '';
    editing = mode;
    d.querySelector('#note-title').textContent = mode.kind === 'new' ? L('Guardar en el cuaderno', 'Save to the notebook') : note ? L('Editar la nota', 'Edit the note') : L('Escribir una nota', 'Write a note');
    const q = d.querySelector('#note-passage');
    q.textContent = text; q.hidden = !text;
    d.querySelector('#note-source').textContent = w ? '— ' + cite(w) : art ? `${paintField(art, 'title')} — ${art.artist}` : '';
    d.querySelector('.note-label').textContent = L('Nota privada (opcional)', 'Private note (optional)');
    const ta = d.querySelector('#note-text');
    ta.value = note; ta.placeholder = L('Lo que te dice, a quién te recuerda, por qué lo guardas…', 'What it tells you, who it reminds you of, why you keep it…');
    d.querySelector('#note-privacy').textContent = L('Solo tú la ves: se guarda en este navegador.', 'Only you can see it: it is kept in this browser.');
    d.querySelector('[data-note-cancel]').textContent = L('Cancelar', 'Cancel');
    d.querySelector('[data-note-save]').textContent = L('Guardar', 'Save');
    d.showModal();
    ta.focus();
  }
  function saveEditor() {
    const d = editor(), mode = editing, note = d.querySelector('#note-text').value.trim(), now = Date.now();
    if (!mode) return d.close();
    let ok = true;
    if (mode.kind === 'new') {
      data.passages.push({ id: 'p' + now.toString(36) + Math.random().toString(36).slice(2, 6), reading: mode.reading, text: mode.text, note, lang, at: now });
      ok = persist(); refreshCount();
      if (typeof mode.onSave === 'function') mode.onSave();
      announce(L('Pasaje guardado en tu cuaderno.', 'Passage saved to your notebook.') + (ok ? '' : L(' El navegador no permite conservarlo al cerrar.', ' This browser cannot keep it after closing.')));
    } else if (mode.kind === 'passage') {
      const p = data.passages.find(x => x.id === mode.id);
      if (p) { p.note = note; p.edited = now; ok = persist(); }
      announce(L('Nota guardada.', 'Note saved.'));
    } else {
      const key = itemKey(mode.type, mode.id);
      if (note) data.notes[key] = { text: note, at: now }; else delete data.notes[key];
      ok = persist();
      announce(L('Nota guardada.', 'Note saved.'));
    }
    d.close();
    if (typeof page !== 'undefined' && page === 'favorites') renderFavorites();
    if (mode.kind === 'new') flash(L('Guardado en tu cuaderno', 'Saved to your notebook'));
  }
  function flash(msg) {
    const book = document.getElementById('book');
    if (!book || !book.open) return;
    let t = book.querySelector('.note-toast');
    if (!t) { book.insertAdjacentHTML('beforeend', '<p class="note-toast" role="status"></p>'); t = book.querySelector('.note-toast'); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(flash.t); flash.t = setTimeout(() => t.classList.remove('on'), 2200);
  }

  // ---- the notebook page ------------------------------------------------------------------------
  function entries() {
    const list = passages().map(p => ({ kind: 'passage', p, w: reading(p.reading), at: p.at || 0 }));
    const favs = [...favorites.values()];
    favs.forEach((f, i) => {
      const item = favoriteItem(f.type, f.id);
      if (item) list.push({ kind: f.type, id: f.id, item, w: f.type === 'reading' ? item : null, at: data.times[itemKey(f.type, f.id)] || i / 1e6 });
    });
    return list;
  }
  function sortRecent(list) { return list.sort((a, b) => b.at - a.at); }
  // The anthology: authors in alphabetical order, their works in catalogue order, then artworks.
  function groups(list) {
    const order = new Map(works.map((w, i) => [w.id, i])), by = new Map();
    for (const e of list) {
      const g = e.w ? e.w.author : '\u0000art';
      if (!by.has(g)) by.set(g, []);
      by.get(g).push(e);
    }
    const keys = [...by.keys()].sort((a, b) => a === '\u0000art' ? 1 : b === '\u0000art' ? -1 : a.localeCompare(b, lang));
    return keys.map(k => ({
      title: k === '\u0000art' ? L('Pinturas y grabados', 'Paintings and prints') : k,
      items: by.get(k).sort((a, b) => (a.w && b.w ? order.get(a.w.id) - order.get(b.w.id) : 0) || (a.kind === 'passage') - (b.kind === 'passage') || a.at - b.at)
    }));
  }
  function noteBlock(text) {
    return text ? `<div class="note-body"><span>${L('Nota', 'Note')}</span><p>${escH(text)}</p></div>` : '';
  }
  function passageCard(e) {
    const { p, w } = e;
    return `<article class="note-card note-card-passage"><blockquote class="note-quote ${w.kind === 'Poem' ? 'verse-text' : ''}">${escH(p.text)}</blockquote>
      <p class="note-cite">— ${escH(w.author.split(' · ')[0])} · <em>${escH(bookTitleOf(w))}</em>${titleOf(w) !== bookTitleOf(w) ? ` · ${escH(titleOf(w))}` : ''}</p>
      ${noteBlock(p.note)}
      <div class="note-card-foot"><span class="note-date">${escH(when(p.at))}</span><span class="note-card-actions">
        <button class="text-button" data-note-edit="${escH(p.id)}">${p.note ? L('Editar nota', 'Edit note') : L('Escribir nota', 'Write a note')}</button>
        <button class="text-button" data-note-open="${escH(p.id)}">${L('Abrir en el libro', 'Open in the book')} ↗</button>
        <button class="text-button" data-note-share="${escH(p.id)}">${L('Compartir', 'Share')}</button>
        <button class="text-button note-remove" data-note-remove="${escH(p.id)}">${L('Quitar', 'Remove')}</button></span></div></article>`;
  }
  function itemCard(e) {
    const { kind: type, id, item } = e, enabled = isEnabled(item), p = packages.find(x => x.id === item.package_id), note = noteOf(itemKey(type, id));
    const title = type === 'reading' ? titleOf(item) : paintField(item, 'title'), author = type === 'reading' ? item.author : paintField(item, 'artist');
    return `<article class="saved-item note-card">${type === 'painting' ? `<img class="saved-art" src="${item.image}" alt="${escH(paintField(item, 'alt'))}" loading="lazy">` : ''}<div class="saved-copy"><p class="saved-meta">${type === 'reading' ? `${escH(kindOf(item))} · ${minutes(item)}` : escH(paintField(item, 'art_kind'))}</p><h3>${escH(title)}</h3><p>${escH(author)}</p>${!enabled ? `<p class="saved-package">${escH(packageName(p))} · ${L('paquete desactivado', 'package disabled')}</p>` : ''}
      ${noteBlock(note)}
      <span class="note-card-actions"><button class="text-button saved-open" data-saved-open="${escH(id)}" data-saved-type="${type}">${!enabled ? L('Activar paquete y abrir', 'Enable package and open') : type === 'reading' ? L('Abrir el libro', 'Open the book') : L('Ver ilustración', 'View artwork')} <span aria-hidden="true">↗</span></button>
      <button class="text-button" data-note-item="${type}" data-note-id="${escH(id)}">${note ? L('Editar nota', 'Edit note') : L('Escribir nota', 'Write a note')}</button></span></div>${favoriteButton(type, id)}</article>`;
  }
  const card = e => e.kind === 'passage' ? passageCard(e) : itemCard(e);
  function render(el) {
    const scroll = el.scrollTop, list = entries(), n = count(), r = list.filter(e => e.kind === 'reading').length, a = list.filter(e => e.kind === 'painting').length;
    const counts = [n ? `${n} ${n === 1 ? L('pasaje', 'passage') : L('pasajes', 'passages')}` : '', r ? `${r} ${r === 1 ? L('lectura', 'reading') : L('lecturas', 'readings')}` : '', a ? `${a} ${a === 1 ? L('obra visual', 'artwork') : L('obras visuales', 'artworks')}` : ''].filter(Boolean).join(' · ');
    const body = !list.length
      ? `<div class="favorites-empty"><p>${L('Tu cuaderno está en blanco.', 'Your notebook is blank.')}</p><p>${L('Selecciona un verso o un pasaje en una lectura y pulsa «Guardar pasaje»: podrás escribirle una nota. «Guardar» conserva también lecturas y pinturas enteras.', 'Select a verse or passage in a reading and choose “Save passage”: you can write it a note. “Save” also keeps whole readings and artworks.')}</p><button class="book-btn" data-saved-discover>${L('Ir a la antología', 'Go to the anthology')}</button></div>`
      : view === 'anthology'
        ? groups(list).map(g => `<section class="note-group"><h3 class="note-author">${escH(g.title)}</h3><div class="favorites-list">${g.items.map(card).join('')}</div></section>`).join('')
        : `<div class="favorites-list">${sortRecent(list).map(card).join('')}</div>`;
    el.innerHTML = `<div class="favorites-inner notebook"><div class="favorites-heading"><p class="tiny-title">${L('Tu antología', 'Your anthology')}</p><h2 id="favorites-title" tabindex="-1">${L('Cuaderno de lectura', 'Reading notebook')}</h2><p>${L('Los versos y pasajes que guardas, con tus notas privadas. Con el tiempo, tu propia antología dentro de Katabasis.', 'The verses and passages you keep, with your private notes. In time, your own anthology within Katabasis.')}</p></div>
      ${list.length ? `<div class="note-toolbar"><p class="favorites-total">${counts}</p><div class="share-seg note-views" role="group" aria-label="${L('Orden', 'Order')}"><button type="button" data-note-view="recent" aria-pressed="${view === 'recent'}">${L('Recientes', 'Recent')}</button><button type="button" data-note-view="anthology" aria-pressed="${view === 'anthology'}">${L('Mi antología', 'My anthology')}</button></div></div>` : ''}
      ${body}
      <div class="note-keep"><p class="favorites-note">${L('Tu cuaderno se guarda solo en este navegador; nadie más lo ve. Descárgalo para conservarlo o llevarlo a otro dispositivo.', 'Your notebook is kept only in this browser; nobody else sees it. Download it to keep it or take it to another device.')}</p>
      <div class="note-keep-actions">${list.length ? `<button type="button" class="secondary" data-note-export>${L('Descargar mi antología (.txt)', 'Download my anthology (.txt)')}</button><button type="button" class="secondary" data-note-backup>${L('Copia de seguridad', 'Backup copy')}</button>` : ''}<label class="secondary note-restore">${L('Restaurar una copia', 'Restore a copy')}<input type="file" accept="application/json,.json" data-note-restore hidden></label></div></div></div>`;
    el.scrollTop = scroll;
  }

  // ---- keeping the notebook ------------------------------------------------------------------------
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function exportText() {
    const out = [L('MI ANTOLOGÍA', 'MY ANTHOLOGY'), L('Cuaderno de lectura de Katabasis', 'Katabasis reading notebook') + ' · ' + when(Date.now()), ''];
    for (const g of groups(entries())) {
      out.push('', g.title.toUpperCase(), '');
      for (const e of g.items) {
        if (e.kind === 'passage') {
          out.push(e.p.text, '— ' + bookTitleOf(e.w) + (titleOf(e.w) !== bookTitleOf(e.w) ? ' · ' + titleOf(e.w) : ''));
          if (e.p.note) out.push('', '   ' + L('Nota: ', 'Note: ') + e.p.note.replace(/\n/g, '\n   '));
        } else {
          const note = noteOf(itemKey(e.kind, e.id));
          out.push(e.kind === 'reading' ? `${titleOf(e.item)} (${L('lectura completa', 'whole reading')})` : `${paintField(e.item, 'title')} — ${e.item.artist}`);
          if (note) out.push('', '   ' + L('Nota: ', 'Note: ') + note.replace(/\n/g, '\n   '));
        }
        out.push('', '* * *', '');
      }
    }
    download('katabasis-mi-antologia.txt', out.join('\n'), 'text/plain;charset=utf-8');
  }
  function exportBackup() {
    const copy = { app: 'katabasis', kind: 'notebook', version: 1, saved: new Date().toISOString(), favorites: [...favorites.values()], notebook: data };
    download('katabasis-cuaderno.json', JSON.stringify(copy, null, 1), 'application/json');
  }
  function restore(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const copy = JSON.parse(r.result);
        if (!copy || copy.app !== 'katabasis' || !copy.notebook) throw new Error('format');
        const nb = copy.notebook, have = new Set(data.passages.map(p => p.id));
        let added = 0;
        for (const p of nb.passages || []) if (p && p.id && p.reading && p.text && !have.has(p.id)) { data.passages.push(p); added++; }
        for (const [k, v] of Object.entries(nb.notes || {})) if (!data.notes[k] && v && v.text) data.notes[k] = v;
        for (const [k, v] of Object.entries(nb.times || {})) if (!data.times[k]) data.times[k] = v;
        for (const f of copy.favorites || []) if (f && favoriteItem(f.type, f.id) && !favorites.has(favoriteKey(f.type, f.id))) { favorites.set(favoriteKey(f.type, f.id), { type: f.type, id: f.id }); added++; }
        store.set('katabasis-favorites-v1', JSON.stringify([...favorites.values()]));
        persist(); refreshCount(); renderFavorites();
        announce(L(`Copia restaurada: ${added} elementos nuevos.`, `Copy restored: ${added} new items.`));
      } catch (e) { announce(L('No se pudo leer esa copia.', 'That copy could not be read.')); alert(L('No se pudo leer esa copia del cuaderno.', 'That notebook copy could not be read.')); }
    };
    r.readAsText(file);
  }

  // ---- finding a passage in the book ------------------------------------------------------------------
  function reveal(text) {
    const box = document.getElementById('book-content');
    if (!box) return;
    const first = text.split('\n').map(s => s.trim()).find(Boolean) || '';
    const probe = first.slice(0, 60);
    const hit = [...box.querySelectorAll('.plain-reading .verse, .parallel-cell')].find(n => n.textContent.includes(probe));
    if (!hit) return;
    hit.scrollIntoView({ block: 'center' });
    hit.classList.add('note-found');
    setTimeout(() => hit.classList.remove('note-found'), 2600);
  }
  function openPassage(p) {
    const w = reading(p.reading);
    if (!w) return;
    if (!isEnabled(w) && typeof setPackageEnabled === 'function') setPackageEnabled(w.package_id, true);
    openBook(w.id);
    requestAnimationFrame(() => reveal(p.text));
  }

  // ---- events ------------------------------------------------------------------------------------------
  // Record when a reading or artwork is saved, so the notebook can list it among recent entries.
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-favorite-id]');
    if (!b || typeof favorites === 'undefined') return;
    const key = favoriteKey(b.dataset.favoriteType, b.dataset.favoriteId), k2 = itemKey(b.dataset.favoriteType, b.dataset.favoriteId);
    if (!favorites.has(key)) { data.times[k2] = Date.now(); persist(); }
  }, true);
  document.addEventListener('click', e => {
    const t = e.target.closest('button, label');
    if (!t) return;
    if (t.matches('[data-note-passage]')) {
      const text = typeof KatabasisShare !== 'undefined' ? KatabasisShare.takeSelection() : String(getSelection() || '').trim();
      const w = typeof active === 'number' ? works[active] : null;
      if (text && w) openEditor({ kind: 'new', reading: w.id, text });
      return;
    }
    const byId = id => data.passages.find(p => p.id === id);
    if (t.dataset.noteEdit) return openEditor({ kind: 'passage', id: t.dataset.noteEdit });
    if (t.dataset.noteItem) return openEditor({ kind: 'item', type: t.dataset.noteItem, id: t.dataset.noteId });
    if (t.dataset.noteOpen) { const p = byId(t.dataset.noteOpen); if (p) openPassage(p); return; }
    if (t.dataset.noteShare) {
      const p = byId(t.dataset.noteShare), w = p && reading(p.reading);
      if (w && typeof KatabasisShare !== 'undefined') KatabasisShare.open(p.text, w);
      return;
    }
    if (t.dataset.noteRemove) {
      const p = byId(t.dataset.noteRemove);
      if (!p || (p.note && !confirm(L('¿Quitar este pasaje y su nota?', 'Remove this passage and its note?')))) return;
      data.passages = data.passages.filter(x => x !== p);
      persist(); refreshCount(); renderFavorites();
      announce(L('Pasaje quitado del cuaderno.', 'Passage removed from the notebook.'));
      return;
    }
    if (t.dataset.noteView) { view = t.dataset.noteView; store.set(VIEW_KEY, view); renderFavorites(); return; }
    if (t.matches('[data-note-export]')) return exportText();
    if (t.matches('[data-note-backup]')) return exportBackup();
  });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-note-restore]') && e.target.files[0]) { restore(e.target.files[0]); e.target.value = ''; }
  });

  window.KatabasisNotebook = { render, count, open: openEditor, data: () => data };
})();
