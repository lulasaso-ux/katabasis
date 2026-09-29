// Share as image: draws a reading, or the selected part of it, over one of the museum's paintings
// on a canvas, with a choice of format, typeface, frame and lettering, and saves it as a PNG.
(function () {
  const STYLE_KEY = 'katabasis-share-style-v1';
  const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=EB+Garamond:ital@0;1&family=Playfair+Display:ital@0;1&family=Cinzel:wght@500&family=IM+Fell+English:ital@0;1&family=Libre+Baskerville:ital@0;1&family=Pinyon+Script&display=swap';
  const FORMATS = { square: [1080, 1080], portrait: [1080, 1350], story: [1080, 1920], landscape: [1600, 900] };
  const FONTS = [
    { id: 'cormorant', family: 'Cormorant Garamond', label: 'Cormorant', weight: 500 },
    { id: 'garamond', family: 'EB Garamond', label: 'Garamond' },
    { id: 'playfair', family: 'Playfair Display', label: 'Playfair' },
    { id: 'baskerville', family: 'Libre Baskerville', label: 'Baskerville' },
    { id: 'fell', family: 'IM Fell English', label: 'Fell' },
    { id: 'cinzel', family: 'Cinzel', label: 'Cinzel', noItalic: true, weight: 500 },
    { id: 'pinyon', family: 'Pinyon Script', label: 'Caligrafía', noItalic: true, scale: 1.25 },
    { id: 'georgia', family: 'Georgia', label: 'Georgia', local: true }
  ];
  const FRAMES = ['none', 'line', 'double', 'corners', 'passepartout', 'band'];
  const COLORS = { cream: '#fbf4e6', ink: '#2b1d14', gold: '#ecc97c' };
  const DEFAULTS = { format: 'portrait', font: 'cormorant', size: 1, align: 'center', italic: false, color: 'cream', frame: 'line', veil: 0.45, blur: 0, focusY: 0.35, source: 'translation', showAuthor: true, showCredit: true, showBrand: true };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (es, en) => (typeof lang !== 'undefined' && lang === 'es') ? es : en;
  let style = { ...DEFAULTS };
  try { Object.assign(style, JSON.parse(localStorage.getItem(STYLE_KEY) || '{}')); } catch (e) {}
  let state = null, fontsReady = null, drawToken = 0;
  const images = new Map(), broken = new Set();

  // ---- text of the reading -------------------------------------------------------------
  function joinRows(rows) {
    const lens = rows.map(r => r.length).filter(Boolean), avg = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length);
    if (avg <= 90) return rows.join('\n').replace(/\n{3,}/g, '\n\n');   // verse: one row per line, empty rows mark stanzas
    return rows.filter(Boolean).join(avg > 220 ? '\n\n' : ' ');         // prose: paragraphs or sentences
  }
  function readingText(w, source) {
    const same = w.lang === lang;
    if (source === 'original' || same) return joinRows(w.segments.map(r => r.map(s => s.original).join('').trim()));
    if (typeof KatabasisOfficial !== 'undefined' && KatabasisOfficial.on()) {
      const t = KatabasisOfficial.entry(w, lang);
      if (t) return t.blocks.map(b => b.text).join('\n\n');
    }
    return joinRows(w.segments.map(r => r.map(s => s[lang]).join('').trim()));
  }
  function translatorCredit(w, source) {
    if (source === 'original' || w.lang === lang) return '';
    if (typeof KatabasisOfficial !== 'undefined' && KatabasisOfficial.on()) {
      const t = KatabasisOfficial.entry(w, lang);
      if (t) return L(`Trad. ${t.translator}`, `Tr. ${t.translator}`);
    }
    return '';
  }
  // Text currently selected inside the open book, without the word-by-word glosses.
  function selectedText() {
    const sel = window.getSelection(), box = document.getElementById('book-content');
    if (!sel || sel.isCollapsed || !box || !sel.rangeCount) return '';
    const range = sel.getRangeAt(0);
    if (!box.contains(range.commonAncestorContainer)) return '';
    const clean = frag => {
      frag.querySelectorAll('.gl-t, button, .gloss-toggle').forEach(n => n.remove());
      return frag.textContent.replace(/[ \t\u00a0]+/g, ' ');
    };
    // Within the parallel text keep only the column where the selection starts, cell by cell.
    const startNode = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentNode;
    const startCell = startNode.closest && startNode.closest('.parallel-cell');
    if (startCell) {
      const side = [...startCell.parentNode.children].indexOf(startCell);
      const verse = !!startCell.closest('.parallel.poem') || !!box.querySelector('.official-row .segment') && /\n/.test(startCell.textContent);
      const parts = [];
      box.querySelectorAll('.parallel-row').forEach(row => {
        const cell = row.children[side];
        if (!cell || !range.intersectsNode(cell)) return;
        const r = document.createRange();
        r.selectNodeContents(cell);
        if (cell.contains(range.startContainer)) r.setStart(range.startContainer, range.startOffset);
        if (cell.contains(range.endContainer)) r.setEnd(range.endContainer, range.endOffset);
        parts.push(clean(r.cloneContents()).trim());
      });
      return parts.join(verse ? '\n' : ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    const frag = range.cloneContents();
    frag.querySelectorAll('p, div').forEach(n => n.append('\n'));
    return clean(frag).replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  // ---- paintings ------------------------------------------------------------------------
  // A reading from a package opens on that package's artworks (the ones tied to the reading first);
  // readings of the base collection, which belong to no package, start from any painting.
  function availablePaintings(w) {
    if (typeof paintings === 'undefined') return [];
    const list = paintings.filter(p => p.image && !broken.has(p.id) && (typeof isEnabled === 'undefined' || isEnabled(p)));
    const own = [w.package_id, ...(w.additional_package_ids || [])].filter(id => id && id !== 'mvp');
    if (!own.length) {
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
      return list;
    }
    const rank = p => (p.related_reading_ids || []).includes(w.id) ? 0 : own.includes(p.package_id) ? 1 : 2;
    return list.map((p, i) => [p, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]);
  }
  const paintTitle = p => (lang === 'es' ? p.title_es : p.title_en) || p.title_en || p.title_es || '';
  function loadImage(p) {
    if (images.has(p.id)) return images.get(p.id);
    const pr = new Promise((resolve, reject) => {
      const img = new Image();
      if (!p.image.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => { broken.add(p.id); images.delete(p.id); reject(new Error('image')); };
      img.src = p.image;
    });
    images.set(p.id, pr);
    return pr;
  }
  function loadFonts() {
    if (fontsReady) return fontsReady;
    // The stylesheet must arrive before document.fonts knows the faces; then load every face used.
    const sheet = new Promise(resolve => {
      let link = document.getElementById('share-fonts');
      if (link && link.sheet) return resolve();
      if (!link) {
        link = document.createElement('link');
        link.id = 'share-fonts'; link.rel = 'stylesheet'; link.href = FONTS_URL;
        document.head.appendChild(link);
      }
      link.addEventListener('load', resolve); link.addEventListener('error', resolve);
    });
    const faces = sheet.then(() => Promise.all(FONTS.filter(f => !f.local).flatMap(f => [
      document.fonts.load(`${f.weight || 400} 40px "${f.family}"`, 'Aá'),
      f.noItalic ? null : document.fonts.load(`italic ${f.weight || 400} 40px "${f.family}"`, 'Aá')
    ].filter(Boolean)))).catch(() => {});
    fontsReady = Promise.race([faces, new Promise(r => setTimeout(r, 5000))]);
    faces.then(() => { if (state) draw(); });
    return fontsReady;
  }

  // ---- drawing --------------------------------------------------------------------------
  function wrap(ctx, text, maxWidth) {
    const lines = [];
    for (const para of text.split('\n')) {
      if (!para.trim()) { lines.push(''); continue; }
      let line = '';
      for (const word of para.split(/\s+/)) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width <= maxWidth || !line) line = test;
        else { lines.push(line); line = word; }
      }
      if (line) lines.push(line);
    }
    return lines;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  async function draw() {
    const token = ++drawToken, canvas = document.getElementById('share-canvas');
    if (!canvas || !state) return;
    const [W, H] = FORMATS[style.format] || FORMATS.portrait, u = Math.min(W, H) / 1080;
    const p = state.paintings.find(x => x.id === state.paintingId) || state.paintings[0];
    let img = null;
    try { loadFonts(); if (p) img = await loadImage(p); } catch (e) { if (p && broken.has(p.id)) { refreshThumbs(); return pickPainting(); } }
    if (token !== drawToken) return;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2b1d14'; ctx.fillRect(0, 0, W, H);
    if (img) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight) * (style.blur ? 1.06 : 1);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.save();
      if (style.blur) ctx.filter = `blur(${style.blur * u}px)`;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) * style.focusY, dw, dh);
      ctx.restore();
    }
    const frame = style.frame, paper = frame === 'passepartout';
    const color = paper ? COLORS.ink : COLORS[style.color] || COLORS.cream, light = color !== COLORS.ink;
    // Veil: dark behind light letters, pale behind ink.
    if (!paper && style.veil > 0) {
      if (frame === 'band') {
        const g = ctx.createLinearGradient(0, H * 0.35, 0, H);
        const rgb = light ? '20,12,8' : '250,244,232';
        g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.35, `rgba(${rgb},${style.veil})`); g.addColorStop(1, `rgba(${rgb},${Math.min(1, style.veil + 0.25)})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = light ? `rgba(20,12,8,${style.veil})` : `rgba(250,244,232,${style.veil})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
    // Text box and frame.
    const m = 0.075 * Math.min(W, H);
    let box = { x: m, y: m, w: W - 2 * m, h: H - 2 * m };
    ctx.strokeStyle = light ? 'rgba(251,244,230,0.85)' : 'rgba(43,29,20,0.8)';
    const inset = 0.04 * Math.min(W, H);
    if (frame === 'line' || frame === 'double') {
      ctx.lineWidth = 2 * u; ctx.strokeRect(inset, inset, W - 2 * inset, H - 2 * inset);
      if (frame === 'double') { ctx.lineWidth = 1 * u; const i2 = inset + 12 * u; ctx.strokeRect(i2, i2, W - 2 * i2, H - 2 * i2); }
    } else if (frame === 'corners') {
      ctx.lineWidth = 2.5 * u; const c = 90 * u;
      for (const [x, y, dx, dy] of [[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(x, y + dy * c); ctx.lineTo(x, y); ctx.lineTo(x + dx * c, y); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + dx * 16 * u, y + dy * 16 * u, 4 * u, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
      }
    } else if (paper) {
      const px = 0.1 * W, py = 0.1 * H;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30 * u; ctx.shadowOffsetY = 8 * u;
      ctx.fillStyle = '#f7f0e3'; roundRect(ctx, px, py, W - 2 * px, H - 2 * py, 6 * u); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(166,117,50,0.55)'; ctx.lineWidth = 1.5 * u; ctx.strokeRect(px + 14 * u, py + 14 * u, W - 2 * px - 28 * u, H - 2 * py - 28 * u);
      box = { x: px + 0.07 * W, y: py + 0.06 * H, w: W - 2 * px - 0.14 * W, h: H - 2 * py - 0.12 * H };
    } else if (frame === 'band') {
      box = { x: m, y: H * 0.42, w: W - 2 * m, h: H * 0.58 - m };
    }
    const footerLine = (style.showCredit || style.showBrand) && !paper ? 50 * u : 0;
    if (footerLine) box.h = Math.min(box.h, H - inset - footerLine - 16 * u - box.y);
    // Footer lines: attribution, painting credit, brand.
    const f = FONTS.find(x => x.id === style.font) || FONTS[0];
    const italic = style.italic && !f.noItalic ? 'italic ' : '';
    const weight = f.weight || 400, fam = `"${f.family}", Georgia, serif`;
    const small = 24 * u, tiny = 17 * u;
    const author = style.showAuthor ? state.attribution : '', credit = style.showCredit && p ? `${p.artist}, ${paintTitle(p)}${p.year ? ' (' + p.year + ')' : ''}` : '';
    const footH = (author ? small * 2.9 : 0) + (paper ? 0 : 0);
    // Fit the text: largest size that fits the box, at most the chosen scale.
    const rtl = /[֐-׿]/.test(state.text);
    const avail = box.h - footH;
    const len = state.text.length;
    const base = (len < 120 ? 64 : len < 300 ? 52 : len < 700 ? 42 : 34) * u * (f.scale || 1) * style.size;
    // Verse keeps its lines whole when it can; long texts stop at a legible minimum and are cut.
    const logical = state.text.split('\n');
    const verse = logical.length > 1 && logical.every(l => l.length <= 90);
    const floor = 22 * u, lineFloor = 28 * u;
    let size = base, lines, lh, found = false;
    for (let pass = verse ? 0 : 1; pass < 2 && !found; pass++) {
      for (size = base; size >= (pass ? floor : lineFloor); size *= 0.95) {
        ctx.font = `${italic}${weight} ${size}px ${fam}`;
        lines = wrap(ctx, state.text, box.w); lh = size * 1.38;
        if ((pass || lines.length === logical.length) && lines.length * lh <= avail) { found = true; break; }
      }
    }
    if (!found) size = Math.max(size, floor);
    ctx.font = `${italic}${weight} ${size}px ${fam}`;
    lines = wrap(ctx, state.text, box.w); lh = size * 1.38;
    let truncated = false;
    const maxLines = Math.max(1, Math.floor(avail / lh));
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + ' …'; truncated = true; }
    const blockH = lines.length * lh + footH;
    let y = frame === 'band' ? box.y + box.h - blockH : box.y + (box.h - blockH) / 2;
    const align = rtl ? 'right' : style.align;
    const x = align === 'center' ? box.x + box.w / 2 : align === 'right' ? box.x + box.w : box.x;
    ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.direction = rtl ? 'rtl' : 'ltr';
    ctx.fillStyle = color;
    if (light && !paper) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 12 * u; ctx.shadowOffsetY = 2 * u; }
    for (const line of lines) { ctx.fillText(line, x, y + (lh - size) / 2); y += lh; }
    if (author) {
      y += small * 0.9;
      ctx.font = `italic ${weight} ${small}px ${fam}`;
      ctx.direction = 'ltr';
      for (const part of author.split('\n')) { ctx.fillText(part, x, y); y += small * 1.25; }
    }
    ctx.shadowColor = 'transparent'; ctx.direction = 'ltr';
    ctx.font = `${tiny}px ${fam}`; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = paper ? 'rgba(247,240,227,0.92)' : light ? 'rgba(251,244,230,0.75)' : 'rgba(43,29,20,0.7)';
    const by = H - (paper ? 0.045 * H : inset + 22 * u);
    const bx = paper ? 0.1 * W : inset + 22 * u;
    if (credit) { ctx.textAlign = 'left'; ctx.fillText(credit.length > 80 ? credit.slice(0, 78) + '…' : credit, bx, by); }
    if (style.showBrand) { ctx.textAlign = 'right'; ctx.font = `italic ${tiny * 1.25}px ${fam}`; ctx.fillText('Katabasis', W - bx, by); }
    const note = document.getElementById('share-note');
    if (note) note.textContent = !truncated ? '' : style.format === 'story'
      ? L('El texto no cabe completo: selecciona en el libro el pasaje que quieras compartir.', 'The text does not fit: select the passage you want to share in the book.')
      : L('El texto no cabe completo: prueba el formato Historia o selecciona un pasaje en el libro.', 'The text does not fit: try the Story format or select a passage in the book.');
  }

  // ---- dialog ---------------------------------------------------------------------------
  function seg(name, options, current) {
    return `<div class="share-seg" role="group" data-style="${name}">${options.map(([v, label]) => `<button type="button" data-value="${v}" aria-pressed="${String(v) === String(current)}">${label}</button>`).join('')}</div>`;
  }
  function controls() {
    const w = state.work, same = w.lang === lang;
    return `
      <section><h3>${L('Pintura', 'Painting')}</h3>${filterMenu()}<div class="share-thumbs" id="share-thumbs"></div>
        <button type="button" class="share-link" data-share-random>${L('Otra al azar', 'Another at random')}</button></section>
      <section><h3>${L('Formato', 'Format')}</h3>${seg('format', [['square', L('Cuadrado', 'Square')], ['portrait', L('Vertical', 'Portrait')], ['story', L('Historia', 'Story')], ['landscape', L('Horizontal', 'Landscape')]], style.format)}</section>
      ${state.selection || same ? '' : `<section><h3>${L('Texto', 'Text')}</h3>${seg('source', [['translation', L('Traducción', 'Translation')], ['original', L('Original', 'Original')]], style.source)}</section>`}
      <section><h3>${L('Letra', 'Typeface')}</h3><div class="share-fonts">${FONTS.map(f => `<button type="button" data-font="${f.id}" aria-pressed="${f.id === style.font}" style="font-family:'${f.family}',Georgia,serif">${f.label === 'Caligrafía' ? L('Caligrafía', 'Script') : f.label}</button>`).join('')}</div>
        <label class="share-range">${L('Tamaño', 'Size')}<input type="range" min="0.6" max="1.5" step="0.05" value="${style.size}" data-range="size"></label>
        ${seg('align', [['left', L('Izquierda', 'Left')], ['center', L('Centro', 'Centre')]], style.align)}
        ${seg('italic', [[false, L('Redonda', 'Roman')], [true, L('Cursiva', 'Italic')]], style.italic)}
        ${seg('color', [['cream', L('Marfil', 'Ivory')], ['gold', L('Oro', 'Gold')], ['ink', L('Tinta', 'Ink')]], style.color)}</section>
      <section><h3>${L('Marco', 'Frame')}</h3>${seg('frame', FRAMES.map(v => [v, { none: L('Sin marco', 'None'), line: L('Filete', 'Rule'), double: L('Doble', 'Double'), corners: L('Esquinas', 'Corners'), passepartout: L('Paspartú', 'Passe-partout'), band: L('Banda', 'Band') }[v]]), style.frame)}</section>
      <section><h3>${L('Fondo', 'Background')}</h3>
        <label class="share-range">${L('Velo', 'Veil')}<input type="range" min="0" max="0.85" step="0.05" value="${style.veil}" data-range="veil"></label>
        <label class="share-range">${L('Desenfoque', 'Blur')}<input type="range" min="0" max="18" step="1" value="${style.blur}" data-range="blur"></label>
        <label class="share-range">${L('Encuadre', 'Crop')}<input type="range" min="0" max="1" step="0.05" value="${style.focusY}" data-range="focusY"></label></section>
      <section class="share-checks">
        <label><input type="checkbox" data-check="showAuthor" ${style.showAuthor ? 'checked' : ''}> ${L('Autor y obra', 'Author and work')}</label>
        <label><input type="checkbox" data-check="showCredit" ${style.showCredit ? 'checked' : ''}> ${L('Crédito de la pintura', 'Painting credit')}</label>
        <label><input type="checkbox" data-check="showBrand" ${style.showBrand ? 'checked' : ''}> Katabasis</label></section>`;
  }
  // Paintings can be narrowed to one package; the reading's own package comes first in the menu.
  const inPackage = (p, id) => p.package_id === id || (p.additional_package_ids || []).includes(id);
  function filterMenu() {
    const w = state.work, own = [w.package_id, ...(w.additional_package_ids || [])];
    const pk = typeof packages !== 'undefined' ? packages : [];
    const name = x => typeof packageName === 'function' ? packageName(x) : (lang === 'es' ? x.title_es : x.title_en);
    const groups = [{ id: 'mvp', label: L('La antología original', 'The original anthology') }, ...pk.map(x => ({ id: x.id, label: name(x) }))]
      .map(g => ({ ...g, n: state.all.filter(p => inPackage(p, g.id)).length })).filter(g => g.n)
      .sort((a, b) => (own.includes(b.id) - own.includes(a.id)) || a.label.localeCompare(b.label, lang));
    return `<label class="share-filter"><span>${L('Paquete', 'Package')}</span><select data-share-filter>
      <option value="">${L('Todas las pinturas', 'All paintings')} (${state.all.length})</option>
      ${groups.map(g => `<option value="${esc(g.id)}"${g.id === state.filter ? ' selected' : ''}>${esc(g.label)} (${g.n})</option>`).join('')}</select></label>`;
  }
  function applyFilter(id) {
    state.filter = id;
    state.paintings = state.all.filter(p => !broken.has(p.id) && (!id || inPackage(p, id)));
    if (!state.paintings.some(p => p.id === state.paintingId)) state.paintingId = (state.paintings[0] || {}).id;
    refreshThumbs(); draw();
  }
  function refreshThumbs() {
    const box = document.getElementById('share-thumbs');
    if (!box || !state) return;
    state.paintings = state.paintings.filter(p => !broken.has(p.id));
    box.innerHTML = state.paintings.map(p => `<button type="button" data-painting="${esc(p.id)}" aria-pressed="${p.id === state.paintingId}" title="${esc(p.artist + ' — ' + paintTitle(p))}"><img src="${p.image}" alt="${esc(paintTitle(p))}" loading="lazy" decoding="async"></button>`).join('');
    box.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function pickPainting(id) {
    state.paintingId = id || (state.paintings.find(p => !broken.has(p.id)) || {}).id;
    document.querySelectorAll('#share-thumbs [data-painting]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.painting === state.paintingId)));
    draw();
  }
  function ensureDialog() {
    let d = document.getElementById('share-dialog');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'share-dialog'; d.className = 'share-dialog'; d.setAttribute('aria-labelledby', 'share-title');
    document.body.appendChild(d);
    d.addEventListener('click', onDialogClick);
    d.addEventListener('input', onDialogInput);
    d.addEventListener('close', () => { state = null; });
    return d;
  }
  function setText() {
    const w = state.work;
    state.text = state.selection || readingText(w, style.source);
    const title = typeof bookTitleOf === 'function' ? bookTitleOf(w) : typeof titleOf === 'function' ? titleOf(w) : w.title;
    const tr = state.selection ? translatorCredit(w, 'translation') : translatorCredit(w, style.source);
    state.attribution = `— ${w.author.split(' · ')[0]}\n${title}${tr ? ' · ' + tr : ''}`;
  }
  function open(selection, work) {
    const w = work || (typeof works !== 'undefined' && typeof active !== 'undefined' && active !== null ? works[active] : null);
    if (!w) return;
    const list = availablePaintings(w);
    state = { work: w, selection: selection || '', all: list, filter: '', paintings: list.slice(), paintingId: (list[0] || {}).id };
    setText();
    const d = ensureDialog();
    d.innerHTML = `<div class="share-bar"><h2 id="share-title">${state.selection ? L('Compartir selección', 'Share selection') : L('Compartir lectura', 'Share reading')}</h2>
        <button class="close" type="button" data-share-close aria-label="${L('Cerrar', 'Close')}">×</button></div>
      <div class="share-body"><div class="share-stage"><canvas id="share-canvas" aria-label="${L('Vista previa de la imagen', 'Image preview')}"></canvas><p class="share-note" id="share-note" role="status"></p>
        <div class="share-actions"><button type="button" class="share-primary" data-share-save>${L('Guardar imagen', 'Save image')}</button>
        ${navigator.canShare ? `<button type="button" data-share-native>${L('Compartir…', 'Share…')}</button>` : ''}
        ${window.ClipboardItem && navigator.clipboard ? `<button type="button" data-share-copy>${L('Copiar', 'Copy')}</button>` : ''}</div></div>
        <div class="share-controls">${controls()}</div></div>`;
    d.showModal();
    refreshThumbs();
    draw();
  }
  function saveStyle() { try { localStorage.setItem(STYLE_KEY, JSON.stringify(style)); } catch (e) {} }
  function blob() { return new Promise((res, rej) => { try { document.getElementById('share-canvas').toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/png'); } catch (e) { rej(e); } }); }
  const fileName = () => `katabasis-${state.work.id}${state.selection ? '-fragmento' : ''}.png`;
  function flash(msg) { const n = document.getElementById('share-note'); if (n) { n.textContent = msg; setTimeout(() => { if (n.textContent === msg) n.textContent = ''; }, 2600); } }
  async function onDialogClick(e) {
    const t = e.target.closest('button');
    if (!t || !state) return;
    if (t.matches('[data-share-close]')) return e.currentTarget.close();
    if (t.dataset.painting) return pickPainting(t.dataset.painting);
    if (t.matches('[data-share-random]')) {
      const list = state.paintings.filter(p => p.id !== state.paintingId);
      for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
      const current = state.paintings.find(p => p.id === state.paintingId);
      state.paintings = current ? [...list, current] : list;
      if (list.length) { state.paintingId = list[0].id; refreshThumbs(); draw(); }
      return;
    }
    if (t.dataset.font) { style.font = t.dataset.font; t.parentNode.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t))); saveStyle(); return draw(); }
    const group = t.closest('[data-style]');
    if (group) {
      const key = group.dataset.style, v = t.dataset.value;
      style[key] = v === 'true' ? true : v === 'false' ? false : v;
      group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === t)));
      if (key === 'source') setText();
      saveStyle(); return draw();
    }
    try {
      if (t.matches('[data-share-save]')) {
        const b = await blob(), a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = fileName(); document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } else if (t.matches('[data-share-native]')) {
        const file = new File([await blob()], fileName(), { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: state.work.title });
        else flash(L('Este navegador no comparte imágenes; usa «Guardar imagen».', 'This browser cannot share images; use “Save image”.'));
      } else if (t.matches('[data-share-copy]')) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob() })]);
        flash(L('Imagen copiada.', 'Image copied.'));
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      flash(L('No se pudo exportar esta pintura; prueba con otra.', 'This painting could not be exported; try another.'));
    }
  }
  function onDialogInput(e) {
    if (e.target.matches('[data-share-filter]')) return applyFilter(e.target.value);
    const r = e.target.dataset.range, c = e.target.dataset.check;
    if (r) style[r] = parseFloat(e.target.value);
    else if (c) style[c] = e.target.checked;
    else return;
    saveStyle(); draw();
  }

  // ---- the button in the book ---------------------------------------------------------------
  const shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>';
  function button() {
    return `<button type="button" class="share-open" data-share-open aria-label="${L('Compartir como imagen', 'Share as image')}">${shareIcon}<span>${L('Compartir', 'Share')}</span></button>`;
  }
  // The last selection is kept for its reading even after a tap collapses it: on phones the tap
  // that reaches a button often only dismisses the selection. A new tap on the text starts over.
  let kept = null;
  const currentId = () => typeof works !== 'undefined' && typeof active === 'number' && works[active] ? works[active].id : null;
  const keptText = () => kept && kept.id === currentId() ? kept.text : '';
  // While there is a selection, a bar near the text offers to keep it in the notebook or share it.
  const noteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  function floatButton() {
    const book = document.getElementById('book');
    if (!book) return null;
    let f = book.querySelector('.share-float');
    if (!f) {
      book.insertAdjacentHTML('beforeend', `<div class="share-float" role="group" hidden>${typeof KatabasisNotebook !== 'undefined' ? `<button type="button" data-note-passage>${noteIcon}<span></span></button>` : ''}<button type="button" data-share-open>${shareIcon}<span></span></button></div>`);
      f = book.querySelector('.share-float');
      book.addEventListener('close', () => { kept = null; f.hidden = true; });
    }
    return f;
  }
  function syncButton() {
    const t = selectedText();
    if (t) kept = { id: currentId(), text: t };
    const has = !!(t || keptText()), label = has ? L('Compartir selección', 'Share selection') : L('Compartir', 'Share');
    const b = document.querySelector('#book-content [data-share-open]');
    if (b) { b.classList.toggle('has-selection', has); b.querySelector('span').textContent = label; }
    const f = floatButton(), book = document.getElementById('book');
    if (f) {
      f.hidden = !has || !book.open;
      const note = f.querySelector('[data-note-passage] span');
      if (note) note.textContent = L('Guardar pasaje', 'Save passage');
      f.querySelector('[data-share-open] span').textContent = note ? L('Compartir', 'Share') : L('Compartir selección', 'Share selection');
    }
  }
  const soon = () => { clearTimeout(syncButton.t); syncButton.t = setTimeout(syncButton, 120); };
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('[data-share-open], [data-note-passage]')) {
      const t = selectedText();
      if (t) kept = { id: currentId(), text: t };
      e.preventDefault();
    } else if (e.target.closest('#book-content')) { kept = null; soon(); }
  }, true);
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-share-open]')) return;
    const text = selectedText() || keptText();
    kept = null; soon();
    open(text);
  });
  document.addEventListener('selectionchange', soon);

  // The current selection, or the one kept after a tap collapsed it; taking it clears what was kept.
  function takeSelection() { const t = selectedText() || keptText(); kept = null; soon(); return t; }

  window.KatabasisShare = { button, open, readingText, selectedText, takeSelection, draw, style: () => style, state: () => state };
})();
