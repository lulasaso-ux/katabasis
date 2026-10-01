// The atlas as an old double-hemisphere world map: two stereographic hemispheres and two polar
// discs (geometry in app/atlas-hemispheres.json), with the engraved apparatus of the genre —
// graduated rims, graticule, tropics and ecliptic, compass roses, ships and a title cartouche.
(() => {
  let A = null;
  const data = () => {
    if (A) return A;
    const el = document.getElementById('atlas-hemispheres');
    return (A = el ? JSON.parse(el.textContent) : null);
  };
  const D2R = Math.PI / 180;
  // Point in the old equirectangular coordinates (x=(lon+180)*2.5, y=(85-lat)*2.5) on the new map.
  function point(xy, id) {
    const a = data();
    if (id && a.anchors[id]) return a.anchors[id];
    let lon = xy[0] / 2.5 - 180, lat = 85 - xy[1] / 2.5;
    const h = lon < -20 || lon >= 160 ? a.hemis[0] : a.hemis[1];
    if (lon >= 160) lon -= 360;
    const dl = (lon - h.lon0) * D2R, la = lat * D2R, k = 2 / (1 + Math.cos(la) * Math.cos(dl)), R = h.r / 2;
    return [+(h.cx + R * k * Math.cos(la) * Math.sin(dl)).toFixed(1), +(h.cy - R * k * Math.sin(la)).toFixed(1)];
  }
  const path = id => ((data().countries[id] || {}).d) || '';
  const polar = id => ((data().countries[id] || {}).p) || '';
  const view = v => data().views[v] || data().views.world;
  const L = (es, en) => (typeof lang !== 'undefined' && lang === 'es') ? es : en;

  // ---- engraved ornaments ---------------------------------------------------------------------
  function rose(x, y, r) {
    const pts = (n, len, off) => Array.from({ length: n }, (_, i) => (i * 360 / n + off) * D2R).map(a => [Math.sin(a) * len, -Math.cos(a) * len]);
    const star = (n, len, w, off, dark) => pts(n, len, off).map(([px, py], i) => {
      const a = (i * 360 / n + off) * D2R, sx = Math.cos(a) * w, sy = Math.sin(a) * w;
      return `<path d="M0,0L${(sx).toFixed(2)},${(sy).toFixed(2)}L${px.toFixed(2)},${py.toFixed(2)}Z" class="${dark ? 'ink' : 'paper'}"/><path d="M0,0L${(-sx).toFixed(2)},${(-sy).toFixed(2)}L${px.toFixed(2)},${py.toFixed(2)}Z" class="${dark ? 'paper' : 'ink'}"/>`;
    }).join('');
    const rhumbs = pts(16, r * 9, 0).map(([px, py]) => `M0,0L${px.toFixed(1)},${py.toFixed(1)}`).join('');
    return `<g transform="translate(${x} ${y})"><path class="rhumb" d="${rhumbs}"/><circle r="${r * 0.62}" class="rose-ring"/>${star(16, r * 0.45, r * 0.05, 11.25, false)}${star(8, r * 0.7, r * 0.08, 22.5, true)}${star(4, r, r * 0.12, 0, true)}<circle r="${r * 0.06}" class="ink"/><text y="${-r - 2.5}" text-anchor="middle" class="rose-n">N</text></g>`;
  }
  function ship(x, y, s, flip) {
    return `<g class="ship" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <path class="wave" d="M-17,8q2,-2 4,0t4,0t4,0t4,0t4,0t4,0t4,0t4,0"/>
      <path class="ink" d="M-12,1Q0,4 13,0L10,5Q0,7.5 -9,5Z"/><path class="ink" d="M-12,1L-12.5,-4L-7,-3.5L-7,1.5Z"/>
      <path class="mast" d="M-4,1V-16M3,1V-19M9,0V-12M12,0L18,-6"/>
      <path class="paper" d="M-8,-14Q-4,-12.5 0,-14L0,-7Q-4,-5.5 -8,-7Z"/><path class="paper" d="M-1,-17Q3,-15.5 7,-17L7,-9Q3,-7.5 -1,-9Z"/>
      <path class="paper" d="M-0.5,-7.5Q3,-6 6.5,-7.5L6.5,-2Q3,-0.5 -0.5,-2Z"/><path class="paper" d="M6,-10.5Q9,-9.5 12,-10.5L12,-5Q9,-4 6,-5Z"/>
      <path class="ink" d="M3,-19L8,-18L3,-17Z"/></g>`;
  }
  function cartouche(x, y) {
    return `<g class="cartouche" transform="translate(${x} ${y})">
      <path class="scroll" d="M-62,-13H62C68,-13 70,-7 66,-4C70,-1 70,9 62,13H-62C-70,9 -70,-1 -66,-4C-70,-7 -68,-13 -62,-13Z"/>
      <path class="scroll-curl" d="M-62,-13C-56,-13 -56,-4 -62,-4C-66,-4 -66,-9 -62,-9M62,13C56,13 56,4 62,4C66,4 66,9 62,9"/>
      <text y="-1.5" text-anchor="middle" class="cart-title">ORBIS LECTORVM</text>
      <text y="7.5" text-anchor="middle" class="cart-sub">${L('nova tabula · Katabasis', 'nova tabula · Katabasis')}</text></g>`;
  }
  function rim(c, r, w, n) {
    const mid = r + w / 2, seg = (2 * Math.PI * mid) / n;
    return `<circle cx="${c.cx}" cy="${c.cy}" r="${r}" class="rim"/><circle cx="${c.cx}" cy="${c.cy}" r="${r + w}" class="rim"/>
      <circle cx="${c.cx}" cy="${c.cy}" r="${mid}" class="rim-ticks" style="stroke-width:${w}px;stroke-dasharray:${seg.toFixed(3)} ${seg.toFixed(3)}"/>`;
  }
  function arcText(c, r, text, below, id, span = 62, cls = 'arc-title') {
    const sweep = below ? 0 : 1, a = span * D2R;
    const x0 = c.cx - r * Math.sin(a), x1 = c.cx + r * Math.sin(a), yy = below ? c.cy + r * Math.cos(a) : c.cy - r * Math.cos(a);
    return `<path id="${id}" d="M${x0.toFixed(1)},${yy.toFixed(1)}A${r},${r} 0 0 ${sweep} ${x1.toFixed(1)},${yy.toFixed(1)}" fill="none"/><text class="${cls}"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
  }

  // Background: paper, frame, the oceans of each disc and the engraved water-lining of the coasts.
  function under() {
    const a = data(), [W, H] = a.size, discs = [...a.hemis, ...a.poles];
    return `<defs>
        <filter id="atl-paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .42 0 0 0 0 .3 0 0 0 0 .17 0 0 0 .1 0"/></filter>
        <radialGradient id="atl-sea" r="0.55"><stop offset="0" stop-color="#f6eedb"/><stop offset=".8" stop-color="#efe3c6"/><stop offset="1" stop-color="#e2d0a8"/></radialGradient>
        <radialGradient id="atl-age" r="0.75"><stop offset=".55" stop-color="#c9a76f" stop-opacity="0"/><stop offset="1" stop-color="#9c7643" stop-opacity=".32"/></radialGradient>
        <clipPath id="atl-discs">${discs.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}"/>`).join('')}</clipPath></defs>
      <g class="atlas-under" aria-hidden="true">
        <rect width="${W}" height="${H}" class="paper-bg"/><rect width="${W}" height="${H}" fill="url(#atl-age)"/><rect width="${W}" height="${H}" filter="url(#atl-paper)"/>
        <rect x="4" y="4" width="${W - 8}" height="${H - 8}" class="frame-outer"/><rect x="9" y="9" width="${W - 18}" height="${H - 18}" class="frame-inner"/>
        ${[[9, 9], [W - 9, 9], [9, H - 9], [W - 9, H - 9]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 3}" width="6" height="6" class="frame-corner"/>`).join('')}
        ${discs.map(d => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="url(#atl-sea)"/>`).join('')}
        <g clip-path="url(#atl-discs)"><path d="${a.coast}" class="coast c3"/><path d="${a.coast}" class="coast c2"/><path d="${a.coast}" class="coast c1"/></g>
      </g>`;
  }
  // Foreground: graticule, rims, titles and ornaments; none of it takes clicks.
  function over() {
    const a = data(), p = a.places, [w, e] = a.hemis, [n, s] = a.poles;
    return `<g class="atlas-over" aria-hidden="true">
        <g clip-path="url(#atl-discs)"><path d="${a.graticule}" class="grat"/><path d="${a.special}" class="tropic"/><path d="${a.ecliptic}" class="ecliptic"/>
          ${rose(...p.rose_west, 15)}${rose(...p.rose_east, 13)}</g>
        ${a.hemis.map(h => rim(h, h.r, 6, 36)).join('')}${a.poles.map(c => rim(c, c.r, 4, 36)).join('')}
        ${arcText(w, w.r + 15, 'HEMISPHÆRIVM OCCIDENTALE', false, 'atl-arc-w')}${arcText(e, e.r + 15, 'HEMISPHÆRIVM ORIENTALE', false, 'atl-arc-e')}
        ${arcText(n, n.r + 10, 'POLVS ARCTICVS', true, 'atl-arc-n', 42, 'arc-title pole')}${arcText(s, s.r + 10, 'POLVS ANTARCTICVS', false, 'atl-arc-s', 48, 'arc-title pole')}
        <text class="sea terra" x="${s.cx}" y="${s.cy + 3}">TERRA AVSTRALIS</text><text class="sea terra" x="${s.cx}" y="${s.cy + 11}">INCOGNITA</text>
        <text class="sea terra" x="${p.australis_w[0]}" y="${p.australis_w[1]}">TERRA AVSTRALIS INCOGNITA</text>
        <text class="sea terra" x="${p.australis_e[0]}" y="${p.australis_e[1]}">TERRA AVSTRALIS INCOGNITA</text>
        <text class="sea" x="${p.pacific[0]}" y="${p.pacific[1]}">MARE PACIFICVM</text>
        <text class="sea" x="${p.atlantic[0]}" y="${p.atlantic[1]}">OCEANVS ATLANTICVS</text>
        <text class="sea" x="${p.indian[0]}" y="${p.indian[1]}">OCEANVS INDICVS</text>
        <text class="sea" x="${p.aethiopic[0]}" y="${p.aethiopic[1]}">OCEANVS ÆTHIOPICVS</text>
        ${ship(...p.ship_atlantic, 0.62, true)}${ship(...p.ship_pacific, 0.55, false)}${ship(...p.ship_indian, 0.55, false)}
        ${cartouche(...p.cartouche)}
      </g>`;
  }
  window.KatabasisAtlas = { ready: () => !!data(), path, polar, view, point, under, over };
})();
