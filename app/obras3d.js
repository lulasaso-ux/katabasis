(function () {
  'use strict';
  // Works in 3D. From the artwork's detail view, "Ver en 3D" (or a tap on the image) opens the work
  // as an object that can be turned and approached:
  //  · vases are turned on their own profile, measured from the museum photograph;
  //  · the kouros gets a volume estimated from its silhouette;
  //  · a photograph is a print on paper, a work on paper a sheet, a fresco a slab of plaster,
  //    and a painting a canvas in its frame.
  // A piece rebuilt from a single photograph only turns as far as what is known of it: past that
  // point there is no record of what it looks like, so the view stops (with a little give) there.
  // three.js (MIT) is loaded only when a work is first opened.
  const L = (es, en) => (typeof lang !== 'undefined' && lang === 'en' ? en : es);
  const MODELS = { 'hirschfeld-krater': 'krater', 'berlin-painter-amphora': 'amphora', 'attic-kouros': 'kouros' };
  const LIMIT = { krater: 80, amphora: 80, kouros: 42 };
  let lib = null, models = null, viewer = null;

  const field = (p, k) => (typeof paintField === 'function' ? paintField(p, k) : p[k + '_es'] || p[k]) || '';
  function kind(p) {
    if (!p) return '';
    if (MODELS[p.id]) return MODELS[p.id] === 'kouros' ? 'statue' : 'vase';
    const k = (p.art_kind_es || '') + ' ' + (p.medium_es || '');
    if (/fotograf[ií]a(?!.*fotomec)/i.test(p.art_kind_es || '')) return 'photo';
    if (/escultura|cer[aá]mica/i.test(k)) return '';
    if (/fresco/i.test(k)) return 'fresco';
    if (/[óo]leo|temple|t[ée]mpera|lienzo|tabla|tela|cobre/i.test(p.medium_es || '')) return 'painting';
    if (/grabado|aguafuerte|buril|litograf|dibujo|acuarela|gouache|papel|pergamino|vitela|miniatura|manuscrito|ilustraci|estampa|tinta/i.test(k)) return 'paper';
    if (/pintura|retrato|paisaje|bodeg[oó]n|alegor/i.test(p.art_kind_es || '') || !p.art_kind_es) return 'painting';
    return '';
  }
  const available = p => !!kind(p) && !!p.image;
  const NOTE = {
    vase: () => L('Torneada sobre su propio perfil, tomado de la fotografía del museo', 'Turned on its own profile, taken from the museum photograph'),
    statue: () => L('Volumen estimado a partir de la fotografía; no es un escaneo', 'Volume estimated from the photograph; not a scan'),
    photo: () => L('Una fotografía: la copia en papel', 'A photograph: the print on paper'),
    paper: () => L('Una obra sobre papel', 'A work on paper'),
    fresco: () => L('Pintura al fresco: el color en el revoque', 'Fresco: the colour in the plaster'),
    painting: () => L('El cuadro en su marco', 'The painting in its frame')
  };
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>';

  async function load() {
    if (!lib) {
      const [THREE, oc, re] = await Promise.all([import('./app/vendor/three/three.module.min.js'), import('./app/vendor/three/OrbitControls.js'), import('./app/vendor/three/RoomEnvironment.js')]);
      lib = { THREE, OrbitControls: oc.OrbitControls, RoomEnvironment: re.RoomEnvironment };
    }
    if (!models) models = await (await fetch('app/obras3d/models.json')).json();
    return lib;
  }
  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // ---- builders ----------------------------------------------------------------------------------
  function vase(T, m, map) {
    const g = new T.Group(), prof = m.profile.slice(m.inner ? 1 : 0), N = 180, rows = prof.length;
    const yc = (prof[0][0] + prof[rows - 1][0]) / 2, pos = [], uv = [], idx = [];
    for (let i = 0; i < rows; i++) {
      const [y, r] = prof[i];
      for (let j = 0; j <= N; j++) {
        const th = (j / N) * Math.PI * 2, s = Math.sin(th), c = Math.cos(th), X = r * s * 0.985;
        pos.push(r * s, -(y - yc), r * c);
        // The photograph is projected onto the front; the back repeats it (the bands of a geometric
        // krater), or, on an atlas, takes a version without the figure, which is not known there.
        uv.push(m.atlas ? (m.cx + X) / m.W / 2 + (c < 0 ? 0.5 : 0) : (m.cx + X) / m.W, 1 - y / m.H);
      }
    }
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < N; j++) { const a = i * (N + 1) + j, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mat = new T.MeshStandardMaterial({ map, roughness: 0.62, envMapIntensity: 0.5 });
    const body = new T.Mesh(geo, mat); body.castShadow = body.receiveShadow = true; g.add(body);
    if (m.inner) {
      const top = prof[0], inn = prof.filter(p => p[0] >= m.inner.top && p[0] <= m.inner.bottom).map(p => new T.Vector2(Math.max(2, p[1] - m.inner.shrink), -(p[0] - yc)));
      inn.unshift(new T.Vector2(top[1] - m.inner.shrink, -(top[0] - yc)));
      inn.push(new T.Vector2(0, inn[inn.length - 1].y));
      const im = new T.Mesh(new T.LatheGeometry(inn.reverse(), N), new T.MeshStandardMaterial({ color: m.inner.color, roughness: 0.8, side: T.DoubleSide }));
      im.receiveShadow = true; g.add(im);
      const ring = new T.RingGeometry(top[1] - m.inner.shrink, top[1], N, 1);
      ring.rotateX(-Math.PI / 2); ring.translate(0, -(top[0] - yc), 0);
      g.add(new T.Mesh(ring, new T.MeshStandardMaterial({ color: m.atlas ? '#16110e' : '#9a6440', roughness: 0.7 })));
    }
    const hmat = new T.MeshStandardMaterial({ color: m.handle_color || '#16120f', roughness: 0.6 });
    for (const h of m.handles || []) {
      const curve = new T.CatmullRomCurve3(h.map(([x, y]) => new T.Vector3(x - m.cx, -(y - yc), 0)));
      const hm = new T.Mesh(new T.TubeGeometry(curve, 80, m.handle_r, 14, false), hmat); hm.castShadow = true; g.add(hm);
    }
    g.scale.setScalar(1 / (prof[rows - 1][0] - prof[0][0]));
    return g;
  }

  function statue(T, m, map, back) {
    const { gw, gh, step: S, x0, y0 } = m, raw = atob(m.depth), q = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) q[i] = raw.charCodeAt(i);
    const inside = (i, j) => i >= 0 && j >= 0 && i < gw && j < gh && q[j * gw + i] > 0;
    const cx = x0 + (gw - 1) * S / 2, yc = y0 + (gh - 1) * S / 2;
    const sheet = sign => {
      const pos = [], uv = [], idx = [], id = new Int32Array(gw * gh).fill(-1);
      for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
        if (!inside(i, j)) continue;
        const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
        const z = edge ? 0 : (q[j * gw + i] - 1) / 254 * m.depth_max * 0.72, px = x0 + i * S, py = y0 + j * S;
        id[j * gw + i] = pos.length / 3; pos.push(px - cx, -(py - yc), sign * z); uv.push(px / m.W, 1 - py / m.H);
      }
      for (let j = 0; j < gh - 1; j++) for (let i = 0; i < gw - 1; i++) {
        const a = id[j * gw + i], b = id[j * gw + i + 1], c = id[(j + 1) * gw + i], d = id[(j + 1) * gw + i + 1];
        if (a < 0 || b < 0 || c < 0 || d < 0) continue;
        if (sign > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
      const geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx); geo.computeVertexNormals();
      const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ map: sign > 0 ? map : back, roughness: 0.78, envMapIntensity: 0.45 }));
      mesh.castShadow = mesh.receiveShadow = true; return mesh;
    };
    const g = new T.Group(); g.add(sheet(1), sheet(-1)); g.scale.setScalar(1 / ((gh - 1) * S));
    return g;
  }

  function sheetOfPaper(T, img, k) {
    // A photograph: the print inside a white border, deeper at the foot, glossy and slightly curled.
    // Other works on paper: the sheet itself, matte, with a gentler curl.
    const photo = k === 'photo', ar = img.width / img.height, side = photo ? 0.07 : 0, foot = photo ? 0.26 : 0;
    const W = ar + 2 * side, H = 1 + side + foot, c = document.createElement('canvas'), s = 1024 / Math.max(W, H);
    c.width = Math.round(W * s); c.height = Math.round(H * s);
    const x = c.getContext('2d'); x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, side * s, side * s, ar * s, 1 * s);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8;
    const geo = new T.PlaneGeometry(W, H, 60, 1), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (W / 2); p.setZ(i, -(photo ? 0.05 : 0.03) * u * u); }
    geo.computeVertexNormals();
    const front = new T.Mesh(geo, photo ? new T.MeshPhysicalMaterial({ map: t, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }) : new T.MeshStandardMaterial({ map: t, roughness: 0.92 }));
    const bg = geo.clone(); bg.translate(0, 0, -0.004);
    const back = new T.Mesh(bg, new T.MeshStandardMaterial({ color: '#e9e3d6', roughness: 0.95, side: T.BackSide }));
    front.castShadow = back.castShadow = true;
    const g = new T.Group(); g.add(front, back); g.scale.setScalar(1 / Math.max(W, H)); return g;
  }

  function slab(T, map, img, k) {
    const ar = img.width / img.height, w = ar, h = 1, g = new T.Group();
    if (k === 'fresco') {
      const plaster = new T.MeshStandardMaterial({ color: '#d9ccb4', roughness: 1 });
      g.add(new T.Mesh(new T.BoxGeometry(w, h, 0.08), [plaster, plaster, plaster, plaster, new T.MeshStandardMaterial({ map, roughness: 0.9 }), plaster]));
      g.children[0].castShadow = true; g.scale.setScalar(1 / Math.max(w, h)); return g;
    }
    const f = 0.11, side = new T.MeshStandardMaterial({ color: '#d8cdb8', roughness: 0.9 });
    g.add(new T.Mesh(new T.BoxGeometry(w, h, 0.03), [side, side, side, side, new T.MeshStandardMaterial({ map, roughness: 0.55 }), side]));
    const s = new T.Shape(); s.moveTo(-w / 2 - f, -h / 2 - f); s.lineTo(w / 2 + f, -h / 2 - f); s.lineTo(w / 2 + f, h / 2 + f); s.lineTo(-w / 2 - f, h / 2 + f);
    const hole = new T.Path(); hole.moveTo(-w / 2 + 0.01, -h / 2 + 0.01); hole.lineTo(-w / 2 + 0.01, h / 2 - 0.01); hole.lineTo(w / 2 - 0.01, h / 2 - 0.01); hole.lineTo(w / 2 - 0.01, -h / 2 + 0.01); s.holes.push(hole);
    const fg = new T.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.03, bevelSegments: 6 }); fg.translate(0, 0, -0.01);
    const frame = new T.Mesh(fg, new T.MeshStandardMaterial({ color: '#b48a3c', metalness: 0.85, roughness: 0.38 })); frame.castShadow = true; g.add(frame);
    g.scale.setScalar(1 / (Math.max(w, h) + 2 * f)); return g;
  }

  // ---- dialog ------------------------------------------------------------------------------------
  function dialog() {
    let d = document.getElementById('obra3d');
    if (d) return d;
    d = document.createElement('dialog'); d.id = 'obra3d'; d.className = 'obra3d'; d.setAttribute('aria-labelledby', 'obra3d-title');
    document.body.appendChild(d);
    d.addEventListener('close', () => { if (viewer) viewer.stop(); viewer = null; d.innerHTML = ''; });
    d.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.matches('[data-obra3d-close]')) return d.close();
      if (!viewer) return;
      if (b.matches('[data-obra3d-home]')) viewer.home();
      if (b.matches('[data-obra3d-spin]')) b.setAttribute('aria-pressed', String(viewer.spin()));
      if (b.matches('[data-obra3d-graze]')) b.setAttribute('aria-pressed', String(viewer.graze()));
    });
    return d;
  }

  async function open(id) {
    const p = paintings.find(x => x.id === id), k = kind(p);
    if (!k || !p.image) return;
    const d = dialog();
    d.innerHTML = `<div class="obra3d-stage"><p class="obra3d-status">${L('Preparando la obra…', 'Preparing the work…')}</p><p class="obra3d-limit" aria-live="polite"></p></div>
      <header class="obra3d-head"><p class="obra3d-kicker">${field(p, 'art_kind') || (k === 'painting' ? L('Pintura', 'Painting') : '')}</p><h2 id="obra3d-title">${field(p, 'title')}</h2><p>${[field(p, 'artist'), field(p, 'year'), p.museum].filter(Boolean).join(' · ')}</p></header>
      <button type="button" class="obra3d-close" data-obra3d-close aria-label="${L('Cerrar', 'Close')}">×</button>
      <footer class="obra3d-foot"><span class="obra3d-note">${NOTE[k]()}</span>
        <div class="obra3d-bar"><button type="button" data-obra3d-home>${L('Vista inicial', 'Initial view')}</button><button type="button" data-obra3d-spin aria-pressed="false">${L('Girar sola', 'Turn by itself')}</button><button type="button" data-obra3d-graze aria-pressed="false">${L('Luz rasante', 'Raking light')}</button></div>
        <span class="obra3d-hint">${L('Arrastra para girar · Rueda o pellizca para acercarte o alejarte', 'Drag to turn · Wheel or pinch to come closer or move away')}</span></footer>`;
    d.showModal();
    const status = d.querySelector('.obra3d-status');
    try {
      const { THREE } = await load();
      if (!d.open) return;
      viewer = await start(d.querySelector('.obra3d-stage'), p, k);
      status.textContent = '';
    } catch (err) {
      status.textContent = /WebGL/i.test(String(err && err.message)) ? L('Este navegador no puede mostrar gráficos 3D (WebGL).', 'This browser cannot show 3D graphics (WebGL).') : L('No se pudo preparar la obra en 3D.', 'The work could not be prepared in 3D.');
    }
  }

  async function start(stage, p, k) {
    const { THREE: T, OrbitControls, RoomEnvironment } = lib;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    const size = () => [stage.clientWidth || innerWidth, stage.clientHeight || innerHeight];
    renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(...size());
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    stage.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-label', L('Obra en 3D que se puede girar y acercar', 'Work in 3D that can be turned and approached'));
    const scene = new T.Scene(), pm = new T.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    const [w0, h0] = size(), camera = new T.PerspectiveCamera(32, w0 / h0, 0.005, 50);
    scene.add(new T.HemisphereLight(0xfff3e2, 0x2b2119, 0.9));
    const key = new T.DirectionalLight(0xfff1dc, 2.2), KEY = new T.Vector3(-1.6, 2.4, 2.2), GRAZE = new T.Vector3(-3, 0.35, 0.7);
    key.position.copy(KEY); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5 }); key.shadow.radius = 6; key.shadow.bias = -0.0004;
    scene.add(key);
    const rim = new T.DirectionalLight(0xbfd2ff, 0.7); rim.position.set(2, 1.2, -2.5); scene.add(rim);

    const img = await loadImage(p.image), texOf = i => { const t = new T.Texture(i); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return t; };
    const model = MODELS[p.id];
    let obj;
    if (k === 'vase') { const m = models[model]; obj = vase(T, m, texOf(m.texture ? await loadImage(m.texture) : img)); }
    else if (k === 'statue') {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.filter = 'blur(14px)'; x.drawImage(img, 0, 0);
      obj = statue(T, models[model], texOf(img), texOf(c));
    } else if (k === 'photo' || k === 'paper') obj = sheetOfPaper(T, img, k);
    else obj = slab(T, texOf(img), img, k);
    scene.add(obj);
    const box = new T.Box3().setFromObject(obj), dims = box.getSize(new T.Vector3());
    obj.position.sub(box.getCenter(new T.Vector3()));
    if (k === 'vase' || k === 'statue' || k === 'photo') {
      const floor = new T.Mesh(new T.CircleGeometry(3, 64), new T.ShadowMaterial({ opacity: 0.38 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = -dims.y / 2 - (k === 'photo' ? 0.25 : 0); floor.receiveShadow = true; scene.add(floor);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.minDistance = 0.08; controls.maxDistance = 9; controls.zoomToCursor = true; controls.maxPolarAngle = Math.PI * 0.62;
    let springBack = null;
    const limit = LIMIT[model];
    if (limit) {
      const lim = T.MathUtils.degToRad(limit), give = T.MathUtils.degToRad(9), tip = stage.querySelector('.obra3d-limit');
      controls.minAzimuthAngle = -lim - give; controls.maxAzimuthAngle = lim + give;
      let dragging = false;
      controls.addEventListener('start', () => { dragging = true; });
      controls.addEventListener('end', () => { dragging = false; });
      controls.addEventListener('change', () => {
        // Shown on reaching the stop, hidden only once the view has come well back from it.
        const a = Math.abs(controls.getAzimuthalAngle());
        if (a > lim - 0.02 && !tip.classList.contains('on')) {
          tip.textContent = L('Hasta aquí: no se sabe cómo es por detrás.', 'This far only: what the back looks like is not known.');
          tip.classList.add('on'); tip.classList.toggle('left', controls.getAzimuthalAngle() > 0);
        } else if (a < lim - 0.14) tip.classList.remove('on');
      });
      springBack = () => {
        const a = controls.getAzimuthalAngle();
        if (dragging || Math.abs(a) <= lim) return;
        const off = camera.position.clone().sub(controls.target);
        off.applyAxisAngle(new T.Vector3(0, 1, 0), (Math.sign(a) * lim - a) * 0.18);
        camera.position.copy(controls.target).add(off);
      };
    }
    const HOME = { vase: [-22, 6, 2.7], statue: [-20, 4, 2.8], photo: [-24, 10, 2.4], paper: [-20, 8, 2.2], fresco: [-22, 6, 2.3], painting: [-24, 6, 2.4] }[k];
    const home = () => {
      const [az, el, dist0] = HOME, a = T.MathUtils.degToRad(az), e = T.MathUtils.degToRad(el);
      const dist = dist0 * Math.max(1, 0.85 / camera.aspect);
      camera.position.set(dist * Math.sin(a) * Math.cos(e), dist * Math.sin(e), dist * Math.cos(a) * Math.cos(e));
      controls.target.set(0, 0, 0); controls.update();
    };
    home();
    const resize = () => { const [w, h] = size(); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); };
    addEventListener('resize', resize);
    let running = true;
    const loop = () => { if (!running) return; springBack && springBack(); controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); };
    loop();
    return {
      home,
      spin: () => (controls.autoRotate = !controls.autoRotate) && true || false,
      graze: () => { const on = !key.position.equals(GRAZE); key.position.copy(on ? GRAZE : KEY); return on; },
      setView: (az, el, dist, target) => { const a = T.MathUtils.degToRad(az), e = T.MathUtils.degToRad(el), t = new T.Vector3(...(target || [0, 0, 0])); camera.position.set(t.x + dist * Math.sin(a) * Math.cos(e), t.y + dist * Math.sin(e), t.z + dist * Math.cos(a) * Math.cos(e)); controls.target.copy(t); controls.update(); },
      stop: () => {
        running = false; removeEventListener('resize', resize); controls.dispose();
        scene.traverse(o => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); });
        pm.dispose(); renderer.dispose(); renderer.forceContextLoss();
      }
    };
  }

  // ---- entry points in the artwork's detail view ------------------------------------------------
  function decorate() {
    const box = document.getElementById('art-detail');
    if (!box || box.querySelector('.obra3d-open') || typeof artDetailIndex !== 'number') return;
    const p = paintings[artDetailIndex];
    if (!available(p)) { box.classList.remove('has-3d'); return; }
    box.classList.add('has-3d');
    const fav = box.querySelector('.favorite-button');
    const btn = `<button type="button" class="favorite-button obra3d-open" data-obra3d-open="${p.id}">${icon}<span>${L('Ver en 3D', 'View in 3D')}</span></button>`;
    if (fav) fav.insertAdjacentHTML('afterend', btn); else box.insertAdjacentHTML('beforeend', btn);
  }
  function init() {
    const box = document.getElementById('art-detail');
    if (box) new MutationObserver(decorate).observe(box, { childList: true });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-obra3d-open]');
      if (b) return open(b.dataset.obra3dOpen);
      if (e.target.matches('#art-detail.has-3d > img') && typeof artDetailIndex === 'number') open(paintings[artDetailIndex].id);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.KatabasisObras3D = { kind, available, open, view: () => viewer };
})();
