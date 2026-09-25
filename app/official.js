// Official translations mode: shows only readings with a public-domain published translation,
// replacing the AI working translation with the translator's text, aligned by stanza or paragraph.
(function () {
  const KEY = 'katabasis-official-v1';
  const node = document.getElementById('official-translations');
  const data = node ? JSON.parse(node.textContent) : {};
  let on = false;
  try { on = localStorage.getItem(KEY) === '1'; } catch (e) {}
  const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (lang, es, en) => lang === 'es' ? es : en;

  function entry(w, lang) { return (data[w.id] || {})[lang] || null; }
  function has(w) { return !!(data[w.id] && (data[w.id].es || data[w.id].en)); }
  // Paintings and anything without segments pass; readings need at least one official translation.
  function allows(item) { return !on || !item || !item.segments || has(item); }
  function byline(t, lang) { return `${L(lang, 'Trad.', 'Tr.')} ${t.translator}, ${t.year}`; }
  function missing(w, lang) {
    const other = entry(w, lang === 'es' ? 'en' : 'es');
    return `<p class="official-missing">${L(lang, 'Esta lectura no tiene traducción oficial al español de dominio público.', 'This reading has no public-domain official English translation.')}${other ? ` ${L(lang, `Está disponible en inglés, en la versión de ${escape(other.translator)}.`, `It is available in Spanish, in ${escape(other.translator)}’s version.`)}` : ''}</p>`;
  }
  // Feed preview: the first blocks of the official text, or the notice.
  function preview(w, lang) {
    const t = entry(w, lang);
    if (!t) return missing(w, lang);
    let chars = 0; const out = [];
    for (const b of t.blocks) { out.push(`<div class="verse">${escape(b.text)}</div>`); chars += b.text.length; if (chars > 2300) break; }
    return out.join('');
  }
  function label(w, lang) {
    const t = entry(w, lang);
    return t ? escape(byline(t, lang)) : L(lang, 'Sin traducción oficial en este idioma', 'No official translation in this language');
  }
  function heading(w, lang) {
    const t = entry(w, lang);
    return t ? `${L(lang, 'Traducción de', 'Translated by')} ${escape(t.translator)} · ${escape(t.year)}` : L(lang, 'Traducción oficial no disponible', 'Official translation not available');
  }
  // original(i) returns the inner HTML of original row i; rows of a block share one highlight key.
  function bookRows(w, lang, original) {
    // Keep line breaks when the original is made of verse lines (short rows); join prose rows with spaces.
    const t = entry(w, lang), lens = w.segments.map(r => r.map(s => s.original).join('').length).filter(Boolean);
    const prose = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length) > 90;
    if (!t) {
      const all = w.segments.map((_, i) => original(i)).join(prose ? ' ' : '\n');
      return `<div class="parallel-row"><div class="parallel-cell" lang="${lang}">${missing(w, lang)}</div><div class="parallel-cell" lang="${w.lang}" dir="${w.lang === 'he' ? 'rtl' : 'ltr'}"><span class="segment" data-key="all" tabindex="0">${all}</span></div></div>`;
    }
    return t.blocks.map((b, k) => {
      const rows = []; for (let i = b.rows[0]; i <= b.rows[1]; i++) rows.push(original(i));
      return `<div class="parallel-row official-row"><div class="parallel-cell" lang="${lang}"><span class="segment" data-key="b${k}" tabindex="${k ? -1 : 0}">${escape(b.text)}</span></div><div class="parallel-cell" lang="${w.lang}" dir="${w.lang === 'he' ? 'rtl' : 'ltr'}"><span class="segment" data-key="b${k}" tabindex="-1">${rows.join(prose ? ' ' : '\n')}</span></div></div>`;
    }).join('');
  }
  function note(w, lang) {
    const t = entry(w, lang);
    if (!t) return '';
    return `<p class="official-note">${escape(L(lang, t.note_es || '', t.note_en || ''))}${t.note_es || t.note_en ? ' ' : ''}${L(lang, 'Traducción publicada', 'Published translation')}: ${escape(t.translator)} (${escape(t.translator_life)}), ${escape(t.edition)}. ${L(lang, 'Dominio público. Alineada por estrofa o párrafo.', 'Public domain. Aligned by stanza or paragraph.')} <a href="${escape(t.source)}" target="_blank" rel="noopener noreferrer">${L(lang, 'Fuente de la traducción ↗', 'Translation source ↗')}</a></p>`;
  }
  function menu(lang) {
    return `<button type="button" class="edition-toggle" data-edition-menu aria-haspopup="true" aria-expanded="false">${on ? L(lang, 'Traducciones oficiales', 'Official translations') : L(lang, 'Traducciones de IA', 'AI translations')} ▾</button><div class="edition-options" role="menu" hidden><button type="button" role="menuitemradio" aria-checked="${!on}" data-edition="ai">${L(lang, 'Traducciones de IA', 'AI translations')}<small>${L(lang, 'Todas las lecturas, traducción literal', 'All readings, literal translation')}</small></button><button type="button" role="menuitemradio" aria-checked="${on}" data-edition="official">${L(lang, 'Solo traducciones oficiales', 'Official translations only')}<small>${L(lang, 'Versiones publicadas de dominio público', 'Published public-domain versions')}</small></button></div>`;
  }
  function setMode(next) {
    if (next === on) return;
    on = next;
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    if (typeof refreshPackageSelection === 'function') refreshPackageSelection();
  }
  document.addEventListener('click', e => {
    const box = document.getElementById('edition-menu');
    if (!box) return;
    const toggle = e.target.closest('[data-edition-menu]'), pick = e.target.closest('[data-edition]');
    const options = box.querySelector('.edition-options');
    if (pick) { options.hidden = true; setMode(pick.dataset.edition === 'official'); return; }
    if (toggle) { options.hidden = !options.hidden; toggle.setAttribute('aria-expanded', String(!options.hidden)); return; }
    if (options && !options.hidden && !e.target.closest('#edition-menu')) { options.hidden = true; box.querySelector('[data-edition-menu]').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', e => {
    const options = document.querySelector('#edition-menu .edition-options');
    if (e.key === 'Escape' && options && !options.hidden) { options.hidden = true; document.querySelector('[data-edition-menu]').focus(); }
  });

  window.KatabasisOfficial = { on: () => on, has, entry, allows, preview, label, heading, bookRows, note, menu, setMode, data };
})();
