// Plain reading view: the book opens on the translation alone, in one column and
// large type; "Open the book" switches to the parallel view with the original.
(() => {
  let full = false;
  const L = (es, en) => (lang === 'es' ? es : en);
  const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const official = w => typeof KatabasisOfficial !== 'undefined' && KatabasisOfficial.on() && w.lang !== lang ? KatabasisOfficial.entry(w, lang) : null;

  function lines(w) {
    const t = official(w);
    if (t) return t.blocks.map(b => b.text);
    const side = w.lang === lang ? 'original' : lang;
    return w.segments.map(r => r.map(s => s[side]).join('').trim());
  }
  function credit(w) {
    if (w.lang === lang) return ui[lang].same;
    const t = official(w);
    return t ? KatabasisOfficial.heading(w, lang) : ui[lang].working;
  }
  function plain(w, tail) {
    const kind = official(w) ? 'prose official' : w.kind === 'Poem' ? 'poem' : w.kind === 'Theatre' ? 'prose theatre' : 'prose';
    const text = lines(w).map(l => `<div class="verse">${escH(l)}</div>`).join('');
    return `<div class="book-title plain-title"><h2 id="book-title" tabindex="-1">${escH(titleOf(w))}</h2><p>${escH(w.author)} · ${escH(scopeOf(w))}</p></div>`
      + `<div class="plain-reading read-text ${kind}" lang="${lang}">${text}</div>`
      + `<div class="plain-open"><button class="book-btn" type="button" data-open-full>${bookIcon}<span>${ui[lang].book}</span></button>`
      + `<p>${escH(credit(w))}${w.lang === lang ? '' : ` · ${L('el original en', 'the original in')} ${escH(languageOf(w))}`}</p></div>${tail || ''}`;
  }
  const hint = w => w && w.lang === lang ? L('Abre el libro para ver la edición completa.', 'Open the book for the full edition.') : L('Abre el libro para leer el original junto a la traducción.', 'Open the book to read the original beside the translation.');

  document.addEventListener('click', e => {
    if (!e.target.closest('[data-open-full]')) return;
    if (typeof active !== 'number' || !works[active]) return; // the book was closed in the meantime
    full = true;
    renderBook();
    const box = document.getElementById('book-content');
    box.scrollTop = 0;
    box.querySelector('#book-title')?.focus({ preventScroll: true });
  });

  window.KatabasisReader = { full: () => full, reset: () => { full = false; }, plain, hint };
})();
