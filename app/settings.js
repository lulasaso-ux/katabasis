(function (root) {
  'use strict';
  // Configuración: a settings view opened from the gear in the rail. For now it holds one
  // setting, the reading ornaments level stored on <html data-ornaments>:
  // 0 = none, 1 = package patterns, 2 = immersive (patterns + paper; not ready yet).
  const KEY = 'katabasis-ornaments-v1';
  const LEVELS = [
    {value: '0', es: 'Sin ornamentos', en: 'No ornaments', note_es: 'El recuadro de lectura, limpio, igual para todos los paquetes.', note_en: 'A plain reading box, the same for every package.'},
    {value: '1', es: 'Patrones de paquete', en: 'Package patterns', note_es: 'Cada paquete con su cenefa: grecas para Grecia, el Nombre en hebreo antiguo para el Éxodo, la Ruta de la Seda para las crónicas…', note_en: 'Each package with its own border: Greek keys for Greece, the Name in ancient Hebrew for Exodus, the Silk Road for the chronicles…'},
    {value: '2', es: 'Inmersivo', en: 'Immersive', note_es: 'Patrones y un papel propio para cada paquete. Pronto.', note_en: 'Patterns and a paper of its own for each package. Coming soon.', soon: true}
  ];
  const doc = root.document;
  const read = () => { try { const v = root.localStorage.getItem(KEY); return LEVELS.some(l => l.value === v && !l.soon) ? v : '1'; } catch (e) { return '1'; } };
  const es = () => !(typeof lang !== 'undefined' && lang === 'en');
  function apply(level) {
    doc.documentElement.dataset.ornaments = level;
    try { root.localStorage.setItem(KEY, level); } catch (e) {}
    doc.querySelectorAll('input[name="ornament-level"]').forEach(i => { i.checked = i.value === level; });
  }
  const gearIcon = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A7.4 7.4 0 0 0 7 6.5l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4z"/></svg>';
  function panel() {
    const e = es(), cur = read();
    return `<header class="settings-head"><div><p class="tiny-title">Katabasis</p><h2 id="settings-title">${e ? 'Configuración' : 'Settings'}</h2></div><button type="button" class="close" data-settings-close aria-label="${e ? 'Cerrar' : 'Close'}">×</button></header>`
      + `<section class="settings-section" aria-labelledby="settings-ornaments"><h3 id="settings-ornaments">${e ? 'Ornamentos de lectura' : 'Reading ornaments'}</h3><p class="settings-intro">${e ? 'Cuánto viste cada paquete el recuadro donde se lee. La elección se guarda en este navegador.' : 'How much each package dresses the box you read in. Your choice is saved in this browser.'}</p>`
      + `<div class="settings-levels" role="radiogroup" aria-labelledby="settings-ornaments">${LEVELS.map(l => `<label class="settings-level${l.soon ? ' soon' : ''}"><input type="radio" name="ornament-level" value="${l.value}" ${cur === l.value ? 'checked' : ''} ${l.soon ? 'disabled' : ''}><span class="settings-preview level-${l.value}" aria-hidden="true"><i></i><b></b><b></b><b></b></span><span class="settings-level-text"><strong>${e ? l.es : l.en}</strong><small>${e ? l.note_es : l.note_en}</small></span></label>`).join('')}</div></section>`;
  }
  function mount() {
    const e = es(), label = e ? 'Configuración' : 'Settings';
    doc.querySelectorAll('.settings-open').forEach(n => n.remove());
    const facts = doc.getElementById('facts');
    if (facts) facts.insertAdjacentHTML('beforebegin', `<button type="button" class="settings-open rail-settings" aria-haspopup="dialog">${gearIcon}<span>${label}</span></button>`);
    const mobile = doc.querySelector('.mobile-language');
    if (mobile) mobile.insertAdjacentHTML('beforeend', `<button type="button" class="settings-open mobile-settings" aria-haspopup="dialog" aria-label="${label}" title="${label}">${gearIcon}</button>`);
    let dlg = doc.getElementById('settings');
    if (!dlg) { dlg = doc.createElement('dialog'); dlg.id = 'settings'; dlg.setAttribute('aria-labelledby', 'settings-title'); doc.body.appendChild(dlg); }
    dlg.innerHTML = panel();
  }
  // The reading box takes the package of the open reading.
  function tag() {
    const box = doc.getElementById('book-content');
    if (!box) return;
    let pkg = '';
    try { if (typeof works !== 'undefined' && typeof active === 'number' && works[active]) pkg = works[active].package_id || ''; } catch (e) {}
    if (box.dataset.package !== pkg) { if (pkg) box.dataset.package = pkg; else delete box.dataset.package; }
  }
  function init() {
    apply(read());
    mount();
    const box = doc.getElementById('book-content');
    if (box) new MutationObserver(tag).observe(box, {childList: true});
    doc.addEventListener('click', e => {
      const t = e.target instanceof Element ? e.target : null;
      if (!t) return;
      if (t.closest('[data-lang]')) { setTimeout(mount, 0); return; }
      const dlg = doc.getElementById('settings');
      if (t.closest('.settings-open')) { dlg.innerHTML = panel(); dlg.showModal(); dlg.querySelector('input:checked')?.focus(); return; }
      if (t.closest('[data-settings-close]') || t === dlg) dlg.close();
    });
    doc.addEventListener('change', e => { if (e.target.name === 'ornament-level') apply(e.target.value); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
  root.KatabasisSettings = {apply, levels: LEVELS.map(l => l.value)};
})(globalThis);
